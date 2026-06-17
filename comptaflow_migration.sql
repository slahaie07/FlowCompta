-- 📂 MIGRATION COMPTA-FLOW (BASE DE DONNÉES MUTI-LOCATAIRE À 3 RÔLES)
-- Conçu pour l'isolation totale des données entre sub_admins et clients.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Désactivation des triggers existants pour éviter les conflits lors de la migration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.is_admin();

-- 1. DROP DES TABLES EXISTANTES S'ELLES EXISTENT POUR REPARTIR SUR DES BASES SAINES
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- A. Table des profils (profiles)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('super_admin', 'sub_admin', 'client')),
    sub_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- NULL pour super_admin/sub_admin ; rempli pour client
    full_name TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Champs de facturation Interac pour les sub_admins
    interac_email TEXT,
    interac_question TEXT,
    interac_autodepot BOOLEAN DEFAULT TRUE
);

-- Indexation pour les performances
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_sub_admin_id ON public.profiles(sub_admin_id);

-- B. Tables Métier avec sub_admin_id pour isolation des locataires

-- Table clients (référence au client final géré par un sub_admin)
CREATE TABLE public.clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sub_admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE, -- Optionnel, si le client a un compte utilisateur
    nom TEXT NOT NULL,
    courriel TEXT NOT NULL,
    telephone TEXT,
    no_tps TEXT,
    no_tvq TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_clients_sub_admin_id ON public.clients(sub_admin_id);
CREATE INDEX idx_clients_client_user_id ON public.clients(client_user_id);

-- Table documents (les documents partagés ou téléversés)
CREATE TABLE public.documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sub_admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- ID profile du client
    titre TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_documents_sub_admin_id ON public.documents(sub_admin_id);
CREATE INDEX idx_documents_client_id ON public.documents(client_id);

-- Table messages (canaux de messagerie directs)
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sub_admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- ID profile du client
    expediteur_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    contenu TEXT NOT NULL,
    lu BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_messages_sub_admin_id ON public.messages(sub_admin_id);
CREATE INDEX idx_messages_client_id ON public.messages(client_id);

-- Table invoices (factures soumises à Interac et taxes québécoises)
CREATE TABLE public.invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sub_admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- ID profile du client
    numero TEXT NOT NULL,
    montant_ht NUMERIC(12, 2) NOT NULL,
    tps NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tvq NUMERIC(12, 2) NOT NULL DEFAULT 0,
    montant_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
    statut TEXT CHECK (statut IN ('brouillon', 'envoyee', 'payee', 'annulee')) DEFAULT 'brouillon',
    date_emission DATE NOT NULL DEFAULT CURRENT_DATE,
    date_echeance DATE,
    date_paiement TIMESTAMP WITH TIME ZONE,
    interac_reference TEXT,
    client_a_declare_paye BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_invoices_sub_admin_id ON public.invoices(sub_admin_id);
CREATE INDEX idx_invoices_client_id ON public.invoices(client_id);


-- C. Fonctions anti-récursion (SECURITY DEFINER, stable, search_path public)

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_sub_admin_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT sub_admin_id FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;


-- D. Trigger d'inscription automatique (handle_new_user)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
    v_sub_admin_id UUID;
    v_full_name TEXT;
