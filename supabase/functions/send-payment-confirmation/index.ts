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
      .select('*, client:profiles!client_id(full_name, email), sub_admin:profiles!sub_admin_id(full_name, email)')
      .eq('id', invoiceId)
      .single()

    if (invError || !invoice) {
      throw invError || new Error('Invoice not found')
    }

    const clientEmail = invoice.client?.email
    const clientName = invoice.client?.full_name || 'Client'
    const subAdminName = invoice.sub_admin?.full_name || 'Votre CPA'
    const amount = parseFloat(invoice.montant_total).toFixed(2)
    const number = invoice.numero
    const ref = invoice.interac_reference || 'Dépôt direct'
    
    const emailBody = `
      <h2>Paiement Interac Confirmé - ComptaFlow</h2>
      <p>Bonjour ${clientName},</p>
      <p>Votre comptable partenaire, <strong>${subAdminName}</strong>, a confirmé la réception du virement Interac pour la facture <strong>${number}</strong>.</p>
      <p>Le statut de la facture a été mis à jour à <strong>Payée (Acquittée)</strong>.</p>
      
      <ul>
        <li><strong>Numéro de facture :</strong> ${number}</li>
        <li><strong>Montant reçu :</strong> ${amount} $ CAD</li>
        <li><strong>Référence de transaction :</strong> ${ref}</li>
        <li><strong>Date de paiement :</strong> ${invoice.date_paiement ? new Date(invoice.date_paiement).toLocaleString('fr-CA') : new Date().toLocaleString('fr-CA')}</li>
      </ul>
      
      <p>Merci pour votre ponctualité,<br/>L'équipe ComptaFlow</p>
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
          subject: `Paiement Interac Confirmé - Facture ${number}`,
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
