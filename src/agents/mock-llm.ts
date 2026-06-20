import type { LLMClient } from './types';
import { getAgentForIntent } from './registry';
import type { AgentIntent } from './types';

const MOCK_INTENT_HINTS: { pattern: RegExp; intent: AgentIntent }[] = [
  { pattern: /\b(tps|tvh|tvq|tvp|gst|qst|déclar|fiscal|tax|impôt)\b/i, intent: 'TAX' },
  { pattern: /\b(t4|relevé|paie|payroll|salaire|employé)\b/i, intent: 'PAYROLL' },
  { pattern: /\b(factur|interac|stripe|paiement|invoice)\b/i, intent: 'BILLING' },
  { pattern: /\b(transaction|livre|comptab|rapproch|bookkeep)\b/i, intent: 'BOOKKEEPING' },
  { pattern: /\b(document|étape|parcours|procedure|dossier|mandat)\b/i, intent: 'PROCEDURE' },
  { pattern: /\b(portail|navigation|connexion|login|vault|coffre)\b/i, intent: 'PORTAL' },
  { pattern: /\b(inscription|onboard|compte|profil)\b/i, intent: 'ONBOARDING' },
];

function detectIntent(message: string): AgentIntent {
  for (const { pattern, intent } of MOCK_INTENT_HINTS) {
    if (pattern.test(message)) return intent;
  }
  return 'GENERAL';
}

