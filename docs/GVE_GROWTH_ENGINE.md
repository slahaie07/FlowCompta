# 🌱 GVE — Growth & Visibility Engine

Moteur d'intelligence de **croissance organique** de ComptaFlow. À partir d'un
profil d'entreprise (le cabinet lui-même ou un client), le GVE :

1. **Priorise** des canaux d'acquisition 100 % légitimes (scoring RICE déterministe).
2. **Projette** trafic et ROI sur 12 mois (courbe de montée en charge saturante).
3. **Génère** un plan d'action concret et éthique (playbook), avec KPI et garde-fous.

> **Charte d'intégrité (non négociable).** Le GVE ne crée aucun faux compte,
> n'imite aucune identité, ne contourne aucune protection anti-robot et
> n'automatise aucune publication trompeuse. Il priorise, projette et rédige des
> briefs pour des actions authentiques exécutées par des humains ou via des API
> officielles, avec divulgation, dans le respect des conditions de chaque
> plateforme et de la **LCAP** (loi anti-pourriel canadienne).

---

## Architecture

```
src/lib/gve/
├── types.ts        Modèle de domaine (GrowthTarget, OpportunityScore, GrowthPlan…)
├── channels.ts     Catalogue des 8 canaux organiques + facteur d'attribution
├── scoring.ts      Scoring RICE déterministe (reach × impact × confiance / effort)
├── projection.ts   Projection trafic/ROI (courbe saturante) + benchmark CAC payant
├── playbook.ts     Génération du plan d'action éthique par canal
├── engine.ts       Orchestrateur : profil cible → GrowthPlan complet
└── __tests__/      19 tests (scoring, projection, engine)
```

Le moteur est **pur et déterministe** : mêmes entrées ⇒ mêmes sorties (aucun
aléatoire), pour des projections auditables.

## Canaux couverts

| Canal | Catégorie | Coût | Garde-fou clé |
|-------|-----------|------|---------------|
| Contenu SEO evergreen | `content-seo` | Organique | Contenu utile, relu CPA — aucune ferme de contenu |
| Fiche Google Business & SEO local | `local-seo` | Organique | Vrais avis de vrais clients uniquement |
| Réponses expertes en communauté | `community` | Organique | Compte réel, affiliation divulguée, règles respectées |
| Programme de parrainage | `referral` | Faible | Consentement LCAP, incitatif transparent |
| Infolettre & séquences | `email` | Faible | Opt-in LCAP, désabonnement 1 clic, aucune liste achetée |
| Autorité organique LinkedIn | `social-organic` | Organique | Profils réels de l'équipe, aucune automatisation d'engagement |
| Partenariats & co-marketing | `partnerships` | Faible | Accords réels et divulgués |
| Relations presse & citations | `pr` | Faible | Données véridiques et sourcées |

## Modèle de scoring (RICE effort-ajusté)

```
score = clamp( (reachNorm × impactNorm × confiance) / effortNorm × 80 , 0, 100 )
```

- **reach** : `baseReach × poids provincial × adéquation niche × échelle d'effort`
- **impact** : `reach × conversion × modulateur canal × attribution(0,4) × valeur client`
- **confiance** : fonction du trafic existant, de la rapidité de montée du canal et de la complétude des données
- **effort** : heures/semaine (référence 6 h)

L'attribution multi-touch (`REVENUE_ATTRIBUTION = 0.4`) escompte visiteurs
récurrents et parcours multi-canaux pour éviter de sur-créditer un seul canal.

## API

| Route | Auth | Rôle |
|-------|------|------|
| `GET /api/gve/channels` | Public (CDN-cache) | Catalogue des canaux |
| `POST /api/gve/plan` | Public, rate-limité (30/min) | Génère un `GrowthPlan` depuis un profil |
| `GET /api/cron/gve-scan` | `Bearer CRON_SECRET` | Analyse quotidienne des opportunités du cabinet |

### Exemple

```bash
curl -X POST https://compta-flow.net/api/gve/plan \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "ComptaFlow",
    "niche": "comptabilité",
    "province": "QC",
    "monthlyBudgetCad": 300,
    "currentMonthlySessions": 1500,
    "avgDealValueCad": 1800,
    "conversionRatePct": 1.5,
    "teamCapacityHoursPerWeek": 12
  }'
```

## Tableau de bord

Page autonome (aucune dépendance CDN, graphiques SVG maison) :
**`/gve.html`** — saisir un profil, lancer l'analyse, visualiser matrice de
canaux, radar, projection, comparaison CAC et plan d'action.

## Cron

Planifié quotidiennement à 07 h (`vercel.json` → `/api/cron/gve-scan`).
Job interne exposé aussi via `POST /api/internal/cron/gve-scan`.

## Agent stratège

`growth-strategist` (interne) — cerveau éditorial du GVE : produit des briefs de
contenu et d'action à partir d'un canal recommandé, sous contrainte stricte
d'intégrité (voir `src/agents/registry.ts`).

## Tests

```bash
npm test -- src/lib/gve   # 19 tests
npm run lint
```
