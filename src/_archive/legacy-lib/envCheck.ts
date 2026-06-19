/**
 * Utilitaire de validation de l'environnement de production.
 * Vérifie que toutes les clés nécessaires sont présentes au démarrage.
 */
export function validateEnvironment() {
  const requiredKeys = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_N8N_INVOICE_WEBHOOK_URL',
    'VITE_N8N_SUBSCRIPTION_WEBHOOK_URL'
  ];

  const missingKeys = requiredKeys.filter(key => !import.meta.env[key]);

  if (missingKeys.length > 0) {
    console.warn(
      `⚠️ [ComptaFlow] Clés d'environnement manquantes : ${missingKeys.join(', ')}. ` +
      `Certaines fonctionnalités pourraient ne pas fonctionner correctement.`
    );
  } else {
    console.info("✅ [ComptaFlow] Environnement validé.");
  }
}
