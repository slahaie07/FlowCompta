-- 📂 SCHEMA "ELITE" Comptaflow (SUPABASE FINAL)
-- Conçu pour la scalabilité massive, la traçabilité et la protection anti-perte.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLE DES PROFILS (Optimisée)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    display_name TEXT,
    company_name TEXT,
    email TEXT UNIQUE,
    neq TEXT,
    nas TEXT,
    income_bracket TEXT,
    employee_count TEXT,
    needs JSONB,
    role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending_manual_payment', 'suspended')),
    active_mode TEXT DEFAULT 'business',
    initial_profile_type TEXT,
    preferred_language TEXT DEFAULT 'fr' CHECK (preferred_language IN ('fr', 'en', 'ar')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour accélérer les recherches admin
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 2. TABLE D'AUDIT (Traçabilité Totale - Indispensable pour un Grand Cabinet)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL, -- ex: 'UPLOAD_DOC', 'CREATE_INVOICE'
    table_name TEXT,
    record_id TEXT,
    previous_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLE DES TRANSACTIONS (Optimisée)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    type TEXT CHECK (type IN ('sale', 'purchase')),
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT,
    date BIGINT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reconciled', 'error', 'quarantine')),
    category TEXT,
    context TEXT CHECK (context IN ('personal', 'business')),
    ai_confidence FLOAT DEFAULT 1.0,
    document_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date);

-- 4. TABLE DES FACTURES
CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    number TEXT NOT NULL,
    client_name TEXT,
    amount DECIMAL(12, 2) NOT NULL,
    date BIGINT NOT NULL,
    due_date BIGINT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue', 'draft')),
    items JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLE DES DOCUMENTS (Confidentialité AES-256)
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    file_name TEXT NOT NULL,
    file_size TEXT,
    url TEXT NOT NULL,
    upload_date BIGINT NOT NULL,
    status TEXT DEFAULT 'secure',
    category TEXT DEFAULT 'general',
    source TEXT DEFAULT 'client',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABLE DES CONTENUS SOCIAUX (Pour l'automatisation n8n)
CREATE TABLE IF NOT EXISTS social_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_id UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    raw_content TEXT NOT NULL,
    image_url TEXT,
    target_platforms TEXT[] DEFAULT ARRAY['linkedin', 'instagram', 'twitter'],
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'error')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    published_urls JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_social_status ON social_content(status);

-- 7. AUTOMATISATION : CRÉATION DE PROFIL (Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role, active_mode)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'display_name', 'client', 'business');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. TABLE DES MESSAGES (Communication Temps Réel)
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('client', 'cpa', 'system')),
    text TEXT NOT NULL,
    client_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour accélérer la récupération des messages
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);

-- Politiques RLS Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Messages access" ON messages FOR ALL USING (auth.uid() = user_id OR is_admin());

-- 11. TABLE DES LOGS BOT (Comptaflow WARDEN)
CREATE TABLE IF NOT EXISTS bot_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    action_type TEXT NOT NULL,
    target_id TEXT,
    details TEXT,
    status TEXT DEFAULT 'success',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. INTÉGRITÉ LÉGALE (HASHING SHA-256)
CREATE TABLE IF NOT EXISTS document_hashes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    file_hash TEXT NOT NULL, -- Empreinte numérique unique
    algorithm TEXT DEFAULT 'sha256',
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. ACCÈS COLLABORATEURS (CABINET STAFF)
CREATE TABLE IF NOT EXISTS staff (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT,
    role TEXT CHECK (role IN ('CPA', 'CLERK', 'ADMIN')),
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE
);

-- 14. TRACKING ACQUISITION (MARKETING LEADS)
CREATE TABLE IF NOT EXISTS marketing_leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    source TEXT, -- 'GOOGLE', 'META', 'DIRECT'
    campaign_id TEXT,
    converted_at TIMESTAMP WITH TIME ZONE,
    revenue_estimate NUMERIC,
    metadata JSONB DEFAULT '{}'
);

-- ACTIVER LE REALTIME SUR TOUT L'ÉCOSYSTÈME
ALTER PUBLICATION supabase_realtime ADD TABLE messages, documents, orders, profiles, bot_logs;

-- Création du bucket 'vault' pour les documents confidentiels
-- Note: Requires Supabase Storage schema privileges. Run these statements if applicable.
INSERT INTO storage.buckets (id, name, public) VALUES ('vault', 'vault', false) ON CONFLICT DO NOTHING;

-- Storage RLS: Les utilisateurs ne peuvent voir/uploader que dans leur propre dossier (id utilisateur)
CREATE POLICY "Vault Client Access" ON storage.objects FOR ALL USING (
    bucket_id = 'vault' AND (auth.uid()::text = (string_to_array(name, '/'))[1] OR public.is_admin())
);

CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
DECLARE
  is_admin_user BOOLEAN;
BEGIN
  SELECT (role = 'admin') INTO is_admin_user FROM profiles WHERE id = auth.uid();
  RETURN COALESCE(is_admin_user, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. POLITIQUES DE SÉCURITÉ (RLS) - RIGOUREUX
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Own + Admin can see all
CREATE POLICY "Profiles access" ON profiles FOR ALL USING (auth.uid() = id OR is_admin());

-- Transactions: Own + Admin
CREATE POLICY "Transactions access" ON transactions FOR ALL USING (auth.uid() = user_id OR is_admin());

-- Invoices: Own + Admin
CREATE POLICY "Invoices access" ON invoices FOR ALL USING (auth.uid() = user_id OR is_admin());

-- Documents: Own + Admin
CREATE POLICY "Documents access" ON documents FOR ALL USING (auth.uid() = user_id OR is_admin());

-- Audit logs: Admin only
CREATE POLICY "Admin view logs" ON audit_logs FOR ALL USING (is_admin());
