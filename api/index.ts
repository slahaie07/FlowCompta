import express from 'express';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import Stripe from 'stripe';
import * as paypal from '@paypal/checkout-server-sdk';
import { Resend } from 'resend';
import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai';
import crypto from 'crypto';
import dotenv from 'dotenv';
import twilio from 'twilio';
dotenv.config();

// ============================================================
// 🏛️ SAS V5.0 : SUPREME AUTONOMOUS STACK
// ============================================================

const sanitizeEnvVar = (val: string | undefined): string => {
    if (!val) return '';
    return val.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
};

const stripeKey = sanitizeEnvVar(process.env.STRIPE_SECRET_KEY) || 'sk_test_mock_stripe_key_51P';
const resendKey = sanitizeEnvVar(process.env.RESEND_API_KEY) || 're_mock_resend_key_123';
const twilioSid = sanitizeEnvVar(process.env.TWILIO_ACCOUNT_SID) || 'AC_mock_twilio_sid';
const twilioToken = sanitizeEnvVar(process.env.TWILIO_AUTH_TOKEN) || 'mock_twilio_token';
const geminiKey = sanitizeEnvVar(process.env.GOOGLE_GEMINI_API_KEY) || 'mock_gemini_api_key';

const genAI = new GoogleGenerativeAI(geminiKey);
const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const agenticModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
const resend = new Resend(resendKey);
const stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' as any });
const twilioClient = twilio(twilioSid, twilioToken);
const ADMIN_PHONE = '+18192158545';

// --- DATABASE PERSISTENCE ---
const DB_PATH = path.join(process.cwd(), 'local_db.json');
const getDb = () => { try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { return {}; } };
const saveDb = (data: any) => { try { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); } catch { /* Read-only Vercel Fallback */ } };

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ============================================================
// 🛡️ DEEP GUARD : PREDICTIVE TELEMETRY & AUTO-HEALING
// ============================================================

const botLog = (action: string, target: string, details: string) => {
    try {
        const db = getDb();
        if (!db.bot_logs) db.bot_logs = [];
        db.bot_logs.push({ id: `bot_${Date.now()}`, action_type: action, target_id: target, details, timestamp: new Date().toISOString() });
        saveDb(db);
        console.log(`[SAS V5.0][${action}] ${details}`);
    } catch (e) {}
};

const sendSupremeEmail = async (to: string, subject: string, html: string) => {
    if (!process.env.RESEND_API_KEY) return;
    await resend.emails.send({
        from: 'Comptaflow <support@comptaflow.ca>',
        to: [to],
        subject: subject,
        html: `<div style="font-family:serif;background:#050505;color:#F5F1E8;padding:50px;border:1px solid #D4AF37;">
                <h1 style="color:#D4AF37;border-bottom:1px solid #D4AF37;padding-bottom:10px;">Comptaflow ELITE</h1>
                ${html}
                <p style="margin-top:40px;font-size:10px;color:#A39E92;">SYSTÈME SUPRÊME AUTOMATISÉ — QUÉBEC</p>
               </div>`
    });
};

// ============================================================
// 🏛️ ENDPOINTS
// ============================================================

// --- PLAID BANKING API SCAFFOLDING ---
app.post('/api/plaid/create-link-token', async (req, res) => {
    botLog('PLAID_SYNC', 'Banking', 'Génération du Link Token bancaire via API Plaid.');
    res.json({ link_token: 'link-sandbox-fake-token-1234' });
});

app.post('/api/plaid/exchange-public-token', async (req, res) => {
    botLog('PLAID_AUTH', 'Banking', `Token échangé avec succès. Pont bancaire établi.`);
    res.json({ success: true, access_token: 'access-sandbox-fake', item_id: 'item-fake' });
});

// --- QUICKBOOKS ONLINE API SCAFFOLDING ---
app.post('/api/qbo/push-transaction', async (req, res) => {
    const { documentId, amount, date, vendor, taxAmount } = req.body;
    botLog('QBO_SYNC', vendor, `Synchronisation de la facture ${documentId} vers QuickBooks en cours...`);
    
    setTimeout(() => {
        botLog('QBO_SUCCESS', vendor, `Facture poussée avec succès vers le grand livre (Total: ${amount}$, Taxes: ${taxAmount}$).`);
        res.json({ success: true, qbo_id: `qbo_${Date.now()}` });
    }, 1500);
});

