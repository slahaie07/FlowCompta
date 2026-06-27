import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Documents requis par service (FR)
const SERVICE_DOCS: Record<string, { name: string; docs: { label: string; required: boolean }[] }> = {
  hourlyBookkeeping: {
    name: 'Tenue de livres à l\'heure',
    docs: [
      { label: 'Relevés bancaires (3 derniers mois)', required: true },
      { label: 'Reçus et factures d\'achats', required: true },
      { label: 'Grand livre précédent', required: false },
    ],
  },
  monthlyMicro: {
    name: 'Forfait mensuel — Micro-entreprise',
    docs: [
      { label: 'Relevés bancaires', required: true },
      { label: 'Factures de ventes', required: true },
      { label: 'Reçus de dépenses', required: true },
    ],
  },
  monthlySmall: {
    name: 'Forfait mensuel — Petite entreprise',
    docs: [
      { label: 'Relevés bancaires', required: true },
      { label: 'Factures de ventes', required: true },
      { label: 'Reçus de dépenses', required: true },
      { label: 'Relevés de carte de crédit', required: true },
    ],
  },
  monthlySme: {
    name: 'Forfait mensuel — PME',
    docs: [
      { label: 'Relevés bancaires', required: true },
      { label: 'Factures de ventes', required: true },
      { label: 'Reçus de dépenses', required: true },
      { label: 'Relevés de carte de crédit', required: true },
      { label: 'Registres de paie', required: true },
    ],
  },
  gstQst: {
    name: 'Déclaration TPS/TVQ',
    docs: [
      { label: 'Relevés bancaires', required: true },
      { label: 'Factures de ventes', required: true },
      { label: 'Reçus de dépenses admissibles', required: true },
    ],
  },
  payroll: {
    name: 'Gestion de la paie',
    docs: [
      { label: 'Liste des employés avec salaires', required: true },
      { label: 'Talons de paie précédents', required: true },
    ],
  },
  t4Releve1: {
    name: 'Feuillets T4 / Relevé 1',
    docs: [
      { label: 'Liste des employés et rémunérations annuelles', required: true },
      { label: 'Relevés de paie de l\'année', required: true },
    ],
  },
  catchUp: {
    name: 'Mise à jour comptable (Catch-Up)',
    docs: [
      { label: 'Relevés bancaires (toute la période)', required: true },
      { label: 'Reçus et factures', required: true },
      { label: 'Grand livre existant (si disponible)', required: false },
    ],
  },
  softwareSetup: {
    name: 'Configuration logicielle',
    docs: [
      { label: 'Accès au logiciel comptable (identifiants)', required: true },
    ],
  },
  taxHelpAutonomous: {
    name: 'Aide à la déclaration de revenus (Travailleur autonome)',
    docs: [
      { label: 'Feuillets T4 / T4A reçus', required: true },
      { label: 'Reçus de dépenses d\'affaires', required: true },
      { label: 'Avis de cotisation de l\'année précédente', required: false },
    ],
  },
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { serviceId, clientId, serviceType } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Récupérer les infos du client
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, display_name, email')
      .eq('id', clientId)
      .single()

    // Récupérer l'email depuis auth.users si absent du profil
    let clientEmail = profile?.email
    let clientName = profile?.display_name || profile?.full_name || 'Client'

    if (!clientEmail) {
      const { data: authUser } = await supabase.auth.admin.getUserById(clientId)
      clientEmail = authUser?.user?.email
      if (!clientName || clientName === 'Client') {
        clientName = authUser?.user?.user_metadata?.full_name || 'Client'
      }
    }

    if (!clientEmail) {
      console.warn('Client email introuvable pour', clientId)
      return new Response(JSON.stringify({ ok: false, error: 'email introuvable' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const serviceInfo = SERVICE_DOCS[serviceType] ?? {
      name: serviceType ?? 'Service ComptaFlow',
      docs: [{ label: 'Documents requis selon votre service', required: true }],
    }

    const docsListHtml = serviceInfo.docs
      .map(d => `
        <li style="padding: 8px 0; border-bottom: 1px solid #1a1a1a; display: flex; align-items: center; gap: 10px;">
          <span style="color: ${d.required ? '#C6A15B' : '#666'}; font-weight: bold;">${d.required ? '★' : '◇'}</span>
          <span>${d.label}${d.required ? '' : ' <span style="color:#555; font-size:11px;">(optionnel)</span>'}</span>
        </li>`)
      .join('')

    const portalUrl = 'https://compta-flow.net/portal'

    const emailBody = `
<!DOCTYPE html>
<html lang="fr">
<body style="font-family: Arial, sans-serif; background: #0a0a0a; color: #e5e5e5; padding: 40px; margin: 0;">
  <div style="max-width: 600px; margin: auto; background: #111; border: 1px solid #C6A15B33; border-radius: 16px; overflow: hidden;">

    <div style="background: linear-gradient(135deg, #C6A15B22, #0a0a0a); padding: 40px; border-bottom: 1px solid #C6A15B22;">
      <h1 style="color: #C6A15B; font-family: Georgia, serif; margin: 0 0 8px; font-size: 24px;">Compta<span style="color:#fff">Flow</span></h1>
      <p style="color: #888; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0;">Cabinet Comptable Certifié — Québec</p>
    </div>

    <div style="padding: 40px;">
      <h2 style="color: #fff; font-family: Georgia, serif; font-style: italic; font-size: 22px; margin: 0 0 16px;">
        🔐 Votre dossier est prêt, ${clientName}.
      </h2>
      <p style="color: #aaa; line-height: 1.7;">
        Votre service <strong style="color: #C6A15B;">${serviceInfo.name}</strong> a été ouvert dans notre système.
        Pour que nous puissions débuter le traitement, vous devez compléter <strong style="color: #fff;">deux actions</strong> dans votre portail :
      </p>

      <!-- Étape 1 -->
      <div style="background: #0a0a0a; border: 1px solid #C6A15B22; border-left: 3px solid #C6A15B; border-radius: 12px; padding: 24px; margin: 28px 0 16px;">
        <h3 style="color: #C6A15B; margin: 0 0 8px; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">Étape 1 — Signer le mandat professionnel</h3>
        <p style="color: #999; margin: 0; font-size: 14px; line-height: 1.6;">
          Connectez-vous à votre portail et cliquez sur <strong style="color: #fff;">"Signer le Mandat"</strong> dans le menu latéral.
          Ce document officialise notre engagement professionnel et est obligatoire pour débuter.
        </p>
      </div>

      <!-- Étape 2 -->
      <div style="background: #0a0a0a; border: 1px solid #C6A15B22; border-left: 3px solid #C6A15B; border-radius: 12px; padding: 24px; margin: 16px 0;">
        <h3 style="color: #C6A15B; margin: 0 0 16px; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">Étape 2 — Déposer vos documents dans le Vault</h3>
        <p style="color: #999; margin: 0 0 16px; font-size: 14px;">Documents requis pour le service <strong style="color: #C6A15B;">${serviceInfo.name}</strong> :</p>
        <ul style="list-style: none; margin: 0; padding: 0; color: #ccc; font-size: 14px;">
          ${docsListHtml}
        </ul>
        <p style="color: #666; font-size: 11px; margin: 16px 0 0;">
          ★ = obligatoire &nbsp;|&nbsp; ◇ = optionnel mais recommandé
        </p>
      </div>

      <div style="text-align: center; margin: 36px 0;">
        <a href="${portalUrl}" style="display: inline-block; background: #C6A15B; color: #000; font-weight: bold; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; padding: 16px 40px; border-radius: 50px;">
          Accéder à mon portail →
        </a>
      </div>

      <p style="color: #555; font-size: 13px; line-height: 1.6; border-top: 1px solid #1a1a1a; padding-top: 24px; margin-top: 24px;">
        Des questions ? Répondez directement à ce courriel ou écrivez-nous à
        <a href="mailto:compta-flow@outlook.com" style="color: #C6A15B;">compta-flow@outlook.com</a>.
        Nous vous répondons sous 24 h ouvrables.
      </p>
    </div>

    <div style="background: #C6A15B; padding: 16px 40px; text-align: center;">
      <p style="color: #000; font-size: 10px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase; margin: 0;">
        🔒 Sécurisé par le Protocole ComptaFlow Souverain
      </p>
    </div>
  </div>
</body>
</html>`

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY non configurée')
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendApiKey}` },
      body: JSON.stringify({
        from: 'ComptaFlow <noreply@compta-flow.net>',
        to: [clientEmail],
        reply_to: 'compta-flow@outlook.com',
        subject: `🔐 Action requise — Votre dossier ${serviceInfo.name} est prêt`,
        html: emailBody,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Resend error:', err)
      return new Response(JSON.stringify({ ok: false, error: err }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Email d'onboarding envoyé à ${clientEmail} pour le service ${serviceType}`)
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('send-service-onboarding-email error:', err)
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
