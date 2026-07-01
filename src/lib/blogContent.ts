export interface BlogArticle {
  slug: string;
  titleFr: string;
  titleEn: string;
  excerptFr: string;
  excerptEn: string;
  dateIso: string;
  readingMin: number;
  category: 'fiscal' | 'comptabilite' | 'logiciel' | 'paie' | 'demarrage';
  keywordsFr: string[];
  bodyFr: string;
  bodyEn: string;
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'choisir-comptable-en-ligne-canada',
    titleFr: 'Comment choisir son comptable en ligne au Canada en 2026',
    titleEn: 'How to Choose an Online Accountant in Canada in 2026',
    excerptFr: 'Portail sécurisé, conformité PIPEDA, tarifs transparents — les 7 critères essentiels pour sélectionner votre comptable virtuel canadien.',
    excerptEn: 'Secure portal, PIPEDA compliance, transparent pricing — the 7 key criteria to choose your Canadian virtual accountant.',
    dateIso: '2026-01-15',
    readingMin: 6,
    category: 'comptabilite',
    keywordsFr: ['comptable en ligne Canada', 'choisir comptable virtuel', 'comptabilité PME Canada 2026'],
    bodyFr: `
## Les 7 critères pour choisir votre comptable en ligne au Canada

Avec la montée des plateformes numériques, de plus en plus d'entrepreneurs canadiens confient leur comptabilité à des firmes 100 % en ligne. Mais tous les services ne se valent pas. Voici les critères déterminants.

### 1. Hébergement des données au Canada

La Loi 25 au Québec et la loi PIPEDA au niveau fédéral exigent que vos données personnelles soient traitées de façon sécurisée. Assurez-vous que votre prestataire héberge ses serveurs **au Canada** (idéalement dans la région ca-central-1 d'AWS ou équivalent).

ComptaFlow héberge toutes vos données en région canadienne (ca-central-1), sans transfert international.

### 2. Portail client sécurisé avec chiffrement bout-en-bout

Vos pièces justificatives (relevés bancaires, factures, T4, Relevé 1) doivent transiter par un canal chiffré. Évitez les prestataires qui demandent d'envoyer des documents par courriel non sécurisé.

Un bon portail offre : téléversement chiffré, historique des accès, signatures électroniques et notifications en temps réel.

### 3. Connaissance des taxes canadiennes (TPS, TVQ, TVH, TVP)

Le système fiscal canadien est complexe : **13 régimes de taxes différents** selon les provinces. Votre comptable en ligne doit maîtriser :
- TPS 5 % + TVQ 9,975 % (Québec)
- TVH 13 % (Ontario, Nouveau-Brunswick, Nouvelle-Écosse)
- TPS 5 % + TVP/PST (Colombie-Britannique, Saskatchewan, Manitoba)
- TPS 5 % seulement (Alberta, Territoires)

### 4. Tarification transparente sans surprise

Méfiez-vous des offres « à partir de X $ » qui cachent des frais supplémentaires. Un bon comptable en ligne vous fournit une grille tarifaire claire avec le nombre de transactions inclus, les frais de paie et les extras éventuels.

Chez ComptaFlow : tenue de livres dès **150 $/mois** pour micro-entreprises, ou **45–75 $/h** pour les mandats ponctuels. Ouverture de dossier gratuite.

### 5. Accès bilingue (français et anglais)

Indispensable si vous faites affaire dans plusieurs provinces. Au Québec, la loi impose le droit de recevoir des services en français. Vérifiez que la plateforme est entièrement disponible dans les deux langues officielles.

### 6. Intégration avec vos logiciels existants

QuickBooks Online, Sage, Wave, Xero — votre comptable en ligne doit pouvoir synchroniser ou importer vos données sans ressaisie manuelle. Demandez quels formats de fichiers sont acceptés (CSV, QBO, OFX, PDF).

### 7. Réactivité et accompagnement humain

L'IA peut automatiser le classement, mais vous avez besoin d'un expert humain pour interpréter vos états financiers et vous conseiller. Vérifiez les délais de réponse garantis et la disponibilité d'un comptable attitré.

---

## Conclusion

Choisir un comptable en ligne au Canada, c'est avant tout choisir un **partenaire de confiance** qui comprend les réalités fiscales de votre province et protège vos données selon la loi canadienne.

**[Ouvrez votre dossier gratuitement chez ComptaFlow →](/login?next=/onboarding&register=1)**
    `,
    bodyEn: `
## The 7 Criteria for Choosing Your Online Accountant in Canada

More and more Canadian entrepreneurs are trusting 100% online accounting firms. But not all services are equal. Here are the key criteria.

### 1. Data hosted in Canada

PIPEDA federally and Law 25 in Quebec require that your personal data be processed securely. Make sure your provider hosts servers **in Canada**.

ComptaFlow hosts all data in the Canadian region (ca-central-1), with no international transfers.

### 2. Secure client portal with end-to-end encryption

Your supporting documents must travel through an encrypted channel. A good portal offers: encrypted uploads, access history, e-signatures, and real-time notifications.

### 3. Knowledge of Canadian taxes (GST, HST, PST, QST)

Canada has **13 different tax regimes** by province. Your online accountant must master:
- GST 5% + QST 9.975% (Quebec)
- HST 13% (Ontario, New Brunswick, Nova Scotia)
- GST 5% + PST (British Columbia, Saskatchewan, Manitoba)
- GST 5% only (Alberta, Territories)

### 4. Transparent pricing with no surprises

Avoid "starting from X$" offers that hide extra fees. ComptaFlow: bookkeeping from **$150/month** for micro-businesses, or **$45–75/hr** for one-time mandates. Free file opening.

### 5. Bilingual access (French and English)

Essential if you operate in multiple provinces. In Quebec, the law guarantees the right to services in French.

### 6. Integration with your existing software

QuickBooks Online, Sage, Wave, Xero — your online accountant must sync or import your data without manual re-entry.

### 7. Responsiveness and human support

AI can automate sorting, but you need a human expert to interpret your financials. Check guaranteed response times and dedicated accountant availability.

---

**[Open your file for free with ComptaFlow →](/login?next=/onboarding&register=1)**
    `,
  },
  {
    slug: 'guide-tps-tvq-tvh-canada',
    titleFr: 'TPS, TVQ et TVH : guide complet des taxes canadiennes pour entrepreneurs 2026',
    titleEn: 'GST, QST and HST: Complete Guide to Canadian Business Taxes 2026',
    excerptFr: 'Comprendre les obligations de taxes à la consommation selon votre province — seuils d\'inscription, fréquence de production, remboursements de crédit de taxe sur les intrants.',
    excerptEn: 'Understand sales tax obligations by province — registration thresholds, filing frequency, input tax credit refunds.',
    dateIso: '2026-02-01',
    readingMin: 8,
    category: 'fiscal',
    keywordsFr: ['TPS TVQ TVH entrepreneurs', 'taxe vente Canada PME', 'inscription TPS obligatoire'],
    bodyFr: `
## Guide des taxes canadiennes pour entrepreneurs 2026

Naviguer dans le système de taxes canadien est l'un des défis les plus courants pour les nouveaux entrepreneurs. Ce guide vous donne les bases essentielles.

### Quand doit-on s'inscrire à la TPS/TVH ?

Vous **devez** vous inscrire à la TPS/TVH si vos revenus taxables dépassent **30 000 $ sur 4 trimestres consécutifs**. En dessous, l'inscription est volontaire mais souvent avantageuse (vous pouvez récupérer la TPS payée sur vos achats via les CTI).

### Les différents régimes provinciaux

**Québec (TPS 5 % + TVQ 9,975 %)**
En plus de la TPS fédérale, le Québec impose la TVQ (Taxe de vente du Québec). Vous devez faire deux déclarations distinctes : l'une à l'ARC (Agence du revenu du Canada) et l'autre à Revenu Québec. Le taux combiné est de 14,975 %.

**Ontario (TVH 13 %)**
L'Ontario a harmonisé sa taxe provinciale avec la TPS fédérale pour créer la TVH (Taxe de vente harmonisée). Une seule déclaration à l'ARC. Taux : 13 %.

**Colombie-Britannique (TPS 5 % + TVP 7 %)**
La C.-B. n'a pas harmonisé sa taxe. Vous produisez la TPS à l'ARC et la TVP (Provincial Sales Tax) séparément au gouvernement provincial. Le taux TVP varie selon les biens/services.

**Alberta (TPS 5 % seulement)**
L'Alberta est la seule province sans taxe de vente provinciale, ce qui simplifie la comptabilité. Une seule déclaration TPS à l'ARC.

**Atlantique (TVH 15 %)**
Nouveau-Brunswick, Nouvelle-Écosse, Île-du-Prince-Édouard et Terre-Neuve ont tous un taux TVH de 15 % harmonisé avec le fédéral.

**Prairies (TPS 5 % + TVP provinciale)**
Saskatchewan (PST 6 %), Manitoba (PST 7 %) ont leur propre taxe provinciale distincte.

### Fréquence de production

- **Annuelle** : si vos revenus taxables sont inférieurs à 1 500 000 $
- **Trimestrielle** : si entre 1 500 000 $ et 6 000 000 $
- **Mensuelle** : si plus de 6 000 000 $

Le gouvernement peut exiger la production mensuelle même en dessous du seuil.

### Les Crédits de Taxe sur les Intrants (CTI)

Un CTI vous permet de récupérer la TPS/TVH payée sur vos achats d'entreprise. C'est pourquoi l'inscription à la TPS est souvent avantageuse même si vous n'y êtes pas obligé.

### Attention aux pénalités

Une déclaration en retard entraîne une pénalité de 1 % du solde dû, plus 0,25 % pour chaque mois de retard additionnel. Les intérêts s'accumulent quotidiennement.

---

**Vous avez besoin d'aide pour vos déclarations de taxes ?** ComptaFlow gère votre TPS/TVQ/TVH de A à Z.

**[Obtenir un devis gratuit →](/estimate)**
    `,
    bodyEn: `
## Canadian Business Tax Guide 2026

### When must you register for GST/HST?

You **must** register for GST/HST if your taxable revenues exceed **$30,000 over 4 consecutive quarters**. Below that, registration is voluntary but often advantageous — you can recover GST paid on purchases via ITCs.

### Provincial Tax Regimes

**Quebec (GST 5% + QST 9.975%)**
Two separate returns: one to CRA, one to Revenu Quebec. Combined rate: 14.975%.

**Ontario (HST 13%)**
Harmonized — single return to CRA at 13%.

**British Columbia (GST 5% + PST 7%)**
Not harmonized — GST to CRA, PST separately to provincial government.

**Alberta (GST 5% only)**
Alberta has no provincial sales tax — simplest tax environment in Canada.

**Atlantic (HST 15%)**
New Brunswick, Nova Scotia, PEI, and Newfoundland all have 15% HST.

### Filing Frequency

- **Annual**: taxable revenues under $1,500,000
- **Quarterly**: $1,500,000 – $6,000,000
- **Monthly**: over $6,000,000

### Input Tax Credits (ITCs)

ITCs let you recover GST/HST paid on business purchases — a key reason to register even when not required.

---

**Need help with your tax filings?** ComptaFlow handles your GST/QST/HST end-to-end.

**[Get a free quote →](/estimate)**
    `,
  },
  {
    slug: 'tenue-livres-travailleur-autonome-canada',
    titleFr: 'Tenue de livres pour travailleurs autonomes au Canada : guide 2026',
    titleEn: 'Bookkeeping for Self-Employed Canadians: 2026 Guide',
    excerptFr: 'Quels revenus déclarer, quelles dépenses déduire, comment séparer vos finances personnelles et professionnelles en tant que travailleur autonome au Canada.',
    excerptEn: 'What income to report, what expenses to deduct, and how to separate personal and business finances as a self-employed Canadian.',
    dateIso: '2026-02-15',
    readingMin: 7,
    category: 'comptabilite',
    keywordsFr: ['tenue de livres travailleur autonome', 'comptabilité freelance Canada', 'dépenses déductibles indépendant'],
    bodyFr: `
## Tenue de livres pour travailleurs autonomes au Canada

Que vous soyez consultant, graphiste, entrepreneur en construction ou professionnel libéral, la tenue de livres rigoureuse est votre meilleure protection en cas de vérification fiscale.

### Pourquoi séparer vos finances ?

L'erreur la plus courante : mélanger les entrées et sorties personnelles avec les revenus d'affaires. Ouvrez un **compte bancaire dédié** à votre activité dès le premier jour. Cela simplifie :
- Le calcul de votre revenu net d'affaires
- La déduction des dépenses admissibles
- La préparation de votre déclaration T1 (et TP-1 au Québec)

### Revenus à déclarer

En tant que travailleur autonome, vous déclarez **tous** vos revenus d'affaires, incluant :
- Paiements par Interac, virement ou chèque
- Revenus de plateformes (Upwork, Fiverr, Airbnb, etc.)
- Troc ou échanges de services (valeur marchande)
- Tout paiement en argent comptant

### Dépenses déductibles courantes

- **Espace de bureau à domicile** : calculé en proportion de la superficie totale (loyer ou intérêts hypothécaires, électricité, internet)
- **Véhicule** : kilométrage d'affaires × taux kilométrique ARC, ou méthode des dépenses réelles
- **Équipement et logiciels** : ordinateur, appareil photo, abonnements Adobe, Microsoft, etc.
- **Formation et développement** : cours, livres, formations liées à votre secteur
- **Frais de bureau** : fournitures, cartouches, mobilier
- **Téléphone** : portion d'utilisation professionnelle
- **Frais bancaires et d'intérêts** : sur compte et cartes d'affaires
- **Frais comptables** : oui, les honoraires de votre comptable sont déductibles !

### Le régime de retraite : REER et CELI

En tant que travailleur autonome, vous n'avez pas de REER collectif d'employeur. Cotisez à votre **REER individuel** (jusqu'à 18 % du revenu gagné l'année précédente) pour réduire votre impôt à payer.

### Acomptes provisionnels

Si votre impôt net dépasse **3 000 $ par an** (1 800 $ au Québec), vous devez payer des **acomptes provisionnels trimestriels** (mars, juin, septembre, décembre). Ignorez cette obligation et vous accumulerez des intérêts à 10 %+.

### Outils recommandés

- **Wave** : gratuit pour la facturation et le suivi basique (idéal pour débutants)
- **QuickBooks Simple Start** : abordable, connecté aux banques canadiennes
- **Sage** : plus robuste pour les volumes élevés

Ou laissez ComptaFlow gérer vos livres pendant que vous vous concentrez sur vos clients.

---

**[Démarrer avec ComptaFlow — Ouverture gratuite →](/login?next=/onboarding&register=1)**
    `,
    bodyEn: `
## Bookkeeping for Self-Employed Canadians

### Why Separate Your Finances?

The most common mistake: mixing personal and business transactions. Open a **dedicated business bank account** from day one.

### Income to Report

As self-employed, you report **all** business income including:
- Interac, wire, and cheque payments
- Platform income (Upwork, Fiverr, Airbnb, etc.)
- Barter or service exchanges (fair market value)
- Cash payments

### Common Deductible Expenses

- **Home office**: proportional to total square footage
- **Vehicle**: business mileage × CRA rate, or actual expense method
- **Equipment and software**: computer, subscriptions, etc.
- **Training**: courses and books related to your field
- **Phone**: business-use portion
- **Bank charges and interest**: on business accounts/cards
- **Accounting fees**: yes, your accountant is deductible!

### Quarterly Installments

If your net tax exceeds **$3,000/year**, you must pay **quarterly installments** (March, June, September, December). Miss them and you'll face 10%+ interest.

---

**[Start with ComptaFlow — Free file opening →](/login?next=/onboarding&register=1)**
    `,
  },
  {
    slug: 'quickbooks-sage-wave-comparaison-canada',
    titleFr: 'QuickBooks vs Sage vs Wave : quel logiciel comptable pour votre PME canadienne ?',
    titleEn: 'QuickBooks vs Sage vs Wave: Which Accounting Software for Your Canadian SMB?',
    excerptFr: 'Comparaison détaillée des logiciels comptables les plus populaires au Canada : prix, fonctionnalités, intégrations bancaires canadiennes et conformité fiscale.',
    excerptEn: 'Detailed comparison of the most popular accounting software in Canada: pricing, features, Canadian bank integrations, and tax compliance.',
    dateIso: '2026-03-01',
    readingMin: 9,
    category: 'logiciel',
    keywordsFr: ['QuickBooks Canada PME', 'Sage vs QuickBooks', 'logiciel comptable PME 2026'],
    bodyFr: `
## QuickBooks vs Sage vs Wave : comparaison 2026 pour PME canadiennes

Choisir le bon logiciel comptable peut transformer la gestion de votre PME. Voici une analyse objective des trois leaders au Canada.

### Wave — La solution gratuite idéale pour débutants

**Prix** : Gratuit (revenu sur traitement de paiements)

**Points forts :**
- Entièrement gratuit pour la comptabilité, facturation et rapports de base
- Interface simple, idéale pour les non-comptables
- Connexion bancaire (importation de relevés CSV)
- Facturation illimitée
- Rapports de base (bilan, compte de résultat)

**Limites :**
- Pas de gestion de stock avancée
- Paie payante (environ 40 $/mois + 6 $/employé)
- Support limité — forum communautaire surtout
- Pas idéal au-dessus de 500 transactions/mois

**Idéal pour :** Travailleurs autonomes et micro-entreprises < 100 000 $ de revenus

---

### QuickBooks Online — Le leader incontesté pour PME

**Prix :** Simple Start 22 $/mois · Essentiel 38 $/mois · Plus 54 $/mois · Avancé 99 $/mois

**Points forts :**
- Synchronisation automatique avec 600+ institutions financières canadiennes
- Intégration native TPS/TVQ/TVH avec génération automatique des déclarations
- App mobile robuste
- Écosystème de 700+ intégrations (Shopify, Square, Stripe, etc.)
- Rapports avancés et personnalisables
- Paie canadienne intégrée (T4, Relevé 1)
- Support téléphonique et chat en direct
- Certifié par Revenu Québec pour la production TP-1

**Limites :**
- Coût mensuel récurrent élevé pour les très petites entreprises
- Courbe d'apprentissage pour les fonctions avancées
- Augmentations de prix fréquentes

**Idéal pour :** PME de 1–50 employés avec volume modéré à élevé

---

### Sage 50cloud — Robustesse pour entreprises établies

**Prix :** Pro 59,95 $/mois · Comptabilité 79,95 $/mois · Premium 114,95 $/mois

**Points forts :**
- Puissant pour la gestion d'inventaire et la fabrication
- Paie canadienne très complète (T4, ROE, DAS)
- Rapports financiers très détaillés
- Version bureau + accès cloud
- Connu et accepté par les CPA canadiens
- Support téléphonique dédié 24/7

**Limites :**
- Interface vieillissante moins intuitive
- Plus complexe à configurer
- Prix élevé pour les petites structures

**Idéal pour :** PME établies, distribution, fabrication, >50 transactions/jour

---

### Notre recommandation

| Profil | Solution recommandée |
|--------|---------------------|
| Travailleur autonome / débutant | Wave (gratuit) |
| PME en croissance, e-commerce | QuickBooks Online Essentiel |
| Entreprise avec inventaire/fabrication | Sage 50cloud Comptabilité |
| Délégation complète | ComptaFlow gère pour vous |

---

Chez ComptaFlow, nos experts maîtrisent les trois plateformes. Nous pouvons configurer votre logiciel, former vos équipes et gérer vos livres — quelle que soit la solution choisie.

**[Obtenir de l'aide pour configurer votre logiciel →](/estimate)**
    `,
    bodyEn: `
## QuickBooks vs Sage vs Wave: 2026 Comparison for Canadian SMBs

### Wave — Best Free Option for Beginners

**Price**: Free (revenue on payment processing)

**Best for**: Self-employed and micro-businesses under $100K revenue

### QuickBooks Online — The SMB Leader

**Price**: Simple Start $22/month · Essentials $38/month · Plus $54/month

**Best for**: SMBs 1–50 employees with moderate to high transaction volume

### Sage 50cloud — Robustness for Established Businesses

**Price**: Pro $59.95/month · Accounting $79.95/month · Premium $114.95/month

**Best for**: Established SMBs, distribution, manufacturing, 50+ daily transactions

---

At ComptaFlow, our experts master all three platforms. We can configure your software, train your teams, and manage your books — whatever solution you choose.

**[Get help configuring your software →](/estimate)**
    `,
  },
  {
    slug: 'paie-t4-guide-employeurs-canada',
    titleFr: 'Paie, T4 et Relevé 1 : guide complet pour employeurs canadiens 2026',
    titleEn: 'Payroll, T4 and Relevé 1: Complete Guide for Canadian Employers 2026',
    excerptFr: 'Tout ce que vous devez savoir sur la paie au Canada : cotisations RPC/RRQ, AE, impôt retenu à la source, feuillets T4 et Relevé 1.',
    excerptEn: 'Everything you need to know about Canadian payroll: CPP/QPP contributions, EI, income tax withholdings, T4 and Relevé 1 slips.',
    dateIso: '2026-03-15',
    readingMin: 8,
    category: 'paie',
    keywordsFr: ['paie employeur Canada', 'T4 Relevé 1 guide', 'cotisations RRQ RPC AE 2026'],
    bodyFr: `
## Guide de la paie pour employeurs canadiens 2026

Embaucher votre premier employé est une étape importante — et une nouvelle série d'obligations fiscales. Voici tout ce qu'il faut savoir.

### Les retenues à la source obligatoires

Chaque chèque de paie doit inclure trois retenues :

**1. Impôt sur le revenu**
Calculé selon les tables de retenues de l'ARC et (pour le Québec) de Revenu Québec. Dépend du salaire, de la province de travail et des crédits d'impôt personnels déclarés sur le TD1.

**2. Cotisations au RPC/RRQ**
- **RPC** (Régime de pensions du Canada) — hors Québec
- **RRQ** (Régime de rentes du Québec) — Québec seulement
- Taux 2026 : 5,95 % pour l'employé + 5,95 % pour l'employeur (sur le salaire entre 3 500 $ et 68 500 $)

**3. Cotisations à l'AE (Assurance-emploi)**
- Taux 2026 : 1,66 % pour l'employé, 2,32 % pour l'employeur (hors Québec)
- Au Québec : 1,31 % (employé) + 1,834 % (employeur) — taux réduit car RQAP distinct

### Le RQAP au Québec

Le Régime québécois d'assurance parentale (RQAP) remplace une partie de l'AE pour les congés de maternité/paternité. Taux 2026 : 0,494 % employé + 0,692 % employeur.

### Remises à l'ARC

Vous devez remettre les retenues (impôt + RPC/RRQ + AE) à l'ARC selon votre fréquence de versement :
- **Régulière** : le 15 du mois suivant (masse salariale annuelle < 25 000 $)
- **Accélérée** : dans les 3 jours ouvrables (> 100 000 $/mois)

Au Québec, ajoutez les remises à Revenu Québec (impôt + RRQ + RQAP).

### Les feuillets T4 et Relevé 1

**Échéance :** 28 février de chaque année

Vous devez produire un T4 pour chaque employé ayant reçu un salaire durant l'année, et un Relevé 1 pour les employés travaillant au Québec. Ces feuillets doivent être soumis électroniquement à l'ARC (si 5 feuillets ou plus).

### Le Registre des employeurs

Avant d'émettre votre premier chèque, enregistrez-vous comme employeur auprès de l'ARC (numéro de compte de retenues). Sans enregistrement, vos remises ne seront pas correctement attribuées.

### Erreurs les plus fréquentes

1. **Oublier les avantages imposables** (voiture d'entreprise, assurance collective) — ils s'ajoutent au revenu imposable
2. **Mal calculer les heures supplémentaires** — 1,5× le taux horaire après 40h/semaine (varie par province)
3. **Retarder les remises** — 10 % de pénalité + intérêts dès le premier jour de retard
4. **Manquer la date du T4** — 100 $ à 250 $ par feuillet en retard

---

Confier la paie à ComptaFlow, c'est l'assurance que chaque remise est faite à temps et que vos T4 sont produits sans erreur.

**[Déléguer ma paie à ComptaFlow →](/estimate)**
    `,
    bodyEn: `
## Canadian Employer Payroll Guide 2026

### Mandatory Source Deductions

Every paycheque must include three deductions:

**1. Income Tax** — based on CRA withholding tables and province

**2. CPP/QPP Contributions**
- CPP (outside Quebec) or QPP (Quebec)
- 2026 rate: 5.95% employee + 5.95% employer (on earnings $3,500–$68,500)

**3. EI Premiums**
- 2026: 1.66% employee, 2.32% employer (outside Quebec)
- Quebec: reduced rates due to QPIP (parental insurance)

### T4 and Relevé 1 Slips

**Deadline**: February 28 each year. Must be filed electronically with CRA (5+ slips).

### Most Common Mistakes

1. Forgetting taxable benefits (company car, group insurance)
2. Miscalculating overtime (1.5× after 40h/week, varies by province)
3. Late remittances — 10% penalty + interest from day one
4. Missing T4 deadline — $100–$250 penalty per late slip

---

Delegating payroll to ComptaFlow means every remittance is on time and T4s are produced without error.

**[Delegate my payroll to ComptaFlow →](/estimate)**
    `,
  },
  {
    slug: 'demarrer-entreprise-canada-obligations-comptables',
    titleFr: 'Démarrer une entreprise au Canada : obligations comptables et fiscales dès le premier jour',
    titleEn: 'Starting a Business in Canada: Accounting and Tax Obligations From Day One',
    excerptFr: 'Immatriculation, numéros fiscaux, premier exercice financier, TPS/TVH — le calendrier complet des démarches comptables pour les nouveaux entrepreneurs canadiens.',
    excerptEn: 'Registration, tax numbers, first fiscal year, GST/HST — the complete accounting checklist for new Canadian entrepreneurs.',
    dateIso: '2026-04-01',
    readingMin: 7,
    category: 'demarrage',
    keywordsFr: ['démarrer entreprise Canada', 'obligations comptables nouvelle entreprise', 'numéro ARC inscription TPS'],
    bodyFr: `
## Démarrer une entreprise au Canada : le calendrier comptable complet

Lancer votre entreprise est excitant — mais les démarches administratives peuvent rapidement devenir intimidantes. Ce calendrier vous guide étape par étape.

### Avant le premier jour

**Choisir votre structure juridique**
- **Entreprise individuelle** : la plus simple, mais responsabilité personnelle illimitée
- **Société en nom collectif** : 2 associés ou plus, responsabilité partagée
- **Société par actions (Inc./Ltd.)** : personnalité morale distincte, responsabilité limitée, avantages fiscaux

**Immatriculer votre nom d'entreprise**
Au Québec : Registraire des entreprises du Québec (REQ) — 38 $ à 60 $. Dans les autres provinces, auprès du registraire provincial.

### Semaine 1 — Obtenir vos numéros fiscaux

**Numéro d'entreprise (NE) — ARC**
Obligatoire pour la TPS/TVH, la paie et les importations. Obtenez-le en ligne sur canada.ca/arc en 10 minutes.

**Inscription à la TPS/TVH**
Obligatoire si > 30 000 $ de revenus prévus. Volontaire en dessous — mais souvent avantageux pour récupérer les CTI.

**Au Québec : inscription à la TVQ**
Séparée de la TPS. Faite auprès de Revenu Québec simultanément.

**Si vous embauchez : compte de retenues**
Enregistrez-vous comme employeur auprès de l'ARC avant le premier chèque de paie.

### Mois 1 — Mettre en place votre comptabilité

**Ouvrir un compte bancaire d'entreprise**
Obligatoire dès que vous incorporez. Fortement recommandé même en entreprise individuelle.

**Choisir votre logiciel comptable**
Wave (gratuit), QuickBooks Simple Start (22 $/mois) ou déléguer à ComptaFlow.

**Établir votre exercice financier**
Les sociétés par actions peuvent choisir n'importe quelle date de fin d'exercice (12 mois). Les entreprises individuelles suivent l'année civile (31 décembre).

### Mois 3 — Système de classement

Mettez en place un système pour conserver **toutes vos pièces justificatives** pendant 6 ans (exigence ARC) :
- Factures fournisseurs
- Relevés bancaires
- Contrats clients
- Preuves de dépenses d'entreprise

Un coffre-fort numérique (comme celui de ComptaFlow) facilite la conformité et simplifie les vérifications éventuelles.

### Trimestre 1 — Premier acompte provisionnel (si applicable)

Si votre impôt estimé dépasse 3 000 $ (1 800 $ au Québec), préparez votre premier acompte pour mars.

### Fin d'exercice — La préparation des états financiers

Au moins 30 jours avant votre fin d'exercice, rassemblez :
- Relevés bancaires complets
- Inventaire (si applicable)
- Factures impayées (comptes clients)
- Dettes fournisseurs (comptes fournisseurs)
- Actifs immobilisés et leur amortissement

---

### Le conseil le plus important

**Ne remettez pas à plus tard.** Les erreurs comptables accumulées sur 3 ans coûtent 5× plus cher à corriger qu'un suivi mensuel. Commencez avec les bonnes habitudes dès le premier jour.

**[Ouvrir mon dossier chez ComptaFlow (gratuit) →](/login?next=/onboarding&register=1)**
    `,
    bodyEn: `
## Starting a Business in Canada: The Complete Accounting Checklist

### Before Day One

**Choose your legal structure:**
- **Sole proprietorship**: simplest, unlimited personal liability
- **Partnership**: 2+ partners, shared liability
- **Corporation (Inc./Ltd.)**: separate legal entity, limited liability, tax advantages

### Week 1 — Get Your Tax Numbers

**Business Number (BN) — CRA**: Required for GST/HST, payroll, imports. Apply online at canada.ca/cra in 10 minutes.

**GST/HST Registration**: Mandatory if projected revenues > $30,000. Voluntary below — but often advantageous for ITCs.

**If hiring: Source Deductions Account**: Register as an employer with CRA before the first paycheque.

### Month 1 — Set Up Accounting

- Open a **dedicated business bank account**
- Choose accounting software: Wave (free), QuickBooks ($22/month), or delegate to ComptaFlow
- Establish your **fiscal year end** (corporations can choose any 12-month period)

### The Most Important Advice

**Don't delay.** Accounting errors accumulated over 3 years cost 5× more to fix than monthly tracking. Start with good habits from day one.

**[Open my ComptaFlow file (free) →](/login?next=/onboarding&register=1)**
    `,
  },
];

export function getArticle(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((a) => a.slug === slug);
}
