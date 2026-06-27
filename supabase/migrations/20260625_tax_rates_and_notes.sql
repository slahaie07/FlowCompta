-- 📂 MIGRATION 20260625: TAX RATES & QUICK NOTES SYSTEM
-- Centralisation des taxes provinciales/fédérales et stockage persistant des notes adhésives.

-- 1. TABLE DES TAXES CANADIENNES
CREATE TABLE IF NOT EXISTS public.tax_rates (
    province_code TEXT PRIMARY KEY CHECK (length(province_code) = 2),
    gst_rate DECIMAL(6,5) DEFAULT 0.05000, -- TPS 5%
    pst_qst_rate DECIMAL(6,5) DEFAULT 0.00000, -- TVQ 9.975% ou PST
    hst_rate DECIMAL(6,5) DEFAULT 0.00000, -- HST (Ontario etc)
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertion des taux canadiens par défaut
INSERT INTO public.tax_rates (province_code, gst_rate, pst_qst_rate, hst_rate, description)
VALUES 
    ('QC', 0.05000, 0.09975, 0.00000, 'Québec: TPS 5% + TVQ 9.975%'),
    ('ON', 0.00000, 0.00000, 0.13000, 'Ontario: HST 13%'),
    ('BC', 0.05000, 0.07000, 0.00000, 'Colombie-Britannique: GST 5% + PST 7%'),
    ('AB', 0.05000, 0.00000, 0.00000, 'Alberta: GST 5% uniquement'),
    ('NS', 0.00000, 0.00000, 0.15000, 'Nouvelle-Écosse: HST 15%'),
    ('NB', 0.00000, 0.00000, 0.15000, 'Nouveau-Brunswick: HST 15%'),
    ('MB', 0.05000, 0.07000, 0.00000, 'Manitoba: GST 5% + PST 7%'),
    ('SK', 0.05000, 0.06000, 0.00000, 'Saskatchewan: GST 5% + PST 6%'),
    ('NL', 0.00000, 0.00000, 0.15000, 'Terre-Neuve-et-Labrador: HST 15%'),
    ('PE', 0.00000, 0.00000, 0.15000, 'Île-du-Prince-Édouard: HST 15%')
ON CONFLICT (province_code) DO UPDATE 
SET gst_rate = EXCLUDED.gst_rate, 
    pst_qst_rate = EXCLUDED.pst_qst_rate, 
    hst_rate = EXCLUDED.hst_rate,
    description = EXCLUDED.description,
    updated_at = NOW();

-- 2. TABLE DES NOTES RAPIDES (STICKY NOTES) EN DIRECT
CREATE TABLE IF NOT EXISTS public.quick_notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    color TEXT DEFAULT 'yellow' CHECK (color IN ('yellow', 'green', 'pink', 'blue')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quick_notes_user ON public.quick_notes(user_id);

-- 3. ACTIVER RLS SUR LES DEUX TABLES
ALTER TABLE public.tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_notes ENABLE ROW LEVEL SECURITY;

-- 4. POLITIQUES TAX RATES
DROP POLICY IF EXISTS "Anyone can select tax rates" ON public.tax_rates;
CREATE POLICY "Anyone can select tax rates" ON public.tax_rates
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Only super admins can modify tax rates" ON public.tax_rates;
CREATE POLICY "Only super admins can modify tax rates" ON public.tax_rates
    FOR ALL USING (public.get_user_role() = 'super_admin');

-- 5. POLITIQUES QUICK NOTES
DROP POLICY IF EXISTS "Users manage their own notes" ON public.quick_notes;
CREATE POLICY "Users manage their own notes" ON public.quick_notes
    FOR ALL USING (auth.uid() = user_id);