// --- LIVE TRANSACTION TRACKER (SMS & EMAIL) ---
app.post('/api/webhook/transaction-alert', async (req, res) => {
  const { transactionId, amount, vendor, date, type } = req.body;
  
  const summaryMsg = `COMPTAFLOW ALERT: Nouvelle transaction identifiée.\nFournisseur: ${vendor}\nMontant: ${amount}$\nDate: ${date}\nType: ${type}`;
  
  botLog('LIVE_TRACKER', transactionId, `Analyse en temps réel. Envoi du résumé au ${ADMIN_PHONE}`);

  try {
    if (process.env.TWILIO_ACCOUNT_SID) {
      await twilioClient.messages.create({
        body: summaryMsg,
        from: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
        to: ADMIN_PHONE
      });
    } else {
      console.log(`[SMS MOCK to ${ADMIN_PHONE}] \n${summaryMsg}`);
    }

    await sendSupremeEmail('s.lahaie07@gmail.com', `Alerte Transaction: ${vendor}`, `
      <h2>Nouvelle Transaction Détectée</h2>
      <p><strong>Fournisseur:</strong> ${vendor}</p>
      <p><strong>Montant:</strong> ${amount} $</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Type:</strong> ${type}</p>
    `);

    res.json({ success: true, message: "Alerte envoyée avec succès." });
  } catch (error: any) {
    botLog('LIVE_TRACKER_ERROR', transactionId, error.message);
    res.status(500).json({ error: "Erreur lors de l'envoi de l'alerte." });
  }
});

app.post('/api/ai/analyze-document', async (req, res) => {
  const { fileData, fileName, mimeType } = req.body;
  const hash = crypto.createHash('sha256').update(fileData).digest('hex');
  botLog('LEGAL_HASHING', fileName, `SHA-256 généré: ${hash.slice(0, 8)}...`);

  try {
    const prompt = `Extraire JSON Québec : type (FACTURE, T4, etc.), emetteur, date, montant_total, tps, tvq, categorie.`;
    const result = await visionModel.generateContent([prompt, { inlineData: { data: fileData, mimeType } }]);
    const analysis = JSON.parse((await result.response).text().replace(/```json|```/g, "").trim());
    
    botLog('IA_ANALYZE', fileName, `Classification: ${analysis.type} | Confiance: Élite`);
    res.json({ success: true, analysis, hash });
  } catch (error: any) {
    res.status(500).json({ error: "IA error" });
  }
});

app.post('/api/payment/create-checkout', async (req, res) => {
    const { items, method, customerEmail, reference } = req.body;
    
    if (method === 'interac') {
        botLog('PAYMENT_PENDING', reference, `Instructions Interac envoyées à ${customerEmail}`);
        await sendSupremeEmail(customerEmail, `Action : Virement Comptaflow ${reference}`, `
            <h2>Validation de votre mandat</h2>
            <p>Veuillez effectuer le virement de <strong>${items.reduce((a:any,b:any)=>a+b.price,0)+60}$</strong>.</p>
            <p>Destinataire: <strong>s.lahaie07@gmail.com</strong><br>Référence: <strong>${reference}</strong></p>
        `);
        return res.json({ success: true, manual: true, reference });
    }
});

// --- STRIPE DIRECT DEBIT (PAD / Automated Billing) ---
app.post('/api/payment/setup-direct-debit', async (req, res) => {
  const { userId, email } = req.body;
  try {
    const customer = await stripe.customers.create({ email, metadata: { userId } });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['acss_debit'],
      mode: 'setup',
      customer: customer.id,
      success_url: `${req.headers.origin}/success?setup_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/dashboard/pricing`,
      payment_method_options: {
        acss_debit: {
          mandate_options: {
            payment_schedule: 'interval',
            interval_description: 'Monthly service fees for ComptaFlow Elite.'
          }
        }
      }
    });
    res.json({ url: session.url });
  } catch (error: any) {
    botLog('STRIPE_ERROR', 'System', error.message);
    res.status(500).json({ error: error.message });
  }
});

// --- ELITE FINANCIAL INTELLIGENCE ---
app.post('/api/intelligence/analyze', async (req, res) => {
  const { transactions, query, profile } = req.body;
  
  try {
    const prompt = `Tu es l'Analyste Financier Senior de ComptaFlow. 
    Analyse les transactions suivantes pour ${profile.displayName} (${profile.companyName || 'Individuel'}):
    
    ${JSON.stringify(transactions, null, 2)}
    
    Question du client : "${query}"
    
    Fournis une analyse structurée en 3 points :
    1. 🎯 Réponse directe à la question.
    2. 📈 Insight de croissance ou d'optimisation fiscale.
    3. ⚠️ Risque potentiel ou anomalie détectée.
    
    Ton ton doit être luxueux, expert et ultra-précis.`;

    const result = await visionModel.generateContent(prompt);
    const response = await result.response;
    res.json({ analysis: response.text() });
  } catch (error: any) {
    botLog('IA_INTEL_ERROR', 'System', error.message);
    res.status(500).json({ error: error.message });
  }
});

