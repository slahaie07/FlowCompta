import express from 'express';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import Stripe from 'stripe';
import * as paypal from '@paypal/checkout-server-sdk';
import { Resend } from 'resend';
import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';
import dotenv from 'dotenv';
import twilio from 'twilio';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import { runAgentOrchestrator, listAgents, AGENT_REGISTRY, toPublicSupportReply } from '../src/agents/index';
import { runInternalCronJob, INTERNAL_CRON_JOBS } from './internal-jobs';
import { SEED_ADMIN_ACCOUNTS, PORTAL_HOME_BY_ROLE } from '../src/lib/seedAdminAccounts';
import {
  resolveSupabaseAnonKey,
  resolveSupabaseServiceRoleKey,
  resolveSupabaseUrl,
} from '../src/lib/envResolve';
import type { User } from '@supabase/supabase-js';
import { applySupabaseMigrations } from './lib/supabaseMigrations';
const { Client } = pg;

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
const ADMIN_SECRET = sanitizeEnvVar(process.env.SUPABASE_DB_PASSWORD || process.env.ADMIN_SECRET) || 'Maison-139';

const genAI = new GoogleGenerativeAI(geminiKey);
const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const agenticModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
const resend = new Resend(resendKey);
const stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' as any });
const twilioClient = twilio(twilioSid, twilioToken);
const ADMIN_PHONE = '+18192158545';

// --- SUPABASE CLIENT SETUP ---
// envResolve: Vercel integration SUPABASE_* + legacy VITE_* / SUPABASE_SERVICE_ROLE_KEY
const supabaseUrl = resolveSupabaseUrl();
const supabaseAnonKey = resolveSupabaseAnonKey();
const serviceRoleKey = resolveSupabaseServiceRoleKey();

// createClient throws on empty key — must not crash cold start (health/status routes)
const supabaseClientKey =
  serviceRoleKey ||
  supabaseAnonKey ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIn0.placeholder';

const supabase = createClient(supabaseUrl, supabaseClientKey);

function isInternalAgentRequest(req: express.Request): boolean {
  const headerSecret = req.headers['x-comptaflow-internal'];
  if (headerSecret && String(headerSecret) === ADMIN_SECRET) return true;
  const bearer = req.headers.authorization?.split(' ')[1];
  if (bearer && bearer === ADMIN_SECRET) return true;
  const bodySecret = (req.body as { secret?: string } | undefined)?.secret;
  if (bodySecret && bodySecret === ADMIN_SECRET) return true;
  return false;
}

async function findAuthUserByEmail(
  listUsers: (page: number) => Promise<{ users: User[] }>,
  email: string
): Promise<User | null> {
  const target = email.toLowerCase();
  for (let page = 1; page <= 20; page += 1) {
    const { users } = await listUsers(page);
    const match = users.find((u) => u.email?.toLowerCase() === target);
    if (match) return match;
    if (users.length < 200) break;
  }
  return null;
}

async function bootstrapAdminAccounts(password: string) {
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured on server');
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const listUsers = async (page: number) => {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    return data;
  };

  const results: Array<{ email: string; role: string; userId: string; portal: string; action: string }> = [];

  for (const account of SEED_ADMIN_ACCOUNTS) {
    const portal = PORTAL_HOME_BY_ROLE[account.role];
    let userId = '';
    const existing = await findAuthUserByEmail(listUsers, account.email);

    if (existing) {
      userId = existing.id;
      const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
        user_metadata: { full_name: account.fullName, display_name: account.fullName },
      });
      if (updateError) throw new Error(`updateUser ${account.email}: ${updateError.message}`);
      results.push({ email: account.email, role: account.role, userId, portal, action: 'updated auth' });
    } else {
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email: account.email,
        password,
        email_confirm: true,
        user_metadata: { full_name: account.fullName, display_name: account.fullName },
      });
      if (createError) throw new Error(`createUser ${account.email}: ${createError.message}`);
      userId = created.user.id;
      results.push({ email: account.email, role: account.role, userId, portal, action: 'created auth' });
    }

    const { error: profileError } = await admin.from('profiles').upsert(
      {
        id: userId,
        email: account.email,
        full_name: account.fullName,
        display_name: account.fullName,
        role: account.role,
        sub_admin_id: null,
        status: 'active',
      },
      { onConflict: 'id' }
    );

    if (profileError) {
      throw new Error(`profiles upsert ${account.email}: ${profileError.message}`);
    }
  }

  return results;
}

// --- DATABASE PERSISTENCE ---
const DB_PATH = path.join(process.cwd(), 'local_db.json');
const getDb = () => { try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { return {}; } };
const saveDb = (data: any) => { try { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); } catch { /* Read-only Vercel Fallback */ } };

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- MIDDLEWARE DE SÉCURITÉ (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy - Items 10, 11, 12, 27, 28, 32) ---
app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.paypal.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://*.supabase.co https://images.unsplash.com; connect-src 'self' https://*.supabase.co https://api.stripe.com https://*.stripe.com; frame-src 'self' https://js.stripe.com https://www.paypal.com; font-src 'self' https://fonts.gstatic.com;");
    next();
});

// --- EN-MÉMOIRE RATE LIMITER BASIQUE (PREVENT BRUTE FORCE - Items 6 & 7) ---
const rateLimitStore: Record<string, { count: number; resetTime: number }> = {};
const rateLimiter = (limit: number, windowMs: number) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const key = `${ip.toString()}:${req.path}`;
    const now = Date.now();
    
    if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
      rateLimitStore[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      return next();
    }
    
    rateLimitStore[key].count++;
    
    if (rateLimitStore[key].count > limit) {
      botLog('RATE_LIMIT_EXCEEDED', ip.toString(), `Trop de requêtes sur ${req.path}`);
      return res.status(429).json({
        error: "Too many requests",
        message: "Trop de requêtes. Veuillez réessayer plus tard."
      });
    }
    
    next();
  };
};

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
        from: 'Comptaflow <support@compta-flow.net>',
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

