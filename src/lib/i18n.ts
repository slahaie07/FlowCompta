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
      payroll: "Gestion des paies",
      taxes_biz: "Impôts Société",
      taxes_perso: "Impôts Particulier",
      consulting: "Expertise CPA",
      stocks: "Gestion des stocks",
      title: "Six services, six prix nets.",
      subtitle: "Chaque mandat est inscrit au registre avec son tarif ferme. Sélectionnez, payez, suivez — tout part d'ici.",
      composer: "Composer mon mandat",
      perMandate: "Net par mandat",
      
      t1_name: "Impôts — Particulier",
      t1_desc: "Déclaration complète, optimisation des crédits (REER, frais médicaux, frais de garde) et transmission électronique à l'ARC et à Revenu Québec.",
      t1_price: "89 $",
      
      ta_name: "Impôts — Travailleur autonome",
      ta_desc: "Revenus d'entreprise, dépenses admissibles, TPS/TVQ et acomptes provisionnels calculés pour vous éviter toute pénalité.",
      ta_price: "199 $",
      
      t2_name: "Impôts — Société",
      t2_desc: "Déclarations fédérale et provinciale, états financiers de fin d'exercice et stratégie salaire-dividendes pour l'actionnaire-dirigeant.",
      t2_price: "749 $",
      
      gl_name: "Tenue de livres",
      gl_desc: "Classement mensuel des transactions, conciliations bancaires, rapports de taxes et états des résultats livrés dans votre portail.",
      gl_price: "249 $",
      
      inv_name: "Gestion des stocks",
      inv_desc: "Suivi des inventaires, coût des marchandises vendues, marges par produit et alertes de rupture — vos stocks deviennent des données.",
      inv_price: "179 $",
      
      cfo_name: "Finances d'entreprise",
      cfo_desc: "Direction financière externe : budgets, prévisions de trésorerie, tableaux de bord et accompagnement décisionnel chaque mois.",
      cfo_price: "499 $"
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
      mobileOpen: "Ouvrir mon dossier"
    },

    // Hero
    hero: {
      tagline: "Cabinet comptable · Québec · Canada",
      title1: "La comptabilité qui",
      title2: "coule de source.",
      subtitle: "Comptaflow réunit vos impôts, votre tenue de livres et vos finances d'entreprise dans un seul flux : un portail, des prix fermes, zéro paperasse.",
      cta: "Ouvrir mon dossier — 60 $",
      googleLogin: "Connexion Google",
      preview: "Aperçu client",
      item1: "Déclaration T1 — transmise à l'ARC",
      item1Val: "✓",
      item2: "Documents reçus au coffre-fort",
      item3: "Tenue de livres — mai 2026",
      item3Val: "Conciliée",
      item4: "Remboursement estimé",
      item4Val: "1 847,00 $",
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
      title: "Quatre étapes. Un seul flux.",
      step1Title: "Composez",
      step1Desc: "Sélectionnez vos mandats en ligne. Le frais d'ouverture de 60 $ crée votre espace sécurisé.",
      step2Title: "Payez",
      step2Desc: "Paiement par carte ou Interac. Compte créé instantanément, reçu officiel à l'appui.",
      step3Title: "Déposez",
      step3Desc: "T4, relevés, factures : glissez-déposez le tout dans votre coffre-fort numérique chiffré.",
      step4Title: "Recevez",
      step4Desc: "Suivez l'avancement en temps réel et récupérez vos livrables directement dans le portail."
    },

    // FAQ
    faq: {
      tagline: "Article V — Questions fréquentes",
      title: "Avant de nous confier vos chiffres.",
      q1: "À quoi sert le frais d'ouverture de dossier de 60 $ ?",
      a1: "Il couvre la création de votre espace client sécurisé, la vérification initiale de votre dossier fiscal et la configuration de votre coffre-fort de documents. Il n'est facturé qu'une seule fois.",
      q2: "Mes documents sont-ils en sécurité ?",
      a2: "Oui. Vos fichiers sont transmis chiffrés (TLS) et stockés dans une base de données hébergée au Canada, accessible uniquement par vous et votre comptable. Aucun document ne transite par courriel.",
      q3: "Quels formats de documents puis-je déposer ?",
      a3: "PDF, images (photos de reçus), fichiers Excel et CSV — jusqu'à 4 Mo par fichier. Une photo nette de votre T4 prise au téléphone fait parfaitement l'affaire.",
      q4: "Comment suivre l'avancement de mon dossier ?",
      a4: "Chaque mandat a un statut visible en temps réel dans votre portail : en attente de vos documents, à traiter, en cours, puis terminé. Vous recevez vos livrables directement au même endroit."
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
      taxDisclaimer: "Les prix affichés sont hors taxes (TPS 5 % et TVQ 9,975 % en sus).",
      privacy: "Confidentialité (Loi 25)",
      admin: "Administration",
      copyright: "© 2026 Comptaflow — Québec, Canada"
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
      consulting: "CPA Advice",
      stocks: "Inventory Management",
      title: "Six services, six flat rates.",
      subtitle: "Each mandate is logged with its fixed price. Select, pay, track — everything flows from here.",
      composer: "Configure My Mandate",
      perMandate: "Net per mandate",
      
      t1_name: "T1 Taxes — Personal",
      t1_desc: "Complete tax return, optimization of credits (RRSP, medical expenses, childcare fees) and electronic filing to CRA and Revenu Québec.",
      t1_price: "$89",
      
      ta_name: "T2125 Taxes — Freelance",
      ta_desc: "Business income, allowable expenses, GST/QST and installment calculations to avoid any late penalties.",
      ta_price: "$199",
      
      t2_name: "T2 Taxes — Corporate",
      t2_desc: "Federal and provincial tax returns, year-end financial statements and salary-dividend strategy for owner-managers.",
      t2_price: "$749",
      
      gl_name: "Bookkeeping",
      gl_desc: "Monthly classification of transactions, bank reconciliations, tax reports, and income statements delivered directly to your portal.",
      gl_price: "$249",
      
      inv_name: "Inventory Management",
      inv_desc: "Inventory tracking, cost of goods sold, margin analysis by product and stockout alerts — turning stock into actionable data.",
      inv_price: "$179",
      
      cfo_name: "Corporate Finance",
      cfo_desc: "External CFO services: budgets, cash flow forecasts, financial dashboards and monthly strategic support.",
      cfo_price: "$499"
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
      mobileOpen: "Start My File"
    },

    // Hero
    hero: {
      tagline: "Accounting Firm · Quebec · Canada",
      title1: "Accounting that",
      title2: "flows naturally.",
      subtitle: "Comptaflow brings together your taxes, bookkeeping, and corporate finance into a single flow: one portal, fixed rates, zero paperwork.",
      cta: "Start My File — $60",
      googleLogin: "Google Sign In",
      preview: "Client Preview",
      item1: "T1 Tax Return — filed with CRA",
      item1Val: "✓",
      item2: "Documents uploaded to vault",
      item3: "Bookkeeping — May 2026",
      item3Val: "Reconciled",
      item4: "Estimated Refund",
      item4Val: "$1,847.00",
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
      title: "Four Steps. One Flow.",
      step1Title: "Configure",
      step1Desc: "Select your mandates online. The $60 setup fee configures your secure client account.",
      step2Title: "Pay",
      step2Desc: "Secure payment via card or Interac. Instant account creation and official receipt issued.",
      step3Title: "Upload",
      step3Desc: "T4s, receipts, bank statements: drag and drop everything into your encrypted digital vault.",
      step4Title: "Receive",
      step4Desc: "Track progress in real time and retrieve your tax and financial deliverables directly in the portal."
    },

    // FAQ
    faq: {
      tagline: "Article V — FAQ",
      title: "Before trusting us with your numbers.",
      q1: "What is the $60 setup fee for?",
      a1: "It covers the creation of your secure client workspace, the initial configuration of your tax profile, and the setup of your encrypted document vault. It is a one-time fee.",
      q2: "Are my documents secure?",
      a2: "Yes. All files are encrypted in transit (TLS) and stored in a secure Canadian data center, accessible only by you and your CPA. No sensitive documents are sent over regular email.",
      q3: "What document formats can I upload?",
      a3: "PDF, images (receipt photos), Excel, and CSV files up to 4 MB. A clear phone picture of your tax documents works perfectly.",
      q4: "How do I track the progress of my file?",
      a4: "Each mandate has a real-time status in your portal: waiting for documents, processing, in progress, and completed. You will retrieve your files directly from the same space."
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
      taxDisclaimer: "Displayed prices exclude taxes (5% GST and 9.975% QST will be added).",
      privacy: "Privacy Policy (Law 25)",
      admin: "Administration",
      copyright: "© 2026 Comptaflow — Quebec, Canada"
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
    audit_active: "تدقيق معتمد",
    msg_validate: "يرجى تأكيد بريدك الإلكتروني قبل المتابعة",
    services: {
      bookkeeping: "مسك الدفاتر",
      payroll: "إدارة الرواتب",
      taxes_biz: "ضريبة الشركات",
      taxes_perso: "الضريبة الشخصية",
      consulting: "خبرة محاسب قانوني",
      stocks: "إدارة المخزون",
      title: "ستة خدمات، ستة أسعار ثابتة",
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
      cfo_price: "499 $"
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
      mobileOpen: "بدء ملفي"
    },
    hero: {
      tagline: "مكتب محاسبة · كيبك · كندا",
      title1: "المحاسبة التي",
      title2: "تتدفق بشكل طبيعي.",
      subtitle: "يجمع كومبتا فلو ضرائبك وإمساك الدفاتر والتمويل في تدفق واحد.",
      cta: "بدء ملفي — 60 $",
      googleLogin: "تسجيل الدخول بجوجل",
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
      title: "أربع خطوات. تدفق واحد.",
      step1Title: "تكوين",
      step1Desc: "اختر خدماتك عبر الإنترنت. رسوم 60 $ تؤسس حسابك الآمن.",
      step2Title: "دفع",
      step2Desc: "دفع آمن بالبطاقة أو إنترأك. إنشاء الحساب فوراً.",
      step3Title: "رفع",
      step3Desc: "ملفات ووصولات: اسحب وأفلت كل شيء في خزنتك الآمنة.",
      step4Title: "تلقي",
      step4Desc: "تابع التقدم بالوقت الحقيقي واستلم مخرجاتك مباشرة."
    },
    faq: {
      tagline: "المادة الخامسة — الأسئلة الشائعة",
      title: "قبل أن تثق بنا في أرقامك.",
      q1: "ما هي رسوم الـ 60 $؟",
      a1: "تغطي إنشاء الحساب والتحقق وتجهيز الخزنة الإلكترونية.",
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
      admin: "الإدارة",
      copyright: "© 2026 كومبتا فلو — كيبك، كندا"
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
