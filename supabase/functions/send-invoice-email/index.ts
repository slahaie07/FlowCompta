import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { invoiceId } = await req.json()

    const { data: invoice, error: invError } = await supabaseClient
      .from('invoices')
      .select('*, client:profiles!client_id(full_name, email), sub_admin:profiles!sub_admin_id(full_name, email, interac_email, interac_question, interac_autodepot)')
      .eq('id', invoiceId)
      .single()

    if (invError || !invoice) throw invError || new Error('Facture introuvable')

    const clientEmail = invoice.client?.email
    const clientName = invoice.client?.full_name || 'Client'
    const subAdminName = invoice.sub_admin?.full_name || 'Votre CPA'
    const interacEmail = invoice.sub_admin?.interac_email || invoice.sub_admin?.email
    const montantHt = parseFloat(invoice.montant_ht).toFixed(2)
    const tps = parseFloat(invoice.tps).toFixed(2)
    const tvq = parseFloat(invoice.tvq).toFixed(2)
    const total = parseFloat(invoice.montant_total).toFixed(2)
    const number = invoice.numero
    const dateEmission = new Date(invoice.date_emission).toLocaleDateString('fr-CA')
    const dateEcheance = invoice.date_echeance ? new Date(invoice.date_echeance).toLocaleDateString('fr-CA') : '—'

    const interacQuestion = !invoice.sub_admin?.interac_autodepot && invoice.sub_admin?.interac_question
      ? `<tr><td style="padding:6px 0;color:#888;font-size:12px;">Question de sécurité</td><td style="padding:6px 0;color:#111;font-size:12px;font-weight:bold;">${invoice.sub_admin.interac_question}</td></tr>`
      : ''

    const emailHtml = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f1ea;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.08);">
    <div style="background:#0a0a0a;padding:32px 40px;text-align:center;">
      <div style="font-family:Georgia,serif;font-size:28px;color:#C6A15B;letter-spacing:4px;">ComptaFlow</div>
      <div style="font-size:9px;letter-spacing:4px;color:#666;margin-top:4px;text-transform:uppercase;">Plateforme Comptable Certifiée Québec</div>
    </div>
    <div style="padding:40px;">
      <h2 style="font-family:Georgia,serif;color:#111;margin:0 0 8px;">Nouvelle Facture</h2>
      <p style="color:#666;font-size:14px;margin:0 0 32px;">Bonjour <strong>${clientName}</strong>, votre comptable <strong>${subAdminName}</strong> vous a émis la facture suivante.</p>

      <div style="background:#faf7f0;border:1px solid #C6A15B33;border-radius:12px;padding:24px;margin-bottom:32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:6px 0;color:#888;font-size:12px;">Numéro de facture</td><td style="padding:6px 0;color:#C6A15B;font-size:14px;font-weight:bold;font-family:monospace;text-align:right;">${number}</td></tr>
          <tr><td style="padding:6px 0;color:#888;font-size:12px;">Date d'émission</td><td style="padding:6px 0;color:#111;font-size:12px;text-align:right;">${dateEmission}</td></tr>
          <tr><td style="padding:6px 0;color:#888;font-size:12px;">Date d'échéance</td><td style="padding:6px 0;color:#111;font-size:12px;text-align:right;">${dateEcheance}</td></tr>
          <tr><td colspan="2" style="border-top:1px solid #eee;padding-top:12px;"></td></tr>
          <tr><td style="padding:4px 0;color:#888;font-size:12px;">Sous-total HT</td><td style="padding:4px 0;color:#111;font-size:12px;text-align:right;">${montantHt} $</td></tr>
          <tr><td style="padding:4px 0;color:#888;font-size:12px;">TPS (5%)</td><td style="padding:4px 0;color:#111;font-size:12px;text-align:right;">${tps} $</td></tr>
          <tr><td style="padding:4px 0;color:#888;font-size:12px;">TVQ (9.975%)</td><td style="padding:4px 0;color:#111;font-size:12px;text-align:right;">${tvq} $</td></tr>
          <tr><td colspan="2" style="border-top:2px solid #C6A15B;padding-top:12px;"></td></tr>
          <tr><td style="color:#C6A15B;font-size:16px;font-weight:bold;font-family:Georgia,serif;">Total TTC</td><td style="color:#C6A15B;font-size:20px;font-weight:bold;font-family:Georgia,serif;text-align:right;">${total} $ CAD</td></tr>
        </table>
      </div>

      <div style="background:#0a0a0a;border-radius:12px;padding:24px;margin-bottom:32px;">
        <div style="color:#C6A15B;font-size:11px;letter-spacing:3px;font-weight:bold;text-transform:uppercase;margin-bottom:16px;">Instructions de Paiement — Virement Interac</div>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:6px 0;color:#888;font-size:12px;">Destinataire</td><td style="padding:6px 0;color:#e5e5e5;font-size:12px;font-weight:bold;">${subAdminName}</td></tr>
          <tr><td style="padding:6px 0;color:#888;font-size:12px;">Adresse de virement</td><td style="padding:6px 0;color:#C6A15B;font-size:14px;font-weight:bold;font-family:monospace;">${interacEmail}</td></tr>
          <tr><td style="padding:6px 0;color:#888;font-size:12px;">Montant exact</td><td style="padding:6px 0;color:#C6A15B;font-size:16px;font-weight:bold;font-family:Georgia,serif;">${total} $ CAD</td></tr>
          <tr><td style="padding:6px 0;color:#888;font-size:12px;">Dépôt automatique</td><td style="padding:6px 0;color:#e5e5e5;font-size:12px;">${invoice.sub_admin?.interac_autodepot ? '✓ Oui (aucune question requise)' : '✗ Non'}</td></tr>
          ${interacQuestion}
        </table>
      </div>

      <p style="color:#666;font-size:12px;line-height:1.6;">Une fois le virement envoyé, connectez-vous à votre portail ComptaFlow et cliquez sur <strong>« J'ai envoyé le virement »</strong> pour notifier votre comptable.</p>
    </div>
    <div style="padding:24px 40px;background:#faf7f0;text-align:center;">
      <p style="color:#aaa;font-size:11px;margin:0;">ComptaFlow · compta-flow.net · TPS/TVQ conformes Revenu Québec</p>
    </div>
  </div>
</body>
</html>`

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (resendApiKey && clientEmail) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
        body: JSON.stringify({
          from: 'ComptaFlow <noreply@compta-flow.net>',
          to: [clientEmail],
          subject: `Facture ${number} — ${total} $ à payer par Interac`,
          html: emailHtml
        })
      })
      if (!res.ok) throw new Error(await res.text())
    } else {
      console.warn("RESEND_API_KEY non configurée — courriel non envoyé.")
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
    })
  }
})
