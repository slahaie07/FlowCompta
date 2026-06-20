# ComptaFlow — Listings gratuits Canada (copier-coller)

> **Objectif** : Maximiser la visibilité SEO locale/nationale sans budget pub.  
> **Site** : https://compta-flow.net  
> **Sitemap** : https://compta-flow.net/sitemap.xml  
> **Courriel** : comptaflow.officiel@gmail.com  
> **Script ping** : `npx tsx scripts/ping-search-engines.ts`

---

## Statut d'automatisation

| Action | Statut | Notes |
|--------|--------|-------|
| `robots.txt` | ✅ En place | `public/robots.txt` |
| `sitemap.xml` | ✅ Dynamique | API `/sitemap.xml` via Vercel |
| Meta OG / Twitter | ✅ En place | `index.html` |
| JSON-LD Schema.org | ✅ En place | Organization + WebSite + ProfessionalService |
| Ping Google/Bing | ⚙️ Script prêt | Exécuter après chaque déploiement |
| Google Search Console | 📋 Manuel | Compte Google requis |
| Bing Webmaster | 📋 Manuel | Compte Microsoft requis |
| Apple Business Connect | 📋 Manuel | Compte Apple requis |
| Yelp / Pages Jaunes / etc. | 📋 Manuel | Inscription 1-clic |

---

## A. Moteurs de recherche (priorité 1)

### 1. Google Search Console

| | |
|---|---|
| **URL** | https://search.google.com/search-console |
| **Action** | Ajouter une propriété → **Préfixe d'URL** : `https://compta-flow.net` |
| **Vérification** | Balise HTML (recommandé) ou DNS TXT via registrar |
| **Sitemap** | Soumettre : `https://compta-flow.net/sitemap.xml` |
| **Inspection URL** | Demander l'indexation de `/`, `/estimate`, `/ca/quebec` |

**Texte « À propos » (si demandé)** :
```
ComptaFlow — plateforme comptable premium pour entrepreneurs canadiens. Tenue de livres, taxes, paie, portail client sécurisé. https://compta-flow.net
```

---

### 2. Bing Webmaster Tools

| | |
|---|---|
| **URL** | https://www.bing.com/webmasters |
| **Action** | Ajouter un site → importer depuis Google Search Console (plus rapide) ou vérifier manuellement |
| **Sitemap** | `https://compta-flow.net/sitemap.xml` |
| **Ping direct** | https://www.bing.com/ping?sitemap=https%3A%2F%2Fcompta-flow.net%2Fsitemap.xml |

---

### 3. IndexNow (Bing + partenaires)

| | |
|---|---|
| **URL** | https://www.indexnow.org/documentation |
| **Action** | Générer une clé API, placer `/{key}.txt` à la racine, soumettre URLs |
| **Alternative rapide** | Exécuter `npx tsx scripts/ping-search-engines.ts` après deploy |

---

## B. Apple & cartes (priorité 2)

### 4. Apple Business Connect

