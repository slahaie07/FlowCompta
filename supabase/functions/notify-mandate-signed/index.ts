import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { clientName, clientEmail, serviceType, signedAt } = await req.json()

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY non configurée')
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const dateStr = signedAt
      ? new Date(signedAt).toLocaleString('fr-CA', { timeZone: 'America/Toronto' })
      : new Date().toLocaleString('fr-CA', { timeZone: 'America/Toronto' })

    const emailBody = `
<!DOCTYPE html>
<html lang="fr">
<body style="font-family: Arial, sans-serif; background: #0a0a0a; color: #e5e5e5; padding: 40px;">
  <div style="max-width: 560px; margin: auto; background: #111; border: 1px solid #C6A15B33; border-radius: 16px; padding: 40px;">
    <h2 style="color: #C6A15B; font-family: Georgia, serif;">✅ Mandat signé — Action client</h2>
    <p>Un client vient de signer son mandat professionnel sur <strong>compta-flow.net</strong>.</p>
    <div style="background: #0a0a0a; border: 1px solid #C6A15B22; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <p style="margin: 0 0 8px;"><strong style="color: #888;">Client :</strong> <span style="color: #C6A15B;">${clientName || 'Inconnu'}</span></p>
      <p style="margin: 0 0 8px;"><strong style="color: #888;">Courriel :</strong> <span style="font-family: monospace;">${clientEmail || 'Inconnu'}</span></p>
      ${serviceType ? `<p style="margin: 0 0 8px;"><strong style="color: #888;">Service :</strong> ${serviceType}</p>` : ''}
      <p style="margin: 0;"><strong style="color: #888;">Signé le :</strong> ${dateStr}</p>
    </div>
    <p style="color: #888;">Le dossier est maintenant actif. Connecte-toi au portail admin pour commencer le traitement.</p>
    <p style="color: #555; font-size: 12px; margin-top: 40px;">ComptaFlow — Plateforme comptable certifiée Québec</p>
  </div>
</body>
</html>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendApiKey}` },
      body: JSON.stringify({
        from: 'ComptaFlow <noreply@compta-flow.net>',
        to: ['compta-flow@outlook.com'],
        subject: `✅ Mandat signé par ${clientName || clientEmail}`,
        html: emailBody,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return new Response(JSON.stringify({ ok: false, error: err }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