const MOCK_ANSWERS: Record<AgentIntent, { fr: string; en: string; ar: string }> = {
  TAX: {
    fr: 'Pour vos déclarations TPS/TVH/TVQ, rassemblez vos relevés bancaires et factures du trimestre. Votre comptable validera les montants avant transmission — consultez aussi votre parcours dossier dans le portail.',
    en: 'For GST/HST/QST filings, gather bank statements and invoices for the period. Your bookkeeper will validate amounts before filing — see your guided file path in the portal.',
    ar: 'لإقرارات الضرائب، اجمع كشوف الحساب والفواتير. سيتحقق محاسبك من المبالغ قبل الإرسال — راجع مسار ملفك في البوابة.',
  },
  PAYROLL: {
    fr: 'Pour la paie et les T4/Relevé 1, préparez les feuilles de temps et relevés RRQ/RQAP. Les échéances varient selon votre province — voir l’onglet Parcours dossier.',
    en: 'For payroll and T4/Relevé 1, prepare timesheets and provincial deduction slips. Deadlines vary by province — check your file path tab.',
    ar: 'للرواتب ونماذج T4، جهّز سجلات الوقت والخصومات الإقليمية — راجع تبويب مسار الملف.',
  },
  BILLING: {
    fr: 'Vous pouvez déclarer un virement Interac depuis Factures après paiement. Indiquez toujours le numéro de facture en message de virement.',
    en: 'You can declare an Interac transfer from Invoices after payment. Always include the invoice number in the transfer message.',
    ar: 'يمكنك الإعلان عن تحويل Interac من قسم الفواتير بعد الدفع. أدرج رقم الفاتورة في رسالة التحويل.',
  },
  BOOKKEEPING: {
    fr: 'Déposez vos relevés et reçus dans le Coffre-fort ; votre comptable les classera. Le rapprochement bancaire se fait dans Transactions.',
    en: 'Upload statements and receipts to the Vault; your bookkeeper will classify them. Bank reconciliation is under Transactions.',
    ar: 'ارفع الكشوف والإيصالات إلى الخزنة؛ سيصنّفها محاسبك. المطابقة البنكية في المعاملات.',
  },
  TECHNICAL: {
    fr: 'Pour un problème technique, décrivez ce que vous voyez à l’écran. En attendant, vous pouvez aussi nous écrire via le formulaire de support.',
    en: 'For a technical issue, describe what you see on screen. You can also reach us via the support form.',
    ar: 'لوصف مشكلة تقنية، اشرح ما تراه على الشاشة. يمكنك أيضاً مراسلتنا عبر نموذج الدعم.',
  },
  SALES: {
    fr: 'Nos forfaits sont listés dans Services. Après sélection, un devis personnalisé vous sera transmis sous 24 h ouvrables.',
    en: 'Plans are listed under Services. After selection, a custom quote is sent within 24 business hours.',
    ar: 'الخطط مدرجة في الخدمات. بعد الاختيار، يُرسل عرض سعر مخصص خلال 24 ساعة عمل.',
  },
  COMPLIANCE: {
    fr: 'ComptaFlow respecte la Loi 25 (QC) et la PIPEDA. Vos données sont hébergées au Canada. Consultez Confidentialité pour plus de détails.',
    en: 'ComptaFlow complies with Quebec Law 25 and PIPEDA. Data is hosted in Canada. See Privacy for details.',
    ar: 'ComptaFlow يلتزم بقوانين الخصوصية الكندية. البيانات مستضافة في كندا.',
  },
  PORTAL: {
    fr: 'Votre portail client regroupe Aperçu, Parcours dossier, Coffre-fort, Factures et Support. Utilisez le menu à gauche pour naviguer.',
    en: 'Your client portal includes Overview, File path, Vault, Invoices and Support. Use the left menu to navigate.',
    ar: 'تتضمن بوابتك نظرة عامة ومسار الملف والخزنة والفواتير والدعم. استخدم القائمة اليسرى.',
  },
  ONBOARDING: {
    fr: 'Après inscription, choisissez votre service dans l’Aperçu puis suivez le Parcours dossier étape par étape.',
    en: 'After signup, pick your service in Overview then follow the guided file path step by step.',
    ar: 'بعد التسجيل، اختر خدمتك في النظرة العامة ثم اتبع مسار الملف.',
  },
  MESSAGING: {
    fr: 'Utilisez Messagerie pour échanger avec votre comptable attitré. Les réponses arrivent généralement sous 24 h ouvrables.',
    en: 'Use Messaging to reach your assigned bookkeeper. Replies usually arrive within 24 business hours.',
    ar: 'استخدم المراسلة للتواصل مع محاسبك. الردود عادة خلال 24 ساعة عمل.',
  },
  PROCEDURE: {
    fr: 'Ouvrez Parcours dossier pour la liste des documents et étapes de votre mandat. Cochez chaque étape au fur et à mesure.',
    en: 'Open your file path for required documents and steps. Check off each step as you go.',
    ar: 'افتح مسار الملف لقائمة المستندات والخطوات. ضع علامة على كل خطوة.',
  },
  GENERAL: {
    fr: 'Bonjour ! Je suis votre interlocutrice ComptaFlow. Posez une question sur vos taxes, la paie, vos factures ou votre parcours dossier — je vous guide.',
    en: 'Hello! I\'m your ComptaFlow contact. Ask about taxes, payroll, invoices or your file path — I\'ll guide you.',
    ar: 'مرحباً! أنا مسؤولتك في ComptaFlow. اسأل عن الضرائب أو الرواتب أو الفواتير أو مسار ملفك.',
  },
};

/** Réponses locales quand GOOGLE_GEMINI_API_KEY est absent (pas d'appel API). */
export function createMockLLMClient(): LLMClient {
  return {
    async generateJSON<T>(prompt: string): Promise<T> {
      const intent = detectIntent(prompt);
      return { intent, confidence: 0.75 } as T;
    },
    async generateText(prompt: string, options = {}): Promise<string> {
      const intent = detectIntent(prompt);
      const agent = getAgentForIntent(intent);
      const lang =
        options.systemPrompt?.includes('Langue de réponse: en') ? 'en'
        : options.systemPrompt?.includes('Langue de réponse: ar') ? 'ar'
        : 'fr';
      const answers = MOCK_ANSWERS[intent];
      const base = answers[lang];
      return `${base}\n\n(Mode assistance — configuration IA en cours. Votre comptable peut préciser les montants.)`;
    },
  };
}