| | |
|---|---|
| **URL** | https://businessconnect.apple.com |
| **Action** | Créer / revendiquer la fiche entreprise |
| **Catégorie** | Accounting Service / Financial Services |
| **Nom** | ComptaFlow |
| **Description** | Copier depuis section « Description longue » ci-dessous |
| **Site** | https://compta-flow.net |
| **Zone desservie** | Canada (service en ligne — pas d'adresse physique requise si « Service area business ») |

---

## C. Annuaires Canada (priorité 3)

### 5. Yelp Canada

| | |
|---|---|
| **URL** | https://biz.yelp.ca/signup |
| **Catégorie** | Accountants, Bookkeepers, Tax Services |
| **Nom** | ComptaFlow |
| **Description (FR)** | Voir bloc « Description longue » |
| **Site** | https://compta-flow.net |
| **Note** | Choisir « Service area » si pas de local physique |

---

### 6. Yellow Pages Canada (Pages Jaunes)

| | |
|---|---|
| **URL inscription** | https://www.yellowpages.ca/solutions/en-ca/products/free-listing |
| **URL FR** | https://www.pagesjaunes.ca/solutions/fr-ca/produits/inscription-gratuite |
| **Catégorie** | Comptables · Tenue de livres · Services aux entreprises |
| **Nom** | ComptaFlow |
| **Description** | Voir bloc ci-dessous |
| **Site** | https://compta-flow.net |

---

### 7. CanadaOne Business Directory

| | |
|---|---|
| **URL** | https://www.canadaone.com/biz/add-your-business.html |
| **Catégorie** | Accounting & Bookkeeping |
| **Nom** | ComptaFlow |
| **Description** | Voir bloc ci-dessous |
| **Site** | https://compta-flow.net |

---

### 8. 411.ca

| | |
|---|---|
| **URL** | https://www.411.ca/add-your-business |
| **Catégorie** | Comptables |
| **Nom** | ComptaFlow |
| **Site** | https://compta-flow.net |

---

### 9. Hotfrog Canada

| | |
|---|---|
| **URL** | https://www.hotfrog.ca/AddYourBusiness.aspx |
| **Catégorie** | Accounting Services |
| **Nom** | ComptaFlow |

---

### 10. Cylex Canada

| | |
|---|---|
| **URL** | https://www.cylex-canada.ca/company/add.html |
| **Catégorie** | Accounting & Bookkeeping |

---

## D. Annuaires Québec (priorité 4)

### 11. Registre des entreprises du Québec (info publique)

| | |
|---|---|
| **URL** | https://www.registreentreprises.gouv.qc.ca |
| **Note** | Si NEQ enregistré — s'assurer que le site web est à jour sur la fiche légale |

---

### 12. Québec Numérique / PME MTL (selon éligibilité)

| | |
|---|---|
| **PME MTL** | https://pmemtl.com (réseau entrepreneurs Montréal — si applicable) |
| **Québec.ca entreprises** | https://www.quebec.ca/entreprises-et-travailleurs-autonomes |

---

### 13. Classements locaux gratuits

| Annuaire | URL |
|----------|-----|
| iGlobal Canada | https://www.iglobal.co/canada |
| Tuugo | https://www.tuugo.ca/AddYourBusiness |
| Brownbook | https://www.brownbook.net/add-business/ |
| Tupalo | https://www.tupalo.co/en/Account/Register |
| Cybo | https://www.cybo.com/US/biz/add/ |

---

## E. Réseaux sociaux (création de page — gratuit)

| Plateforme | URL création | Nom | Bio (copier) |
|------------|--------------|-----|--------------|
| **Facebook Page** | https://www.facebook.com/pages/create | ComptaFlow | Comptabilité premium pour entrepreneurs au Canada 🇨🇦 · compta-flow.net |
| **Instagram** | https://www.instagram.com/accounts/emailsignup/ | @comptaflow (si dispo) | ComptaFlow • Sérénité financière ✨ Portail 24/7 · CPA · Canada 👇 |
| **LinkedIn Page** | https://www.linkedin.com/company/setup/new/ | ComptaFlow | Excellence comptable pour entrepreneurs visionnaires. https://compta-flow.net |
| **TikTok Business** | https://www.tiktok.com/signup | @comptaflow | Comptabilité premium 🇨🇦 compta-flow.net |
| **Pinterest Business** | https://www.pinterest.ca/business/create/ | ComptaFlow | Conseils compta PME Canada |
| **YouTube** | https://www.youtube.com/create_channel | ComptaFlow | Tutoriels comptabilité PME Canada |

**Visuels à uploader** :
- Facebook : `public/marketing/facebook/facebook-cover.png`
- LinkedIn : `public/marketing/linkedin/linkedin-banner-b2b.png`
- Instagram/TikTok : assets `public/marketing/instagram/` et `tiktok/`

**Légendes** : `docs/social_media/PUBLISH_PACK.md`

---

## F. Textes réutilisables (copier-coller)

### Description longue (750 caractères max)

```
ComptaFlow est une plateforme comptable premium pour entrepreneurs et PME partout au Canada. Services : tenue de livres horaire (45–75 $/h) ou forfaitaire (dès 150 $/mois), déclarations TPS/TVQ/TVH, paie, feuillets T4/Relevé 1, configuration QuickBooks et Sage. Portail client sécurisé 24/7, coffre-fort chiffré AES-256, conformité PIPEDA et Loi 25, hébergement des données au Canada. Paiement par Interac e-Transfer. Ouverture de dossier gratuite — vous ne payez que pour les travaux effectués. Service bilingue français/anglais. https://compta-flow.net — comptaflow.officiel@gmail.com
```

### Description courte (250 caractères)

```
ComptaFlow : comptabilité premium en ligne pour PME canadiennes. Tenue de livres, taxes, paie, portail client sécurisé. Ouverture gratuite. Interac. https://compta-flow.net
```

### Description EN

```
ComptaFlow — premium online accounting for Canadian SMBs. Bookkeeping, GST/HST/QST filings, payroll, secure client portal. Free account setup. Interac payments. https://compta-flow.net
```

### Mots-clés (tags annuaires)

```
comptabilité, tenue de livres, CPA, comptable, TPS, TVQ, TVH, paie, T4, portail client, PME, entrepreneur, Québec, Canada, Interac, QuickBooks, Sage, Loi 25, PIPEDA
```

### Horaires (service en ligne)

```
Lundi–Vendredi : 9 h – 17 h (HE)
Support en ligne : 24/7 (assistant + CPA sous 24 h ouvrables)
```

---

## G. Checklist post-déploiement

```powershell
# 1. Vérifier sitemap live
curl https://compta-flow.net/sitemap.xml

# 2. Vérifier robots.txt
curl https://compta-flow.net/robots.txt

# 3. Ping moteurs de recherche
npx tsx scripts/ping-search-engines.ts

# 4. Tester partage social (Facebook Debugger)
# https://developers.facebook.com/tools/debug/?q=https%3A%2F%2Fcompta-flow.net

# 5. Tester Twitter Card
# https://cards-dev.twitter.com/validator

# 6. Tester rich results Google
# https://search.google.com/test/rich-results?url=https%3A%2F%2Fcompta-flow.net
```

---

## H. Ce que l'agent NE PEUT PAS faire sans vos identifiants

| Plateforme | Raison |
|------------|--------|
| Google Search Console | Connexion Google + vérification domaine |
| Bing Webmaster | Connexion Microsoft |
| Facebook / Instagram / TikTok | OAuth + 2FA |
| LinkedIn Company Page | Compte admin LinkedIn |
| Yelp / Pages Jaunes | Revendication téléphone ou courriel |
| Apple Business Connect | Apple ID entreprise |

**Tout est préparé** : textes, URLs, visuels, bios et calendrier dans `PUBLISH_PACK.md`.

---

## I. Ordre recommandé (30 min)

1. ✅ Déployer sur Vercel (main)
2. ⚙️ `npx tsx scripts/ping-search-engines.ts`
3. 📋 Google Search Console + soumettre sitemap
4. 📋 Bing Webmaster (import GSC)
5. 📋 Créer pages Facebook + LinkedIn + Instagram
6. 📋 Publier 1er post depuis `PUBLISH_PACK.md`
7. 📋 Inscrire sur Pages Jaunes + Yelp (30 min)
8. 📋 Apple Business Connect (si cible iOS/Plans)

---

*Guide listings gratuits Canada — ComptaFlow — juin 2026*
