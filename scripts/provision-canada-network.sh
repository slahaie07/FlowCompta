#!/usr/bin/env bash
# Provisionne le réseau ComptaFlow pour compta-flow.net
set -euo pipefail

DOMAIN="compta-flow.net"
VERCEL_A="76.76.21.21"
VERCEL_CNAME="cname.vercel-dns.com"

echo "🇨🇦 Provisionnement réseau ComptaFlow — ${DOMAIN}"
echo ""
echo "=== Enregistrements DNS à configurer chez votre registraire ==="
echo ""
echo "Type A:"
echo "  ${DOMAIN}  →  ${VERCEL_A}"
echo ""
echo "Type CNAME:"
echo "  www.${DOMAIN}  →  ${VERCEL_CNAME}"
echo ""

if command -v vercel >/dev/null 2>&1 && [[ -n "${VERCEL_TOKEN:-}" ]]; then
  echo "=== Liaison domaine Vercel ==="
  vercel domains add "${DOMAIN}" 2>/dev/null || echo "Domaine déjà lié ou erreur — vérifier le dashboard Vercel"
  vercel domains add "www.${DOMAIN}" 2>/dev/null || true
  echo "✅ Domaines soumis à Vercel"
else
  echo "⚠️  vercel CLI ou VERCEL_TOKEN absent — configurez manuellement sur https://vercel.com/dashboard"
fi

echo ""
echo "=== Variables d'environnement recommandées ==="
echo "  CONVEX_AGENT_MODE=anonymous  (agents cloud uniquement)"
echo "  VITE_SUPABASE_URL=..."
echo "  VITE_SUPABASE_ANON_KEY=..."
echo ""
echo "✅ Guide complet : infra/canada-network/README.md"