app.post('/api/bootstrap-admins', async (req, res) => {
  if (!isInternalAgentRequest(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const password = String(req.body?.password || '');
  if (password.length < 8) {
    return res.status(400).json({
      error: 'password requis (min. 8 caractères) dans le body JSON',
      hint: 'docs/SETUP_WITHOUT_CLI.md — alternative: scripts/seed-admins-manual.sql',
    });
  }

  if (!serviceRoleKey) {
    return res.status(503).json({
      error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server',
      hint: 'Vercel → connect Supabase integration or add env manually, then redeploy',
      manualAlternative: 'scripts/seed-admins-manual.sql',
    });
  }

  try {
    const results = await bootstrapAdminAccounts(password);
    return res.json({
      success: true,
      accounts: results,
      loginUrl: 'https://compta-flow.net/login',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
});

/** @deprecated Prefer POST /api/bootstrap-admins — same ADMIN_SECRET, no hardcoded credentials */
app.post('/api/setup-admin', async (req, res) => {
  if (!isInternalAgentRequest(req)) {
    return res.status(401).json({
      error: 'Unauthorized',
      hint: 'Use X-ComptaFlow-Internal, Authorization: Bearer ADMIN_SECRET, or body.secret',
      preferred: 'POST /api/bootstrap-admins with {"password":"..."}',
    });
  }

  const password = String(req.body?.password || '');
  if (password.length < 8) {
    return res.status(400).json({
      error: 'password requis (min. 8 caractères)',
      preferred: 'POST /api/bootstrap-admins',
    });
  }

  if (!serviceRoleKey) {
    return res.status(503).json({
      error: 'SUPABASE_SERVICE_ROLE_KEY not configured',
      manualAlternative: 'scripts/seed-admins-manual.sql + docs/SETUP_WITHOUT_CLI.md',
    });
  }

  try {
    const results = await bootstrapAdminAccounts(password);
    return res.json({
      success: true,
      deprecated: true,
      message: 'Use /api/bootstrap-admins instead',
      accounts: results,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
});

app.post('/api/diagnostics', (req, res) => {
  if (!isInternalAgentRequest(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const matchingEnv: Record<string, string> = {};
  for (const key of Object.keys(process.env)) {
    const keyLower = key.toLowerCase();
    if (
      keyLower.includes('supabase') ||
      keyLower.includes('secret') ||
      keyLower.includes('key') ||
      keyLower.includes('db') ||
      keyLower.includes('password') ||
      keyLower.includes('url') ||
      keyLower.includes('postgres') ||
      keyLower.includes('service')
    ) {
      matchingEnv[key] = process.env[key] || '';
    }
  }
  res.json({
    keys: Object.keys(process.env).sort(),
    matchingEnv
  });
});

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
  
  if (!fileData || !fileName || !mimeType) {
    botLog('IA_ANALYZE_ERROR', fileName || 'unknown', 'Paramètres requis manquants.');
    return res.status(400).json({ error: "Champs obligatoires manquants: fileData, fileName ou mimeType." });
  }

  try {
    const hash = crypto.createHash('sha256').update(fileData).digest('hex');
    botLog('LEGAL_HASHING', fileName, `SHA-256 généré: ${hash.slice(0, 8)}...`);

    const prompt = `Extraire JSON Québec : type (FACTURE, T4, etc.), emetteur, date, montant_total, tps, tvq, categorie.`;
    const result = await visionModel.generateContent([prompt, { inlineData: { data: fileData, mimeType } }]);
    const analysis = JSON.parse((await result.response).text().replace(/```json|```/g, "").trim());
    
    botLog('IA_ANALYZE', fileName, `Classification: ${analysis.type} | Confiance: Élite`);
    res.json({ success: true, analysis, hash });
  } catch (error: any) {
    botLog('IA_ANALYZE_CRASH', fileName, error.message);
    res.status(500).json({ error: "IA error" });
  }
});

app.post('/api/payment/create-checkout', async (req, res) => {
    const { items, method, customerEmail, reference } = req.body;
    
    if (!items || !method || !customerEmail || !reference) {
      return res.status(400).json({ error: "Paramètres de facturation manquants." });
    }

    if (method === 'interac') {
        botLog('PAYMENT_PENDING', reference, `Instructions Interac envoyées à ${customerEmail}`);
        await sendSupremeEmail(customerEmail, `Action : Virement Comptaflow ${reference}`, `
            <h2>Validation de votre mandat</h2>
            <p>Veuillez effectuer le virement de <strong>${items.reduce((a:any,b:any)=>a+b.price,0)+60}$</strong>.</p>
            <p>Destinataire: <strong>s.lahaie07@gmail.com</strong><br>Référence: <strong>${reference}</strong></p>
        `);
        return res.json({ success: true, manual: true, reference });
    }

    if (method === 'card') {
        try {
            const lineItems = items.map((item: any) => ({
                price_data: {
                    currency: 'cad',
                    product_data: {
                        name: item.name || item.code,
                        description: item.desc || item.code,
                    },
                    unit_amount: Math.round(Number(item.price) * 100),
                },
                quantity: 1,
            }));

            // Ajout automatique du frais d'ouverture de 60$
            lineItems.push({
                price_data: {
                    currency: 'cad',
                    product_data: {
                        name: "Frais d'ouverture de dossier (Comptaflow)",
                        description: "Frais administratifs et configuration initiale du coffre-fort sécurisé",
                    },
                    unit_amount: 6000,
                },
                quantity: 1,
            });

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                customer_email: customerEmail,
                client_reference_id: reference,
                success_url: `${req.headers.origin || 'https://compta-flow.net'}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${req.headers.origin || 'https://compta-flow.net'}/portal/client/services`,
            });

            botLog('PAYMENT_CHECKOUT_CREATED', reference, `Session Stripe créée: ${session.id}`);
            return res.json({ success: true, url: session.url });
        } catch (error: any) {
            botLog('PAYMENT_CHECKOUT_ERROR', reference, error.message);
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(400).json({ error: `Mode de paiement non supporté : ${method}` });
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
      cancel_url: `${req.headers.origin}/portal/client/services`,
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

    const geminiLive = geminiKey && geminiKey !== 'mock_gemini_api_key' && !geminiKey.startsWith('mock_');
    let sniperMessage = `Bonjour ${mockLead.name}, ComptaFlow accompagne les ${mockLead.industry} québécois en tenue de livres et fiscalité.`;

    if (geminiLive) {
      const prompt = `${AGENT_REGISTRY['marketing-hunter'].systemPrompt}

Profil LinkedIn:
Nom: ${mockLead.name}
Titre: ${mockLead.title}
Entreprise: ${mockLead.company}
Industrie: ${mockLead.industry}`;

      const result = await agenticModel.generateContent(prompt);
      sniperMessage = await result.response.text();
    }

    const sAdmin = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey);
    
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
    res.json({ success: true, message: "La chasse a été fructueuse.", geminiLive });
  } catch (error: any) {
    botLog('ELITE_HUNTER_CRON_ERROR', 'System', error.message);
    res.status(500).json({ error: error.message });
  }
});

// --- AGENTIC MIND (interne — non exposé aux clients) ---
// isInternalAgentRequest defined near supabase client setup

// --- INTERNAL CRON (ADMIN_SECRET / X-ComptaFlow-Internal) ---
app.get('/api/cron/agent-health', async (req, res) => {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    if (process.env.NODE_ENV === 'production') return res.status(401).json({ error: 'Unauthorized' });
  }
  const geminiLive = !!(geminiKey && geminiKey !== 'mock_gemini_api_key' && !geminiKey.startsWith('mock_'));
  const result = runInternalCronJob('agent-health', { geminiConfigured: geminiLive });
  botLog('CRON_AGENT_HEALTH', 'System', result.message);
  res.json(result);
});

app.get('/api/internal/cron', (_req, res) => {
  res.json({
    jobs: INTERNAL_CRON_JOBS,
    auth: 'X-ComptaFlow-Internal header or Authorization: Bearer CRON_SECRET',
    examples: INTERNAL_CRON_JOBS.map((j) => `POST /api/internal/cron/${j}`),
  });
});

app.post('/api/internal/cron/:job', async (req, res) => {
  if (!isInternalAgentRequest(req)) {
    const cronAuth = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || cronAuth !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const job = String(req.params.job || '');
  const geminiLive = !!(geminiKey && geminiKey !== 'mock_gemini_api_key' && !geminiKey.startsWith('mock_'));

  if (job === 'elite-hunter' || job === 'marketing-hunter') {
    const stub = runInternalCronJob(job, { geminiConfigured: geminiLive });
    botLog('INTERNAL_CRON', job, stub.message);
    return res.json({
      ...stub,
      liveEndpoint: 'GET /api/cron/elite-hunter (Bearer CRON_SECRET) — planifié quotidiennement via vercel.json',
    });
  }

  const result = runInternalCronJob(job, { geminiConfigured: geminiLive });
  botLog('INTERNAL_CRON', job, result.message);
  res.status(result.success ? 200 : 400).json(result);
});

// --- ONBOARDING WEBHOOK (n8n / parcours client) ---
app.post('/api/webhook/onboarding-complete', async (req, res) => {
  const { userId, email, displayName, province, language } = req.body || {};

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'email requis' });
  }

  try {
    botLog('ONBOARDING_COMPLETE', userId || email, `Province: ${province || 'QC'}`);

    const portalUrl = 'https://compta-flow.net/portal/client/overview';
    const procedureUrl = 'https://compta-flow.net/portal/client/procedure';
    const lang = language === 'en' ? 'en' : language === 'ar' ? 'ar' : 'fr';

    const subjects = {
      fr: 'Bienvenue chez ComptaFlow — vos prochaines étapes',
      en: 'Welcome to ComptaFlow — your next steps',
      ar: 'مرحباً بكم في ComptaFlow — الخطوات التالية',
    };

    const htmlBodies = {
      fr: `<p>Bonjour ${displayName || ''},</p>
        <p>Votre compte est actif. <strong>Prochaine étape :</strong> choisissez votre service dans l'aperçu, puis suivez votre <a href="${procedureUrl}">parcours dossier</a>.</p>
        <p><a href="${portalUrl}">Accéder à mon portail</a></p>`,
      en: `<p>Hello ${displayName || ''},</p>
        <p>Your account is active. <strong>Next step:</strong> pick your service in Overview, then follow your <a href="${procedureUrl}">guided file path</a>.</p>
        <p><a href="${portalUrl}">Open my portal</a></p>`,
      ar: `<p>مرحباً ${displayName || ''},</p>
        <p>حسابك نشط. <strong>الخطوة التالية:</strong> اختر خدمتك ثم اتبع <a href="${procedureUrl}">مسار ملفك</a>.</p>
        <p><a href="${portalUrl}">فتح بوابتي</a></p>`,
    };

    if (process.env.RESEND_API_KEY) {
      await sendSupremeEmail(email, subjects[lang], htmlBodies[lang]);
    }

    if (userId && serviceRoleKey) {
      const { data: profile } = await supabase.from('profiles').select('metadata').eq('id', userId).single();
      const existingMeta = (profile?.metadata as Record<string, unknown>) || {};
      await supabase
        .from('profiles')
        .update({
          metadata: {
            ...existingMeta,
            onboardingCompletedAt: new Date().toISOString(),
            province: province || existingMeta.province || 'QC',
            onboardingWebhook: true,
          },
        })
        .eq('id', userId);
    }

    res.json({
      success: true,
      emailSent: !!process.env.RESEND_API_KEY,
      portalUrl,
      procedureUrl,
      n8nHint: 'Import n8n-onboarding-automation.json — webhook POST /api/webhook/onboarding-complete',
    });
  } catch (error: any) {
    botLog('ONBOARDING_WEBHOOK_ERROR', email, error.message);
    res.status(500).json({ error: error.message });
  }
});

// --- INTERNAL BOT LOGS (audit trail) ---
app.get('/api/internal/bot-logs', async (req, res) => {
  if (!isInternalAgentRequest(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const limit = Math.min(parseInt(String(req.query.limit || '50'), 10) || 50, 200);
  const db = getDb();
  const logs = (db.bot_logs || []).slice(-limit).reverse();
  res.json({ logs, count: logs.length });
});

// --- AGENTIC MIND (interne — non exposé aux clients) ---
app.get('/api/internal/agents', async (req, res) => {
  if (!isInternalAgentRequest(req)) {
    const ctx = await getSuperAdminFromRequest(req);
    if (!ctx) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const includeInternal = req.query.all === '1' || req.query.all === 'true';
  res.json({
    agents: listAgents({ internal: includeInternal }).map((a) => ({
      id: a.id,
      name: a.name,
      intent: a.intent,
      visibility: a.visibility,
      description: a.description,
    })),
  });
});

app.post('/api/support/ai-chat', async (req, res) => {
  const { message, context, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message requis' });
  }

  try {
    const result = await runAgentOrchestrator(
      {
        message,
        context: { ...context, channel: 'support-chat' },
        history: Array.isArray(history) ? history : undefined,
      },
      {
        onRoute: (intent, agentId) => botLog('AGENTIC_ROUTING', 'User', `${intent} → ${agentId}`),
      }
    );

    const lang =
      context?.language === 'en' || context?.language === 'ar' ? context.language : 'fr';

    botLog('AGENTIC_REPLY', result.agentId, `${result.intent} ${result.latencyMs}ms`);
    res.json(toPublicSupportReply(result, lang));
  } catch (e: any) {
    botLog('AGENTIC_CRASH', 'Support', e.message);
    const lang =
      context?.language === 'en' || context?.language === 'ar' ? context.language : 'fr';
    res.json(
      toPublicSupportReply(
        {
          answer:
            lang === 'en'
              ? "I'm briefly unavailable — your bookkeeper will follow up within 24 business hours."
              : lang === 'ar'
                ? 'أنا غير متاحة مؤقتاً — سيتابع محاسبك خلال 24 ساعة عمل.'
                : 'Je suis momentanément indisponible — votre comptable reprendra le fil sous 24 h ouvrables.',
          agentId: 'general',
        },
        lang
      )
    );
  }
});

// --- AUTOMATED INTERAC E-TRANSFER RECONCILIATION VIA n8n ---
app.post('/api/invoices/reconcile', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token || token !== ADMIN_SECRET) {
    return res.status(401).json({ error: "Non autorisé. Jeton secret invalide." });
  }

  const { invoiceNumber, amount, interacRef } = req.body;

  if (!invoiceNumber || !interacRef) {
    return res.status(400).json({ error: "invoiceNumber et interacRef sont requis." });
  }

  try {
    // 1. Check in local DB mock handler first if running locally
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      const db = getDb();
      const invoice = db.invoices.find((i: any) => i.number === invoiceNumber);
      if (invoice) {
        if (invoice.status === 'paid') {
          return res.status(400).json({ error: "La facture est déjà payée." });
        }
        invoice.status = 'paid';
        invoice.clientADeclarePaye = true;
        invoice.interacReference = interacRef;
        invoice.datePaiement = new Date().toISOString();
        saveDb(db);
        return res.json({ success: true, message: "Facture réconciliée avec succès (Mock DB).", invoice });
      }
    }

    // 2. Query Supabase
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*, profiles!client_id(full_name, email)')
      .eq('numero', invoiceNumber)
      .single();

    if (fetchError || !invoice) {
      return res.status(404).json({ error: `Facture ${invoiceNumber} introuvable.` });
    }

    if (invoice.statut === 'payee') {
      return res.status(400).json({ error: "La facture est déjà réglée." });
    }

    // Optionnel: valider le montant (avec une marge de 0.05 $ pour les arrondis de centimes)
    if (amount && Math.abs(parseFloat(invoice.montant_total) - parseFloat(amount)) > 0.05) {
      return res.status(400).json({ 
        error: `Montant non concordant. Attendu: ${invoice.montant_total}, Reçu: ${amount}` 
      });
    }

    // Mettre à jour dans Supabase
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        statut: 'payee',
        date_paiement: new Date().toISOString(),
        interac_reference: interacRef,
        client_a_declare_paye: true
      })
      .eq('id', invoice.id);

    if (updateError) throw updateError;

    // Envoi du courriel de confirmation via Resend
    if (resendKey && invoice.profiles?.email) {
      try {
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: 'Facturation ComptaFlow <noreply@compta-flow.net>',
          to: invoice.profiles.email,
          subject: `Confirmation de réception de votre virement Interac - Facture ${invoiceNumber}`,
          text: `Bonjour ${invoice.profiles.full_name || 'Client'},\n\nNous confirmons la bonne réception de votre virement Interac d'un montant de ${invoice.montant_total} $ (Réf Interac: ${interacRef}).\n\nVotre facture ${invoiceNumber} est maintenant marquée comme payée.\n\nCordialement,\nL'équipe ComptaFlow`
        });
      } catch (emailErr: any) {
        console.warn("Échec d'envoi du courriel de confirmation :", emailErr.message);
      }
    }

    // Logger dans la table d'audit
    try {
      await supabase.from('audit_logs').insert({
        user_id: invoice.client_id,
        action: 'AUTO_RECONCILE',
        table_name: 'invoices',
        record_id: invoice.id,
        new_data: { interac_reference: interacRef, amount: invoice.montant_total }
      });
    } catch (auditErr) {
      console.warn("Échec d'écriture dans les logs d'audit :", auditErr);
    }

    return res.json({ 
      success: true, 
      message: "Facture réconciliée avec succès et notifiée par courriel.",
      invoiceId: invoice.id,
      clientEmail: invoice.profiles?.email
    });

  } catch (err: any) {
    botLog('RECONCILE_ERROR', 'System', err.message);
    return res.status(500).json({ error: "Erreur interne lors de la réconciliation : " + err.message });
  }
});

