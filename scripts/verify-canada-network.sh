#!/usr/bin/env bash
# Vérifie la santé du réseau ComptaFlow Canada
set -euo pipefail

BASE_URL="${COMPTAFLOW_URL:-https://compta-flow.net}"
PASS=0
FAIL=0

check() {
  local name="$1"
  local url="$2"
  local expected="${3:-}"

  if response=$(curl -sf --max-time 15 "$url" 2>/dev/null); then
    if [[ -n "$expected" ]] && ! echo "$response" | grep -q "$expected"; then
      echo "❌ $name — réponse inattendue"
      FAIL=$((FAIL + 1))
    else
      echo "✅ $name"
      PASS=$((PASS + 1))
    fi
  else
    echo "❌ $name — inaccessible ($url)"
    FAIL=$((FAIL + 1))
  fi
}

echo "🔍 Vérification réseau ComptaFlow — ${BASE_URL}"
echo ""

check "Health API" "${BASE_URL}/api/health" "ok"
check "Région API" "${BASE_URL}/api/network/region" "province"
check "Légal API" "${BASE_URL}/api/network/legal" "privacyLaw"
check "Status réseau" "${BASE_URL}/api/network/status" "activeRegions"
check "Sitemap" "${BASE_URL}/sitemap.xml" "urlset"
check "Robots.txt" "${BASE_URL}/robots.txt" "Sitemap"
check "Page Québec" "${BASE_URL}/ca/quebec" "Compta"
check "Politique cookies" "${BASE_URL}/cookies" "témoin"
check "Mentions légales" "${BASE_URL}/legal" "ComptaFlow"

echo ""
echo "Résultat : ${PASS} OK, ${FAIL} échecs"

if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi

echo "✅ Réseau Canada opérationnel"
