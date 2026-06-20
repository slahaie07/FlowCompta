# Réseau national ComptaFlow — compta-flow.net

Infrastructure automatisée pour couvrir les 13 provinces et territoires du Canada avec conformité légale (PIPEDA + Loi 25).

## Architecture

```
Visiteur Canada
    │
    ▼
Vercel Edge (yul1, yyz1, yvr1, yyc1…)
    │
    ├── /api/network/region   → détection province
    ├── /api/network/legal    → pattern légal applicable
    └── /api/network/status   → santé du réseau
    │
    ▼
Supabase (ca-central-1) — données au Canada
```

## Composants créés

| Fichier | Rôle |
|---------|------|
| `src/lib/canadaNetwork.ts` | Config 13 régions, taxes, pattern légal |
| `src/hooks/useCanadaNetwork.ts` | Détection auto + consentement cookies |
| `src/context/CanadaNetworkProvider.tsx` | Contexte React global |
| `src/components/common/RegionalLanding.tsx` | Pages SEO `/ca/:slug` |
| `src/components/common/Cookies.tsx` | Politique témoins Loi 25 |
| `src/components/common/LegalCookieBanner.tsx` | Bannière consentement auto |
| `scripts/provision-canada-network.sh` | Provisionnement DNS + Vercel |
| `scripts/verify-canada-network.sh` | Vérification post-déploiement |
| `.github/workflows/canada-network.yml` | CI/CD automatisé |
| `n8n-canada-network-automation.json` | Workflow n8n monitoring |

## DNS (registraire WHC ou autre)

```json
{
  "A": { "compta-flow.net": "76.76.21.21" },
  "CNAME": { "www.compta-flow.net": "cname.vercel-dns.com" }
}
```

## Déploiement automatique

Le workflow GitHub `canada-network.yml` s'exécute à chaque push sur `main` :

1. Build + tests
2. Déploiement Vercel (si `VERCEL_TOKEN` configuré)
3. Vérification des endpoints réseau

## Variables d'environnement requises

```bash
VERCEL_TOKEN=...
VERCEL_ORG_ID=...
VERCEL_PROJECT_ID=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Pages régionales (SEO Canada)

- https://compta-flow.net/ca/quebec
- https://compta-flow.net/ca/ontario
- https://compta-flow.net/ca/alberta
- … (13 provinces/territoires)

## Pattern légal automatique

À chaque visite, le système applique :

1. Bannière cookies (Loi 25 / PIPEDA)
2. Liens vers `/privacy`, `/terms`, `/legal`, `/cookies`
3. Avis hébergement Canada (ca-central-1)
4. Avis CPA (tenue de livres, pas CPA agréé)
5. Responsable protection des données (Québec)

## Commandes utiles

```bash
# Vérifier le réseau en production
./scripts/verify-canada-network.sh

# Provisionner DNS + domaine Vercel
./scripts/provision-canada-network.sh
```
