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
    services: {
      bookkeeping: "Tenue de livres",
      payroll: "Gestion des paies",
      taxes_biz: "Impôts Société",
      taxes_perso: "Impôts Particulier",
      consulting: "Expertise CPA"
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
    services: {
      bookkeeping: "Bookkeeping",
      payroll: "Payroll Management",
      taxes_biz: "Corporate Tax",
      taxes_perso: "Personal Tax",
      consulting: "CPA Expertise"
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
      consulting: "خبرة محاسب قانوني"
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