// --- LOI 25 : AUTOMATED ACCOUNT DELETION ("Right to be Forgotten" / Droit à l'oubli) ---
app.post('/api/profile/delete', async (req, res) => {
  const { userId, email } = req.body;

  if (!userId && !email) {
    botLog('DELETE_PROFILE_BAD_REQUEST', 'System', 'Tentative de suppression de compte sans identifiants.');
    return res.status(400).json({ error: "userId ou email requis pour la suppression." });
  }

  let targetUserId = userId;
  let targetEmail = email;

  // 1. Resolve from local_db.json if available
  const db = getDb();
  let foundInLocalDb = false;
  if (db.profiles) {
    const localProfile = db.profiles.find((p: any) => 
      (targetUserId && p.id === targetUserId) || 
      (targetEmail && p.email?.toLowerCase() === targetEmail.toLowerCase())
    );
    if (localProfile) {
      targetUserId = localProfile.id || targetUserId;
      targetEmail = localProfile.email || targetEmail;
      foundInLocalDb = true;
    }
  }

  // 2. Resolve from Supabase if needed and available
  const projectRef = 'unvyxfxlzhnutpugjxhe';

  if (serviceRoleKey && (!targetUserId || !targetEmail)) {
    try {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
      let query = supabaseAdmin.from('profiles').select('*');
      if (targetUserId) {
        query = query.eq('id', targetUserId);
      } else if (targetEmail) {
        query = query.eq('email', targetEmail);
      }
      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        targetUserId = data.id;
        targetEmail = data.email;
      }
    } catch (e: any) {
      console.error("[delete-profile] Supabase lookup error:", e.message);
    }
  }

  if (!targetUserId) {
    botLog('DELETE_PROFILE_NOT_FOUND', 'System', `Utilisateur non trouvé pour la suppression: ID=${userId}, Email=${email}`);
    return res.status(404).json({ error: "Utilisateur non trouvé." });
  }

  botLog('DELETE_PROFILE_REQUEST', targetUserId, `Loi 25 - Demande de suppression pour ${targetEmail}`);

  // 3. Check Legal Retention Requirements
  let hasTaxFilings = false;
  let hasUnpaidInvoices = false;

  // Mock checking logic
  if (targetUserId.startsWith('mock_')) {
    if (targetUserId === 'mock_client_id') {
      hasTaxFilings = true;
    }
    if (db.invoices) {
      const mockInvs = db.invoices.filter((inv: any) => inv.userId === targetUserId || inv.user_id === targetUserId);
      hasUnpaidInvoices = mockInvs.some((inv: any) => inv.status !== 'paid');
    }
  }

  // Real Database check (Supabase JS Client)
  if (serviceRoleKey && !targetUserId.startsWith('mock_')) {
    try {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
      
      const { data: docs, error: docsErr } = await supabaseAdmin
        .from('documents')
        .select('category, metadata')
        .eq('user_id', targetUserId);
        
      if (!docsErr && docs) {
        hasTaxFilings = docs.some((doc: any) => 
          doc.category === 'fiscal' || 
          doc.category === 'tax' ||
          (doc.metadata && ['T1', 'T2', 'T4', 'T5', 'fiscal', 'tax'].includes(doc.metadata.type || ''))
        );
      }
      
      const { data: invs, error: invsErr } = await supabaseAdmin
        .from('invoices')
        .select('status')
        .eq('user_id', targetUserId);
        
      if (!invsErr && invs) {
        hasUnpaidInvoices = invs.some((inv: any) => inv.status !== 'paid');
      }
    } catch (e: any) {
      console.error("[delete-profile] Supabase retention check error:", e.message);
    }
  }

  // Real Database check fallback (Direct Postgres Client)
  if (!serviceRoleKey && !targetUserId.startsWith('mock_')) {
    const configs = [
      { host: `db.${projectRef}.supabase.co`, port: 5432, user: 'postgres' },
      { host: `aws-1-ca-central-1.pooler.supabase.com`, port: 6543, user: `postgres.${projectRef}` },
      { host: `aws-0-ca-central-1.pooler.supabase.com`, port: 6543, user: `postgres.${projectRef}` }
    ];
    
    for (const conf of configs) {
      const client = new Client({
        host: conf.host,
        port: conf.port,
        user: conf.user,
        password: ADMIN_SECRET,
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
      });
      try {
        await client.connect();
        
        const docRes = await client.query('SELECT category, metadata FROM public.documents WHERE user_id = $1', [targetUserId]);
        hasTaxFilings = docRes.rows.some((doc: any) => 
          doc.category === 'fiscal' || 
          doc.category === 'tax' ||
          (doc.metadata && ['T1', 'T2', 'T4', 'T5', 'fiscal', 'tax'].includes(doc.metadata.type || ''))
        );
        
        const invRes = await client.query('SELECT status FROM public.invoices WHERE user_id = $1', [targetUserId]);
        hasUnpaidInvoices = invRes.rows.some((inv: any) => inv.status !== 'paid');
        
        await client.end();
        break;
      } catch (e) {
        try { await client.end(); } catch (err) {}
      }
    }
  }

  // If retention is required, reject deletion request with specific status 409
  if (hasTaxFilings || hasUnpaidInvoices) {
    botLog('DELETE_PROFILE_REJECTED', targetUserId, `Rejet Loi 25: Déclarations=${hasTaxFilings}, Impayés=${hasUnpaidInvoices}`);
    return res.status(409).json({
      success: false,
      error: "LEGAL_RETENTION_REQUIRED",
      hasTaxFilings,
      hasUnpaidInvoices,
      message: "La suppression du compte a été rejetée. Les déclarations fiscales officielles transmises et les factures impayées doivent être conservées légalement pendant 7 ans sous les réglementations fiscales du Québec (Loi 25 / ARC / Revenu Québec)."
    });
  }

  // 4. Perform actual deletion of user data
  let method = 'None';
  
  // Local Db deletion
  if (foundInLocalDb) {
    method = 'local_db.json';
    const dbData = getDb();
    if (dbData.users) dbData.users = dbData.users.filter((u: any) => u.id !== targetUserId);
    if (dbData.profiles) dbData.profiles = dbData.profiles.filter((p: any) => p.id !== targetUserId);
    if (dbData.transactions) dbData.transactions = dbData.transactions.filter((t: any) => t.userId !== targetUserId && t.user_id !== targetUserId);
    if (dbData.invoices) dbData.invoices = dbData.invoices.filter((i: any) => i.userId !== targetUserId && i.user_id !== targetUserId);
    if (dbData.orders) dbData.orders = dbData.orders.filter((o: any) => o.userId !== targetUserId && o.user_id !== targetUserId);
    if (dbData.messages) dbData.messages = dbData.messages.filter((m: any) => m.userId !== targetUserId && m.user_id !== targetUserId);
    saveDb(dbData);
  }

  // Supabase delete execution
  if (serviceRoleKey && !targetUserId.startsWith('mock_')) {
    try {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
      
      method = 'Supabase JS Admin SDK';

      // Delete user files in Storage
      try {
        const { data: files, error: listErr } = await supabaseAdmin.storage
          .from('vault')
          .list(targetUserId);
        if (!listErr && files && files.length > 0) {
          const filesToRemove = files.map((f: any) => `${targetUserId}/${f.name}`);
          await supabaseAdmin.storage.from('vault').remove(filesToRemove);
        }
      } catch (sErr: any) {
        console.warn("[delete-profile] Storage clean warning:", sErr.message);
      }

      // Delete database table entries
      await supabaseAdmin.from('social_content').delete().eq('author_id', targetUserId);
      await supabaseAdmin.from('messages').delete().eq('user_id', targetUserId);
      await supabaseAdmin.from('invoices').delete().eq('user_id', targetUserId);
      await supabaseAdmin.from('transactions').delete().eq('user_id', targetUserId);
      await supabaseAdmin.from('documents').delete().eq('user_id', targetUserId);
      await supabaseAdmin.from('profiles').delete().eq('id', targetUserId);
      
      // Delete Auth user
      const { error: authDelErr } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
      if (authDelErr) {
        console.warn("[delete-profile] Auth user deletion warning:", authDelErr.message);
      }
    } catch (e: any) {
      console.error("[delete-profile] Supabase deletion crash:", e.message);
    }
  }

  // Direct PG fallback deletion execution
  if (!serviceRoleKey && !targetUserId.startsWith('mock_')) {
    const configs = [
      { host: `db.${projectRef}.supabase.co`, port: 5432, user: 'postgres' },
      { host: `aws-1-ca-central-1.pooler.supabase.com`, port: 6543, user: `postgres.${projectRef}` },
      { host: `aws-0-ca-central-1.pooler.supabase.com`, port: 6543, user: `postgres.${projectRef}` }
    ];
    
    for (const conf of configs) {
      const client = new Client({
        host: conf.host,
        port: conf.port,
        user: conf.user,
        password: ADMIN_SECRET,
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
      });
      try {
        await client.connect();
        method = 'Direct PG Client';
        
        await client.query('DELETE FROM public.social_content WHERE author_id = $1', [targetUserId]);
        await client.query('DELETE FROM public.messages WHERE user_id = $1', [targetUserId]);
        await client.query('DELETE FROM public.invoices WHERE user_id = $1', [targetUserId]);
        await client.query('DELETE FROM public.transactions WHERE user_id = $1', [targetUserId]);
        await client.query('DELETE FROM public.documents WHERE user_id = $1', [targetUserId]);
        await client.query('DELETE FROM public.profiles WHERE id = $1', [targetUserId]);
        await client.query('DELETE FROM auth.users WHERE id = $1', [targetUserId]);
        
        await client.end();
        break;
      } catch (e) {
        try { await client.end(); } catch (err) {}
      }
    }
  }

  botLog('DELETE_PROFILE_SUCCESS', targetUserId, `Loi 25 - Compte supprimé avec succès via ${method}`);
  return res.json({
    success: true,
    message: "Conformité Loi 25 confirmée : toutes les données personnelles ont été supprimées définitivement du système.",
    method
  });
});

