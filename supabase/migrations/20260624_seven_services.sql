-- 📂 MIGRATION 20260624: INTEGRATION DES 7 SERVICES COMPTAFLOW
-- Ajout des tables pour la gestion unifiée des services, transactions associées et documents téléversés.
-- Isolation totale multi-locataire (sub_admin_id) et sécurité RLS durcie.

-- 1. TABLE DES SERVICES (Gestion des dossiers clients par type de service)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sub_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    service_type TEXT NOT NULL CHECK (service_type IN (
        'monthly_bookkeeping', -- Forfaits Mensuels
        'student_tax',         -- L'Étudiant (Impôts simples)
        'catchup_bookkeeping', -- Le Rattrapage (L'urgence)
        'setup_onboarding',    -- Le Setup (Configuration)
        'personal_tax',        -- Impôts Personnels (Proprio)
        'autonomous_tax',      -- Travailleurs Autonomes
        'corporate_tax'        -- Impôts de Sociétés
    )),
    status TEXT NOT NULL DEFAULT 'En attente du client' CHECK (status IN (
        'En attente du client', 
        'Prêt à traiter',
        'En cours de production',
        'En traitement',
        'En attente de paiement/signature', 
        'Terminé', 
        'Bloqué'
    )),
    metadata JSONB DEFAULT '{}'::jsonb, -- Données spécifiques (ex: province de taxes, année d'imposition)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour accélérer les jointures et requêtes
CREATE INDEX IF NOT EXISTS idx_services_client_id ON public.services(client_id);
CREATE INDEX IF NOT EXISTS idx_services_sub_admin_id ON public.services(sub_admin_id);
CREATE INDEX IF NOT EXISTS idx_services_status ON public.services(status);

-- 2. TABLE DES DOCUMENTS UPLOADES (Lien spécifique entre les documents et les services)
CREATE TABLE IF NOT EXISTS public.documents_uploades (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sub_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    file_name TEXT NOT NULL,
    file_size TEXT,
    url TEXT NOT NULL, -- Path de stockage dans le bucket
    upload_date BIGINT NOT NULL,
    status TEXT DEFAULT 'secure' CHECK (status IN ('secure', 'processing', 'error')),
    category TEXT DEFAULT 'general',
    source TEXT DEFAULT 'client' CHECK (source IN ('client', 'admin')),
    metadata JSONB DEFAULT '{}'::jsonb, -- Pour stocker les analyses OCR / Dext
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_docs_uploades_service ON public.documents_uploades(service_id);
CREATE INDEX IF NOT EXISTS idx_docs_uploades_client ON public.documents_uploades(client_id);
CREATE INDEX IF NOT EXISTS idx_docs_uploades_sub_admin ON public.documents_uploades(sub_admin_id);

-- 3. AJOUT DU MULTI-LOCATAIRE SUR LA TABLE TRANSACTIONS
-- La table transactions existe peut-être déjà; on s'assure qu'elle a toutes les colonnes requises.
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS sub_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_transactions_sub_admin ON public.transactions(sub_admin_id);

-- Mise à jour automatique des sub_admin_id manquants sur les transactions existantes
UPDATE public.transactions t
SET sub_admin_id = p.sub_admin_id
FROM public.profiles p
WHERE t.user_id = p.id AND t.sub_admin_id IS NULL;

-- 4. MISE EN PLACE DE LA ROW LEVEL SECURITY (RLS)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents_uploades ENABLE ROW LEVEL SECURITY;

-- --- POLITIQUES SERVICES ---
DROP POLICY IF EXISTS "Clients select own services" ON public.services;
CREATE POLICY "Clients select own services" ON public.services
    FOR SELECT USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "Clients insert own services" ON public.services;
CREATE POLICY "Clients insert own services" ON public.services
    FOR INSERT WITH CHECK (
        auth.uid() = client_id 
        AND sub_admin_id = (SELECT sub_admin_id FROM public.profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Sub admins select assigned services" ON public.services;
CREATE POLICY "Sub admins select assigned services" ON public.services
    FOR SELECT USING (
        public.get_user_role() = 'sub_admin' AND sub_admin_id = auth.uid()
    );

DROP POLICY IF EXISTS "Super admins select all services" ON public.services;
CREATE POLICY "Super admins select all services" ON public.services
    FOR SELECT USING (
        public.get_user_role() = 'super_admin'
    );

DROP POLICY IF EXISTS "Staff manage services" ON public.services;
CREATE POLICY "Staff manage services" ON public.services
    FOR ALL USING (
        (public.get_user_role() = 'sub_admin' AND sub_admin_id = auth.uid())
        OR public.get_user_role() = 'super_admin'
    );

-- --- POLITIQUES DOCUMENTS UPLOADES ---
DROP POLICY IF EXISTS "Clients select own docs" ON public.documents_uploades;
CREATE POLICY "Clients select own docs" ON public.documents_uploades
    FOR SELECT USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "Clients insert own docs" ON public.documents_uploades;
CREATE POLICY "Clients insert own docs" ON public.documents_uploades
    FOR INSERT WITH CHECK (
        auth.uid() = client_id 
        AND sub_admin_id = (SELECT sub_admin_id FROM public.profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Sub admins select assigned docs" ON public.documents_uploades;
CREATE POLICY "Sub admins select assigned docs" ON public.documents_uploades
    FOR SELECT USING (
        public.get_user_role() = 'sub_admin' AND sub_admin_id = auth.uid()
    );

DROP POLICY IF EXISTS "Super admins select all docs" ON public.documents_uploades;
CREATE POLICY "Super admins select all docs" ON public.documents_uploades
    FOR SELECT USING (
        public.get_user_role() = 'super_admin'
    );

DROP POLICY IF EXISTS "Staff manage docs" ON public.documents_uploades;
CREATE POLICY "Staff manage docs" ON public.documents_uploades
    FOR ALL USING (
        (public.get_user_role() = 'sub_admin' AND sub_admin_id = auth.uid())
        OR public.get_user_role() = 'super_admin'
    );

-- --- MISE A JOUR DES POLITIQUES SUR TRANSACTIONS POUR COUVRIR LE MULTI-LOCATAIRE ---
DROP POLICY IF EXISTS "Clients select own transactions" ON public.transactions;
CREATE POLICY "Clients select own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Sub admins select assigned transactions" ON public.transactions;
CREATE POLICY "Sub admins select assigned transactions" ON public.transactions
    FOR SELECT USING (
        public.get_user_role() = 'sub_admin' AND sub_admin_id = auth.uid()
    );

DROP POLICY IF EXISTS "Super admins select all transactions" ON public.transactions;
CREATE POLICY "Super admins select all transactions" ON public.transactions
    FOR SELECT USING (
        public.get_user_role() = 'super_admin'
    );

DROP POLICY IF EXISTS "Staff manage transactions" ON public.transactions;
CREATE POLICY "Staff manage transactions" ON public.transactions
    FOR ALL USING (
        (public.get_user_role() = 'sub_admin' AND sub_admin_id = auth.uid())
        OR public.get_user_role() = 'super_admin'
    );
