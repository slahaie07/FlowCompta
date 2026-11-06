-- =============================================================================
-- ComptaFlow — événements de conversion du site public (lot A11, 2026-11-05).
-- Table d'insertion seulement côté public : aucune lecture possible avec les
-- clés anon/authenticated (RLS sans politique SELECT). Lecture par BOSS via
-- l'éditeur SQL (service role) ou le tableau hebdomadaire.
-- Aucune donnée personnelle : ni nom, ni courriel, ni adresse IP stockée ici.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.site_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  event       text NOT NULL CHECK (event IN (
                'estimate_view',
                'estimate_completed',
                'intake_click',
                'diagnostic_click',
                'mandate_signed'
              )),
  session_id  text,
  page        text,
  service_id  text,
  source      text,
  utm_source  text,
  utm_medium  text,
  utm_campaign text,
  lang        text
);

ALTER TABLE public.site_events ENABLE ROW LEVEL SECURITY;

-- Insertion seulement, pour les visiteurs anonymes et les utilisateurs connectés.
DROP POLICY IF EXISTS site_events_insert_anon ON public.site_events;
CREATE POLICY site_events_insert_anon
  ON public.site_events FOR INSERT TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS site_events_insert_auth ON public.site_events;
CREATE POLICY site_events_insert_auth
  ON public.site_events FOR INSERT TO authenticated
  WITH CHECK (true);

-- Volontairement AUCUNE politique SELECT/UPDATE/DELETE : la table est un
-- journal en écriture seule pour le public.
