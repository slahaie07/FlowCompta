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
      .select('*, client:profiles!client_id(full_name, email), sub_admin:profiles!sub_admin_id(full_name, email)')
      .eq('id', invoiceId)
      .single()

    if (invError || !invoice) throw invError || new Error('Facture introuvable')

    const clientEmail = invoice.client?.email
    const clientName = invoice.client?.full_name || 'Client'
    const subAdminName = invoice.sub_admin?.full_name || 'Votre CPA'
    const total = parseFloat(invoice.montant_total).toFixed(2)
    const number = invoice.numero
    const ref = invoice.interac_reference || 'Dépôt direct'
    const datePaiement = invoice.date_paiement
      ? new Date(invoice.date_paiement).toLocaleDateString('fr-CA')
      : new Date().toLocaleDateString('fr-CA')

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
      <div style="background:#d1fae5;border:1px solid #6ee7b7;border-radius:12px;padding:20px;text-align:center;margin-bottom:32px;">
        <div style="font-size:32px;margin-bottom:8px;">✅</div>
        <div style="color:#065f46;font-size:18px;font-weight:bold;font-family:Georgia,serif;">Paiement Interac Confirmé</div>
      </div>

      <p style="color:#444;font-size:14px;margin:0 0 24px;">Bonjour <strong>${clientName}</strong>, votre comptable <strong>${subAdminName}</strong> a confirmé la réception de votre virement Interac.</p>

      <div style="background:#faf7f0;border:1px solid #C6A15B33;border-radius:12px;padding:24px;margin-bottom:32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:6px 0;color:#888;font-size:12px;">Numéro de facture</td><td style="padding:6px 0;color:#C6A15B;font-family:monospace;font-weight:bold;text-align:right;">${number}</td></tr>
          <tr><td style="padding:6px 0;color:#888;font-size:12px;">Montant reçu</td><td style="padding:6px 0;color:#C6A15B;font-size:18px;font-weight:bold;font-family:Georgia,serif;text-align:right;">${total} $ CAD</td></tr>
          <tr><td style="padding:6px 0;color:#888;font-size:12px;">Référence Interac</td><td style="padding:6px 0;color:#065f46;font-family:monospace;font-size:13px;font-weight:bold;text-align:right;">${ref}</td></tr>
          <tr><td style="padding:6px 0;color:#888;font-size:12px;">Date de paiement</td><td style="padding:6px 0;color:#111;font-size:12px;text-align:right;">${datePaiement}</td></tr>
          <tr><td style="padding:6px 0;color:#888;font-size:12px;">Statut</td><td style="padding:6px 0;text-align:right;"><span style="background:#d1fae5;color:#065f46;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:bold;">ACQUITTÉE</span></td></tr>
        </table>
      </div>

      <p style="color:#666;font-size:12px;line-height:1.6;">Conservez ce courriel à titre de reçu. Vous pouvez également télécharger votre facture acquittée depuis votre portail ComptaFlow.</p>
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
          subject: `✅ Paiement confirmé — Facture ${number} acquittée`,
          html: emailHtml
        })
      })
      if (!res.ok) throw new Error(await res.text())
    } else {
      console.warn("RESEND_API_KEY non configurée — confirmation non envoyée.")
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
