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

    // Charger les infos de la facture, du client et du sous-admin
    const { data: invoice, error: invError } = await supabaseClient
      .from('invoices')
      .select('*, client:profiles!client_id(full_name, email), sub_admin:profiles!sub_admin_id(full_name, email, interac_email, interac_question, interac_autodepot)')
      .eq('id', invoiceId)
      .single()

    if (invError || !invoice) {
      throw invError || new Error('Invoice not found')
    }

    const clientEmail = invoice.client?.email
    const clientName = invoice.client?.full_name || 'Client'
    const subAdminName = invoice.sub_admin?.full_name || 'Votre CPA'
    const interacEmail = invoice.sub_admin?.interac_email || invoice.sub_admin?.email
    const amount = parseFloat(invoice.montant_total).toFixed(2)
    const number = invoice.numero
    
    let emailBody = `
      <h2>Nouvelle Facture Émise - ComptaFlow</h2>
      <p>Bonjour ${clientName},</p>
      <p>Votre comptable partenaire, <strong>${subAdminName}</strong>, a émis la facture <strong>${number}</strong> pour un montant total de <strong>${amount} $ CAD</strong>.</p>
      
      <h3>Instructions de paiement Interac :</h3>
      <ul>
        <li><strong>Adresse de virement :</strong> ${interacEmail}</li>
        <li><strong>Montant :</strong> ${amount} $ CAD</li>
        <li><strong>Dépôt automatique :</strong> ${invoice.sub_admin?.interac_autodepot ? 'Oui' : 'Non'}</li>
    `
    
    if (!invoice.sub_admin?.interac_autodepot) {
      emailBody += `
        <li><strong>Question de sécurité :</strong> ${invoice.sub_admin?.interac_question || 'Quel cabinet?'}</li>
        <li><strong>Mot de passe :</strong> (Celui convenu avec votre comptable)</li>
      `
    }
    
    emailBody += `
      </ul>
      <p>Merci pour votre confiance,<br/>L'équipe ComptaFlow</p>
    `

    // Envoi via Resend API
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (resendApiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: 'ComptaFlow <noreply@compta-flow.net>',
          to: [clientEmail],
          subject: `Facture ${number} émise par ${subAdminName}`,
          html: emailBody
        })
      })
      
      if (!res.ok) {
        throw new Error(await res.text())
      }
    } else {
      console.warn("RESEND_API_KEY non configurée, log de l'email :");
      console.log(emailBody);
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
