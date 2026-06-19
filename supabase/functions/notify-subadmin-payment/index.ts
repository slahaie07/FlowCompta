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

    if (invError || !invoice) {
      throw invError || new Error('Facture introuvable')
    }

    const subAdminEmail = invoice.sub_admin?.email
    const subAdminName = invoice.sub_admin?.full_name || 'Comptable'
    const clientName = invoice.client?.full_name || 'Client'
    const amount = parseFloat(invoice.montant_total).toFixed(2)
    const number = invoice.numero

    const emailBody = `
      <!DOCTYPE html>
      <html lang="fr">
      <body style="font-family: Arial, sans-serif; background: #0a0a0a; color: #e5e5e5; padding: 40px;">
        <div style="max-width: 560px; margin: auto; background: #111; border: 1px solid #C6A15B33; border-radius: 16px; padding: 40px;">
          <h2 style="color: #C6A15B; font-family: Georgia, serif;">⚡ Alerte Paiement Interac</h2>
          <p>Bonjour <strong>${subAdminName}</strong>,</p>
          <p>Votre client <strong style="color: #C6A15B;">${clientName}</strong> a déclaré avoir effectué le virement Interac pour la facture <strong>${number}</strong>.</p>
          <div style="background: #0a0a0a; border: 1px solid #C6A15B22; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <p style="margin: 0 0 8px;"><strong style="color: #888;">Numéro de facture :</strong> <span style="color: #C6A15B; font-family: monospace;">${number}</span></p>
            <p style="margin: 0 0 8px;"><strong style="color: #888;">Client :</strong> ${clientName}</p>
            <p style="margin: 0;"><strong style="color: #888;">Montant déclaré :</strong> <span style="color: #C6A15B; font-size: 18px; font-family: Georgia, serif;">${amount} $ CAD</span></p>
          </div>
          <p style="color: #888;">Veuillez vérifier votre compte bancaire et confirmer la réception dans votre portail ComptaFlow pour acquitter la facture.</p>
          <p style="color: #555; font-size: 12px; margin-top: 40px;">ComptaFlow — Plateforme comptable certifiée Québec</p>
        </div>
      </body>
      </html>
    `

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (resendApiKey && subAdminEmail) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: 'ComptaFlow <noreply@compta-flow.net>',
          to: [subAdminEmail],
          subject: `⚡ Virement Interac déclaré — Facture ${number} (${amount} $)`,
          html: emailBody
        })
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }
    } else {
      console.warn("RESEND_API_KEY non configurée — notification comptable non envoyée.");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