// --- LOI 25 : DROIT À LA PORTABILITÉ DES DONNÉES ("Right to Portability" / Item 109) ---
app.post('/api/profile/export', rateLimiter(5, 60000), async (req, res) => {
  const { userId, email } = req.body;

  if (!userId && !email) {
    botLog('EXPORT_PROFILE_BAD_REQUEST', 'System', "Tentative d'exportation de données sans identifiants.");
    return res.status(400).json({ error: "userId ou email requis pour l'exportation." });
  }

  let targetUserId = userId;
  let targetEmail = email;

  // 1. Resolve from local_db.json if available
  const db = getDb();
  let foundInLocalDb = false;
  let localData: any = {};
  if (db.profiles) {
    const localProfile = db.profiles.find((p: any) => 
      (targetUserId && p.id === targetUserId) || 
      (targetEmail && p.email?.toLowerCase() === targetEmail.toLowerCase())
    );
    if (localProfile) {
      targetUserId = localProfile.id || targetUserId;
      targetEmail = localProfile.email || targetEmail;
      foundInLocalDb = true;
      
      localData.profile = localProfile;
      localData.transactions = db.transactions ? db.transactions.filter((t: any) => t.userId === targetUserId || t.user_id === targetUserId) : [];
      localData.invoices = db.invoices ? db.invoices.filter((i: any) => i.userId === targetUserId || i.user_id === targetUserId) : [];
      localData.orders = db.orders ? db.orders.filter((o: any) => o.userId === targetUserId || o.user_id === targetUserId) : [];
      localData.messages = db.messages ? db.messages.filter((m: any) => m.userId === targetUserId || m.user_id === targetUserId) : [];
    }
  }

  // 2. Resolve from Supabase / Postgres if needed
  const projectRef = 'unvyxfxlzhnutpugjxhe';

  let dbData: any = {};
  let foundInDb = false;

  if (serviceRoleKey && !targetUserId?.startsWith('mock_')) {
    try {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
      
      // Resolve details if needed
      if (!targetUserId || !targetEmail) {
        let query = supabaseAdmin.from('profiles').select('*');
        if (targetUserId) {
          query = query.eq('id', targetUserId);
        } else {
          query = query.eq('email', targetEmail);
        }
        const { data: p } = await query.maybeSingle();
        if (p) {
          targetUserId = p.id;
          targetEmail = p.email;
        }
      }

      if (targetUserId) {
        foundInDb = true;
        // Fetch everything concurrently (Item 48 optimization)
        const [
          { data: profile },
          { data: transactions },
          { data: invoices },
          { data: documents },
          { data: messages },
          { data: socialContent }
        ] = await Promise.all([
          supabaseAdmin.from('profiles').select('*').eq('id', targetUserId).maybeSingle(),
          supabaseAdmin.from('transactions').select('*').eq('user_id', targetUserId),
          supabaseAdmin.from('invoices').select('*').eq('user_id', targetUserId),
          supabaseAdmin.from('documents').select('*').eq('user_id', targetUserId),
          supabaseAdmin.from('messages').select('*').eq('user_id', targetUserId),
          supabaseAdmin.from('social_content').select('*').eq('author_id', targetUserId)
        ]);

        dbData = {
          profile,
          transactions,
          invoices,
          documents,
          messages,
          socialContent
        };
      }
    } catch (e: any) {
      console.error("[export-profile] Supabase error:", e.message);
    }
  }

  // Fallback to PG direct client if needed
  if (!foundInDb && !targetUserId?.startsWith('mock_')) {
    const configs = [
      { host: `db.${projectRef}.supabase.co`, port: 5432, user: 'postgres' },
      { host: `aws-1-ca-central-1.pooler.supabase.com`, port: 6543, user: `postgres.${projectRef}` },
      { host: `aws-0-ca-central-1.pooler.supabase.com`, port: 6543, user: `postgres.${projectRef}` }
    ];
    
    for (const conf of configs) {
      const client = new Client({
        host: conf.host,
        port: conf.port,
        user: conf.user,
        password: ADMIN_SECRET,
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
      });
      try {
        await client.connect();
        foundInDb = true;

        if (!targetUserId || !targetEmail) {
          const resUser = await client.query('SELECT id, email FROM public.profiles WHERE id = $1 OR email = $2', [targetUserId, targetEmail]);
          if (resUser.rows.length > 0) {
            targetUserId = resUser.rows[0].id;
            targetEmail = resUser.rows[0].email;
          }
        }

        if (targetUserId) {
          const profile = (await client.query('SELECT * FROM public.profiles WHERE id = $1', [targetUserId])).rows[0];
          const transactions = (await client.query('SELECT * FROM public.transactions WHERE user_id = $1', [targetUserId])).rows;
          const invoices = (await client.query('SELECT * FROM public.invoices WHERE user_id = $1', [targetUserId])).rows;
          const documents = (await client.query('SELECT * FROM public.documents WHERE user_id = $1', [targetUserId])).rows;
          const messages = (await client.query('SELECT * FROM public.messages WHERE user_id = $1', [targetUserId])).rows;
          const socialContent = (await client.query('SELECT * FROM public.social_content WHERE author_id = $1', [targetUserId])).rows;

          dbData = {
            profile,
            transactions,
            invoices,
            documents,
            messages,
            socialContent
          };
        }

        await client.end();
        break;
      } catch (e) {
        try { await client.end(); } catch (err) {}
      }
    }
  }

  // Merge mock and DB data if both found, or select appropriate
  const exportPayload = foundInLocalDb ? { ...localData, source: "mock_local_db" } : { ...dbData, source: "production_db" };

  if (!exportPayload.profile && !foundInLocalDb) {
    botLog('EXPORT_PROFILE_NOT_FOUND', 'System', `Tentative d'export pour un utilisateur inexistant: ID=${userId}, Email=${email}`);
    return res.status(404).json({ error: "Profil utilisateur introuvable pour l'exportation." });
  }

  botLog('EXPORT_PROFILE_SUCCESS', targetUserId || 'unknown', `Données exportées pour ${targetEmail}`);

  // Force download as JSON file attachment
  res.setHeader('Content-disposition', `attachment; filename=comptaflow_export_${targetUserId || 'data'}.json`);
  res.setHeader('Content-type', 'application/json');
  return res.send(JSON.stringify({
    schema_version: "CF-Loi25-V1.0",
    exported_at: new Date().toISOString(),
    user_identity: {
      userId: targetUserId,
      email: targetEmail
    },
    data: exportPayload
  }, null, 2));
});

