import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import Stripe from 'stripe';
import * as paypal from '@paypal/checkout-server-sdk';
import dotenv from 'dotenv';
dotenv.config();

// PayPal Setup
const paypalClient = new paypal.core.PayPalHttpClient(
  new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID || 'sb',
    process.env.PAYPAL_CLIENT_SECRET || 'sb'
  )
);

/**
 * 4. Audit de Production - Config
 * STRIPE_SECRET_KEY doit être ajoutée aux variables d'environnement.
 */
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_...';
// Initialize Stripe lazily to avoid crashing if key is missing during build
function getStripe() {
  return new Stripe(stripeKey, { apiVersion: '2023-10-16' } as any);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());

  // 3. Webhook de réception post-paiement (Stripe vers n8n) - DOIT être avant express.json()
  app.post('/api/webhook/stripe', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
      if (!webhookSecret) {
        // Mode développement / local sans secret Stripe (Parsing manuel requis car express.raw est utilisé)
        event = JSON.parse(req.body.toString());
      } else {
        const stripe = getStripe();
        event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
      }
    } catch (err: any) {
      console.error(`Erreur de signature Webhook : ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Acheminement / Automatisation n8n
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log(`✅ Paiement validé pour ${session.customer_email}`);
      
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
      if (n8nWebhookUrl) {
         try {
           console.log("Transmission du payload à n8n...");
           await fetch(n8nWebhookUrl, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(event) // Le payload est purement transmis tel quel
           });
           console.log("Transmission à n8n réussie.");
         } catch(e) {
           console.error("Erreur de transmission n8n:", e);
         }
      } else {
         console.log("N8N_WEBHOOK_URL non configuré. Le système tourne en vase clos.");
      }
    }

    res.json({ received: true });
  });

  app.use(express.json());

  // 2. Tunnel de Service: Création de session Stripe sécurisée
  app.post('/api/payment', async (req, res) => {
    try {
      const { customerData, priceId } = req.body;
      
      // Validation stricte (Validation de données requise par le cahier des charges)
      if (!customerData.neq || !/^\d{10}$/.test(customerData.neq)) {
        return res.status(400).json({ error: "NEQ invalide. Doit comporter 10 chiffres." });
      }
      if (!customerData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
        return res.status(400).json({ error: "Format d'email invalide." });
      }

      const stripe = getStripe();
      
      // Payload JSON réel de Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: customerData.email,
        metadata: {
          neq: customerData.neq,
          nas: customerData.nas ? 'FOURNI' : 'NON_FOURNI',
          entreprise: customerData.company
        },
        line_items: [
          {
            price_data: {
              currency: 'cad',
              product_data: {
                name: 'Services Comptables - Intégration',
              },
              unit_amount: priceId * 100, // En cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get('host')}/onboarding?error=payment_cancelled`,
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // 2.1 PayPal: Création de commande
  app.post('/api/paypal/create-order', async (req, res) => {
    try {
      const { amount } = req.body;
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'CAD',
            value: amount.toString()
          }
        }]
      });

      const order = await paypalClient.execute(request);
      res.json({ id: order.result.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2.2 PayPal: Capture de commande
  app.post('/api/paypal/capture-order', async (req, res) => {
    try {
      const { orderID, customerData } = req.body;
      const request = new paypal.orders.OrdersCaptureRequest(orderID);
      request.requestBody({});
      const capture = await paypalClient.execute(request);
      
      if (capture.result.status === 'COMPLETED') {
        console.log(`✅ PayPal: Paiement validé pour ${customerData.email}`);
        // Notification n8n
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
        if (n8nWebhookUrl) {
          fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'PAYPAL_PAYMENT', status: 'SUCCESS', data: capture.result, customer: customerData })
          }).catch(e => console.error("n8n error:", e));
        }
      }
      res.json(capture.result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });



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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
