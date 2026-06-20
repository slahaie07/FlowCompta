/**
 * 🌍 Moteur de Traduction Comptaflow (i18n)
 * Centralise tout le contenu textuel pour garantir une évolutivité et une cohérence totale.
 */

export const i18n = {
  fr: {
    welcome: "Bienvenue chez Comptaflow.",
    slogan: "La comptabilité qui coule de source.",
    login: "Se connecter",
    register: "S'inscrire",
    personal: "Particulier",
    business: "Entreprise / Autonome",
    back: "Retour",
    continue: "Continuer",
    step: "Étape",
    name_placeholder: "Marie Tremblay",
    company_placeholder: "Tremblay Design inc.",
    currency: "$ CAD",
    setup_fee: "Frais d'ouverture unique",
    total: "Total à payer",
    secure_storage: "Coffre-fort chiffré",
    audit_active: "Audit certifié",
    msg_validate: "Veuillez valider votre courriel avant de continuer.",
    
    // Services
    services: {
      bookkeeping: "Tenue de livres",
      payroll: "Gestion de la paie",
      taxes_biz: "Impôts Société",
      taxes_perso: "Impôts Particulier",
      consulting: "Commis comptable & Tenue de livres",
      stocks: "Gestion des stocks",
      title: "Nos services et tarifs",
      subtitle: "Tarifs transparents pour la tenue de livres, la paie et l'aide comptable partout au Canada. Forfaits mensuels, tarif horaire ou services à la carte — choisissez ce qui correspond à votre réalité.",
      composer: "Demander une soumission",
      perMandate: "Tarif indicatif",
      perHour: "À l'heure",
      perMonth: "Par mois",
      perDeclaration: "Par déclaration",
      oneTime: "Frais unique",
      estimateNote: "Estimation — devis final après analyse de votre dossier",
      categories: {
        hourly: {
          title: "1. Tarif horaire de base",
          subtitle: "Mandats ponctuels, remplacements ou besoins ponctuels."
        },
        monthly: {
          title: "2. Forfaits de tenue de livres mensuelle",
          subtitle: "Idéal pour fidéliser vos clients et leur assurer une tranquillité d'esprit."
        },
        alacarte: {
          title: "3. Services à la carte",
          subtitle: "Besoins précis et récurrents, à prix fixes ou sur mesure."
        }
      },
      items: {
        hourlyBookkeeping: {
          name: "Commis comptable / Tenue de livres",
          desc: "Service de commis comptable pour saisie, classement, conciliation et support administratif. Selon votre expérience et la complexité du mandat.",
          price: "45 $ – 75 $ / h"
        },
        monthlyMicro: {
          name: "Micro-entreprise ou travailleur autonome",
          desc: "Très peu de transactions, pas d'employés. Tenue de livres légère et suivi fiscal de base.",
          price: "150 $ – 250 $ / mois"
        },
        monthlySmall: {
          name: "Petite entreprise",
          desc: "Volume moyen de factures, conciliation bancaire régulière et rapports mensuels.",
          price: "300 $ – 500 $ / mois"
        },
        monthlySme: {
          name: "PME avec gestion de la paie",
          desc: "Volume plus élevé, paie pour quelques employés et tenue de livres complète.",
          price: "500 $ – 800 $+ / mois"
        },
        gstQst: {
          name: "Déclaration des taxes (TPS/TVH/TVP)",
          desc: "Préparation et transmission de vos déclarations de taxes — mensuelle ou trimestrielle.",
          price: "35 $ – 60 $ / décl."
        },
        payroll: {
          name: "Traitement de la paie (1 à 5 employés)",
          desc: "Calcul des salaires, déductions à la source et conformité paie pour une petite équipe.",
          price: "50 $ – 80 $ / mois"
        },
        t4Releve1: {
          name: "Feuillets fiscaux (T4 / Relevé 1)",
          desc: "Préparation des feuillets de fin d'année pour vos employés.",
          price: "50 $ + 25 $ / employé"
        },
        catchUp: {
          name: "Comptabilité en retard",
          desc: "Mise à jour d'une tenue de livres en retard — facturé au tarif horaire selon le volume.",
          price: "50 $ – 70 $ / h"
        },
        softwareSetup: {
          name: "Configuration logiciel (QuickBooks, Sage…)",
          desc: "Installation, paramétrage et formation initiale pour les nouveaux clients.",
          price: "150 $ – 300 $"
        },
        taxHelpAutonomous: {
          name: "Aide impôt travailleur autonome",
          desc: "Rassembler et structurer vos chiffres avant transmission à votre comptable.",
          price: "150 $ – 300 $"
        }
      }
    },
    
    // Navigation
    nav: {
      services: "Services",
      processus: "Processus",
      faq: "FAQ",
      clientSpace: "Espace client",
      becomeClient: "Devenir client",
      mobileMenuTitle: "Le registre des services",
      mobileFlux: "Le flux",
      mobileFaq: "Questions fréquentes",
      mobileOpen: "Ouvrir mon dossier",
      getEstimate: "Obtenir une estimation"
    },

    // Hero
    hero: {
      tagline: "Services de tenue de livres & d'aide comptable · Canada",
      title1: "Votre tenue de livres,",
      title2: "claire et sans paperasse.",
      subtitle: "Comptaflow réunit votre tenue de livres, vos déclarations de revenus et d'impôts dans un seul flux d'aide comptable : un portail, des prix fermes, zéro tracas.",
      cta: "Demander une soumission",
      estimateCta: "Obtenir une estimation",
      clientArea: "Espace Client",
      preview: "Aperçu client",
      item1: "Tenue de livres — mai 2026",
      item1Val: "Conciliée",
      item2: "Documents reçus au coffre-fort",
      item3: "Déclarations taxes fédérales et provinciales",
      item3Val: "Transmise",
      item4: "Forfait mensuel actif",
      item4Val: "Micro-entreprise",
      peace: "Tranquillité d'esprit",
      total: "Totale",
      
      stat1Val: "24",
      stat1Unit: "h",
      stat1Desc: "Délai de réponse garanti, jours ouvrables",
      stat2Val: "100",
      stat2Unit: "%",
      stat2Desc: "En ligne — du paiement au livrable final",
      stat3Val: "0",
      stat3Unit: "$",
      stat3Desc: "de surprise : le prix affiché est le prix facturé"
    },

    // Process
    process: {
      tagline: "Article II — Le flux",
      title: "Trois étapes. Un seul flux.",
      step1Title: "Choisissez vos services",
      step1Desc: "Créez votre compte, puis choisissez votre forfait mensuel, service à la carte ou mandat horaire depuis votre portail sécurisé.",
      step2Title: "Déposez vos pièces",
      step2Desc: "Glissez-déposez vos reçus, T4, factures dans votre coffre-fort chiffré et hébergé au Canada.",
      step3Title: "Suivez & Récupérez",
      step3Desc: "Suivez l'avancement de vos déclarations et récupérez vos livrables validés en direct."
    },

    // FAQ
    faq: {
      tagline: "Article V — Questions fréquentes",
      title: "Avant de nous confier vos chiffres.",
      q1: "Comment fonctionne le tarif horaire ?",
      a1: "Pour les mandats ponctuels ou les remplacements, nous facturons entre 45 $ et 75 $ de l'heure selon la complexité. Un devis vous est fourni avant tout travail.",
      q2: "Quel forfait mensuel me convient ?",
      a2: "Micro-entreprise (150–250 $/mois) pour peu de transactions sans employés ; Petite entreprise (300–500 $/mois) pour un volume moyen ; PME avec paie (500–800 $+/mois) pour les dossiers plus exigeants.",
      q3: "Mes documents sont-ils en sécurité ?",
      a3: "Oui. Vos fichiers sont transmis chiffrés (TLS) et stockés dans une base de données hébergée au Canada, accessible uniquement par vous et votre préparateur comptable.",
      q4: "Les prix affichés incluent-ils les taxes ?",
      a4: "Non. Les tarifs sont hors taxes (TPS, TVH, TVQ, TVP, etc. selon votre province). Un devis détaillé vous est remis avant confirmation du mandat.",
    },

    // Cookies
    cookies: {
      title: "🍪 Consentement aux témoins (Cookies)",
      desc: "Nous utilisons des témoins essentiels et analytiques pour optimiser votre expérience, conformément à la Loi 25. Vous pouvez accepter ou refuser les témoins non essentiels. Consultez notre Politique de Confidentialité pour en savoir plus.",
      decline: "Refuser",
      accept: "Accepter"
    },

    // Footer
    footer: {
      taxDisclaimer: "Les prix affichés sont hors taxes (TPS, TVH, TVQ ou TVP selon la province).",
      privacy: "Confidentialité (Loi 25)",
      terms: "Conditions de service",
      legal: "Mentions légales",
      admin: "Administration",
      copyright: "© 2026 Comptaflow — Canada"
    },

    auth: {
      tagline: "Canada • Aide Comptable & Tenue de Livres",
      subtitle: "Système de gestion financière et fiscale hautement sécurisé pour entrepreneurs canadiens.",
      privateSpace: "Espace Privé",
      privateSpaceDesc: "S'identifier et accéder à ses portails",
      createFile: "Créer un Dossier",
      createFileDesc: "Nouveau comptable ou client final",
      loginTitle: "S'identifier.",
      registerTitle: "Nouveau Dossier.",
      loginSubtitle: "Rapprocher vos flux financiers",
      registerSubtitle: "Formulaire d'enregistrement fiscal",
      fullName: "Nom complet",
      email: "Adresse courriel",
      password: "Mot de passe",
      roleLabel: "Votre statut d'accès",
      roleClient: "Client final (Entreprise/Individu)",
      roleSubAdmin: "Préparateur Partenaire (Tenue de livres)",
      partnerLabel: "Comptable Partenaire",
      noPartner: "Aucun comptable partenaire n'est enregistré. Créez d'abord un compte comptable ou connectez-vous comme Super Admin.",
      partnersLoading: "Chargement des comptables partenaires…",
      partnersLoadError: "Impossible de charger la liste des partenaires. La migration SQL est peut-être incomplète.",
      contactSupportHint: "Pour ouvrir un dossier client, contactez notre équipe — nous vous rattacherons à un comptable partenaire.",
      contactSupport: "Contacter le support",
      resendEmail: "Renvoyer le courriel de validation",
      submitLogin: "S'identifier",
      submitRegister: "Créer le compte",
      switchToRegister: "Pas encore inscrit ? Créer un dossier",
      switchToLogin: "Déjà inscrit ? S'identifier",
      footer: "Portail ComptaFlow • Canada • MMXXVI"
    },

    portal: {
      brand: "ComptaFlow",
      search: "Rechercher dans le portail…",
      logout: "Déconnexion",
      signMandate: "Signer Mandat",
      notifications: "Notifications",
      openMenu: "Ouvrir le menu",
      closeMenu: "Fermer le menu",
      changeLanguage: "Changer la langue",
      loading: "Chargement de la vue…",
      roles: {
        super_admin: "Propriétaire Suprême",
        sub_admin: "Préparateur Partenaire",
        client: "Espace Client"
      },
      sections: {
        workspace: "Mon espace",
        finance: "Finances",
        documents: "Documents",
        help: "Aide & support",
        firm: "Cabinet",
        production: "Production",
        payments: "Paiements",
        communication: "Communication",
        network: "Réseau ComptaFlow"
      },
      nav: {
        super_overview: "Chiffres Clés",
        super_subadmins: "Gestion Comptables",
        super_clients: "Tous les Clients",
        super_invoices: "Toutes les Factures",
        messaging: "Support Réseau",
        admin_overview: "Tableau de bord",
        admin_clients: "Mes Clients",
        transactions: "Journal des flux",
        invoices: "Mes Factures",
        vault: "Coffre-fort",
        interac_settings: "Paramètres Interac",
        sales_ledger: "Grand livre ventes",
        sales_ledger_global: "Grand livre global",
        service_reports: "Rapports services",
        overview: "Ma Situation",
        faq: "Sécurité & FAQ",
        support: "Centre d'Aide",
        client_messaging: "Contacter mon comptable",
        services: "Services & Tarifs",
        quote: "Estimation tarifaire",
        procedure: "Mon parcours dossier"
      },
      overview: {
        greeting: "Bonjour,",
        subtitle: "Tableau de bord",
        contactCpa: "Contacter mon comptable",
        help: "Centre d'aide",
        pendingInvoices: "Factures à régler",
        pendingCount: "facture(s) en attente",
        totalPaid: "Total Honoraires Réglés",
        paidCount: "facture(s) payée(s)",
        vault: "Coffre-fort Numérique",
        vaultDocs: "Docs",
        vaultEncryption: "Chiffrement AES-256 Actif",
        uploadTitle: "Dépôt de Document Instantané",
        uploadDesc: "Téléversez vos reçus, relevés ou avis de cotisation pour votre comptable.",
        uploadCta: "Téléverser une pièce justificative",
        uploading: "Téléversement en cours…",
        uploadHint: "PDF, Image ou Excel • Max 4 Mo",
        mandateTitle: "Mandat de Gestion Électronique",
        mandateDesc: "Votre mandat de tenue de livres et d'aide comptable est signé et conforme aux exigences de l'ARC et des administrations fiscales provinciales.",
        viewMandate: "Voir le Mandat Signé",
        billing: "Facturation & Interac",
        upToDate: "Votre dossier est à jour",
        noPending: "Aucun règlement en attente",
        declarePaid: "Déclarer payée après virement",
        paymentPending: "Paiement en cours de validation par votre comptable"
      }
    },

    serviceSelector: {
      activeLabel: "Service actif",
      confirmed: "Confirmé",
      changeHint: "Pour changer de service, contactez votre comptable via la messagerie.",
      viewProcedure: "Voir mon parcours dossier",
      chooseLabel: "Choisir votre service",
      chooseTitle: "Quel mandat souhaitez-vous ouvrir ?",
      chooseDesc: "Sélectionnez le service qui correspond à vos besoins. Un devis personnalisé vous sera transmis après validation.",
      placeholder: "— Sélectionnez un service —",
      confirm: "Confirmer mon choix de service",
      selectWarning: "Veuillez choisir un service dans la liste.",
      saved: "Votre service a été enregistré. Suivez maintenant votre parcours dossier.",
      getEstimate: "Obtenir une estimation tarifaire"
    },

    pricingQuestionnaire: {
      badge: "Estimation rapide",
      title: "Quel budget pour votre mandat ?",
      subtitle: "Répondez à quelques questions pour obtenir une fourchette indicative en dollars canadiens.",
      progress: "Question {current} sur {total}",
      showEstimate: "Voir mon estimation",
      disclaimer: "Estimation indicative seulement — devis final par votre CPA après analyse du dossier.",
      skipVolume: "Volume non applicable pour ce service.",
      noAddons: "Aucun complément suggéré pour ce mandat.",
      q: {
        service: "Quel service recherchez-vous ?",
        province: "Dans quelle province opérez-vous ?",
        profile: "Quel est votre profil ?",
        volume: "Quel est votre volume d'activité mensuel ?",
        employees: "Combien d'employés avez-vous ?",
        addons: "Souhaitez-vous ajouter des services complémentaires ?",
        urgency: "Quel est votre délai souhaité ?"
      },
      profile: {
        personal: { title: "Particulier / autonome", desc: "Revenus personnels ou activité très légère." },
        business: { title: "Petite entreprise", desc: "Entreprise en croissance, facturation régulière." },
        sme: { title: "PME", desc: "Volume élevé, paie ou multi-comptes." }
      },
      volume: {
        low: { title: "Faible", desc: "Moins de 20 transactions / mois." },
        medium: { title: "Modéré", desc: "20 à 100 transactions / mois." },
        high: { title: "Élevé", desc: "Plus de 100 transactions / mois." }
      },
      employees: {
        none: { title: "Aucun employé", desc: "Travailleur autonome sans paie." },
        small: { title: "1 à 5 employés", desc: "Petite équipe à gérer." },
        medium: { title: "6 employés et plus", desc: "Paie plus complexe." }
      },
      urgency: {
        standard: { title: "Délai normal", desc: "Ouverture de dossier sous 5 à 10 jours ouvrables." },
        priority: { title: "Prioritaire", desc: "Besoin sous 2 semaines (+15 % indicatif)." }
      },
      provinces: {
        QC: "Québec", ON: "Ontario", BC: "Colombie-Britannique", AB: "Alberta",
        MB: "Manitoba", NB: "Nouveau-Brunswick", NL: "Terre-Neuve", NS: "Nouvelle-Écosse",
        PE: "Î.-P.-É.", SK: "Saskatchewan", YT: "Yukon", NT: "T.N.-O.", NU: "Nunavut"
      },
      units: {
        hourly: "/ mandat horaire estimé",
        monthly: "/ mois",
        oneTime: " (forfait unique)",
        perDeclaration: "/ déclaration"
      },
      result: {
        title: "Votre estimation",
        range: "Fourchette indicative",
        typical: "Montant médian",
        taxesHint: "Taxes applicables (sur le montant médian)",
        totalWithTax: "Total estimé avec taxes"
      },
      cta: {
        continue: "Continuer vers mon espace",
        signup: "Créer mon compte",
        restart: "Recommencer"
      }
    },

    journey: {
      tag: "Prochaine étape",
      pickService: "Choisissez votre service ci-dessous pour démarrer votre parcours guidé.",
      continue: "Continuer mon parcours",
      openProcedure: "Ouvrir mon parcours dossier"
    },

    faqPortal: {
      title: "Centre de",
      titleAccent: "Transparence.",
      subtitle: "Sécurité • Confidentialité • Support",
      moreQuestions: "Encore des questions ?",
      moreDesc: "Notre équipe de support et nos préparateurs sont disponibles sous 24 heures.",
      openTicket: "Ouvrir un ticket de support",
      q1: "Mes données financières sont-elles en sécurité ?",
      a1: "Absolument. ComptaFlow utilise le chiffrement AES-256 pour tous vos documents. Vos données sont isolées via des politiques RLS garantissant que seul vous et votre préparateur assigné y accédez.",
      q2: "Où sont hébergés mes fichiers ?",
      a2: "Toutes les données sont stockées sur des serveurs sécurisés au Canada (Canada-Central), conformément aux lois canadiennes sur la protection des renseignements personnels.",
      q3: "Comment fonctionne la liaison avec mon préparateur ?",
      a3: "Dès qu'un document est téléversé, votre préparateur est notifié. Les échanges se font via notre canal direct chiffré.",
      q4: "Respectez-vous les lois canadiennes sur la protection des données (PIPEDA, Loi 25 au Québec) ?",
      a4: "Oui. Nous avons nommé un responsable de la protection des données et tracé chaque accès pour assurer une transparence totale.",
      q5: "Pourquoi un délai pour l'ouverture du dossier ?",
      a5: "Chaque nouveau client fait l'objet d'une vérification de conformité manuelle (NEQ/NAS) avant l'activation des outils."
    },

    landing: {
      registry: "Article I — Le registre",
      sideTagline: "Précision · Fluidité · Excellence"
    },

    onboarding: {
      stepProfile: "Profil",
      stepCoords: "Coordonnées",
      stepDocs: "Documents",
      stepConfirm: "Confirmation",
      welcomeTitle: "Bienvenue chez",
      welcomeDesc: "Créez votre compte en quelques minutes. Vous choisirez votre service une fois connecté à votre portail.",
      langLabel: "Langue de communication",
      personalDesc: "Salarié, étudiant, retraité",
      businessDesc: "Pigiste, PME, Incorporé",
      coordsTitle: "Vos",
      coordsAccent: "coordonnées.",
      coordsDesc: "Ces informations créent votre compte client sécurisé. Le choix du service se fera ensuite depuis votre portail.",
      fullName: "Votre nom complet",
      province: "Province de résidence",
      companyName: "Nom de l'entreprise",
      neq: "NEQ (10 chiffres)",
      nas: "NAS (optionnel)",
      vaultTag: "Le coffre-fort",
      vaultTitle: "Premier",
      vaultAccent: "dépôt",
      vaultOptional: "(optionnel)",
      vaultDesc: "Vous pourrez déposer vos documents à tout moment depuis le portail.",
      vaultDrop: "Glissez vos documents ici",
      vaultBrowse: "ou cliquez pour parcourir — PDF, images, Excel · 4 Mo max",
      vaultEncrypted: "Chiffrement AES-256 actif",
      readyTitle: "Votre compte est",
      readyAccent: "prêt.",
      readyDesc: "Accédez à votre portail et choisissez le service qui vous convient. Aucun paiement n'est demandé à cette étape.",
      accessPortal: "Accéder à mon portail",
      nameRequired: "Le nom est obligatoire.",
      businessRequired: "Infos entreprise manquantes.",
      accountError: "Erreur lors de la création du compte.",
      skip: "Passer"
    },

    support: {
      title: "Centre d'Assistance",
      titleAccent: "Prioritaire",
      subtitle: "Votre préparateur à portée de clic",
      formTitle: "Envoyer un message formel",
      sentTitle: "Message acheminé avec succès !",
      sentDesc: "Votre préparateur vous répondra sous 24 h ouvrables.",
      subject: "Objet de la demande",
      subjectPlaceholder: "ex: Question sur ma déclaration de taxes…",
      message: "Message détaillé",
      messagePlaceholder: "Décrivez votre besoin avec précision…",
      send: "Envoyer au préparateur",
      ticketSaved: "Ticket de support enregistré avec succès.",
      contacts: "Contacts directs",
      email: "Courriel",
      sms: "Urgence (SMS)",
      chat: "Chat en direct",
      available: "Disponible",
      hours: "Heures d'ouverture",
      weekdays: "Lundi - Vendredi",
      saturday: "Samedi",
      sunday: "Dimanche",
      byAppt: "Sur RDV",
      closed: "Fermé",
      secureLine: "Votre ligne est sécurisée par chiffrement de bout en bout.",
      smsCopied: "Numéro d'assistance copié dans le presse-papiers.",
      liveChatTitle: "Conversation directe",
      liveChatDesc: "Réponse en quelques instants, comme avec votre cabinet.",
      chatPlaceholder: "Écrivez votre message…",
      onlineNow: "En ligne · répond en direct",
      typingPrefix: "écrit",
      chatError: "Petit contretemps technique — réessayez dans un instant ou écrivez-nous par courriel.",
      welcomeMessage: "Bonjour ! Je suis {name}, votre interlocutrice ComptaFlow. Comment puis-je vous aider ?"
    },

    procedure: {
      tag: "Parcours guidé",
      title: "Votre",
      titleAccent: "dossier",
      subtitle: "Documents à fournir, informations requises et étapes jusqu'à la clôture — guidé par votre équipe ComptaFlow.",
      noService: "Choisissez un service pour afficher le parcours complet (documents, infos, étapes).",
      selectService: "— Sélectionner un service —",
      viewPath: "Voir le parcours",
      browseServices: "Parcourir les services",
      step: "Étape",
      done: "Complété",
      progress: "Avancement",
      nextStep: "Prochaine étape",
      allComplete: "Parcours complété — votre comptable finalise le livrable.",
      requiredDocs: "Documents",
      requiredInfo: "Informations",
      optional: "optionnel",
      markComplete: "Marquer complété",
      markIncomplete: "Marquer incomplet",
      goToStep: "Aller à cette étape",
      estimatedDays: "Délai indicatif : {days} jours ouvrables",
      cpaNote: "Chaque étape est validée par un CPA du réseau ComptaFlow. Les calculs fiscaux et comptables sont revus avant tout livrable.",
      common: {
        steps: {
          mandate: { title: "Mandat & profil", desc: "Signez votre mandat et complétez votre profil (province, entreprise)." },
          documents: { title: "Dépôt des documents", desc: "Téléversez les pièces requises dans votre coffre-fort sécurisé." },
          cpaReview: { title: "Revue CPA", desc: "Votre comptable valide les informations et répond à vos questions." },
          delivery: { title: "Clôture & facturation", desc: "Réception du livrable et règlement des honoraires." }
        },
        docs: { signedMandate: "Mandat signé" },
        fields: {
          profileComplete: "Profil complété",
          province: "Province fiscale confirmée",
          questionsAnswered: "Questions du CPA répondues",
          invoiceSettled: "Honoraires réglés"
        }
      },
      docs: {
        bankStatements: "Relevés bancaires (3 derniers mois)",
        receipts: "Reçus et pièces justificatives",
        priorLedger: "Grand livre antérieur (si disponible)",
        salesInvoices: "Factures de vente",
        expenseReceipts: "Reçus de dépenses",
        creditCard: "Relevés carte de crédit",
        payrollRegister: "Registre de paie",
        employeeRoster: "Liste des employés (NAS, adresse, poste)",
        voidCheque: "Spécimen de chèque / dépôt direct",
        priorPayStubs: "Talons de paie antérieurs",
        salesSummary: "Sommaire des ventes de la période",
        purchaseSummary: "Sommaire des achats",
        priorFilings: "Déclarations antérieures",
        yearPayrollSummary: "Sommaire paie annuel",
        rl1DataQc: "Données Relevé 1 (Québec)",
        t4Slips: "Feuillets T4 / Relevé 1 finalisés",
        allBankStatements: "Tous les relevés bancaires (période visée)",
        allReceipts: "Toutes les pièces justificatives",
        priorReturns: "Déclarations antérieures",
        openingBalances: "Balances d'ouverture",
        vendorList: "Liste fournisseurs / clients",
        t2125Support: "Revenus et dépenses d'entreprise (T2125)",
        incomeSlips: "Relevés T4/Relevé 1 reçus",
        expenseSummary: "Sommaire des dépenses",
        organizedPackage: "Dossier structuré pour votre CPA"
      },
      fields: {
        periodRange: "Période visée",
        volumeEstimate: "Volume estimé (transactions/mois)",
        bankAccounts: "Comptes bancaires à concilier",
        fiscalYearEnd: "Date de fin d'exercice",
        employeeCount: "Nombre d'employés",
        businessNumber: "Numéro d'entreprise (NE/NEQ)",
        gstAccount: "Compte TPS/TVH",
        provincialTaxAccount: "Compte taxe provinciale (TVQ/TVP)",
        reportingPeriod: "Période de déclaration",
        payFrequency: "Fréquence de paie",
        provinceWork: "Province de travail des employés",
        taxYear: "Année fiscale",
        monthsBehind: "Nombre de mois en retard",
        lastFiledPeriod: "Dernière période produite",
        softwareName: "Logiciel comptable",
        chartOfAccounts: "Plan comptable souhaité",
        selfEmploymentType: "Type d'activité autonome"
      },
      hourlyBookkeeping: {
        steps: {
          scope: { title: "Cadrage du mandat", desc: "Précisez la période et le volume avec votre comptable." },
          work: { title: "Tenue de livres", desc: "Saisie, catégorisation et conciliation en cours." }
        }
      },
      monthly: {
        steps: {
          bankAccess: { title: "Accès & paramètres", desc: "Indiquez vos comptes et la fin d'exercice." }
        }
      },
      monthlyMicro: { steps: { cycle: { title: "Cycle mensuel", desc: "Tenue de livres légère et suivi fiscal de base." } } },
      monthlySmall: { steps: { cycle: { title: "Cycle mensuel", desc: "Conciliation et rapports mensuels." } } },
      monthlySme: {
        steps: {
          payroll: { title: "Mise en place paie", desc: "Configurez la paie pour votre équipe." },
          cycle: { title: "Cycle complet PME", desc: "Tenue de livres + paie + rapports." }
        }
      },
      gstQst: {
        steps: {
          taxNumbers: { title: "Numéros fiscaux", desc: "Confirmez vos numéros TPS/TVH et provinciaux." },
          filing: { title: "Préparation déclaration", desc: "Compilation et validation avant transmission." }
        }
      },
      payroll: {
        steps: {
          info: { title: "Informations paie", desc: "Fréquence, province et effectif." },
          run: { title: "Traitement paie", desc: "Calcul des salaires et déductions." }
        }
      },
      t4Releve1: {
        steps: {
          prep: { title: "Préparation feuillets", desc: "Compilation des données annuelles." },
          delivery: { title: "Remise des feuillets", desc: "T4 et Relevé 1 disponibles au coffre-fort." }
        }
      },
      catchUp: {
        steps: {
          scope: { title: "Évaluation du retard", desc: "Définissez l'étendue de la remise à niveau." },
          work: { title: "Remise à niveau", desc: "Mise à jour de la comptabilité en retard." }
        }
      },
      softwareSetup: {
        steps: {
          choice: { title: "Choix logiciel", desc: "QuickBooks, Sage ou autre — paramètres initiaux." },
          session: { title: "Session configuration", desc: "Installation et formation avec le support." }
        }
      },
      taxHelpAutonomous: {
        steps: {
          organize: { title: "Organisation fiscale", desc: "Structurez vos revenus et dépenses autonomes." },
          handoff: { title: "Transmission CPA", desc: "Dossier prêt pour votre déclaration." }
        }
      }
    },

    messaging: {
      adminChannels: "Canaux Clients",
      activeConversations: "Conversations actives",
      activeCount: "Actifs",
      individual: "Particulier",
      filePrefix: "Dossier :",
      secureChannel: "Canal direct sécurisé",
      encrypted: "Chiffré AES-256",
      syncing: "Synchronisation des échanges sécurisés…",
      adminPlaceholder: "Échange sécurisé avec le client…",
      clientTitle: "Comptable professionnel dédié",
      online: "En ligne",
      clientPlaceholder: "Échange sécurisé avec votre cabinet…",
      noSelection: "Aucun dossier sélectionné",
      selectClient: "Cliquez sur un client dans le menu de gauche pour charger la conversation chiffrée."
    },

    transactions: {
      titlePro: "Flux Pro",
      titlePersonal: "Flux Privé",
      subtitle: "Rapprochement & conformité temps réel",
      addEntry: "Saisie stratégique",
      syncing: "Synchronisation de vos flux",
      syncingPro: "professionnels",
      syncingPersonal: "personnels",
      inflowPro: "Pulsation entrante",
      inflowPersonal: "Revenus",
      outflowPro: "Flux sortant",
      outflowPersonal: "Dépenses",
      smartFilter: "Filtre intelligent",
      filterAll: "Tout",
      filterSale: "Ventes",
      filterPurchase: "Achats",
      loading: "Chargement du journal…"
    },

    pricing: {
      badge: "Tarifs transparents",
      legalTitle: "Transparence & cadre légal",
      legalSubtitle: "Notre périmètre d'intervention au Canada",
      weDo: "Ce que nous réalisons",
      weDo1: "Tenue de livres mensuelle, forfaits et mandats horaires.",
      weDo2: "Déclarations taxes fédérales/provinciales et préparation des feuillets T4 / Relevé 1.",
      weDo3: "Traitement de la paie pour 1 à 5 employés.",
      weDo4: "Configuration logicielle (QuickBooks, Sage) et aide impôt travailleur autonome.",
      cpaTitle: "Ce qui est confié à un CPA*",
      cpa1: "États financiers audités ou missions d'examen avec opinion publique.",
      cpa2: "Signature d'états certifiés réservée aux CPA auditeurs.",
      cpa3: "Pour ces mandats, nous collaborons avec des CPA partenaires."
    },

    vault: {
      encrypted: "Chiffrement AES-256 certifié",
      subtitle: "Coffre-fort virtuel haute-fidélité",
      upload: "Téléverser",
      official: "Livrable officiel",
      transmit: "Transmettre",
      name: "Nom du document",
      category: "Catégorie",
      size: "Taille",
      date: "Date"
    },

    invoices: {
      title: "Registre",
      titleAccent: "Factures.",
      subtitle: "Taxes canadiennes (TPS · TVH · TVQ · TVP selon province)",
      newInvoice: "Nouvelle facture",
      emitTitle: "Émission de facture",
      emitSubtitle: "Génération avec taxes provinciales intégrées",
      number: "Numéro",
      selectClient: "Client destinataire",
      selectClientPlaceholder: "Sélectionner un client…",
      amountHt: "Montant hors taxes ($ HT)",
      taxPreview: "Aperçu taxation provinciale",
      subtotal: "Sous-total HT",
      gst: "TPS / TVH fédérale",
      qst: "Taxe provinciale (TVQ, TVP, etc.)",
      totalEstimated: "Total TTC estimé",
      cancel: "Annuler",
      createDraft: "Créer le brouillon",
      empty: "Aucune facture enregistrée.",
      declaredPaid: "Déclaré payé",
      issuedOn: "Émis le",
      totalTtc: "Montant total TTC",
      manage: "Gérer",
      statusPaid: "Acquittée",
      statusPending: "Attente paiement",
      statusDraft: "Brouillon",
      statusCancelled: "Annulée",
      manageTitle: "Gérer la facture",
      clientId: "ID client",
      paymentAlert: "Le client a déclaré avoir complété le virement Interac. Veuillez vérifier votre compte bancaire.",
      publish: "Publier et envoyer instructions Interac",
      confirmReceipt: "Confirmer réception du paiement Interac",
      cancelInvoice: "Annuler la facture",
      confirmPaymentTitle: "Confirmer le paiement",
      confirmPaymentDesc: "Saisissez le numéro de référence ou confirmation fourni par la banque pour le virement Interac.",
      interacRef: "Numéro de référence Interac",
      interacRefPlaceholder: "Exemple : CA12345678",
      settleInvoice: "Acquitter facture",
      paymentInstructions: "Instructions de paiement",
      invoiceLabel: "Facture",
      totalTransfer: "Total à transférer",
      paidMessage: "Facture acquittée. Référence bancaire Interac",
      directDeposit: "Dépôt direct",
      interacRequired: "Virement Interac requis",
      recipient: "Destinataire",
      yourBookkeeper: "Votre comptable",
      sendTo: "Envoyer le virement à",
      exactAmount: "Montant exact",
      autodeposit: "Dépôt automatique",
      autodepositYes: "Oui (aucune question requise)",
      autodepositNo: "Non",
      securityQuestion: "Question de sécurité",
      defaultQuestion: "Quel cabinet ?",
      clientDeclaredPending: "Vous avez déclaré avoir envoyé le virement. En attente de validation par votre comptable.",
      clientSentTransfer: "J'ai envoyé le virement",
      toastSelectClient: "Veuillez sélectionner un client et entrer un montant.",
      toastPublished: "Facture publiée et courriel envoyé au client.",
      toastPublishedSim: "Facture publiée (envoi de courriel simulé).",
      toastPublishError: "Erreur lors de la publication de la facture.",
      toastRefRequired: "Veuillez saisir le numéro de confirmation Interac.",
      toastPaymentConfirmed: "Paiement Interac confirmé. La facture est marquée payée.",
      toastPaymentError: "Erreur de validation de paiement."
    },

    superAdmin: {
      loading: "Chargement de la console Super Admin…",
      title: "Console",
      titleAccent: "Super Admin.",
      subtitle: "Propriétaire ComptaFlow et analytics globaux",
      subAdmins: "Comptables (Sub-Admins)",
      clients: "Clients rattachés",
      totalInvoices: "Factures totales",
      paidVolume: "Volume réseau payé",
      networkCommission: "Commissions réseau (5 %)",
      partnersTitle: "Cabinets comptables partenaires",
      colPartner: "Comptable partenaire",
      colEmail: "Adresse courriel",
      colClients: "Nombre clients",
      colRevenue: "Chiffre d'affaires encaissé",
      colRoyalty: "Redevance (5 %)",
      colRegistered: "Date d'enregistrement",
      noPartners: "Aucun comptable partenaire enregistré pour le moment.",
      noName: "Sans nom",
      live: "Données en direct",
      pendingInvoices: "Factures en attente",
      byProvince: "Clients par province",
      byService: "Mandats par service",
      noBreakdown: "Aucune donnée disponible pour le moment."
    },

    superAdminClients: {
      title: "Registre",
      titleAccent: "Global Clients.",
      subtitle: "Vue d'ensemble et assignation de la clientèle du réseau",
      searchPlaceholder: "Rechercher client ou comptable…",
      filterPartner: "Filtrer par cabinet",
      allPartners: "Tous les cabinets",
      orphanOnly: "Clients orphelins seulement",
      colClient: "Client",
      colEmail: "Adresse courriel",
      colPartner: "Comptable partenaire",
      colCreated: "Date de création",
      colAssign: "Assignation",
      assignPartner: "Assigner un cabinet",
      choosePartner: "Choisir un cabinet…",
      assign: "Assigner",
      selectPartnerFirst: "Sélectionnez un cabinet partenaire.",
      assignSuccess: "Client assigné au cabinet.",
      assignError: "Impossible d'assigner le client.",
      orphan: "Orphelin (aucun comptable rattaché)",
      noResults: "Aucun client ne correspond à votre recherche."
    },

    superAdminInvoices: {
      title: "Registre",
      titleAccent: "Global Factures.",
      subtitle: "Audit global de la facturation et des taxes perçues (Lecture seule)",
      searchPlaceholder: "Rechercher facture, client ou cabinet…",
      statTotalHt: "Total facturé HT",
      statTotalTps: "Total TPS/TVH perçu",
      statTotalTvq: "Total taxes provinciales perçues",
      statTotalPaid: "Total encaissé",
      statTotalPending: "Total en attente",
      colNumber: "Numéro",
      colClient: "Client",
      colFirm: "Cabinet comptable",
      colSubtotal: "Sous-total HT",
      colTps: "TPS/TVH",
      colTvq: "Provincial",
      colTotal: "Total TTC",
      colStatus: "Statut",
      colIssueDate: "Date émission",
      statusPaid: "Payée",
      statusSent: "Envoyée",
      statusCancelled: "Annulée",
      statusDraft: "Brouillon",
      defaultFirm: "Cabinet",
      empty: "Aucune facture enregistrée pour le moment."
    },

    superAdminSubAdmins: {
      title: "Gestion des",
      titleAccent: "Comptables.",
      subtitle: "Enregistrement et provisionnement des cabinets partenaires",
      newFirmTitle: "Nouveau cabinet",
      placeholderName: "Nom complet / Raison sociale",
      placeholderEmail: "Adresse courriel",
      placeholderPassword: "Mot de passe initial",
      submit: "Enregistrer le comptable",
      registeredTitle: "Cabinets enregistrés",
      registeredOn: "Inscrit le",
      empty: "Aucun cabinet comptable enregistré.",
      toastLoadError: "Impossible de récupérer la liste des comptables.",
      toastFillAll: "Veuillez remplir tous les champs.",
      toastCreated: "Le compte sub_admin pour {name} a été initié. Courriel de confirmation envoyé.",
      toastCreateError: "Erreur lors de l'enregistrement."
    },

    adminHub: {
      loading: "Initialisation du hub cabinet…",
      title: "Hub",
      titleAccent: "ComptaFlow.",
      subtitle: "Opérations stratégiques et BI",
      badge: "Administrateur suprême",
      grossRevenue: "Chiffre d'affaires brut",
      vsLastMonth: "vs mois dernier",
      networkFees: "Frais de réseau (5 %)",
      networkRoyalty: "Redevance ComptaFlow",
      netRevenue: "Revenu net cabinet (95 %)",
      netCollected: "Net encaissé",
      clientPortfolio: "Portefeuille clients",
      compliantFiles: "Dossiers conformes ARC / provinces",
      workflow: "Flux de travail",
      criticalPriority: "Priorité critique",
      activityFeed: "Flux d'activité du réseau",
      globalArchives: "Archives globales",
      noActivity: "Aucune pulsation détectée sur le réseau ComptaFlow.",
      anonymousMandate: "Mandat anonyme",
      intelligenceTitle: "Gestion intelligence",
      intelligenceDesc: "Contrôlez les connecteurs cloud et déclenchez les automatisations de fin de période.",
      generateReports: "Générer bilans",
      cloudConnectors: "Connecteurs cloud",
      reportsGenerated: "Intelligence en marche : les bilans ont été formatés.",
      statusActive: "Actif",
      statusOnline: "En ligne",
      statusStandby: "Standby"
    },

    adminClients: {
      title: "Gestion des",
      titleAccent: "Mandats Clients.",
      subtitle: "Pilotage des dossiers et conformité",
      newClient: "Nouveau client",
      addClient: "Ajouter client",
      newMandates: "Nouveaux mandats",
      compliant: "Dossiers en règle",
      actionRequired: "Action requise",
      colIdentity: "Identité client",
      colServices: "Services actifs",
      colStatus: "Statut dossier",
      colActions: "Actions de production",
      individual: "Individuel",
      consultation: "Consultation",
      manage: "Gérer"
    }
  },
  en: {
    welcome: "Welcome to Comptaflow.",
    slogan: "Accounting that flows naturally.",
    login: "Sign In",
    register: "Sign Up",
    personal: "Individual",
    business: "Business / Freelance",
    back: "Back",
    continue: "Continue",
    step: "Step",
    name_placeholder: "John Doe",
    company_placeholder: "ABC Business Inc.",
    currency: "$ USD",
    setup_fee: "One-time Setup Fee",
    total: "Total to Pay",
    secure_storage: "Encrypted Vault",
    audit_active: "Certified Audit",
    msg_validate: "Please verify your email before continuing.",
    
    // Services
    services: {
      bookkeeping: "Bookkeeping",
      payroll: "Payroll",
      taxes_biz: "Corporate Tax",
      taxes_perso: "Personal Tax",
      consulting: "Bookkeeping Clerk & Bookkeeping",
      stocks: "Inventory Management",
      title: "Our services & pricing",
      subtitle: "Transparent rates for bookkeeping, payroll and accounting support across Canada. Monthly packages, hourly billing or à la carte services — pick what fits your business.",
      composer: "Request a Quote",
      perMandate: "Indicative rate",
      perHour: "Per hour",
      perMonth: "Per month",
      perDeclaration: "Per filing",
      oneTime: "One-time fee",
      estimateNote: "Estimate — final quote after file review",
      categories: {
        hourly: {
          title: "1. Base hourly rate",
          subtitle: "One-off mandates, replacements or occasional needs."
        },
        monthly: {
          title: "2. Monthly bookkeeping packages",
          subtitle: "Ideal for client retention and peace of mind."
        },
        alacarte: {
          title: "3. À la carte services",
          subtitle: "Specific recurring needs at fixed or custom rates."
        }
      },
      items: {
        hourlyBookkeeping: {
          name: "Bookkeeping clerk / Bookkeeping",
          desc: "Data entry, classification, reconciliation and admin support. Rate varies by complexity and experience.",
          price: "$45 – $75 / hr"
        },
        monthlyMicro: {
          name: "Micro-business or self-employed",
          desc: "Very few transactions, no employees. Light bookkeeping and basic tax tracking.",
          price: "$150 – $250 / mo"
        },
        monthlySmall: {
          name: "Small business",
          desc: "Average invoice volume, regular bank reconciliation and monthly reports.",
          price: "$300 – $500 / mo"
        },
        monthlySme: {
          name: "SME with payroll",
          desc: "Higher volume, payroll for a few employees and full bookkeeping.",
          price: "$500 – $800+ / mo"
        },
        gstQst: {
          name: "Tax returns (GST/QST)",
          desc: "Preparation and filing of your sales tax returns — monthly or quarterly.",
          price: "$35 – $60 / filing"
        },
        payroll: {
          name: "Payroll processing (1–5 employees)",
          desc: "Salary calculations, source deductions and payroll compliance for a small team.",
          price: "$50 – $80 / mo"
        },
        t4Releve1: {
          name: "Tax slips (T4 / Relevé 1)",
          desc: "Year-end slip preparation for your employees.",
          price: "$50 + $25 / employee"
        },
        catchUp: {
          name: "Catch-up bookkeeping",
          desc: "Updating overdue books — billed at hourly rate based on volume.",
          price: "$50 – $70 / hr"
        },
        softwareSetup: {
          name: "Software setup (QuickBooks, Sage…)",
          desc: "Installation, configuration and initial training for new clients.",
          price: "$150 – $300"
        },
        taxHelpAutonomous: {
          name: "Self-employed tax prep help",
          desc: "Gather and organize your numbers before sending to your accountant.",
          price: "$150 – $300"
        }
      }
    },
    
    // Navigation
    nav: {
      services: "Services",
      processus: "Process",
      faq: "FAQ",
      clientSpace: "Client Portal",
      becomeClient: "Get Started",
      mobileMenuTitle: "Our Services",
      mobileFlux: "The Flow",
      mobileFaq: "Frequently Asked Questions",
      mobileOpen: "Start My File",
      getEstimate: "Get a price estimate"
    },

    // Hero
    hero: {
      tagline: "Bookkeeping & Tax Support Services · Canada",
      title1: "Your bookkeeping,",
      title2: "clear and paperless.",
      subtitle: "Comptaflow brings together your tax declarations, bookkeeping, and daily finances into a single bookkeeping assistance flow: one portal, fixed rates, zero paperwork.",
      cta: "Request a Quote",
      estimateCta: "Get a price estimate",
      clientArea: "Client Area",
      preview: "Client Preview",
      item1: "Bookkeeping — May 2026",
      item1Val: "Reconciled",
      item2: "Documents uploaded to vault",
      item3: "GST/QST return",
      item3Val: "Filed",
      item4: "Active monthly plan",
      item4Val: "Micro-business",
      peace: "Peace of Mind",
      total: "Total",
      
      stat1Val: "24",
      stat1Unit: "h",
      stat1Desc: "Guaranteed response time, business days",
      stat2Val: "100",
      stat2Unit: "%",
      stat2Desc: "Online — from payment to final deliverables",
      stat3Val: "0",
      stat3Unit: "$",
      stat3Desc: "surprise fees: the price you see is the price you pay"
    },

    // Process
    process: {
      tagline: "Article II — The Flow",
      title: "Three Steps. One Flow.",
      step1Title: "Choose your services",
      step1Desc: "Create your account, then choose your monthly package, à la carte service or hourly mandate from your secure portal.",
      step2Title: "Upload Documents",
      step2Desc: "Drag and drop bank statements, T4s, and receipts into your encrypted Canadian-hosted vault.",
      step3Title: "Track & Retrieve",
      step3Desc: "Monitor execution in real time and download your completed declarations and ledgers."
    },

    // FAQ
    faq: {
      tagline: "Article V — FAQ",
      title: "Before trusting us with your numbers.",
      q1: "How does hourly billing work?",
      a1: "For one-off mandates or replacements, we bill $45–$75 per hour depending on complexity. A quote is provided before any work begins.",
      q2: "Which monthly package is right for me?",
      a2: "Micro-business ($150–$250/mo) for few transactions without employees; Small business ($300–$500/mo) for average volume; SME with payroll ($500–$800+/mo) for demanding files.",
      q3: "Are my documents secure?",
      a3: "Yes. Files are encrypted in transit (TLS) and stored in a Canadian-hosted database, accessible only by you and your bookkeeper.",
      q4: "Do displayed prices include taxes?",
      a4: "No. Rates exclude taxes (GST, HST, QST, PST, etc. depending on your province). A detailed quote is provided before mandate confirmation.",
    },

    // Cookies
    cookies: {
      title: "🍪 Cookie Consent",
      desc: "We use essential and analytical cookies to optimize your experience, in compliance with Law 25. You can accept or decline non-essential cookies. Read our Privacy Policy to learn more.",
      decline: "Decline",
      accept: "Accept"
    },

    // Footer
    footer: {
      taxDisclaimer: "Displayed prices exclude taxes (GST, HST, QST or PST depending on province).",
      privacy: "Privacy Policy (Law 25)",
      terms: "Terms of Service",
      legal: "Legal Notice",
      admin: "Administration",
      copyright: "© 2026 Comptaflow — Canada"
    },

    auth: {
      tagline: "Canada • Bookkeeping & Accounting Support",
      subtitle: "Highly secure financial and tax management for Canadian entrepreneurs.",
      privateSpace: "Private Portal",
      privateSpaceDesc: "Sign in and access your dashboards",
      createFile: "Open a File",
      createFileDesc: "New bookkeeper or end client",
      loginTitle: "Sign in.",
      registerTitle: "New File.",
      loginSubtitle: "Connect your financial flows",
      registerSubtitle: "Tax registration form",
      fullName: "Full name",
      email: "Email address",
      password: "Password",
      roleLabel: "Access type",
      roleClient: "End client (Business/Individual)",
      roleSubAdmin: "Partner Bookkeeper",
      partnerLabel: "Partner Bookkeeper",
      noPartner: "No partner bookkeeper registered. Create a bookkeeper account first or sign in as Super Admin.",
      partnersLoading: "Loading partner bookkeepers…",
      partnersLoadError: "Could not load the partner list. SQL migration may be incomplete.",
      contactSupportHint: "To open a client file, contact our team — we will assign you to a partner bookkeeper.",
      contactSupport: "Contact support",
      resendEmail: "Resend confirmation email",
      submitLogin: "Sign in",
      submitRegister: "Create account",
      switchToRegister: "Not registered yet? Open a file",
      switchToLogin: "Already registered? Sign in",
      footer: "ComptaFlow Portal • Canada • MMXXVI"
    },

    portal: {
      brand: "ComptaFlow",
      search: "Search the portal…",
      logout: "Sign out",
      signMandate: "Sign Mandate",
      notifications: "Notifications",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      changeLanguage: "Change language",
      loading: "Loading view…",
      roles: {
        super_admin: "Supreme Owner",
        sub_admin: "Partner Bookkeeper",
        client: "Client Portal"
      },
      sections: {
        workspace: "My workspace",
        finance: "Finance",
        documents: "Documents",
        help: "Help & support",
        firm: "Firm",
        production: "Production",
        payments: "Payments",
        communication: "Communication",
        network: "ComptaFlow network"
      },
      nav: {
        super_overview: "Key Metrics",
        super_subadmins: "Bookkeeper Management",
        super_clients: "All Clients",
        super_invoices: "All Invoices",
        messaging: "Network Support",
        admin_overview: "Dashboard",
        admin_clients: "My Clients",
        transactions: "Transaction Journal",
        invoices: "Invoices",
        vault: "Vault",
        interac_settings: "Interac Settings",
        sales_ledger: "Sales ledger",
        sales_ledger_global: "Global sales ledger",
        service_reports: "Service reports",
        overview: "My Overview",
        faq: "Security & FAQ",
        support: "Help Center",
        client_messaging: "Contact my bookkeeper",
        services: "Services & Pricing",
        quote: "Price estimate",
        procedure: "My file path"
      },
      overview: {
        greeting: "Hello,",
        subtitle: "Dashboard",
        contactCpa: "Contact my bookkeeper",
        help: "Help center",
        pendingInvoices: "Invoices due",
        pendingCount: "invoice(s) pending",
        totalPaid: "Total Fees Paid",
        paidCount: "invoice(s) paid",
        vault: "Digital Vault",
        vaultDocs: "Docs",
        vaultEncryption: "AES-256 Encryption Active",
        uploadTitle: "Instant Document Upload",
        uploadDesc: "Upload receipts, statements or tax notices for your bookkeeper.",
        uploadCta: "Upload a supporting document",
        uploading: "Uploading…",
        uploadHint: "PDF, Image or Excel • Max 4 MB",
        mandateTitle: "Electronic Management Mandate",
        mandateDesc: "Your bookkeeping and accounting mandate is signed and compliant with CRA and provincial tax authority requirements.",
        viewMandate: "View Signed Mandate",
        billing: "Billing & Interac",
        upToDate: "Your file is up to date",
        noPending: "No pending payments",
        declarePaid: "Declare paid after transfer",
        paymentPending: "Payment pending validation by your bookkeeper"
      }
    },

    serviceSelector: {
      activeLabel: "Active service",
      confirmed: "Confirmed",
      changeHint: "To change service, contact your bookkeeper via messaging.",
      viewProcedure: "View my file path",
      chooseLabel: "Choose your service",
      chooseTitle: "Which mandate would you like to open?",
      chooseDesc: "Select the service that matches your needs. A personalized quote will follow validation.",
      placeholder: "— Select a service —",
      confirm: "Confirm my service choice",
      selectWarning: "Please choose a service from the list.",
      saved: "Your service has been saved. Follow your guided file path now.",
      getEstimate: "Get a price estimate"
    },

    pricingQuestionnaire: {
      badge: "Quick estimate",
      title: "What budget for your mandate?",
      subtitle: "Answer a few questions to get an indicative range in Canadian dollars.",
      progress: "Question {current} of {total}",
      showEstimate: "See my estimate",
      disclaimer: "Indicative estimate only — final quote by your CPA after file review.",
      skipVolume: "Volume not applicable for this service.",
      noAddons: "No suggested add-ons for this mandate.",
      q: {
        service: "Which service do you need?",
        province: "Which province do you operate in?",
        profile: "What is your profile?",
        volume: "What is your monthly activity volume?",
        employees: "How many employees do you have?",
        addons: "Would you like complementary services?",
        urgency: "What timeline do you need?"
      },
      profile: {
        personal: { title: "Individual / self-employed", desc: "Personal income or very light activity." },
        business: { title: "Small business", desc: "Growing company with regular billing." },
        sme: { title: "SME", desc: "Higher volume, payroll or multiple accounts." }
      },
      volume: {
        low: { title: "Low", desc: "Fewer than 20 transactions / month." },
        medium: { title: "Moderate", desc: "20 to 100 transactions / month." },
        high: { title: "High", desc: "More than 100 transactions / month." }
      },
      employees: {
        none: { title: "No employees", desc: "Self-employed without payroll." },
        small: { title: "1 to 5 employees", desc: "Small team to manage." },
        medium: { title: "6+ employees", desc: "More complex payroll." }
      },
      urgency: {
        standard: { title: "Standard timeline", desc: "File opening within 5–10 business days." },
        priority: { title: "Priority", desc: "Needed within 2 weeks (+15% indicative)." }
      },
      provinces: {
        QC: "Quebec", ON: "Ontario", BC: "British Columbia", AB: "Alberta",
        MB: "Manitoba", NB: "New Brunswick", NL: "Newfoundland", NS: "Nova Scotia",
        PE: "P.E.I.", SK: "Saskatchewan", YT: "Yukon", NT: "N.W.T.", NU: "Nunavut"
      },
      units: {
        hourly: "/ estimated hourly mandate",
        monthly: "/ month",
        oneTime: " (one-time fee)",
        perDeclaration: "/ filing"
      },
      result: {
        title: "Your estimate",
        range: "Indicative range",
        typical: "Midpoint amount",
        taxesHint: "Applicable taxes (on midpoint amount)",
        totalWithTax: "Estimated total with taxes"
      },
      cta: {
        continue: "Continue to my portal",
        signup: "Create my account",
        restart: "Start over"
      }
    },

    journey: {
      tag: "Next step",
      pickService: "Choose your service below to start your guided journey.",
      continue: "Continue my path",
      openProcedure: "Open my file path"
    },

    faqPortal: {
      title: "Transparency",
      titleAccent: "Center.",
      subtitle: "Security • Privacy • Support",
      moreQuestions: "Still have questions?",
      moreDesc: "Our support team and bookkeepers are available within 24 hours.",
      openTicket: "Open a support ticket",
      q1: "Is my financial data secure?",
      a1: "Absolutely. ComptaFlow uses AES-256 encryption for all documents. Data is isolated via RLS policies so only you and your assigned bookkeeper can access it.",
      q2: "Where are my files hosted?",
      a2: "All data is stored on secure servers in Canada (Canada-Central), in compliance with Canadian privacy laws.",
      q3: "How does the link with my bookkeeper work?",
      a3: "When you upload a document, your bookkeeper is notified. Communication happens via our encrypted direct channel.",
      q4: "Do you comply with Canadian privacy laws (PIPEDA, Quebec Law 25)?",
      a4: "Yes. We have appointed a data protection officer and log every access for full transparency.",
      q5: "Why is there a delay to open a file?",
      a5: "Each new client undergoes manual compliance verification (NEQ/NAS) before tools are activated."
    },

    landing: {
      registry: "Article I — The Registry",
      sideTagline: "Precision · Fluidity · Excellence"
    },

    onboarding: {
      stepProfile: "Profile",
      stepCoords: "Details",
      stepDocs: "Documents",
      stepConfirm: "Confirmation",
      welcomeTitle: "Welcome to",
      welcomeDesc: "Create your account in minutes. You'll choose your service once connected to your portal.",
      langLabel: "Communication language",
      personalDesc: "Employee, student, retiree",
      businessDesc: "Freelancer, SME, incorporated",
      coordsTitle: "Your",
      coordsAccent: "details.",
      coordsDesc: "This information creates your secure client account. Service selection happens next in your portal.",
      fullName: "Full name",
      province: "Province of residence",
      companyName: "Company name",
      neq: "NEQ (10 digits)",
      nas: "SIN (optional)",
      vaultTag: "The vault",
      vaultTitle: "First",
      vaultAccent: "upload",
      vaultOptional: "(optional)",
      vaultDesc: "You can upload documents anytime from the portal.",
      vaultDrop: "Drop your documents here",
      vaultBrowse: "or click to browse — PDF, images, Excel · 4 MB max",
      vaultEncrypted: "AES-256 encryption active",
      readyTitle: "Your account is",
      readyAccent: "ready.",
      readyDesc: "Access your portal and choose your service from the dropdown. No payment required at this step.",
      accessPortal: "Access my portal",
      nameRequired: "Name is required.",
      businessRequired: "Business information missing.",
      accountError: "Error creating account.",
      skip: "Skip"
    },

    support: {
      title: "Priority",
      titleAccent: "Support Center",
      subtitle: "Your bookkeeper within reach",
      formTitle: "Send a formal message",
      sentTitle: "Message sent successfully!",
      sentDesc: "Your bookkeeper will respond within 24 business hours.",
      subject: "Request subject",
      subjectPlaceholder: "e.g. Question about my GST filing…",
      message: "Detailed message",
      messagePlaceholder: "Describe your need in detail…",
      send: "Send to bookkeeper",
      ticketSaved: "Support ticket saved successfully.",
      contacts: "Direct contacts",
      email: "Email",
      sms: "Emergency (SMS)",
      chat: "Live chat",
      available: "Available",
      hours: "Business hours",
      weekdays: "Monday - Friday",
      saturday: "Saturday",
      sunday: "Sunday",
      byAppt: "By appointment",
      closed: "Closed",
      secureLine: "Your line is secured with end-to-end encryption.",
      smsCopied: "Support number copied to clipboard.",
      liveChatTitle: "Direct conversation",
      liveChatDesc: "A reply in moments, just like your firm.",
      chatPlaceholder: "Type your message…",
      onlineNow: "Online · replying live",
      typingPrefix: "is typing",
      chatError: "Brief technical issue — try again or email us.",
      welcomeMessage: "Hi! I'm {name}, your ComptaFlow contact. How can I help you today?"
    },

    procedure: {
      tag: "Guided path",
      title: "Your",
      titleAccent: "file",
      subtitle: "Required documents, information and steps through completion — guided by your ComptaFlow team.",
      noService: "Select a service to view the full path (documents, info, steps).",
      selectService: "— Select a service —",
      viewPath: "View path",
      browseServices: "Browse services",
      step: "Step",
      done: "Done",
      progress: "Progress",
      nextStep: "Next step",
      allComplete: "Path complete — your bookkeeper is finalizing the deliverable.",
      requiredDocs: "Documents",
      requiredInfo: "Information",
      optional: "optional",
      markComplete: "Mark complete",
      markIncomplete: "Mark incomplete",
      goToStep: "Go to this step",
      estimatedDays: "Estimated timeline: {days} business days",
      cpaNote: "Each step is validated by a CPA in the ComptaFlow network. Tax and accounting calculations are reviewed before any deliverable.",
      common: {
        steps: {
          mandate: { title: "Mandate & profile", desc: "Sign your mandate and complete your profile (province, business)." },
          documents: { title: "Document upload", desc: "Upload required files to your secure vault." },
          cpaReview: { title: "CPA review", desc: "Your bookkeeper validates information and answers questions." },
          delivery: { title: "Closure & billing", desc: "Receive deliverables and settle fees." }
        },
        docs: { signedMandate: "Signed mandate" },
        fields: {
          profileComplete: "Profile complete",
          province: "Tax province confirmed",
          questionsAnswered: "CPA questions answered",
          invoiceSettled: "Fees settled"
        }
      },
      docs: {
        bankStatements: "Bank statements (last 3 months)",
        receipts: "Receipts and supporting documents",
        priorLedger: "Prior ledger (if available)",
        salesInvoices: "Sales invoices",
        expenseReceipts: "Expense receipts",
        creditCard: "Credit card statements",
        payrollRegister: "Payroll register",
        employeeRoster: "Employee list (SIN, address, role)",
        voidCheque: "Void cheque / direct deposit",
        priorPayStubs: "Prior pay stubs",
        salesSummary: "Sales summary for period",
        purchaseSummary: "Purchase summary",
        priorFilings: "Prior filings",
        yearPayrollSummary: "Annual payroll summary",
        rl1DataQc: "RL-1 data (Quebec)",
        t4Slips: "Final T4 / RL-1 slips",
        allBankStatements: "All bank statements (period covered)",
        allReceipts: "All supporting documents",
        priorReturns: "Prior returns",
        openingBalances: "Opening balances",
        vendorList: "Vendor / customer list",
        t2125Support: "Business income & expenses (T2125)",
        incomeSlips: "T4/RL-1 slips received",
        expenseSummary: "Expense summary",
        organizedPackage: "Organized package for your CPA"
      },
      fields: {
        periodRange: "Period covered",
        volumeEstimate: "Estimated volume (transactions/month)",
        bankAccounts: "Bank accounts to reconcile",
        fiscalYearEnd: "Fiscal year-end date",
        employeeCount: "Number of employees",
        businessNumber: "Business number (BN/NEQ)",
        gstAccount: "GST/HST account",
        provincialTaxAccount: "Provincial tax account (QST/PST)",
        reportingPeriod: "Reporting period",
        payFrequency: "Pay frequency",
        provinceWork: "Employees' work province",
        taxYear: "Tax year",
        monthsBehind: "Months behind",
        lastFiledPeriod: "Last filed period",
        softwareName: "Accounting software",
        chartOfAccounts: "Chart of accounts",
        selfEmploymentType: "Self-employment activity type"
      },
      hourlyBookkeeping: {
        steps: {
          scope: { title: "Scope definition", desc: "Confirm period and volume with your bookkeeper." },
          work: { title: "Bookkeeping work", desc: "Entry, categorization and reconciliation in progress." }
        }
      },
      monthly: { steps: { bankAccess: { title: "Access & settings", desc: "Provide accounts and fiscal year-end." } } },
      monthlyMicro: { steps: { cycle: { title: "Monthly cycle", desc: "Light bookkeeping and basic tax follow-up." } } },
      monthlySmall: { steps: { cycle: { title: "Monthly cycle", desc: "Reconciliation and monthly reports." } } },
      monthlySme: {
        steps: {
          payroll: { title: "Payroll setup", desc: "Configure payroll for your team." },
          cycle: { title: "Full SME cycle", desc: "Bookkeeping + payroll + reports." }
        }
      },
      gstQst: {
        steps: {
          taxNumbers: { title: "Tax numbers", desc: "Confirm GST/HST and provincial numbers." },
          filing: { title: "Return preparation", desc: "Compile and validate before filing." }
        }
      },
      payroll: {
        steps: {
          info: { title: "Payroll information", desc: "Frequency, province and headcount." },
          run: { title: "Payroll processing", desc: "Salary and deduction calculations." }
        }
      },
      t4Releve1: {
        steps: {
          prep: { title: "Slip preparation", desc: "Compile annual payroll data." },
          delivery: { title: "Slip delivery", desc: "T4 and RL-1 available in vault." }
        }
      },
      catchUp: {
        steps: {
          scope: { title: "Backlog assessment", desc: "Define catch-up scope." },
          work: { title: "Catch-up work", desc: "Updating overdue bookkeeping." }
        }
      },
      softwareSetup: {
        steps: {
          choice: { title: "Software choice", desc: "QuickBooks, Sage or other — initial setup." },
          session: { title: "Setup session", desc: "Installation and training with support." }
        }
      },
      taxHelpAutonomous: {
        steps: {
          organize: { title: "Tax organization", desc: "Structure self-employment income and expenses." },
          handoff: { title: "CPA handoff", desc: "File ready for your tax return." }
        }
      }
    },

    messaging: {
      adminChannels: "Client Channels",
      activeConversations: "Active conversations",
      activeCount: "Active",
      individual: "Individual",
      filePrefix: "File:",
      secureChannel: "Secure direct channel",
      encrypted: "AES-256 encrypted",
      syncing: "Syncing secure messages…",
      adminPlaceholder: "Secure message to client…",
      clientTitle: "Dedicated professional bookkeeper",
      online: "Online",
      clientPlaceholder: "Secure message to your firm…",
      noSelection: "No file selected",
      selectClient: "Click a client in the left menu to load the encrypted conversation."
    },

    transactions: {
      titlePro: "Pro Flow",
      titlePersonal: "Personal Flow",
      subtitle: "Real-time reconciliation & compliance",
      addEntry: "Strategic entry",
      syncing: "Syncing your",
      syncingPro: "business flows",
      syncingPersonal: "personal flows",
      inflowPro: "Incoming flow",
      inflowPersonal: "Income",
      outflowPro: "Outgoing flow",
      outflowPersonal: "Expenses",
      smartFilter: "Smart filter",
      filterAll: "All",
      filterSale: "Sales",
      filterPurchase: "Purchases",
      loading: "Loading journal…"
    },

    pricing: {
      badge: "Transparent pricing",
      legalTitle: "Transparency & legal scope",
      legalSubtitle: "Our scope of practice in Canada",
      weDo: "What we do",
      weDo1: "Monthly bookkeeping, packages and hourly mandates.",
      weDo2: "GST/QST filings and T4 / Relevé 1 preparation.",
      weDo3: "Payroll processing for 1 to 5 employees.",
      weDo4: "Software setup (QuickBooks, Sage) and self-employed tax help.",
      cpaTitle: "What requires a CPA*",
      cpa1: "Audited financial statements or review engagements with public opinion.",
      cpa2: "Certified statement signatures reserved for auditor CPAs.",
      cpa3: "For these mandates, we partner with CPA firms."
    },

    vault: {
      encrypted: "AES-256 certified encryption",
      subtitle: "High-fidelity virtual vault",
      upload: "Upload",
      official: "Official deliverable",
      transmit: "Submit",
      name: "Document name",
      category: "Category",
      size: "Size",
      date: "Date"
    },

    invoices: {
      title: "Invoice",
      titleAccent: "Registry.",
      subtitle: "Canadian taxes (GST · HST · QST · PST by province)",
      newInvoice: "New invoice",
      emitTitle: "Issue invoice",
      emitSubtitle: "Generation with provincial taxes included",
      number: "Number",
      selectClient: "Recipient client",
      selectClientPlaceholder: "Select a client…",
      amountHt: "Pre-tax amount ($ excl.)",
      taxPreview: "Provincial tax preview",
      subtotal: "Subtotal excl. tax",
      gst: "Federal GST (5%)",
      qst: "Provincial QST (9.975%)",
      totalEstimated: "Estimated total incl. tax",
      cancel: "Cancel",
      createDraft: "Create draft",
      empty: "No invoices on file.",
      declaredPaid: "Declared paid",
      issuedOn: "Issued on",
      totalTtc: "Total amount incl. tax",
      manage: "Manage",
      statusPaid: "Paid",
      statusPending: "Awaiting payment",
      statusDraft: "Draft",
      statusCancelled: "Cancelled",
      manageTitle: "Manage invoice",
      clientId: "Client ID",
      paymentAlert: "The client declared completing the Interac transfer. Please verify your bank account.",
      publish: "Publish and send Interac instructions",
      confirmReceipt: "Confirm Interac payment received",
      cancelInvoice: "Cancel invoice",
      confirmPaymentTitle: "Confirm payment",
      confirmPaymentDesc: "Enter the reference or confirmation number from the bank for the Interac transfer.",
      interacRef: "Interac reference number",
      interacRefPlaceholder: "Example: CA12345678",
      settleInvoice: "Settle invoice",
      paymentInstructions: "Payment instructions",
      invoiceLabel: "Invoice",
      totalTransfer: "Total to transfer",
      paidMessage: "Invoice paid. Interac bank reference",
      directDeposit: "Direct deposit",
      interacRequired: "Interac transfer required",
      recipient: "Recipient",
      yourBookkeeper: "Your bookkeeper",
      sendTo: "Send transfer to",
      exactAmount: "Exact amount",
      autodeposit: "Auto-deposit",
      autodepositYes: "Yes (no security question)",
      autodepositNo: "No",
      securityQuestion: "Security question",
      defaultQuestion: "Which firm?",
      clientDeclaredPending: "You declared sending the transfer. Awaiting validation by your bookkeeper.",
      clientSentTransfer: "I sent the transfer",
      toastSelectClient: "Please select a client and enter an amount.",
      toastPublished: "Invoice published and email sent to client.",
      toastPublishedSim: "Invoice published (simulated email).",
      toastPublishError: "Error publishing invoice.",
      toastRefRequired: "Please enter the Interac confirmation number.",
      toastPaymentConfirmed: "Interac payment confirmed. Invoice marked paid.",
      toastPaymentError: "Payment validation error."
    },

    superAdmin: {
      loading: "Loading Super Admin console…",
      title: "Console",
      titleAccent: "Super Admin.",
      subtitle: "ComptaFlow owner and global analytics",
      subAdmins: "Bookkeepers (Sub-Admins)",
      clients: "Linked clients",
      totalInvoices: "Total invoices",
      paidVolume: "Network paid volume",
      networkCommission: "Network commission (5%)",
      partnersTitle: "Partner accounting firms",
      colPartner: "Partner bookkeeper",
      colEmail: "Email address",
      colClients: "Client count",
      colRevenue: "Collected revenue",
      colRoyalty: "Royalty (5%)",
      colRegistered: "Registration date",
      noPartners: "No partner bookkeepers registered yet.",
      noName: "Unnamed",
      live: "Live data",
      pendingInvoices: "Pending invoices",
      byProvince: "Clients by province",
      byService: "Mandates by service",
      noBreakdown: "No data available yet."
    },

    superAdminClients: {
      title: "Registry",
      titleAccent: "Global Clients.",
      subtitle: "Network client overview and firm assignment",
      searchPlaceholder: "Search client or bookkeeper…",
      filterPartner: "Filter by firm",
      allPartners: "All firms",
      orphanOnly: "Orphan clients only",
      colClient: "Client",
      colEmail: "Email address",
      colPartner: "Partner bookkeeper",
      colCreated: "Created on",
      colAssign: "Assignment",
      assignPartner: "Assign firm",
      choosePartner: "Choose a firm…",
      assign: "Assign",
      selectPartnerFirst: "Select a partner firm.",
      assignSuccess: "Client assigned to firm.",
      assignError: "Could not assign client.",
      orphan: "Orphan (no linked bookkeeper)",
      noResults: "No clients match your search."
    },

    superAdminInvoices: {
      title: "Registry",
      titleAccent: "Global Invoices.",
      subtitle: "Global billing and tax collection audit (read-only)",
      searchPlaceholder: "Search invoice, client or firm…",
      statTotalHt: "Total billed excl. tax",
      statTotalTps: "Total GST/HST collected",
      statTotalTvq: "Total provincial tax collected",
      statTotalPaid: "Total collected",
      statTotalPending: "Total pending",
      colNumber: "Number",
      colClient: "Client",
      colFirm: "Accounting firm",
      colSubtotal: "Subtotal excl. tax",
      colTps: "GST/HST",
      colTvq: "Provincial",
      colTotal: "Total incl. tax",
      colStatus: "Status",
      colIssueDate: "Issue date",
      statusPaid: "Paid",
      statusSent: "Sent",
      statusCancelled: "Cancelled",
      statusDraft: "Draft",
      defaultFirm: "Firm",
      empty: "No invoices on file yet."
    },

    superAdminSubAdmins: {
      title: "Manage",
      titleAccent: "Bookkeepers.",
      subtitle: "Partner firm registration and provisioning",
      newFirmTitle: "New firm",
      placeholderName: "Full name / Legal name",
      placeholderEmail: "Email address",
      placeholderPassword: "Initial password",
      submit: "Register bookkeeper",
      registeredTitle: "Registered firms",
      registeredOn: "Registered on",
      empty: "No accounting firms registered.",
      toastLoadError: "Unable to load bookkeeper list.",
      toastFillAll: "Please fill in all fields.",
      toastCreated: "Sub-admin account for {name} initiated. Confirmation email sent.",
      toastCreateError: "Registration failed."
    },

    adminHub: {
      loading: "Initializing firm hub…",
      title: "Hub",
      titleAccent: "ComptaFlow.",
      subtitle: "Strategic operations and BI",
      badge: "Supreme administrator",
      grossRevenue: "Gross revenue",
      vsLastMonth: "vs last month",
      networkFees: "Network fees (5%)",
      networkRoyalty: "ComptaFlow royalty",
      netRevenue: "Net firm revenue (95%)",
      netCollected: "Net collected",
      clientPortfolio: "Client portfolio",
      compliantFiles: "CRA / provincial compliant files",
      workflow: "Workflow",
      criticalPriority: "Critical priority",
      activityFeed: "Network activity feed",
      globalArchives: "Global archives",
      noActivity: "No activity detected on the ComptaFlow network.",
      anonymousMandate: "Anonymous mandate",
      intelligenceTitle: "Intelligence management",
      intelligenceDesc: "Control cloud connectors and trigger period-end automations.",
      generateReports: "Generate statements",
      cloudConnectors: "Cloud connectors",
      reportsGenerated: "Intelligence running: statements formatted.",
      statusActive: "Active",
      statusOnline: "Online",
      statusStandby: "Standby"
    },

    adminClients: {
      title: "Client",
      titleAccent: "Mandate Management.",
      subtitle: "File oversight and compliance",
      newClient: "New client",
      addClient: "Add client",
      newMandates: "New mandates",
      compliant: "Compliant files",
      actionRequired: "Action required",
      colIdentity: "Client identity",
      colServices: "Active services",
      colStatus: "File status",
      colActions: "Production actions",
      individual: "Individual",
      consultation: "Consultation",
      manage: "Manage"
    }
  },
  ar: {
    welcome: "مرحباً بكم في كومبتا فلو",
    slogan: "المحاسبة التي تتدفق بشكل طبيعي",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    personal: "فردي",
    business: "شركة / عمل حر",
    back: "رجوع",
    continue: "استمرار",
    step: "خطوة",
    name_placeholder: "أحمد محمد",
    company_placeholder: "شركة النور للتصميم",
    currency: "€ EUR",
    setup_fee: "رسوم تأسيس لمرة واحدة",
    total: "المبلغ الإجمالي",
    secure_storage: "خزنة مشفرة",
    audit_active: "مساعدة محاسبية",
    msg_validate: "يرجى تأكيد بريدك الإلكتروني قبل المتابعة",
    services: {
      bookkeeping: "مسك الدفاتر",
      payroll: "إدارة الرواتب",
      taxes_biz: "ضريبة الشركات",
      taxes_perso: "الضريبة الشخصية",
      consulting: "استشارات مسك الدفاتر والمساعدة",
      stocks: "إدارة المخزون",
      title: "أربعة خدمات، أربعة أسعار ثابتة",
      subtitle: "يتم تسجيل كل تفويض بسعره الثابت.",
      composer: "تكوين تفويضي",
      perMandate: "صافي لكل تفويض",
      t1_name: "ضريبة T1 - شخصي",
      t1_desc: "إقرار ضريبي كامل وتحسين الائتمانات.",
      t1_price: "89 $",
      ta_name: "ضريبة T2125 - مستقل",
      ta_desc: "الدخل التجاري والنفقات المسموح بها.",
      ta_price: "199 $",
      t2_name: "ضريبة T2 - شركات",
      t2_desc: "الإقرارات الضريبية الفيدرالية والإقليمية.",
      t2_price: "749 $",
      gl_name: "مسك الدفاتر",
      gl_desc: "التصنيف الشهري للمعاملات والتسويات.",
      gl_price: "249 $",
      inv_name: "إدارة المخزون",
      inv_desc: "متابعة المخزون وتكلفة البضائع المباعة.",
      inv_price: "179 $",
      cfo_name: "التمويل المالي للشركات",
      cfo_desc: "خدمات المدير المالي الخارجي الميزانيات والخطط.",
      cfo_price: "499 $",
      categories: {
        hourly: { title: "1. Tarif horaire", subtitle: "Mandats ponctuels." },
        monthly: { title: "2. Forfaits mensuels", subtitle: "Tenue de livres." },
        alacarte: { title: "3. À la carte", subtitle: "Services précis." }
      },
      items: {
        hourlyBookkeeping: { name: "Tenue de livres / h", desc: "Commis comptable.", price: "45–75 $ / h" },
        monthlyMicro: { name: "Micro-entreprise", desc: "Peu de transactions.", price: "150–250 $ / mois" },
        monthlySmall: { name: "Petite entreprise", desc: "Volume moyen.", price: "300–500 $ / mois" },
        monthlySme: { name: "PME + paie", desc: "Plusieurs employés.", price: "500–800+ $ / mois" },
        gstQst: { name: "Taxes (TPS/TVH/TVP)", desc: "Déclarations fédérales et provinciales.", price: "35–60 $ / décl." },
        payroll: { name: "Paie (1–5 emp.)", desc: "Traitement paie.", price: "50–80 $ / mois" },
        t4Releve1: { name: "T4 / Relevé 1", desc: "Feuillets fin d'année.", price: "50 $ + 25 $ / emp." },
        catchUp: { name: "Compta en retard", desc: "Mise à jour.", price: "50–70 $ / h" },
        softwareSetup: { name: "Config. logiciel", desc: "QuickBooks, Sage.", price: "150–300 $" },
        taxHelpAutonomous: { name: "Aide impôt autonome", desc: "Rassembler chiffres.", price: "150–300 $" }
      },
      perHour: "À l'heure",
      perMonth: "Par mois",
      perDeclaration: "Par déclaration",
      oneTime: "Frais unique",
      estimateNote: "Estimation — devis final après analyse."
    },
    nav: {
      services: "الخدمات",
      processus: "العملية",
      faq: "الأسئلة الشائعة",
      clientSpace: "بوابة العميل",
      becomeClient: "البدء",
      mobileMenuTitle: "خدماتنا",
      mobileFlux: "التدفق",
      mobileFaq: "الأسئلة الشائعة",
      mobileOpen: "بدء ملفي",
      getEstimate: "احصل على تقدير"
    },
    hero: {
      tagline: "خدمات مسك الدفاتر والمساعدة المحاسبية · كندا",
      title1: "مسك الدفاتر الخاص بك،",
      title2: "واضح وخالي من الأوراق.",
      subtitle: "يجمع كومبتا فلو مسك الدفاتر وإقرارات ضريبة الدخل والضرائب في تدفق واحد مساعدة محاسبية.",
      cta: "طلب عرض سعر",
      estimateCta: "احصل على تقدير",
      clientArea: "بوابة العميل",
      preview: "معاينة العميل",
      item1: "إقرار T1 — تم إرساله إلى مصلحة الضرائب",
      item1Val: "✓",
      item2: "المستندات المرفوعة إلى الخزنة",
      item3: "إمساك الدفاتر — مايو 2026",
      item3Val: "مكتمل",
      item4: "المبلغ المسترد المقدر",
      item4Val: "1,847.00 $",
      peace: "راحة البال",
      total: "الإجمالي",
      stat1Val: "24",
      stat1Unit: "ساعة",
      stat1Desc: "وقت استجابة مضمون، أيام العمل",
      stat2Val: "100",
      stat2Unit: "%",
      stat2Desc: "عبر الإنترنت — من الدفع إلى التسليم النهائي",
      stat3Val: "0",
      stat3Unit: "$",
      stat3Desc: "رسوم مفاجئة: السعر الذي تراه هو السعر الذي تدفعه"
    },
    process: {
      tagline: "المادة الثانية — التدفق",
      title: "ثلاث خطوات. تدفق واحد.",
      step1Title: "التكوين والدفع",
      step1Desc: "أنشئ حسابك، ثم اختر باقتك الشهرية أو خدمتك أو عقدك بالساعة من بوابتك الآمنة.",
      step2Title: "تحميل المستندات",
      step2Desc: "اسحب وأفلت الوصولات وملفات T4 في خزنتك المشفرة والمستضافة في كندا.",
      step3Title: "المتابعة والاستلام",
      step3Desc: "تتبع التقدم واسترد ملفاتك وجداولك الجاهزة مباشرة."
    },
    faq: {
      tagline: "المادة الخامسة — الأسئلة الشائعة",
      title: "قبل أن تثق بنا في أرقامك.",
      q1: "كيف يعمل التسعير بالساعة؟",
      a1: "للمهام المؤقتة أو الاستبدال، نفوتر بين 45 و75 دولاراً في الساعة حسب التعقيد. يُقدَّم عرض سعر قبل أي عمل.",
      q2: "هل مستنداتي بأمان؟",
      a2: "نعم. يتم إرسالها وتخزينها بشكل مشفر في كندا.",
      q3: "ما هي الصيغ المقبولة للمستندات؟",
      a3: "PDF وصور وExcel وCSV حتى 4 ميجابايت.",
      q4: "كيف أتابع ملفي؟",
      a4: "يوجد حالة لكل تفويض تظهر بالوقت الحقيقي في البوابة."
    },
    cookies: {
      title: "🍪 موافقة الكوكيز",
      desc: "نحن نستخدم ملفات تعريف الارتباط الأساسية والتحليلية لتحسين تجربتك وفقاً للقانون 25.",
      decline: "رفض",
      accept: "قبول"
    },
    footer: {
      taxDisclaimer: "الأسعار المعروضة لا تشمل الضرائب (تضاف ضريبة المبيعات الفيدرالية والمحلية).",
      privacy: "سياسة الخصوصية (قانون 25)",
      terms: "شروط الخدمة",
      legal: "الإشعارات القانونية",
      admin: "الإدارة",
      copyright: "© 2026 كومبتا فلو — كندا"
    },

    landing: {
      registry: "المادة الأولى — السجل",
      sideTagline: "دقة · انسيابية · تميز"
    },

    auth: {
      tagline: "كندا · مساعدة محاسبية ومسك دفاتر",
      subtitle: "نظام إدارة مالية وضريبية آمن لرواد الأعمال الكنديين.",
      privateSpace: "البوابة الخاصة",
      privateSpaceDesc: "تسجيل الدخول والوصول إلى لوحات التحكم",
      createFile: "فتح ملف",
      createFileDesc: "محاسب جديد أو عميل نهائي",
      loginTitle: "تسجيل الدخول.",
      registerTitle: "ملف جديد.",
      submitLogin: "تسجيل الدخول",
      submitRegister: "إنشاء الحساب",
      footer: "بوابة ComptaFlow · كندا · MMXXVI"
    },

    portal: {
      brand: "ComptaFlow",
      logout: "تسجيل الخروج",
      openMenu: "فتح القائمة",
      closeMenu: "إغلاق القائمة",
      changeLanguage: "تغيير اللغة",
      sections: {
        workspace: "مساحتي",
        finance: "المالية",
        documents: "المستندات",
        help: "المساعدة",
        firm: "المكتب",
        production: "الإنتاج",
        payments: "المدفوعات",
        communication: "التواصل",
        network: "شبكة ComptaFlow"
      },
      nav: {
        super_overview: "المؤشرات",
        super_subadmins: "إدارة المحاسبين",
        super_clients: "جميع العملاء",
        super_invoices: "جميع الفواتير",
        messaging: "دعم الشبكة",
        admin_overview: "لوحة التحكم",
        admin_clients: "عملائي",
        interac_settings: "إعدادات Interac",
        sales_ledger: "دفتر المبيعات",
        sales_ledger_global: "دفتر المبيعات العام",
        service_reports: "تقارير الخدمات",
        overview: "وضعي",
        quote: "تقدير السعر",
        services: "الخدمات والأسعار",
        transactions: "سجل المعاملات",
        invoices: "فواتيري",
        vault: "الخزنة",
        client_messaging: "مراسلة المحاسب",
        faq: "الأمان والأسئلة",
        support: "مركز المساعدة",
        procedure: "مسار ملفي"
      },
      roles: { client: "بوابة العميل", sub_admin: "محاسب شريك", super_admin: "المالك الأعلى" },
      loading: "جاري تحميل الصفحة…"
    },

    onboarding: {
      stepProfile: "الملف",
      stepCoords: "البيانات",
      stepDocs: "المستندات",
      stepConfirm: "التأكيد",
      welcomeTitle: "مرحباً بكم في",
      welcomeDesc: "أنشئ حسابك في دقائق. ستختار خدمتك بعد الاتصال ببوابتك.",
      langLabel: "لغة التواصل",
      personalDesc: "موظف، طالب، متقاعد",
      businessDesc: "مستقل، شركة صغيرة، مؤسسة",
      coordsTitle: "بيانات",
      coordsAccent: "الاتصال.",
      coordsDesc: "هذه المعلومات تنشئ حسابك الآمن. اختيار الخدمة يتم لاحقاً من البوابة.",
      fullName: "الاسم الكامل",
      province: "المقاطعة",
      companyName: "اسم الشركة",
      neq: "رقم المؤسسة (NEQ)",
      nas: "رقم الضمان (اختياري)",
      vaultTag: "الخزنة",
      vaultTitle: "أول",
      vaultAccent: "رفع",
      vaultOptional: "(اختياري)",
      vaultDesc: "يمكنك رفع المستندات في أي وقت من البوابة.",
      vaultDrop: "أسقط مستنداتك هنا",
      vaultBrowse: "أو انقر للتصفح — PDF، صور، Excel",
      vaultEncrypted: "تشفير AES-256 نشط",
      readyTitle: "حسابك",
      readyAccent: "جاهز.",
      readyDesc: "ادخل إلى بوابتك واختر خدمتك. لا دفع مطلوب في هذه المرحلة.",
      accessPortal: "الوصول إلى بوابتي",
      nameRequired: "الاسم مطلوب.",
      businessRequired: "معلومات الشركة ناقصة.",
      accountError: "خطأ عند إنشاء الحساب.",
      skip: "تخطي"
    },

    journey: {
      tag: "الخطوة التالية",
      pickService: "اختر خدمتك أدناه لبدء مسارك الموجَّه.",
      continue: "متابعة مساري",
      openProcedure: "فتح مسار ملفي"
    },

    serviceSelector: {
      activeLabel: "الخدمة النشطة",
      confirmed: "مؤكَّد",
      changeHint: "لتغيير الخدمة، تواصل مع محاسبك عبر المراسلة.",
      viewProcedure: "عرض مسار ملفي",
      chooseLabel: "اختر خدمتك",
      chooseTitle: "أي تفويض تريد فتحه؟",
      chooseDesc: "اختر الخدمة التي تناسب احتياجاتك. سيُرسل عرض سعر مخصص بعد التحقق.",
      placeholder: "— اختر خدمة —",
      confirm: "تأكيد اختيار الخدمة",
      selectWarning: "يرجى اختيار خدمة من القائمة.",
      saved: "تم حفظ خدمتك. تابع الآن مسار ملفك.",
      getEstimate: "احصل على تقدير السعر"
    },

    pricingQuestionnaire: {
      badge: "تقدير سريع",
      title: "ما الميزانية لتفويضك؟",
      subtitle: "أجب عن بعض الأسئلة للحصول على نطاق تقديري بالدولار الكندي.",
      progress: "السؤال {current} من {total}",
      showEstimate: "عرض تقديري",
      disclaimer: "تقدير إرشادي فقط — العرض النهائي من محاسبك بعد مراجعة الملف.",
      skipVolume: "الحجم غير منطبق على هذه الخدمة.",
      noAddons: "لا توجد إضافات مقترحة لهذا التفويض.",
      q: {
        service: "ما الخدمة التي تحتاجها؟",
        province: "في أي مقاطعة تعمل؟",
        profile: "ما هو ملفك؟",
        volume: "ما حجم نشاطك الشهري؟",
        employees: "كم عدد الموظفين لديك؟",
        addons: "هل تريد خدمات إضافية؟",
        urgency: "ما المهلة المطلوبة؟"
      },
      profile: {
        personal: { title: "فرد / مستقل", desc: "دخل شخصي أو نشاط خفيف جداً." },
        business: { title: "شركة صغيرة", desc: "شركة نامية مع فوترة منتظمة." },
        sme: { title: "مؤسسة صغيرة ومتوسطة", desc: "حجم مرتفع، رواتب أو حسابات متعددة." }
      },
      volume: {
        low: { title: "منخفض", desc: "أقل من 20 معاملة / شهر." },
        medium: { title: "متوسط", desc: "20 إلى 100 معاملة / شهر." },
        high: { title: "مرتفع", desc: "أكثر من 100 معاملة / شهر." }
      },
      employees: {
        none: { title: "بدون موظفين", desc: "مستقل بدون رواتب." },
        small: { title: "1 إلى 5 موظفين", desc: "فريق صغير." },
        medium: { title: "6 موظفين فأكثر", desc: "رواتب أكثر تعقيداً." }
      },
      urgency: {
        standard: { title: "مهلة عادية", desc: "فتح الملف خلال 5–10 أيام عمل." },
        priority: { title: "أولوية", desc: "مطلوب خلال أسبوعين (+15٪ تقديري)." }
      },
      provinces: {
        QC: "كébec", ON: "أونتاريو", BC: "كolumbia-Britannique", AB: "أAlberta",
        MB: "Manitoba", NB: "Nouveau-Brunswick", NL: "Terre-Neuve", NS: "Nouvelle-Écosse",
        PE: "Î.-P.-É.", SK: "Saskatchewan", YT: "Yukon", NT: "T.N.-O.", NU: "Nunavut"
      },
      units: {
        hourly: "/ تقدير بالساعة",
        monthly: "/ شهر",
        oneTime: " (رسوم لمرة واحدة)",
        perDeclaration: "/ إقرار"
      },
      result: {
        title: "تقديرك",
        range: "نطاق تقديري",
        typical: "المبلغ الوسطي",
        taxesHint: "الضرائب المطبقة (على المبلغ الوسطي)",
        totalWithTax: "الإجمالي المقدر مع الضرائب"
      },
      cta: {
        continue: "المتابعة إلى بوابتي",
        signup: "إنشاء حسابي",
        restart: "إعادة البدء"
      }
    },

    support: {
      title: "مركز",
      titleAccent: "المساعدة",
      subtitle: "محاسبك على بعد نقرة",
      formTitle: "إرسال رسالة رسمية",
      sentTitle: "تم إرسال الرسالة بنجاح!",
      sentDesc: "سيرد محاسبك خلال 24 ساعة عمل.",
      subject: "موضوع الطلب",
      subjectPlaceholder: "مثال: سؤال حول إقرار TPS…",
      message: "رسالة مفصلة",
      messagePlaceholder: "صف احتياجك بدقة…",
      send: "إرسال إلى المحاسب",
      ticketSaved: "تم تسجيل تذكرة الدعم بنجاح.",
      contacts: "جهات اتصال مباشرة",
      email: "البريد الإلكتروني",
      sms: "طوارئ (SMS)",
      chat: "دردشة مباشرة",
      available: "متاح",
      hours: "ساعات العمل",
      weekdays: "الإثنين - الجمعة",
      saturday: "السبت",
      sunday: "الأحد",
      byAppt: "بموعد",
      closed: "مغلق",
      secureLine: "خطك مؤمَّن بتشفير من طرف إلى طرف.",
      smsCopied: "تم نسخ رقم المساعدة.",
      liveChatTitle: "محادثة مباشرة",
      liveChatDesc: "رد خلال لحظات، كما مع مكتبك.",
      chatPlaceholder: "اكتب رسالتك…",
      onlineNow: "متصل · يرد مباشرة",
      typingPrefix: "يكتب",
      chatError: "عطل تقني بسيط — أعد المحاولة أو راسلنا بالبريد.",
      welcomeMessage: "مرحباً! أنا {name}، مسؤولتك في ComptaFlow. كيف يمكنني مساعدتك؟"
    },

    procedure: {
      tag: "مسار موجَّه",
      title: "ملفك",
      titleAccent: "الشخصي",
      subtitle: "المستندات المطلوبة والمعلومات والخطوات حتى الإغلاق — بإرشاد فريق ComptaFlow.",
      noService: "اختر خدمة لعرض المسار الكامل (مستندات، معلومات، خطوات).",
      selectService: "— اختر خدمة —",
      viewPath: "عرض المسار",
      browseServices: "تصفح الخدمات",
      step: "خطوة",
      done: "مكتمل",
      progress: "التقدم",
      nextStep: "الخطوة التالية",
      allComplete: "المسار مكتمل — محاسبك يُنهي التسليم.",
      requiredDocs: "المستندات",
      requiredInfo: "المعلومات",
      optional: "اختياري",
      markComplete: "وضع علامة مكتمل",
      markIncomplete: "وضع علامة غير مكتمل",
      goToStep: "الانتقال إلى هذه الخطوة",
      estimatedDays: "المدة التقديرية: {days} أيام عمل",
      cpaNote: "كل خطوة يتحقق منها CPA في شبكة ComptaFlow. تُراجع الحسابات والضرائب قبل أي تسليم.",
      common: {
        steps: {
          mandate: { title: "التفويض والملف", desc: "وقِّع تفويضك وأكمل ملفك (المقاطعة، الشركة)." },
          documents: { title: "رفع المستندات", desc: "حمِّل الملفات المطلوبة إلى خزنتك الآمنة." },
          cpaReview: { title: "مراجعة CPA", desc: "يتحقق محاسبك من المعلومات ويجيب على أسئلتك." },
          delivery: { title: "الإغلاق والفوترة", desc: "استلام التسليمات وتسوية الأتعاب." }
        },
        docs: { signedMandate: "تفويض موقَّع" },
        fields: {
          profileComplete: "الملف مكتمل",
          province: "المقاطعة الضريبية مؤكَّدة",
          questionsAnswered: "أسئلة CPA مُجابة",
          invoiceSettled: "الأتعاب مسدَّدة"
        }
      },
      docs: {
        bankStatements: "كشوف بنكية (آخر 3 أشهر)",
        receipts: "إيصالات ومستندات داعمة",
        priorLedger: "دفتر أستاذ سابق (إن وُجد)",
        salesInvoices: "فواتير المبيعات",
        expenseReceipts: "إيصالات المصروفات",
        creditCard: "كشوف بطاقة الائتمان",
        payrollRegister: "سجل الرواتب",
        employeeRoster: "قائمة الموظفين (رقم التأمين، العنوان، المنصب)",
        voidCheque: "شيك باطل / إيداع مباشر",
        priorPayStubs: "قسائم رواتب سابقة",
        salesSummary: "ملخص المبيعات للفترة",
        purchaseSummary: "ملخص المشتريات",
        priorFilings: "إقرارات سابقة",
        yearPayrollSummary: "ملخص رواتب سنوي",
        rl1DataQc: "بيانات Relevé 1 (كيبيك)",
        t4Slips: "نماذج T4 / Relevé 1 النهائية",
        allBankStatements: "جميع الكشوف البنكية (الفترة المشمولة)",
        allReceipts: "جميع المستندات الداعمة",
        priorReturns: "إقرارات سابقة",
        openingBalances: "أرصدة افتتاحية",
        vendorList: "قائمة الموردين / العملاء",
        t2125Support: "إيرادات ومصروفات الأعمال (T2125)",
        incomeSlips: "نماذج T4/Relevé 1 المستلمة",
        expenseSummary: "ملخص المصروفات",
        organizedPackage: "حزمة منظَّمة لمحاسبك CPA"
      },
      fields: {
        periodRange: "الفترة المشمولة",
        volumeEstimate: "الحجم التقديري (معاملات/شهر)",
        bankAccounts: "الحسابات البنكية للمطابقة",
        fiscalYearEnd: "تاريخ نهاية السنة المالية",
        employeeCount: "عدد الموظفين",
        businessNumber: "رقم الأعمال (BN/NEQ)",
        gstAccount: "حساب TPS/TVH",
        provincialTaxAccount: "حساب الضريبة الإقليمية (TVQ/TVP)",
        reportingPeriod: "فترة الإقرار",
        payFrequency: "تكرار الرواتب",
        paySchedule: "جدول الرواتب",
        provinceWork: "مقاطعة عمل الموظفين",
        taxYear: "السنة الضريبية",
        monthsBehind: "عدد الأشهر المتأخرة",
        lastFiledPeriod: "آخر فترة مُقدَّمة",
        softwareName: "برنامج المحاسبة",
        chartOfAccounts: "دليل الحسابات",
        selfEmploymentType: "نوع النشاط المستقل"
      },
      hourlyBookkeeping: {
        steps: {
          scope: { title: "تحديد نطاق التفويض", desc: "حدِّد الفترة والحجم مع محاسبك." },
          work: { title: "مسك الدفاتر", desc: "الإدخال والتصنيف والمطابقة جارية." }
        }
      },
      monthly: {
        steps: {
          bankAccess: { title: "الوصول والإعدادات", desc: "أدخل حساباتك ونهاية السنة المالية." }
        }
      },
      monthlyMicro: { steps: { cycle: { title: "الدورة الشهرية", desc: "مسك دفاتر خفيف ومتابعة ضريبية أساسية." } } },
      monthlySmall: { steps: { cycle: { title: "الدورة الشهرية", desc: "المطابقة والتقارير الشهرية." } } },
      monthlySme: {
        steps: {
          payroll: { title: "إعداد الرواتب", desc: "اضبط الرواتب لفريقك." },
          cycle: { title: "دورة PME كاملة", desc: "مسك دفاتر + رواتب + تقارير." }
        }
      },
      gstQst: {
        steps: {
          taxNumbers: { title: "الأرقام الضريبية", desc: "أكِّد أرقام TPS/TVH والإقليمية." },
          filing: { title: "إعداد الإقرار", desc: "التجميع والتحقق قبل الإرسال." }
        }
      },
      payroll: {
        steps: {
          info: { title: "معلومات الرواتب", desc: "التكرار والمقاطعة وعدد الموظفين." },
          run: { title: "معالجة الرواتب", desc: "حساب الرواتب والخصومات." }
        }
      },
      t4Releve1: {
        steps: {
          prep: { title: "إعداد النماذج", desc: "تجميع بيانات الرواتب السنوية." },
          delivery: { title: "تسليم النماذج", desc: "T4 و Relevé 1 متاحان في الخزنة." }
        }
      },
      catchUp: {
        steps: {
          scope: { title: "تقييم التأخير", desc: "حدِّد نطاق التحديث." },
          work: { title: "عمل التحديث", desc: "تحديث المحاسبة المتأخرة." }
        }
      },
      softwareSetup: {
        steps: {
          choice: { title: "اختيار البرنامج", desc: "QuickBooks أو Sage أو غيره — الإعداد الأولي." },
          session: { title: "جلسة الإعداد", desc: "التثبيت والتدريب مع الدعم." }
        }
      },
      taxHelpAutonomous: {
        steps: {
          organize: { title: "التنظيم الضريبي", desc: "نظِّم إيرادات ومصروفات العمل المستقل." },
          handoff: { title: "التسليم لـ CPA", desc: "الملف جاهز لإقرارك الضريبي." }
        }
      }
    },

    messaging: {
      adminChannels: "قنوات العملاء",
      activeConversations: "محادثات نشطة",
      activeCount: "نشط",
      individual: "فرد",
      filePrefix: "الملف:",
      secureChannel: "قناة مباشرة آمنة",
      encrypted: "مشفر AES-256",
      syncing: "مزامنة التبادلات الآمنة…",
      adminPlaceholder: "تبادل آمن مع العميل…",
      clientTitle: "محاسب مهني مخصص",
      online: "متصل",
      clientPlaceholder: "تبادل آمن مع مكتبك…",
      noSelection: "لم يُحدَّد ملف",
      selectClient: "انقر على عميل في القائمة اليسرى لتحميل المحادثة المشفرة."
    },

    transactions: {
      titlePro: "تدفق مهني",
      titlePersonal: "تدفق شخصي",
      subtitle: "مطابقة وامتثال في الوقت الفعلي",
      addEntry: "إدخال استراتيجي",
      syncing: "مزامنة تدفقاتك",
      syncingPro: "المهنية",
      syncingPersonal: "الشخصية",
      inflowPro: "تدفق وارد",
      inflowPersonal: "إيرادات",
      outflowPro: "تدفق صادر",
      outflowPersonal: "مصروفات",
      smartFilter: "فلتر ذكي",
      filterAll: "الكل",
      filterSale: "مبيعات",
      filterPurchase: "مشتريات",
      loading: "جاري تحميل السجل…"
    },

    pricing: {
      badge: "أسعار شفافة",
      legalTitle: "الشفافية والإطار القانوني",
      legalSubtitle: "نطاق تدخلنا في كندا",
      weDo: "ما نقوم به",
      weDo1: "مسك دفاتر شهري، باقات وعقود بالساعة.",
      weDo2: "إقرارات الضرائب الفدرالية/الإقليمية وإعداد T4 / Relevé 1.",
      weDo3: "معالجة رواتب لـ 1 إلى 5 موظفين.",
      weDo4: "إعداد البرمجيات (QuickBooks، Sage) ومساعدة ضريبة العامل المستقل.",
      cpaTitle: "ما يُسند إلى CPA*",
      cpa1: "بيانات مالية مدققة أو مهام مراجعة برأي عام.",
      cpa2: "توقيع بيانات معتمدة محجوز لـ CPA مدققين.",
      cpa3: "لهذه المهام، نتعاون مع شركاء CPA."
    },

    vault: {
      encrypted: "تشفير AES-256 معتمد",
      subtitle: "خزنة افتراضية عالية الدقة",
      upload: "رفع",
      official: "مستند رسمي",
      transmit: "إرسال",
      name: "اسم المستند",
      category: "الفئة",
      size: "الحجم",
      date: "التاريخ"
    },

    invoices: {
      title: "سجل",
      titleAccent: "الفواتير.",
      subtitle: "ضرائب كندية (TPS · TVH · TVQ · TVP حسب المقاطعة)",
      newInvoice: "فاتورة جديدة",
      emitTitle: "إصدار فاتورة",
      emitSubtitle: "إنشاء مع الضرائب الإقليمية المدمجة",
      number: "الرقم",
      selectClient: "العميل المستلم",
      selectClientPlaceholder: "اختر عميلاً…",
      amountHt: "المبلغ قبل الضريبة ($ HT)",
      taxPreview: "معاينة الضريبة الإقليمية",
      subtotal: "المجموع الفرعي HT",
      gst: "TPS / TVH فيدرالية",
      qst: "ضريبة إقليمية (TVQ, TVP, إلخ)",
      totalEstimated: "الإجمالي التقديري شامل الضريبة",
      cancel: "إلغاء",
      createDraft: "إنشاء مسودة",
      empty: "لا توجد فواتير مسجلة.",
      declaredPaid: "مُعلَن مدفوعاً",
      issuedOn: "صدر في",
      totalTtc: "المبلغ الإجمالي شامل الضريبة",
      manage: "إدارة",
      statusPaid: "مدفوعة",
      statusPending: "في انتظار الدفع",
      statusDraft: "مسودة",
      statusCancelled: "ملغاة",
      manageTitle: "إدارة الفاتورة",
      clientId: "معرف العميل",
      paymentAlert: "أعلن العميل إتمام تحويل Interac. يرجى التحقق من حسابك البنكي.",
      publish: "نشر وإرسال تعليمات Interac",
      confirmReceipt: "تأكيد استلام دفع Interac",
      cancelInvoice: "إلغاء الفاتورة",
      confirmPaymentTitle: "تأكيد الدفع",
      confirmPaymentDesc: "أدخل رقم المرجع أو التأكيد المقدم من البنك لتحويل Interac.",
      interacRef: "رقم مرجع Interac",
      interacRefPlaceholder: "مثال: CA12345678",
      settleInvoice: "تسوية الفاتورة",
      paymentInstructions: "تعليمات الدفع",
      invoiceLabel: "فاتورة",
      totalTransfer: "المبلغ المطلوب تحويله",
      paidMessage: "فاتورة مسددة. مرجع بنكي Interac",
      directDeposit: "إيداع مباشر",
      interacRequired: "تحويل Interac مطلوب",
      recipient: "المستلم",
      yourBookkeeper: "محاسبك",
      sendTo: "أرسل التحويل إلى",
      exactAmount: "المبلغ الدقيق",
      autodeposit: "إيداع تلقائي",
      autodepositYes: "نعم (بدون سؤال أمان)",
      autodepositNo: "لا",
      securityQuestion: "سؤال الأمان",
      defaultQuestion: "أي مكتب؟",
      clientDeclaredPending: "أعلنت إرسال التحويل. في انتظار التحقق من محاسبك.",
      clientSentTransfer: "أرسلت التحويل",
      toastSelectClient: "يرجى اختيار عميل وإدخال مبلغ.",
      toastPublished: "تم نشر الفاتورة وإرسال البريد للعميل.",
      toastPublishedSim: "تم نشر الفاتورة (محاكاة إرسال البريد).",
      toastPublishError: "خطأ في نشر الفاتورة.",
      toastRefRequired: "يرجى إدخال رقم تأكيد Interac.",
      toastPaymentConfirmed: "تم تأكيد دفع Interac. الفاتورة مُعلَّمة مدفوعة.",
      toastPaymentError: "خطأ في التحقق من الدفع."
    },

    superAdmin: {
      loading: "جاري تحميل وحدة Super Admin…",
      title: "وحدة",
      titleAccent: "Super Admin.",
      subtitle: "مالك ComptaFlow والتحليلات العالمية",
      subAdmins: "المحاسبون (Sub-Admins)",
      clients: "العملاء المرتبطون",
      totalInvoices: "إجمالي الفواتير",
      paidVolume: "حجم الشبكة المدفوع",
      networkCommission: "عمولة الشبكة (5%)",
      partnersTitle: "مكاتب محاسبة شريكة",
      colPartner: "محاسب شريك",
      colEmail: "البريد الإلكتروني",
      colClients: "عدد العملاء",
      colRevenue: "الإيرادات المحصلة",
      colRoyalty: "الامتياز (5%)",
      colRegistered: "تاريخ التسجيل",
      noPartners: "لا يوجد محاسبون شركاء مسجلون حالياً.",
      noName: "بدون اسم",
      live: "بيانات مباشرة",
      pendingInvoices: "فواتير معلقة",
      byProvince: "العملاء حسب المقاطعة",
      byService: "الانتدابات حسب الخدمة",
      noBreakdown: "لا توجد بيانات متاحة حالياً."
    },

    superAdminClients: {
      title: "سجل",
      titleAccent: "العملاء العالمي.",
      subtitle: "نظرة عامة على عملاء الشبكة وتعيين المكاتب",
      searchPlaceholder: "بحث عن عميل أو محاسب…",
      filterPartner: "تصفية حسب المكتب",
      allPartners: "جميع المكاتب",
      orphanOnly: "العملاء اليتامى فقط",
      colClient: "العميل",
      colEmail: "البريد الإلكتروني",
      colPartner: "محاسب شريك",
      colCreated: "تاريخ الإنشاء",
      colAssign: "التعيين",
      assignPartner: "تعيين مكتب",
      choosePartner: "اختر مكتباً…",
      assign: "تعيين",
      selectPartnerFirst: "اختر مكتباً شريكاً.",
      assignSuccess: "تم تعيين العميل للمكتب.",
      assignError: "تعذر تعيين العميل.",
      orphan: "يتيم (بدون محاسب مرتبط)",
      noResults: "لا يوجد عملاء يطابقون بحثك."
    },

    superAdminInvoices: {
      title: "سجل",
      titleAccent: "الفواتير العالمية.",
      subtitle: "تدقيق الفوترة العالمية والضرائب المحصلة (للقراءة فقط)",
      searchPlaceholder: "بحث عن فاتورة أو عميل أو مكتب…",
      statTotalHt: "إجمالي الفوترة HT",
      statTotalTps: "إجمالي TPS/TVH المحصل",
      statTotalTvq: "إجمالي الضرائب الإقليمية المحصلة",
      statTotalPaid: "إجمالي المحصل",
      statTotalPending: "إجمالي المعلق",
      colNumber: "الرقم",
      colClient: "العميل",
      colFirm: "مكتب المحاسبة",
      colSubtotal: "المجموع الفرعي HT",
      colTps: "TPS/TVH",
      colTvq: "إقليمي",
      colTotal: "الإجمالي شامل الضريبة",
      colStatus: "الحالة",
      colIssueDate: "تاريخ الإصدار",
      statusPaid: "مدفوعة",
      statusSent: "مُرسَلة",
      statusCancelled: "ملغاة",
      statusDraft: "مسودة",
      defaultFirm: "مكتب",
      empty: "لا توجد فواتير مسجلة حالياً."
    },

    superAdminSubAdmins: {
      title: "إدارة",
      titleAccent: "المحاسبين.",
      subtitle: "تسجيل وتجهيز المكاتب الشريكة",
      newFirmTitle: "مكتب جديد",
      placeholderName: "الاسم الكامل / الاسم القانوني",
      placeholderEmail: "البريد الإلكتروني",
      placeholderPassword: "كلمة المرور الأولية",
      submit: "تسجيل المحاسب",
      registeredTitle: "المكاتب المسجلة",
      registeredOn: "مسجل في",
      empty: "لا توجد مكاتب محاسبة مسجلة.",
      toastLoadError: "تعذر تحميل قائمة المحاسبين.",
      toastFillAll: "يرجى ملء جميع الحقول.",
      toastCreated: "تم بدء حساب sub_admin لـ {name}. تم إرسال بريد التأكيد.",
      toastCreateError: "فشل التسجيل."
    },

    adminHub: {
      loading: "جاري تهيئة مركز المكتب…",
      title: "مركز",
      titleAccent: "ComptaFlow.",
      subtitle: "عمليات استراتيجية وذكاء أعمال",
      badge: "مدير أعلى",
      grossRevenue: "الإيرادات الإجمالية",
      vsLastMonth: "مقارنة بالشهر الماضي",
      networkFees: "رسوم الشبكة (5%)",
      networkRoyalty: "امتياز ComptaFlow",
      netRevenue: "صافي إيرادات المكتب (95%)",
      netCollected: "صافي المحصل",
      clientPortfolio: "محفظة العملاء",
      compliantFiles: "ملفات متوافقة ARC / المقاطعات",
      workflow: "سير العمل",
      criticalPriority: "أولوية حرجة",
      activityFeed: "تدفق نشاط الشبكة",
      globalArchives: "أرشيف عالمي",
      noActivity: "لم يُكتشَف نشاط على شبكة ComptaFlow.",
      anonymousMandate: "تفويض مجهول",
      intelligenceTitle: "إدارة الذكاء",
      intelligenceDesc: "تحكم في موصلات السحابة وفعِّل أتمتة نهاية الفترة.",
      generateReports: "إنشاء البيانات",
      cloudConnectors: "موصلات السحابة",
      reportsGenerated: "الذكاء يعمل: تم تنسيق البيانات.",
      statusActive: "نشط",
      statusOnline: "متصل",
      statusStandby: "استعداد"
    },

    adminClients: {
      title: "إدارة",
      titleAccent: "تفويضات العملاء.",
      subtitle: "إدارة الملفات والامتثال",
      newClient: "عميل جديد",
      addClient: "إضافة عميل",
      newMandates: "تفويضات جديدة",
      compliant: "ملفات متوافقة",
      actionRequired: "إجراء مطلوب",
      colIdentity: "هوية العميل",
      colServices: "الخدمات النشطة",
      colStatus: "حالة الملف",
      colActions: "إجراءات الإنتاج",
      individual: "فرد",
      consultation: "استشارة",
      manage: "إدارة"
    }
  }
};

export type LanguageCode = keyof typeof i18n;

/**
 * Hook ou utilitaire simple pour récupérer le texte traduit.
 */
export const t = (lang: LanguageCode, key: string) => {
  const keys = key.split('.');
  let result: any = i18n[lang];
  for (const k of keys) {
    if (result && typeof result === 'object') result = result[k];
    else break;
  }
  return result || key;
};
