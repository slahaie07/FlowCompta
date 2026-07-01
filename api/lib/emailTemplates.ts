/**
 * 🏆 MOTEUR DE TEMPLATES D'EMAIL PREMIUM COMPTA-FLOW (STYLE CANVA GOLD & BLACK)
 * Modèles HTML conformes à la charte graphique luxueuse du cabinet.
 */

/** Escapes HTML-significant characters — every field here may originate from user-submitted form data. */
function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface QuoteData {
  clientName: string;
  clientEmail: string;
  serviceName: string;
  province: string;
  subtotal: string;
  taxesHtml: string;
  total: string;
  agentName: string;
  agentEmail: string;
  quoteRef: string;
  portalUrl: string;
  lang?: 'fr' | 'ar' | 'en';
}

const COMMON_CSS = `
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: #050505;
  color: #FDFBF7;
  margin: 0;
  padding: 0;
`;

const CONTAINER_STYLE = `
  max-width: 600px;
  margin: 40px auto;
  background-color: #0C0C0E;
  border: 1px solid #D4AF37;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
`;

const HEADER_STYLE = `
  background: linear-gradient(135deg, #0C0C0E 0%, #151518 100%);
  padding: 40px 30px;
  text-align: center;
  border-bottom: 1px solid rgba(214, 175, 55, 0.2);
`;

const CONTENT_STYLE = `
  padding: 40px 30px;
  line-height: 1.6;
`;

const BUTTON_STYLE = `
  display: inline-block;
  background: linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%);
  color: #050505 !important;
  text-decoration: none;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  padding: 16px 36px;
  border-radius: 12px;
  margin: 30px 0;
  box-shadow: 0 8px 24px rgba(212, 175, 55, 0.25);
  transition: all 0.3s ease;
`;

const FOOTER_STYLE = `
  background-color: #08080A;
  padding: 30px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 10px;
  color: #55555C;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

/**
 * 🏛️ PATTERN DE LAYOUT MASTER PREMIUM COMPTA-FLOW
 * Unifie l'enveloppe HTML de toutes les communications par email.
 */
export function getPremiumEmailWrapper(options: {
  title: string;
  subtitle: string;
  bodyHtml: string;
  buttonLabel?: string;
  buttonUrl?: string;
  lang?: 'fr' | 'ar' | 'en';
  preheader?: string;
}): string {
  const isAr = options.lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const textAlign = isAr ? 'right' : 'left';
  const logoText = "Compta-Flow";
  const brandSub = isAr ? "مكتب المحاسبة السيادي المتميز" : "Cabinet Comptable Souverain d'Élite";
  const footerText = isAr 
    ? "تنبيه أمني Loi 25 · نظام كومبتا فلو المحمي والمشفر · كندا" 
    : "Sécurisé Loi 25 · Cryptage AES-256 · Compta-Flow Canada";

  const buttonHtml = options.buttonLabel && options.buttonUrl
    ? `<div style="text-align: center; margin: 30px 0;">
        <a href="${options.buttonUrl}" style="${BUTTON_STYLE}">${options.buttonLabel}</a>
       </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="${options.lang || 'fr'}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title}</title>
  ${options.preheader ? `<span style="display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; font-size: 0px;">${options.preheader}</span>` : ''}
  <style>
    body { ${COMMON_CSS} }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#050505;">
  <div style="${CONTAINER_STYLE} direction: ${dir}; text-align: ${textAlign};">
    <div style="${HEADER_STYLE}">
      <div style="font-size: 32px; font-family: serif; color: #D4AF37; font-style: italic; font-weight: bold; letter-spacing: 1px;">${logoText}</div>
      <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 3px; color: #88888F; margin-top: 6px;">${brandSub}</div>
    </div>
    
    <div style="${CONTENT_STYLE}">
      <h2 style="font-family: serif; font-size: 24px; color: #FDFBF7; font-style: italic; margin-top: 0; margin-bottom: 20px;">${options.subtitle}</h2>
      ${options.bodyHtml}
      ${buttonHtml}
    </div>
    
    <div style="${FOOTER_STYLE}">
      ${footerText}
    </div>
  </div>