BEGIN
    v_role := COALESCE(new.raw_user_meta_data->>'role', 'client');
    v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'display_name');
    
    IF new.raw_user_meta_data->>'sub_admin_id' IS NOT NULL AND new.raw_user_meta_data->>'sub_admin_id' <> '' THEN
        v_sub_admin_id := (new.raw_user_meta_data->>'sub_admin_id')::UUID;
    ELSE
        v_sub_admin_id := NULL;
    END IF;

    INSERT INTO public.profiles (id, role, sub_admin_id, full_name, email, created_at)
    VALUES (
        new.id,
        v_role,
        v_sub_admin_id,
        v_full_name,
        new.email,
        NOW()
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- E. Calcul automatique des taxes Québec (tps 5%, tvq 9.975%)
CREATE OR REPLACE FUNCTION public.calculate_invoice_taxes()
RETURNS TRIGGER AS $$
BEGIN
    NEW.tps := ROUND(NEW.montant_ht * 0.05, 2);
    NEW.tvq := ROUND(NEW.montant_ht * 0.09975, 2);
    NEW.montant_total := NEW.montant_ht + NEW.tps + NEW.tvq;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_invoice_insert_update_taxes
  BEFORE INSERT OR UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.calculate_invoice_taxes();


-- F. Activation de RLS et application des politiques de sécurité
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLITIQUES SUR PROFILES
-- ============================================================

-- Chacun lit son propre profil
CREATE POLICY "Chacun lit son profil" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Les super_admin voient tous les profils
CREATE POLICY "Super admin voit tout" ON public.profiles
FOR SELECT USING (public.get_user_role() = 'super_admin');

-- Les sub_admin voient les profils de leurs clients attitrés
CREATE POLICY "Sub admin voit ses clients" ON public.profiles
FOR SELECT USING (
    public.get_user_role() = 'sub_admin' AND sub_admin_id = auth.uid()
);

-- Les clients voient le profil de leur sub_admin attitré (comptable)
CREATE POLICY "Client voit son sub_admin" ON public.profiles
FOR SELECT USING (
    public.get_user_role() = 'client' AND id = public.get_sub_admin_id()
);

-- Les utilisateurs modifient leur propre profil (ex: paramètres Interac)
CREATE POLICY "Modif propre profil" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Super admin peut modifier et supprimer n'importe quel profil
CREATE POLICY "Super admin modif profil" ON public.profiles
FOR UPDATE USING (public.get_user_role() = 'super_admin');

CREATE POLICY "Super admin suppr profil" ON public.profiles
FOR DELETE USING (public.get_user_role() = 'super_admin');


-- ============================================================
-- POLITIQUES SUR CLIENTS
-- ============================================================

-- Accès total super_admin
CREATE POLICY "Super admin clients access" ON public.clients FOR ALL USING (public.get_user_role() = 'super_admin');

-- Accès sub_admin sur sa propre base uniquement
CREATE POLICY "Sub admin select clients" ON public.clients FOR SELECT USING (public.get_user_role() = 'sub_admin' AND sub_admin_id = auth.uid());
CREATE POLICY "Sub admin insert clients" ON public.clients FOR INSERT WITH CHECK (public.get_user_role() = 'sub_admin' AND sub_admin_id = auth.uid());
CREATE POLICY "Sub admin update clients" ON public.clients FOR UPDATE USING (public.get_user_role() = 'sub_admin' AND sub_admin_id = auth.uid());
CREATE POLICY "Sub admin delete clients" ON public.clients FOR DELETE USING (public.get_user_role() = 'sub_admin' AND sub_admin_id = auth.uid());

-- Client final voit son propre dossier dossier client
CREATE POLICY "Client select client_record" ON public.clients FOR SELECT USING (public.get_user_role() = 'client' AND client_user_id = auth.uid());


-- ============================================================
-- POLITIQUES SUR DOCUMENTS
-- ============================================================

-- Accès total super_admin
CREATE POLICY "Super admin documents access" ON public.documents FOR ALL USING (public.get_user_role() = 'super_admin');

-- Accès sub_admin sur ses documents
CREATE POLICY "Sub admin select docs" ON public.documents FOR SELECT USING (public.get_user_role() = 'sub_admin' AND sub_admin_id = auth.uid());
CREATE POLICY "Sub admin insert docs" ON public.documents FOR INSERT WITH CHECK (public.get_user_role() = 'sub_admin' AND sub_admin_id = auth.uid());
CREATE POLICY "Sub admin update docs" ON public.documents FOR UPDATE USING (public.get_user_role() = 'sub_admin' AND sub_admin_id = auth.uid());
CREATE POLICY "Sub admin delete docs" ON public.documents FOR DELETE USING (public.get_user_role() = 'sub_admin' AND sub_admin_id = auth.uid());

-- Accès client sur ses documents
CREATE POLICY "Client select docs" ON public.documents FOR SELECT USING (public.get_user_role() = 'client' AND client_id = auth.uid());
CREATE POLICY "Client insert docs" ON public.documents FOR INSERT WITH CHECK (public.get_user_role() = 'client' AND client_id = auth.uid() AND sub_admin_id = public.get_sub_admin_id());
CREATE POLICY "Client update docs" ON public.documents FOR UPDATE USING (public.get_user_role() = 'client' AND client_id = auth.uid());
CREATE POLICY "Client delete docs" ON public.documents FOR DELETE USING (public.get_user_role() = 'client' AND client_id = auth.uid());


-- ============================================================
-- POLITIQUES SUR MESSAGES
-- ============================================================

-- Accès total super_admin
CREATE POLICY "Super admin messages access" ON public.messages FOR ALL USING (public.get_user_role() = 'super_admin');

-- Accès sub_admin sur ses messages
CREATE POLICY "Sub admin select messages" ON public.messages FOR SELECT USING (public.get_user_role() = 'sub_admin' AND sub_admin_id = auth.uid());
CREATE POLICY "Sub admin insert messages" ON public.messages FOR INSERT WITH CHECK (public.get_user_role() = 'sub_admin' AND sub_admin_id = auth.uid());
CREATE POLICY "Sub admin update messages" ON public.messages FOR UPDATE USING (public.get_user_role() = 'sub_admin' AND sub_admin_id = auth.uid());
CREATE POLICY "Sub admin delete messages" ON public.messages FOR DELETE USING (public.get_user_role() = 'sub_admin' AND sub_admin_id = auth.uid());

-- Accès client sur ses messages
CREATE POLICY "Client select messages" ON public.messages FOR SELECT USING (public.get_user_role() = 'client' AND client_id = auth.uid());
CREATE POLICY "Client insert messages" ON public.messages FOR INSERT WITH CHECK (public.get_user_role() = 'client' AND client_id = auth.uid() AND sub_admin_id = public.get_sub_admin_id());
CREATE POLICY "Client update messages" ON public.messages FOR UPDATE USING (public.get_user_role() = 'client' AND client_id = auth.uid());


-- ============================================================
-- POLITIQUES SUR INVOICES (FACTURES)
-- ============================================================

-- Accès total super_admin
CREATE POLICY "Super admin invoices access" ON public.invoices FOR ALL USING (public.get_user_role() = 'super_admin');

-- Accès sub_admin sur ses factures
CREATE POLICY "Sub admin select invoices" ON public.invoices FOR SELECT USING (public.get_user_role() = 'sub_admin' AND sub_admin_id = auth.uid());
CREATE POLICY "Sub admin insert invoices" ON public.invoices FOR INSERT WITH CHECK (public.get_user_role() = 'sub_admin' AND sub_admin_id = auth.uid());
CREATE POLICY "Sub admin update invoices" ON public.invoices FOR UPDATE USING (public.get_user_role() = 'sub_admin' AND sub_admin_id = auth.uid());
CREATE POLICY "Sub admin delete invoices" ON public.invoices FOR DELETE USING (public.get_user_role() = 'sub_admin' AND sub_admin_id = auth.uid());

-- Accès client sur ses factures
CREATE POLICY "Client select invoices" ON public.invoices FOR SELECT USING (public.get_user_role() = 'client' AND client_id = auth.uid());
CREATE POLICY "Client update invoices" ON public.invoices FOR UPDATE USING (public.get_user_role() = 'client' AND client_id = auth.uid());