// --- ELITE HUNTER (NATIVE CRON JOB) ---
app.get('/api/cron/elite-hunter', async (req, res) => {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    if (process.env.NODE_ENV === 'production') return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    botLog('ELITE_HUNTER_CRON', 'System', 'Démarrage de la chasse aux prospects B2B...');

    const industries = ['Fintech', 'SaaS', 'E-commerce', 'Consulting AI'];
    const mockLead = {
       name: "Alexandre Tremblay",
       title: "CEO & Fondateur",
       company: "DataCloud Qc",
       industry: industries[Math.floor(Math.random() * industries.length)]
    };

    const prompt = `Génère un message d'approche ultra-personnalisé (approche 'Sniper' B2B) pour ce profil LinkedIn :
    Nom: ${mockLead.name}
    Titre: ${mockLead.title}
    Entreprise: ${mockLead.company}
    Industrie: ${mockLead.industry}
    
    Directives OBLIGATOIRES :
    1. Ton : Conseiller de confiance, direct, très professionnel.
    2. Personnalisation : Mentionne spécifiquement son entreprise et un défi typique de son industrie.
    3. L'Offre : Propose une brève consultation sur l'optimisation fiscale et le runway.
    4. Longueur : Maximum 4 phrases.`;

    const result = await agenticModel.generateContent(prompt);
    const sniperMessage = await result.response.text();

    const { createClient } = require('@supabase/supabase-js');
    const sAdmin = createClient(sanitizeEnvVar(process.env.VITE_SUPABASE_URL), sanitizeEnvVar(process.env.SUPABASE_SERVICE_ROLE_KEY) || sanitizeEnvVar(process.env.VITE_SUPABASE_ANON_KEY));
    
    const { error } = await sAdmin.from('marketing_leads').insert([{
      source: 'NATIVE_CRON_HUNTER',
      campaign_id: 'SNIPER_V2',
      revenue_estimate: Math.floor(Math.random() * 5000 + 1000),
      metadata: { 
        name: mockLead.name, 
        company: mockLead.company,
        script: sniperMessage 
      }
    }]);

    if (error) throw error;

    botLog('ELITE_HUNTER_CRON', 'Success', `Lead acquis : ${mockLead.company}`);
    res.json({ success: true, message: "La chasse a été fructueuse." });
  } catch (error: any) {
    botLog('ELITE_HUNTER_CRON_ERROR', 'System', error.message);
    res.status(500).json({ error: error.message });
  }
});

// --- AGENTIC MIND ---
const intentSchema = {
    type: SchemaType.OBJECT,
    properties: {
        intent: {
            type: SchemaType.STRING,
            description: "Catégoriser l'intention de l'utilisateur: 'TAX', 'TECHNICAL', 'SALES', ou 'GENERAL'",
        },
    },
    required: ["intent"],
};

app.post('/api/support/ai-chat', async (req, res) => {
    const { message } = req.body;

    try {
        const routerResponse = await agenticModel.generateContent({
            contents: [{ role: "user", parts: [{ text: `Analyse le message et donne l'intention: "${message}"` }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: intentSchema,
            }
        });
        
        const intentData = JSON.parse(routerResponse.response.text());
        const intent = intentData.intent;
        botLog('AGENTIC_ROUTING', 'User', `Intent détecté: ${intent}`);

        let systemPrompt = "";
        switch (intent) {
            case 'TAX':
                systemPrompt = "Tu es l'expert fiscal Comptaflow (Québec). Parle de T4, TPS/TVQ, et optimisations fiscales avec précision et sérieux.";
                break;
            case 'TECHNICAL':
                systemPrompt = "Tu es l'ingénieur support Comptaflow. Aide le client avec la plateforme (coffre-fort, erreur, connexion) de manière concise.";
                break;
            case 'SALES':
                systemPrompt = "Tu es le directeur commercial Comptaflow. Propose poliment nos services (Tenue de livres, T2, CFO) et invite à ouvrir un mandat via le portail.";
                break;
            default:
                systemPrompt = "Tu es le concierge virtuel Comptaflow. Accueille chaleureusement et réponds de manière générale.";
        }

        const specialistResponse = await agenticModel.generateContent({
             contents: [
                 { role: "user", parts: [{ text: `Système: ${systemPrompt}\nClient: ${message}` }] }
             ]
        });

        res.json({ answer: specialistResponse.response.text(), intent });
    } catch (e: any) {
        botLog('AGENTIC_CRASH', 'Support', e.message);
        res.json({ answer: "L'intelligence de la plateforme effectue une maintenance. Votre CPA prendra le relais sous 24h." });
    }
});



// ============================================================
// 🏛 ...
// ============================================================

const setupStatic = async () => {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (!req.url.startsWith('/api')) res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  }
};

setupStatic();
export default app;