</body>
</html>`;
}

/**
 * 1. Courriel au Client (Confirmation & Estimation)
 */
export function getClientEmailTemplate(data: QuoteData): string {
  const isAr = data.lang === 'ar';

  if (isAr) {
    const bodyHtml = `
      <p style="color: #CCCCCC; font-size: 14px;">يسعدنا جداً ويشرفنا مرافقتكم في إدارة حساباتكم وتنظيم هيكلكم المالي. تم حفظ محاكاة الأسعار الخاصة بكم بنجاح.</p>
      
      <div style="background-color: rgba(214, 175, 55, 0.04); border: 1px solid rgba(214, 175, 55, 0.15); padding: 25px; border-radius: 16px; margin: 30px 0;">
        <h3 style="color: #D4AF37; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid rgba(214, 175, 55, 0.1); padding-bottom: 8px;">تفاصيل تقدير السعر (${data.quoteRef})</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #FDFBF7;">
          <tr>
            <td style="padding: 8px 0; color: #88888F;">الخدمة المحددة:</td>
            <td style="padding: 8px 0; text-align: left; font-weight: bold;">${escapeHtml(data.serviceName)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #88888F;">المقاطعة الضريبية:</td>
            <td style="padding: 8px 0; text-align: left; font-weight: bold;">${escapeHtml(data.province)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #88888F;">المبلغ الأساسي (قبل الضريبة):</td>
            <td style="padding: 8px 0; text-align: left; font-family: monospace;">${data.subtotal}</td>
          </tr>
          ${data.taxesHtml}
          <tr style="border-top: 1px solid rgba(214, 175, 55, 0.2); font-size: 15px; font-weight: bold;">
            <td style="padding: 12px 0; color: #D4AF37;">المجموع الإجمالي شامل الضريبة:</td>
            <td style="padding: 12px 0; text-align: left; color: #D4AF37; font-family: monospace;">${data.total}</td>
          </tr>
        </table>
      </div>

      <h3 style="font-family: serif; font-size: 18px; color: #FDFBF7; margin-top: 30px;">الخطوات التالية لتفعيل حسابكم:</h3>
      <ol style="color: #CCCCCC; font-size: 13px; padding-right: 20px; line-height: 1.8;">
        <li style="margin-bottom: 10px;"><strong>توقيع عقد التمثيل المشترك</strong>: يرجى تسجيل الدخول إلى بوابتك لوضع توقيعك الإلكتروني المؤمن.</li>
        <li style="margin-bottom: 10px;"><strong>تحميل مستنداتك الثبوتية</strong>: قم بإيداع كشوفاتك البنكية وإيصالاتك بأمان في خزنتنا الإلكترونية المشفرة.</li>
        <li style="margin-bottom: 10px;"><strong>مكالمة انطلاق الخدمة</strong>: احجز لقاءك الترحيبي مع محاسبتك المعتمدة <strong>إيليا (${escapeHtml(data.agentName)})</strong> لتأكيد مسار ملفك.</li>
      </ol>

      <p style="color: #88888F; font-size: 12px; font-style: italic; margin-top: 30px; border-right: 2px solid #D4AF37; padding-right: 10px;">لقد أرفقنا تقدير الرسوم الرسمي بصيغة PDF في هذا البريد الإلكتروني للرجوع إليه في أي وقت.</p>
    `;

    return getPremiumEmailWrapper({
      title: "تأكيد تقدير الرسوم - Compta-Flow",
      subtitle: `مرحباً ${escapeHtml(data.clientName)}،`,
      bodyHtml,
      buttonLabel: "دخول بوابة العملاء",
      buttonUrl: data.portalUrl,
      lang: 'ar'
    });
  }

  // French template (Default)
  const bodyHtmlFr = `
    <p style="color: #CCCCCC; font-size: 14px;">C'est un honneur et un privilège de vous accompagner dans la structuration et la souveraineté financière de votre entreprise. Votre simulation tarifaire a été scellée avec succès.</p>
    
    <div style="background-color: rgba(214, 175, 55, 0.04); border: 1px solid rgba(214, 175, 55, 0.15); padding: 25px; border-radius: 16px; margin: 30px 0;">
      <h3 style="color: #D4AF37; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid rgba(214, 175, 55, 0.1); padding-bottom: 8px;">Détails de l'Estimation (${escapeHtml(data.quoteRef)})</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #FDFBF7;">
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Service sélectionné :</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">${escapeHtml(data.serviceName)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Province fiscale :</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">${escapeHtml(data.province)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Montant brut (HT) :</td>
          <td style="padding: 8px 0; text-align: right; font-family: monospace;">${escapeHtml(data.subtotal)}</td>
        </tr>
        ${data.taxesHtml}
        <tr style="border-top: 1px solid rgba(214, 175, 55, 0.2); font-size: 15px; font-weight: bold;">
          <td style="padding: 12px 0; color: #D4AF37;">Total TTC estimé :</td>
          <td style="padding: 12px 0; text-align: right; color: #D4AF37; font-family: monospace;">${escapeHtml(data.total)}</td>
        </tr>
      </table>
    </div>

    <h3 style="font-family: serif; font-size: 18px; color: #FDFBF7; margin-top: 30px;">Vos prochaines étapes pour le démarrage :</h3>
    <ol style="color: #CCCCCC; font-size: 13px; padding-left: 20px; line-height: 1.8;">
      <li style="margin-bottom: 10px;"><strong>Signer le mandat de représentation</strong> : Connectez-vous à votre portail sécurisé pour apposer votre signature numérique légale.</li>
      <li style="margin-bottom: 10px;"><strong>Téléverser vos pièces justificatives</strong> : Déposez vos relevés bancaires et factures dans votre coffre-fort chiffré.</li>
      <li style="margin-bottom: 10px;"><strong>Appel de cadrage</strong> : Planifiez votre appel de bienvenue avec votre comptable attitrée, <strong>${escapeHtml(data.agentName)}</strong>.</li>
    </ol>
    
    <p style="color: #88888F; font-size: 12px; font-style: italic; margin-top: 30px; border-left: 2px solid #D4AF37; padding-left: 10px;">Le devis officiel au format PDF est joint à ce courriel.</p>
  `;

  return getPremiumEmailWrapper({
    title: "Confirmation de votre estimation premium - Compta-Flow",
    subtitle: `Bonjour ${escapeHtml(data.clientName)},`,
    bodyHtml: bodyHtmlFr,
    buttonLabel: "Accéder à mon Espace Client",
    buttonUrl: data.portalUrl,
    lang: data.lang
  });
}

/**
 * 2. Courriel à l'Agent (Notification de nouveau dossier client assigné)
 */
export function getAgentEmailTemplate(data: QuoteData): string {
  const bodyHtml = `
    <p style="color: #CCCCCC; font-size: 14px;">Un nouveau client vient de finaliser sa simulation de services et a été rattaché à votre portefeuille comptable.</p>
    
    <div style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); padding: 25px; border-radius: 16px; margin: 30px 0;">
      <h3 style="color: #D4AF37; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 8px;">Fiche Client</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #FDFBF7;">
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Nom complet / Cie :</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">${escapeHtml(data.clientName)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Courriel de contact :</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;"><a href="mailto:${escapeHtml(data.clientEmail)}" style="color: #D4AF37; text-decoration: none;">${escapeHtml(data.clientEmail)}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Service souscrit :</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">${escapeHtml(data.serviceName)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Tarif mensuel :</td>
          <td style="padding: 8px 0; text-align: right; color: #D4AF37; font-family: monospace; font-weight: bold;">${escapeHtml(data.total)}</td>
        </tr>
      </table>
    </div>

    <h3 style="font-family: serif; font-size: 16px; color: #FDFBF7; margin-top: 30px;">Actions requises :</h3>
    <ul style="color: #CCCCCC; font-size: 13px; padding-left: 20px; line-height: 1.8;">
      <li>Valider la conformité des taxes régionales du client (${escapeHtml(data.province)}).</li>
      <li>Suivre le téléversement des livrables et la signature du mandat sur votre portail.</li>
      <li>Préparer l'entretien d'accueil et le plan comptable adapté.</li>
    </ul>
  `;

  return getPremiumEmailWrapper({
    title: "[Compta-Flow] Nouveau dossier assigné",
    subtitle: `Bonjour ${escapeHtml(data.agentName)},`,
    bodyHtml,
    buttonLabel: "Ouvrir mon Portail Agent",
    buttonUrl: data.portalUrl,
    lang: data.lang
  });
}

/**
 * 3. Courriel à l'Admin (Rapport de supervision transactionnelle)
 */
export function getAdminEmailTemplate(data: QuoteData): string {
  const bodyHtml = `
    <p style="color: #CCCCCC; font-size: 14px;">Le système a scellé une nouvelle estimation financière et affecté le dossier associé avec isolation stricte.</p>
    
    <div style="background-color: rgba(214, 175, 55, 0.02); border: 1px solid rgba(214, 175, 55, 0.1); padding: 25px; border-radius: 16px; margin: 30px 0;">
      <h3 style="color: #D4AF37; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid rgba(214, 175, 55, 0.05); padding-bottom: 8px;">Détails d'Audit</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #FDFBF7;">
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Client :</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">${escapeHtml(data.clientName)} (${escapeHtml(data.clientEmail)})</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Agent assigné :</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">${escapeHtml(data.agentName)} (${escapeHtml(data.agentEmail)})</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Région fiscale :</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">${escapeHtml(data.province)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Détail financier :</td>
          <td style="padding: 8px 0; text-align: right; font-family: monospace;">Sub: ${escapeHtml(data.subtotal)} / Net: ${escapeHtml(data.total)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Réf Devis :</td>
          <td style="padding: 8px 0; text-align: right; font-family: monospace;">${escapeHtml(data.quoteRef)}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: rgba(0, 150, 255, 0.02); border: 1px solid rgba(0, 150, 255, 0.1); padding: 15px; border-radius: 12px; font-size: 12px; color: #A0C0E0; margin-bottom: 30px;">
      ℹ <strong>Hardening de Sécurité :</strong> La politique d'isolation RLS a été vérifiée automatiquement sur ce dossier. L'accès aux documents et écritures comptables est strictement restreint à l'agent assigné (${escapeHtml(data.agentName)}) et supervisé par le propriétaire principal.
    </div>
  `;

  return getPremiumEmailWrapper({
    title: "[Rapport Financier] Nouvelle Transaction de Services",
    subtitle: "Bonjour Samuel,",
    bodyHtml,
    buttonLabel: "Ouvrir le Panneau Propriétaire",
    buttonUrl: data.portalUrl,
    lang: data.lang
  });
}

/**
 * 4. Courriel de confirmation d'activation de compte
 */
export function getAccountConfirmedEmailTemplate(data: { clientName: string; clientEmail: string; portalUrl: string }): string {
  const bodyHtml = `
    <div style="text-align: center;">
      <div style="display: inline-block; background-color: rgba(46, 213, 115, 0.08); border: 1px solid rgba(46, 213, 115, 0.3); padding: 6px 20px; border-radius: 50px; font-size: 10px; font-weight: bold; color: #2ed573; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 25px;">
        ✦ Courriel Confirmé ✦
      </div>
    </div>
    <p style="color: #CCCCCC; font-size: 14px; text-align: center; max-width: 480px; margin: 0 auto 20px auto; font-weight: 300;">
      Félicitations ! Votre adresse courriel (<strong>${escapeHtml(data.clientEmail)}</strong>) a été validée avec succès. Votre espace sécurisé Compta-Flow is maintenant pleinement actif et prêt pour la prise en charge de vos besoins comptables.
    </p>

    <p style="color: #88888F; font-size: 13px; text-align: center; max-width: 450px; margin: 0 auto 30px auto;">
      Vous pouvez à tout moment vous connecter pour configurer vos besoins de tenue de livres, impôts ou états financiers.
    </p>
  `;

  return getPremiumEmailWrapper({
    title: "Votre compte Compta-Flow est activé !",
    subtitle: `Bonjour ${escapeHtml(data.clientName)},`,
    bodyHtml,
    buttonLabel: "Accéder à mon Portail",
    buttonUrl: data.portalUrl
  });
}

/**
 * 5. Courriel de bienvenue lors de la fin de l'onboarding client
 */
export function getOnboardingCompleteEmailTemplate(data: {
  clientName: string;
  lang: 'fr' | 'en' | 'ar';
  portalUrl: string;
  procedureUrl: string;
}): string {
  const isAr = data.lang === 'ar';
  const isEn = data.lang === 'en';
  
  let subtitle = '';
  let bodyHtml = '';
  let buttonLabel = '';
  
  if (isAr) {
    subtitle = `مرحباً ${escapeHtml(data.clientName)}،`;
    bodyHtml = `
      <p style="color: #CCCCCC; font-size: 14px;">تم تفعيل حسابكم بنجاح واكتمال عملية التسجيل الإرشادية.</p>
      <p style="color: #CCCCCC; font-size: 14px;"><strong>الخطوة التالية:</strong> يرجى اختيار الخدمة المطلوبة من جدول أعمالكم ومتابعة <a href="${data.procedureUrl}" style="color: #D4AF37; text-decoration: none;">مسار ملفكم الاستشاري</a>.</p>
    `;
    buttonLabel = "فتح بوابتي الخاصة";
  } else if (isEn) {
    subtitle = `Hello ${escapeHtml(data.clientName)},`;
    bodyHtml = `
      <p style="color: #CCCCCC; font-size: 14px;">Your client onboarding is now complete and your account is active.</p>
      <p style="color: #CCCCCC; font-size: 14px;"><strong>Next step:</strong> please select your desired accounting plan in the Overview tab, then follow your <a href="${data.procedureUrl}" style="color: #D4AF37; text-decoration: none;">guided file path</a>.</p>
    `;
    buttonLabel = "Open My Client Portal";
  } else {
    subtitle = `Bonjour ${escapeHtml(data.clientName)},`;
    bodyHtml = `
      <p style="color: #CCCCCC; font-size: 14px;">Votre parcours d'intégration client est complété avec succès et votre compte est pleinement actif.</p>
      <p style="color: #CCCCCC; font-size: 14px;"><strong>Prochaine étape :</strong> veuillez sélectionner le service comptable souhaité dans votre tableau de bord, puis suivez votre <a href="${data.procedureUrl}" style="color: #D4AF37; text-decoration: none;">parcours dossier guidé</a>.</p>
    `;
    buttonLabel = "Accéder à mon Espace Client";
  }

  return getPremiumEmailWrapper({
    title: isAr 
      ? "مرحباً بكم في ComptaFlow — الخطوات التالية" 
      : isEn 
        ? "Welcome to ComptaFlow — your next steps" 
        : "Bienvenue chez ComptaFlow — vos prochaines étapes",
    subtitle,
    bodyHtml,
    buttonLabel,
    buttonUrl: data.portalUrl,
    lang: data.lang,
  });
}

/**
 * 6. Courriel de bienvenue collaborateur (Création de compte Agent)
 */
export function getAgentWelcomeEmailTemplate(data: {
  agentName: string;
  agentEmail: string;
  portalUrl: string;
  tempPassword?: string;
}): string {
  const bodyHtml = `
    <p style="color: #CCCCCC; font-size: 14px;">Félicitations ! Un accès collaborateur a été créé pour vous au sein du réseau Compta-Flow.</p>
    <div style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); padding: 25px; border-radius: 16px; margin: 30px 0;">
      <h3 style="color: #D4AF37; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 8px;">Vos identifiants d'accès</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #FDFBF7;">
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Identifiant :</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">${escapeHtml(data.agentEmail)}</td>
        </tr>
        ${data.tempPassword ? `
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Mot de passe temporaire :</td>
          <td style="padding: 8px 0; text-align: right; font-family: monospace; font-weight: bold; color: #D4AF37;">${escapeHtml(data.tempPassword)}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Rôle système :</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #D4AF37;">Collaborateur / Agent Comptable</td>
        </tr>
      </table>
    </div>
    <p style="color: #88888F; font-size: 13px;">Lors de votre première connexion, nous vous conseillons de réinitialiser votre mot de passe depuis les paramètres de votre profil.</p>
  `;

  return getPremiumEmailWrapper({
    title: "[Compta-Flow] Création de votre accès collaborateur",
    subtitle: `Bonjour ${escapeHtml(data.agentName)},`,
    bodyHtml,
    buttonLabel: "Accéder au Portail Collaborateur",
    buttonUrl: data.portalUrl,
  });
}

/**
 * 7. Courriel de notification d'alerte de flux financier (Admin)
 */
export function getTransactionAlertEmailTemplate(data: {
  transactionId: string;
  amount: string;
  vendor: string;
  date: string;
  type: string;
}): string {
  const bodyHtml = `
    <p style="color: #CCCCCC; font-size: 14px;">Une alerte de flux financier en temps réel a été déclenchée pour surveillance.</p>
    <div style="background-color: rgba(214, 175, 55, 0.02); border: 1px solid rgba(214, 175, 55, 0.1); padding: 25px; border-radius: 16px; margin: 30px 0;">
      <h3 style="color: #D4AF37; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid rgba(214, 175, 55, 0.05); padding-bottom: 8px;">Détails du Flux</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #FDFBF7;">
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Fournisseur / Tiers :</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">${escapeHtml(data.vendor)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Montant brut :</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #D4AF37; font-family: monospace;">${escapeHtml(data.amount)} $</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Date de l'opération :</td>
          <td style="padding: 8px 0; text-align: right;">${escapeHtml(data.date)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Type / Canal :</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">${escapeHtml(data.type)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Identifiant Transaction :</td>
          <td style="padding: 8px 0; text-align: right; font-family: monospace; font-size: 11px;">${escapeHtml(data.transactionId)}</td>
        </tr>
      </table>
    </div>
  `;

  return getPremiumEmailWrapper({
    title: `[Alerte Flux] Opération de tenue : ${escapeHtml(data.vendor)}`,
    subtitle: "Rapport de Contrôle Financier",
    bodyHtml,
    buttonLabel: "Superviser sur le Portail Admin",
    buttonUrl: "https://compta-flow.net/login"
  });
}

/**
 * 8. Courriel de suivi d'assistance ou ticket
 */
export function getSupportResponseEmailTemplate(data: {
  clientName: string;
  question: string;
  aiResponse: string;
  portalUrl: string;
}): string {
  const bodyHtml = `
    <p style="color: #CCCCCC; font-size: 14px;">Votre conseiller virtuel Compta-Flow a traité votre demande d'assistance.</p>
    <div style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px; margin: 20px 0;">
      <p style="color: #88888F; font-size: 12px; margin-top:0;"><strong>Votre question :</strong></p>
      <p style="color: #FDFBF7; font-size: 13px; font-style: italic; margin-bottom:0;">"${escapeHtml(data.question)}"</p>
    </div>
    <div style="background-color: rgba(214, 175, 55, 0.03); border-left: 3px solid #D4AF37; padding: 20px; border-radius: 4px; margin: 20px 0;">
      <p style="color: #D4AF37; font-size: 12px; margin-top:0; font-weight: bold;">Réponse de l'assistant d'élite :</p>
      <p style="color: #CCCCCC; font-size: 13px; line-height:1.7; margin-bottom:0;">${escapeHtml(data.aiResponse).replace(/\n/g, '<br>')}</p>
    </div>
    <p style="color: #88888F; font-size: 13px;">Si vous avez besoin de précisions ou de déposer des documents d'analyse, vous pouvez poursuivre la conversation depuis votre espace client.</p>
  `;

  return getPremiumEmailWrapper({
    title: "[Compta-Flow] Suivi de votre demande de support",
    subtitle: `Bonjour ${escapeHtml(data.clientName)},`,
    bodyHtml,
    buttonLabel: "Ouvrir l'Espace Support en ligne",
    buttonUrl: data.portalUrl
  });
}
