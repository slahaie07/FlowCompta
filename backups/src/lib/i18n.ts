/**
 * 🌍 Moteur de Traduction ComptaFlow (i18n)
 * Centralise tout le contenu textuel pour garantir une évolutivité et une cohérence totale.
 * Langues supportées : Français (FR), English (EN), Arabe (AR)
 */

export const i18n = {
  fr: {
    welcome: "Bienvenue chez ComptaFlow.",
    slogan: "Votre cabinet comptable nouvelle génération.",
    login: "Se connecter",
    register: "S'inscrire",
    personal: "Particulier",
    business: "Entreprise",
    back: "Retour",
    continue: "Continuer",
    step: "Étape",
    name_placeholder: "Jean Tremblay",
    company_placeholder: "Entreprise ABC Inc.",
    currency: "$ CAD",
    setup_fee: "Frais d'ouverture",
    total: "Total Réel",
    secure_storage: "Coffre-fort Sécurisé",
    audit_active: "Traçabilité Activée",
    msg_validate: "Veuillez valider votre courriel avant de continuer.",
    services: {
      bookkeeping: "Tenue de livres",
      payroll: "Gestion des paies",
      taxes_biz: "Impôts Entreprise",
      taxes_perso: "Impôts Particulier",
      consulting: "Expertise CPA"
    }
  },
  en: {
    welcome: "Welcome to ComptaFlow.",
    slogan: "Your next-generation accounting firm.",
    login: "Sign In",
    register: "Sign Up",
    personal: "Individual",
    business: "Business",
    back: "Back",
    continue: "Continue",
    step: "Step",
    name_placeholder: "John Doe",
    company_placeholder: "ABC Business Inc.",
    currency: "$ CAD",
    setup_fee: "Setup Fee",
    total: "Final Total",
    secure_storage: "Secure Vault",
    audit_active: "Audit Logging Active",
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
    welcome: "مرحباً بكم في كومبتا فلو.",
    slogan: "مكتب المحاسبة من الجيل الجديد.",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    personal: "فرد",
    business: "شركة",
    back: "رجوع",
    continue: "متابعة",
    step: "خطوة",
    name_placeholder: "فلان الفلاني",
    company_placeholder: "شركة النور التجارية",
    currency: "$ CAD",
    setup_fee: "رسوم التأسيس",
    total: "المجموع النهائي",
    secure_storage: "الخزنة الآمنة",
    audit_active: "تتبع العمليات نشط",
    msg_validate: "يرجى تفعيل بريدك الإلكتروني قبل المتابعة.",
    services: {
      bookkeeping: "مسك الدفاتر",
      payroll: "إدارة الرواتب",
      taxes_biz: "ضرائب الشركات",
      taxes_perso: "الضرائب الشخصية",
      consulting: "استشارات محاسبية"
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
    if (result) result = result[k];
  }
  return result || key;
};
