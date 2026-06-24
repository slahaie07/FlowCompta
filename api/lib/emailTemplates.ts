/**
 * 🏆 MOTEUR DE TEMPLATES D'EMAIL PREMIUM COMPTA-FLOW (STYLE CANVA GOLD & BLACK)
 * Modèles HTML conformes à la charte graphique luxueuse du cabinet.
 */

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
 * 1. Courriel au Client (Confirmation, Bienvenue & Prochaines Étapes)
 */
export function getClientEmailTemplate(data: QuoteData): string {
  const isAr = data.lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const textAlign = isAr ? 'right' : 'left';

  if (isAr) {
    return `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>تأكيد تقدير الرسوم - Compta-Flow</title>
        <style>
          body { ${COMMON_CSS} }
        </style>
      </head>
      <body>
        <div style="${CONTAINER_STYLE} direction: rtl; text-align: right;">
          <div style="${HEADER_STYLE}">
            <div style="font-size: 32px; font-family: serif; color: #D4AF37; font-style: italic; font-weight: bold; letter-spacing: 1px;">Compta-Flow</div>
            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #88888F; margin-top: 6px;">مكتب المحاسبة السيادي المتميز</div>
          </div>
          
          <div style="${CONTENT_STYLE}">
            <h2 style="font-family: serif; font-size: 24px; color: #FDFBF7; font-style: italic; margin-bottom: 20px;">مرحباً ${data.clientName}،</h2>
            <p style="color: #CCCCCC; font-size: 14px;">يسعدنا جداً ويشرفنا مرافقتكم في إدارة حساباتكم وتنظيم هيكلكم المالي. تم حفظ محاكاة الأسعار الخاصة بكم بنجاح.</p>
            
            <div style="background-color: rgba(214, 175, 55, 0.04); border: 1px solid rgba(214, 175, 55, 0.15); padding: 25px; border-radius: 16px; margin: 30px 0;">
              <h3 style="color: #D4AF37; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid rgba(214, 175, 55, 0.1); padding-bottom: 8px;">تفاصيل تقدير السعر (${data.quoteRef})</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #FDFBF7;">
                <tr>
                  <td style="padding: 8px 0; color: #88888F;">الخدمة المحددة:</td>
                  <td style="padding: 8px 0; text-align: left; font-weight: bold;">${data.serviceName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #88888F;">المقاطعة الضريبية:</td>
                  <td style="padding: 8px 0; text-align: left; font-weight: bold;">${data.province}</td>
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
              <li style="margin-bottom: 10px;"><strong>مكالمة انطلاق الخدمة</strong>: احجز لقاءك الترحيبي مع محاسبتك المعتمدة <strong>إيليا (${data.agentName})</strong> لتأكيد مسار ملفك.</li>
            </ol>

            <div style="text-align: center;">
              <a href="${data.portalUrl}" style="${BUTTON_STYLE}">دخول بوابة العملاء</a>
            </div>
            
            <p style="color: #88888F; font-size: 12px; font-style: italic; margin-top: 30px; border-right: 2px solid #D4AF37; padding-right: 10px;">لقد أرفقنا تقدير الرسوم الرسمي بصيغة PDF في هذا البريد الإلكتروني للرجوع إليه في أي وقت.</p>
          </div>
          
          <div style="${FOOTER_STYLE}">
            تنبيه أمني Loi 25 · نظام كومبتا فلو المحمي والمشفر · كندا
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // French template (Default)
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Confirmation de votre estimation premium - Compta-Flow</title>
      <style>
        body { ${COMMON_CSS} }
      </style>
    </head>
    <body>
      <div style="${CONTAINER_STYLE}">
        <div style="${HEADER_STYLE}">
          <div style="font-size: 32px; font-family: serif; color: #D4AF37; font-style: italic; font-weight: bold; letter-spacing: 1px;">Compta-Flow</div>
          <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 3px; color: #88888F; margin-top: 6px;">Cabinet Comptable Souverain d'Élite</div>
        </div>
        
        <div style="${CONTENT_STYLE}">
          <h2 style="font-family: serif; font-size: 24px; color: #FDFBF7; font-style: italic; margin-bottom: 20px;">Bonjour ${data.clientName},</h2>
          <p style="color: #CCCCCC; font-size: 14px;">C'est un honneur et un privilège de vous accompagner dans la structuration et la souveraineté financière de votre entreprise. Votre simulation tarifaire a été scellée avec succès.</p>
          
          <div style="background-color: rgba(214, 175, 55, 0.04); border: 1px solid rgba(214, 175, 55, 0.15); padding: 25px; border-radius: 16px; margin: 30px 0;">
            <h3 style="color: #D4AF37; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid rgba(214, 175, 55, 0.1); padding-bottom: 8px;">Détails de l'Estimation (${data.quoteRef})</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #FDFBF7;">
              <tr>
                <td style="padding: 8px 0; color: #88888F;">Service sélectionné :</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${data.serviceName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #88888F;">Province fiscale :</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${data.province}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #88888F;">Montant brut (HT) :</td>
                <td style="padding: 8px 0; text-align: right; font-family: monospace;">${data.subtotal}</td>
              </tr>
              ${data.taxesHtml}
              <tr style="border-top: 1px solid rgba(214, 175, 55, 0.2); font-size: 15px; font-weight: bold;">
                <td style="padding: 12px 0; color: #D4AF37;">Total TTC estimé :</td>
                <td style="padding: 12px 0; text-align: right; color: #D4AF37; font-family: monospace;">${data.total}</td>
              </tr>
            </table>
          </div>

          <h3 style="font-family: serif; font-size: 18px; color: #FDFBF7; margin-top: 30px;">Vos prochaines étapes pour le démarrage :</h3>
          <ol style="color: #CCCCCC; font-size: 13px; padding-left: 20px; line-height: 1.8;">
            <li style="margin-bottom: 10px;"><strong>Signer le mandat de représentation</strong> : Connectez-vous à votre portail sécurisé pour apposer votre signature numérique légale.</li>
            <li style="margin-bottom: 10px;"><strong>Téléverser vos pièces justificatives</strong> : Déposez vos relevés bancaires et factures dans votre coffre-fort chiffré.</li>
            <li style="margin-bottom: 10px;"><strong>Appel de cadrage</strong> : Planifiez votre appel de bienvenue avec votre comptable attitrée, <strong>${data.agentName}</strong>.</li>
          </ol>

          <div style="text-align: center;">
            <a href="${data.portalUrl}" style="${BUTTON_STYLE}">Accéder à mon Espace Client</a>
          </div>
          
          <p style="color: #88888F; font-size: 12px; font-style: italic; margin-top: 30px; border-left: 2px solid #D4AF37; padding-left: 10px;">Le devis officiel au format PDF est joint à ce courriel.</p>
        </div>
        
        <div style="${FOOTER_STYLE}">
          Sécurisé Loi 25 · Cryptage AES-256 · Compta-Flow Canada
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * 2. Courriel à l'Agent (Notification de nouveau dossier client assigné)
 */
export function getAgentEmailTemplate(data: QuoteData): string {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>[Compta-Flow] Nouveau dossier assigné - ${data.clientName}</title>
      <style>
        body { ${COMMON_CSS} }
      </style>
    </head>
    <body>
      <div style="${CONTAINER_STYLE}">
        <div style="${HEADER_STYLE}">
          <div style="font-size: 26px; font-family: serif; color: #D4AF37; font-style: italic; font-weight: bold;">Nouveau Dossier Assigné</div>
          <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: #88888F; margin-top: 6px;">Notification Collaborateur</div>
        </div>
        
        <div style="${CONTENT_STYLE}">
          <h2 style="font-family: serif; font-size: 20px; color: #FDFBF7; font-style: italic; margin-bottom: 20px;">Bonjour ${data.agentName},</h2>
          <p style="color: #CCCCCC; font-size: 14px;">Un nouveau client vient de finaliser sa simulation de services et a été rattaché à votre portefeuille comptable.</p>
          
          <div style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); padding: 25px; border-radius: 16px; margin: 30px 0;">
            <h3 style="color: #D4AF37; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 8px;">Fiche Client</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #FDFBF7;">
              <tr>
                <td style="padding: 8px 0; color: #88888F;">Nom complet / Cie :</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${data.clientName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #88888F;">Courriel de contact :</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;"><a href="mailto:${data.clientEmail}" style="color: #D4AF37; text-decoration: none;">${data.clientEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #88888F;">Service souscrit :</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${data.serviceName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #88888F;">Tarif mensuel :</td>
                <td style="padding: 8px 0; text-align: right; color: #D4AF37; font-family: monospace; font-weight: bold;">${data.total}</td>
              </tr>
            </table>
          </div>

          <h3 style="font-family: serif; font-size: 16px; color: #FDFBF7; margin-top: 30px;">Actions requises :</h3>
          <ul style="color: #CCCCCC; font-size: 13px; padding-left: 20px; line-height: 1.8;">
            <li>Valider la conformité des taxes régionales du client (${data.province}).</li>
            <li>Suivre le téléversement des livrables et la signature du mandat sur votre portail.</li>
            <li>Préparer l'entretien d'accueil et le plan comptable adapté.</li>
          </ul>

          <div style="text-align: center;">
            <a href="${data.portalUrl}" style="${BUTTON_STYLE}">Ouvrir mon Portail Agent</a>
          </div>
        </div>
        
        <div style="${FOOTER_STYLE}">
          Isolation RLS Active · Compta-Flow Agent Network
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * 3. Courriel à l'Admin (Rapport de supervision transactionnelle)
 */
export function getAdminEmailTemplate(data: QuoteData): string {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>[Rapport Financier] Nouvelle Transaction de Services - ${data.clientName}</title>
      <style>
        body { ${COMMON_CSS} }
      </style>
    </head>
    <body>
      <div style="${CONTAINER_STYLE}">
        <div style="${HEADER_STYLE}">
          <div style="font-size: 26px; font-family: serif; color: #D4AF37; font-style: italic; font-weight: bold;">Supervision Transactionnelle</div>
          <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: #88888F; margin-top: 6px;">Rapport de Cadrage Principal</div>
        </div>
        
        <div style="${CONTENT_STYLE}">
          <h2 style="font-family: serif; font-size: 20px; color: #FDFBF7; font-style: italic; margin-bottom: 20px;">Bonjour Samuel,</h2>
          <p style="color: #CCCCCC; font-size: 14px;">Le système a scellé une nouvelle estimation financière et affecté le dossier associé avec isolation stricte.</p>
          
          <div style="background-color: rgba(214, 175, 55, 0.02); border: 1px solid rgba(214, 175, 55, 0.1); padding: 25px; border-radius: 16px; margin: 30px 0;">
            <h3 style="color: #D4AF37; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid rgba(214, 175, 55, 0.05); padding-bottom: 8px;">Détails d'Audit</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #FDFBF7;">
              <tr>
                <td style="padding: 8px 0; color: #88888F;">Client :</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${data.clientName} (${data.clientEmail})</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #88888F;">Agent assigné :</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${data.agentName} (${data.agentEmail})</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #88888F;">Région fiscale :</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${data.province}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #88888F;">Détail financier :</td>
                <td style="padding: 8px 0; text-align: right; font-family: monospace;">Sub: ${data.subtotal} / Net: ${data.total}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #88888F;">Réf Devis :</td>
                <td style="padding: 8px 0; text-align: right; font-family: monospace;">${data.quoteRef}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: rgba(0, 150, 255, 0.02); border: 1px solid rgba(0, 150, 255, 0.1); padding: 15px; border-radius: 12px; font-size: 12px; color: #A0C0E0; margin-bottom: 30px;">
            ℹ <strong>Hardening de Sécurité :</strong> La politique d'isolation RLS a été vérifiée automatiquement sur ce dossier. L'accès aux documents et écritures comptables est strictement restreint à l'agent assigné (${data.agentName}) et supervisé par le propriétaire principal.
          </div>

          <div style="text-align: center;">
            <a href="${data.portalUrl}" style="${BUTTON_STYLE}">Ouvrir le Panneau Propriétaire</a>
          </div>
        </div>
        
        <div style="${FOOTER_STYLE}">
          ADMIN COMPTA-FLOW · SUPERVISION DIRECTE
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * 4. Courriel de confirmation d'activation de compte
 */
export function getAccountConfirmedEmailTemplate(data: { clientName: string; clientEmail: string; portalUrl: string }): string {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Votre compte Compta-Flow est activé !</title>
      <style>
        body { ${COMMON_CSS} }
      </style>
    </head>
    <body>
      <div style="${CONTAINER_STYLE}">
        <div style="${HEADER_STYLE}">
          <div style="font-size: 32px; font-family: serif; color: #D4AF37; font-style: italic; font-weight: bold; letter-spacing: 1px;">Compta-Flow</div>
          <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 3px; color: #88888F; margin-top: 6px;">Compte Activé avec Succès</div>
        </div>
        
        <div style="${CONTENT_STYLE}; text-align: center;">
          <div style="display: inline-block; background-color: rgba(46, 213, 115, 0.08); border: 1px solid rgba(46, 213, 115, 0.3); padding: 6px 20px; border-radius: 50px; font-size: 10px; font-weight: bold; color: #2ed573; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 25px;">
            ✦ Courriel Confirmé ✦
          </div>

          <h2 style="font-family: serif; font-size: 24px; color: #FDFBF7; font-style: italic; margin-bottom: 20px;">Bonjour ${data.clientName},</h2>
          <p style="color: #CCCCCC; font-size: 14px; max-width: 480px; margin: 0 auto 20px auto; font-weight: 300;">
            Félicitations ! Votre adresse courriel (<strong>${data.clientEmail}</strong>) a été validée avec succès. Votre espace sécurisé Compta-Flow est maintenant pleinement actif et prêt pour la prise en charge de vos besoins comptables.
          </p>

          <p style="color: #88888F; font-size: 13px; max-width: 450px; margin: 0 auto 30px auto;">
            Vous pouvez à tout moment vous connecter pour configurer vos besoins de tenue de livres, impôts ou états financiers.
          </p>

          <div style="text-align: center;">
            <a href="${data.portalUrl}" style="${BUTTON_STYLE}">Accéder à mon Portail</a>
          </div>
        </div>
        
        <div style="${FOOTER_STYLE}">
          Souveraineté Numérique · Données hébergées au Canada (YUL)
        </div>
      </div>
    </body>
    </html>
  `;
}
