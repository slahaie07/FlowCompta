/**
 * 📄 Moteur de Génération de Contrats ComptaFlow (Elite Engagement Letters)
 * Supporte les mandats T1/T2 et les langues FR/EN/AR.
 */

export const contracts = {
  fr: {
    title: "Lettre de Mandat Professionnel",
    introduction: "Le présent contrat lie le Cabinet AGY (ci-après le 'CPA') et l'Utilisateur (ci-après le 'Client').",
    clauses: [
      "Services : Le CPA s'engage à fournir des services de {service_name} selon les normes en vigueur.",
      "Honoraires : Le Client accepte de payer la somme de {amount} {currency} pour la réalisation du mandat.",
      "Confidentialité : Toutes les données déposées dans le Vault sont protégées par chiffrement AES-256.",
      "Responsabilité : Le Client demeure responsable de l'exactitude des pièces fournies (ARC/RQ)."
    ],
    signature: "Certifié numériquement par ComptaFlow Elite Core."
  },
  en: {
    title: "Professional Engagement Letter",
    introduction: "This agreement is between AGY Firm (hereinafter 'CPA') and the User (hereinafter 'Client').",
    clauses: [
      "Services: The CPA agrees to provide {service_name} services in accordance with professional standards.",
      "Fees: The Client agrees to pay the amount of {amount} {currency} for the completion of the mandate.",
      "Confidentiality: All data uploaded to the Vault is protected by AES-256 encryption.",
      "Liability: The Client remains responsible for the accuracy of provided documents (CRA/RQ)."
    ],
    signature: "Digitally certified by ComptaFlow Elite Core."
  },
  ar: {
    title: "خطاب تكليف مهني",
    introduction: "هذه الاتفاقية بين شركة AGY (يشار إليها فيما يلي بـ 'المحاسب') والمستخدم (يشار إليه فيما يلي بـ 'العميل').",
    clauses: [
      "الخدمات: يوافق المحاسب على تقديم خدمات {service_name} وفقًا للمعايير المهنية.",
      "الرسوم: يوافق العميل على دفع مبلغ {amount} {currency} لإكمال التكليف.",
      "السرية: جميع البيانات المرفوعة إلى الخزنة محمية بتشفير AES-256.",
      "المسؤولية: يظل العميل مسؤولاً عن دقة المستندات المقدمة."
    ],
    signature: "معتمد رقميًا بواسطة ComptaFlow Elite Core."
  }
};

export const generateContract = (lang: string, service: string, price: number, currency: string) => {
  const template = (contracts as any)[lang] || contracts.fr;
  return {
    title: template.title,
    content: `
      ${template.introduction}
      
      ${template.clauses.map((c: string) => `- ${c.replace('{service_name}', service).replace('{amount}', price.toString()).replace('{currency}', currency)}`).join('\n')}
      
      ${template.signature}
      Date: ${new Date().toLocaleDateString()}
    `
  };
};