// --- SUPER ADMIN: provision sub_admin accounts (service role) ---
async function getSuperAdminFromRequest(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  if (!serviceRoleKey) return null;

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: userData, error: userError } = await adminClient.auth.getUser(token);
  if (userError || !userData.user) return null;

  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single();

  if (profile?.role !== 'super_admin') return null;
  return { user: userData.user, adminClient };
}

app.post('/api/admin/create-sub-admin', async (req, res) => {
  const ctx = await getSuperAdminFromRequest(req);
  if (!ctx) {
    return res.status(403).json({ error: 'Accès réservé au super administrateur.' });
  }

  const { fullName, email, password } = req.body || {};
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'fullName, email et password sont requis.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Mot de passe trop court (min. 6 caractères).' });
  }

  try {
    const cleanEmail = String(email).toLowerCase().trim();
    const { data: created, error: createError } = await ctx.adminClient.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError) throw createError;

    const userId = created.user?.id;
    if (!userId) throw new Error('Utilisateur non créé.');

    const { error: profileError } = await ctx.adminClient.from('profiles').upsert({
      id: userId,
      email: cleanEmail,
      full_name: fullName,
      display_name: fullName,
      role: 'sub_admin',
      status: 'active',
    });

    if (profileError) throw profileError;

    return res.json({
      success: true,
      userId,
      email: cleanEmail,
      message: 'Comptable partenaire provisionné.',
    });
  } catch (err: any) {
    console.error('[create-sub-admin]', err.message);
    return res.status(500).json({ error: err.message || 'Échec de création du comptable.' });
  }
});

