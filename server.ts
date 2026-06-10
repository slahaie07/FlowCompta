import express from 'express';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import Stripe from 'stripe';
import * as paypal from '@paypal/checkout-server-sdk';
import dotenv from 'dotenv';
dotenv.config();

// --- DATABASE LOCALE (AUTO-VIABILITÉ) ---
const DB_PATH = path.join(process.cwd(), 'local_db.json');
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], profiles: [], transactions: [], invoices: [] }, null, 2));
}

const getDb = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const saveDb = (data: any) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// PayPal Setup
const paypalClient = new paypal.core.PayPalHttpClient(
  new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID || 'sb',
    process.env.PAYPAL_CLIENT_SECRET || 'sb'
  )
);

const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_...';
function getStripe() {
  return new Stripe(stripeKey, { apiVersion: '2023-10-16' } as any);
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());

  // --- API D'AUTHENTIFICATION INTERNE (ALTERNATIVE SUPABASE) ---
  app.post('/api/auth/register', (req, res) => {
    const { email, password, displayName } = req.body;
    const db = getDb();
    if (db.users.find((u: any) => u.email === email)) return res.status(400).json({ error: "Email déjà utilisé" });
    
    const newUser = { id: `user_${Date.now()}`, email, password, role: 'client' };
    db.users.push(newUser);
    saveDb(db);
    res.json({ user: newUser });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const db = getDb();
    const user = db.users.find((u: any) => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: "Identifiants invalides" });
    res.json({ user });
  });

  // --- GESTION DES PROFILS INTERNE ---
  app.get('/api/profile/:id', (req, res) => {
    const db = getDb();
    const profile = db.profiles.find((p: any) => p.id === req.params.id);
    if (!profile) return res.status(404).json({ error: "Profil non trouvé" });
    res.json(profile);
  });

  app.post('/api/profile', (req, res) => {
    const profileData = req.body;
    const db = getDb();
    const index = db.profiles.findIndex((p: any) => p.id === profileData.id);
    if (index !== -1) db.profiles[index] = profileData;
    else db.profiles.push(profileData);
    saveDb(db);
    res.json({ success: true });
  });

  // 3. Webhook de réception post-paiement (Stripe vers n8n)
  app.post('/api/webhook/stripe', express.raw({type: 'application/json'}), async (req, res) => {
    // ... (Logique Stripe existante)
    res.json({ received: true });
  });

  app.use(express.json());

  // --- SIMULATEUR DE PAIEMENT (ALTERNATIVE VIABLE) ---
  app.post('/api/payment/simulate', async (req, res) => {
    const { customerData, amount } = req.body;
    console.log(`[SIMULATION] Paiement de ${amount}$ pour ${customerData.email}`);
    
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const sessionId = `sim_${Date.now()}`;
    res.json({ 
      id: sessionId, 
      url: `/success?session_id=${sessionId}`,
      simulated: true 
    });
  });

  app.post('/api/payment', async (req, res) => {
    // ... (Logique Stripe existante)
  });

  // ... (Rest of PayPal routes)

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`
🚀 COMPTAFLOW EST OPÉRATIONNEL (MODE TOTAL AUTONOME)
---------------------------------------------------
Serveur : http://localhost:${PORT}
Base de données : local_db.json (Active)
Mode Simulation : Disponible (Aucune clé requise)
---------------------------------------------------
    `);
  });
}

startServer();
