import { supabase } from './supabase';

/**
 * Mesure de conversion maison (lot A11) — événements en écriture seule vers
 * la table Supabase `site_events` (RLS : insertion seulement, aucune lecture
 * publique). Aucune donnée personnelle, aucun témoin : l'identifiant de
 * session et les UTM vivent en sessionStorage, le temps de l'onglet.
 * Tous les envois sont « fire-and-forget » : un échec ne doit jamais
 * dégrader le parcours du visiteur.
 */

export type SiteEventName =
  | 'estimate_view'
  | 'estimate_completed'
  | 'intake_click'
  | 'diagnostic_click'
  | 'mandate_signed';

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign'] as const;
const UTM_STORAGE_KEY = 'comptaflow-utm';
const SESSION_STORAGE_KEY = 'comptaflow-session-id';

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!id) {
      id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `s-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return 'no-storage';
  }
}

/** Capture les UTM de l'URL courante (premier passage) et les conserve pour la session. */
export function captureUtmParams(): Record<string, string> {
  try {
    const params = new URLSearchParams(window.location.search);
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    const current: Record<string, string> = stored ? JSON.parse(stored) : {};
    let changed = false;
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value && !current[key]) {
        current[key] = value.slice(0, 80);
        changed = true;
      }
    }
    if (changed) {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(current));
    }
    return current;
  } catch {
    return {};
  }
}

export interface SiteEventOptions {
  serviceId?: string;
  source?: string;
  lang?: string;
}

export function trackEvent(event: SiteEventName, options: SiteEventOptions = {}): void {
  try {
    const utm = captureUtmParams();
    void supabase
      .from('site_events')
      .insert({
        event,
        session_id: getSessionId(),
        page: window.location.pathname,
        service_id: options.serviceId ?? null,
        source: options.source ?? null,
        utm_source: utm.utm_source ?? null,
        utm_medium: utm.utm_medium ?? null,
        utm_campaign: utm.utm_campaign ?? null,
        lang: options.lang ?? null,
      })
      .then(() => undefined, () => undefined);
  } catch {
    // La mesure ne doit jamais interrompre le parcours.
  }
}

/** Variante « une seule fois par session » (vues et écrans atteints plusieurs fois). */
export function trackEventOnce(event: SiteEventName, options: SiteEventOptions = {}): void {
  try {
    const flag = `comptaflow-tracked-${event}`;
    if (sessionStorage.getItem(flag)) return;
    sessionStorage.setItem(flag, '1');
  } catch {
    // sessionStorage indisponible : on envoie quand même.
  }
  trackEvent(event, options);
}