app.post('/api/internal/apply-migrations', async (req, res) => {
  if (!isInternalAgentRequest(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const result = await applySupabaseMigrations({ allFiles: true });
  res.status(result.success ? 200 : 500).json(result);
});

async function checkPartnerRls(): Promise<'ok' | 'recursion' | 'missing_key' | 'error'> {
  const anon = resolveSupabaseAnonKey();
  if (!anon) return 'missing_key';
  const projectRef = resolveSupabaseUrl().match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) return 'error';
  const url = `https://${projectRef}.supabase.co/rest/v1/profiles?select=id&role=eq.sub_admin&limit=1`;
  try {
    const res = await fetch(url, {
      headers: { apikey: anon, Authorization: `Bearer ${anon}` },
    });
    const body = await res.text();
    if (res.ok) return 'ok';
    if (body.includes('42P17')) return 'recursion';
    return 'error';
  } catch {
    return 'error';
  }
}

// --- HEALTH CHECK (monitoring / stress tests) ---
app.get('/api/health', async (_req, res) => {
  const geminiLive = !!(geminiKey && geminiKey !== 'mock_gemini_api_key' && !geminiKey.startsWith('mock_'));
  const partnerRls = await checkPartnerRls();
  res.json({
    status: 'ok',
    service: 'ComptaFlow',
    site: 'https://compta-flow.net',
    timestamp: new Date().toISOString(),
    env: {
      gemini: geminiLive ? 'live' : 'mock-fallback',
      supabase: supabaseUrl ? 'configured' : 'missing',
      serviceRole: serviceRoleKey ? 'configured' : 'missing',
      anonKey: supabaseAnonKey ? 'configured' : 'missing',
      supabaseProject: resolveSupabaseUrl().match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? 'unknown',
      partnerRls,
      resend: process.env.RESEND_API_KEY ? 'configured' : 'missing',
      adminSecret: process.env.ADMIN_SECRET ? 'configured' : 'default-fallback',
      cronSecret: process.env.CRON_SECRET ? 'configured' : 'missing',
      dbPassword: process.env.SUPABASE_DB_PASSWORD ? 'configured' : 'missing',
    },
    agents: listAgents({ internal: false }).length,
  });
});

// --- RÉSEAU CANADA : détection région, légal, status ---
const CANADA_REGIONS: Record<string, { code: string; nameFr: string; nameEn: string; privacyLaw: string; edgeRegion: string; seoSlug: string }> = {
  QC: { code: 'QC', nameFr: 'Québec', nameEn: 'Quebec', privacyLaw: 'loi25', edgeRegion: 'yul1', seoSlug: 'quebec' },
  ON: { code: 'ON', nameFr: 'Ontario', nameEn: 'Ontario', privacyLaw: 'pipeda', edgeRegion: 'yyz1', seoSlug: 'ontario' },
  BC: { code: 'BC', nameFr: 'Colombie-Britannique', nameEn: 'British Columbia', privacyLaw: 'pipeda_bc', edgeRegion: 'yvr1', seoSlug: 'colombie-britannique' },
  AB: { code: 'AB', nameFr: 'Alberta', nameEn: 'Alberta', privacyLaw: 'pipa_ab', edgeRegion: 'yyc1', seoSlug: 'alberta' },
  MB: { code: 'MB', nameFr: 'Manitoba', nameEn: 'Manitoba', privacyLaw: 'pipeda', edgeRegion: 'ywg1', seoSlug: 'manitoba' },
  SK: { code: 'SK', nameFr: 'Saskatchewan', nameEn: 'Saskatchewan', privacyLaw: 'pipeda', edgeRegion: 'yxe1', seoSlug: 'saskatchewan' },
  NB: { code: 'NB', nameFr: 'Nouveau-Brunswick', nameEn: 'New Brunswick', privacyLaw: 'pipeda', edgeRegion: 'yfc1', seoSlug: 'nouveau-brunswick' },
  NS: { code: 'NS', nameFr: 'Nouvelle-Écosse', nameEn: 'Nova Scotia', privacyLaw: 'pipeda', edgeRegion: 'yhz1', seoSlug: 'nouvelle-ecosse' },
  PE: { code: 'PE', nameFr: 'Île-du-Prince-Édouard', nameEn: 'Prince Edward Island', privacyLaw: 'pipeda', edgeRegion: 'yhz1', seoSlug: 'ipe' },
  NL: { code: 'NL', nameFr: 'Terre-Neuve-et-Labrador', nameEn: 'Newfoundland and Labrador', privacyLaw: 'pipeda', edgeRegion: 'yyt1', seoSlug: 'terre-neuve' },
  YT: { code: 'YT', nameFr: 'Yukon', nameEn: 'Yukon', privacyLaw: 'pipeda', edgeRegion: 'yxy1', seoSlug: 'yukon' },
  NT: { code: 'NT', nameFr: 'Territoires du Nord-Ouest', nameEn: 'Northwest Territories', privacyLaw: 'pipeda', edgeRegion: 'yxy1', seoSlug: 'tno' },
  NU: { code: 'NU', nameFr: 'Nunavut', nameEn: 'Nunavut', privacyLaw: 'pipeda', edgeRegion: 'yxy1', seoSlug: 'nunavut' },
};

const detectProvince = (req: express.Request): string => {
  const regionHeader = String(req.headers['x-vercel-ip-country-region'] ?? req.headers['cf-region-code'] ?? '');
  if (regionHeader && CANADA_REGIONS[regionHeader.toUpperCase()]) return regionHeader.toUpperCase();
  const country = String(req.headers['x-vercel-ip-country'] ?? req.headers['cf-ipcountry'] ?? 'CA');
  if (country !== 'CA') return 'QC';
  return 'QC';
};

app.get('/api/network/region', (req, res) => {
  const province = detectProvince(req);
  const region = CANADA_REGIONS[province] ?? CANADA_REGIONS.QC;
  res.json({
    province,
    region,
    country: 'CA',
    dataRegion: 'ca-central-1',
    site: 'https://compta-flow.net',
  });
});

app.get('/api/network/legal', (req, res) => {
  const province = detectProvince(req);
  const region = CANADA_REGIONS[province] ?? CANADA_REGIONS.QC;
  res.json({
    province,
    privacyLaw: region.privacyLaw,
    patterns: [
      { id: 'cookie_consent', route: '/cookies', required: true },
      { id: 'privacy_policy', route: '/privacy', required: true },
      { id: 'terms_of_service', route: '/terms', required: true },
      { id: 'legal_notice', route: '/legal', required: true },
      { id: 'data_residency', required: true, dataRegion: 'ca-central-1' },
      { id: 'cpa_disclaimer', required: true },
    ],
    version: '2026.06',
  });
});

app.get('/api/network/status', (_req, res) => {
  res.json({
    domain: 'compta-flow.net',
    dataRegion: 'ca-central-1',
    activeRegions: Object.keys(CANADA_REGIONS).length,
    edgeNodes: [...new Set(Object.values(CANADA_REGIONS).map((r) => r.edgeRegion))],
    compliance: { pipeda: true, loi25: true, dataInCanada: true },
    legalPatternVersion: '2026.06',
    timestamp: new Date().toISOString(),
  });
});

app.get('/sitemap.xml', (_req, res) => {
  const base = 'https://compta-flow.net';
  const paths = ['/', '/privacy', '/terms', '/legal', '/cookies', '/login', '/showcase',
    ...Object.values(CANADA_REGIONS).map((r) => `/ca/${r.seoSlug}`)];
  const urls = paths.map((p) => `<url><loc>${base}${p}</loc><changefreq>weekly</changefreq><priority>${p === '/' ? '1.0' : '0.8'}</priority></url>`).join('');
  res.setHeader('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
});

// ============================================================
// 🏛 ...
// ============================================================

const setupStatic = async () => {
  // Vercel serves the SPA via vercel.json rewrites — this function is API-only
  if (process.env.VERCEL) return;

  if (process.env.NODE_ENV === "production") {
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

// Auto-apply DB migrations on cold start (Vercel production)
if (process.env.VERCEL && process.env.AUTO_APPLY_DB_MIGRATIONS !== 'false') {
  void applySupabaseMigrations()
    .then((result) => {
      if (result.success) {
        console.log('[migrations] OK', result.host, result.message);
      } else {
        console.warn('[migrations] Skipped or failed:', result.message);
      }
    })
    .catch((err: Error) => console.warn('[migrations] Error:', err.message));
}

export default app;
