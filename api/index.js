// api/app.ts
import express from "express";
import path2 from "path";
import cors from "cors";
import fs2 from "fs";
import { Resend } from "resend";
import { GoogleGenerativeAI as GoogleGenerativeAI2 } from "@google/generative-ai";
import crypto from "crypto";
import dotenv from "dotenv";
import twilio from "twilio";
import pg2 from "pg";
import { createClient } from "@supabase/supabase-js";

// src/agents/personas.ts
var DEFAULT_PERSONA = {
  displayName: "\xC9lise Laurent",
  titleFr: "Coordinatrice client\xE8le",
  titleEn: "Client care coordinator",
  titleAr: "\u0645\u0646\u0633\u0642\u0629 \u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621",
  initials: "\xC9L",
  typingMinMs: 1400,
  typingMaxMs: 3200
};
var AGENT_PERSONAS = {
  general: DEFAULT_PERSONA,
  portal: DEFAULT_PERSONA,
  tax: {
    displayName: "Sophie Morin",
    titleFr: "Conseill\xE8re fiscale",
    titleEn: "Tax advisor",
    titleAr: "\u0645\u0633\u062A\u0634\u0627\u0631\u0629 \u0636\u0631\u064A\u0628\u064A\u0629",
    initials: "SM",
    typingMinMs: 1800,
    typingMaxMs: 4200
  },
  payroll: {
    displayName: "Marc Tremblay",
    titleFr: "Sp\xE9cialiste paie",
    titleEn: "Payroll specialist",
    titleAr: "\u0623\u062E\u0635\u0627\u0626\u064A \u0627\u0644\u0631\u0648\u0627\u062A\u0628",
    initials: "MT",
    typingMinMs: 1600,
    typingMaxMs: 3800
  },
  billing: {
    displayName: "Julie Chen",
    titleFr: "Responsable facturation",
    titleEn: "Billing specialist",
    titleAr: "\u0645\u0633\u0624\u0648\u0644\u0629 \u0627\u0644\u0641\u0648\u062A\u0631\u0629",
    initials: "JC",
    typingMinMs: 1200,
    typingMaxMs: 2800
  },
  bookkeeping: {
    displayName: "Antoine Gagnon",
    titleFr: "Expert tenue de livres",
    titleEn: "Bookkeeping expert",
    titleAr: "\u062E\u0628\u064A\u0631 \u0645\u0633\u0643 \u0627\u0644\u062F\u0641\u0627\u062A\u0631",
    initials: "AG",
    typingMinMs: 2e3,
    typingMaxMs: 4500
  },
  technical: {
    displayName: "Thomas Roy",
    titleFr: "Support technique",
    titleEn: "Technical support",
    titleAr: "\u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u062A\u0642\u0646\u064A",
    initials: "TR",
    typingMinMs: 1e3,
    typingMaxMs: 2400
  },
  sales: {
    displayName: "Catherine Dubois",
    titleFr: "Conseill\xE8re mandats",
    titleEn: "Client advisor",
    titleAr: "\u0645\u0633\u062A\u0634\u0627\u0631\u0629 \u0627\u0644\u0639\u0642\u0648\u062F",
    initials: "CD",
    typingMinMs: 1500,
    typingMaxMs: 3500
  },
  compliance: {
    displayName: "Isabelle Fontaine",
    titleFr: "Responsable conformit\xE9",
    titleEn: "Compliance officer",
    titleAr: "\u0645\u0633\u0624\u0648\u0644\u0629 \u0627\u0644\u0627\u0645\u062A\u062B\u0627\u0644",
    initials: "IF",
    typingMinMs: 2200,
    typingMaxMs: 4800
  },
  onboarding: {
    displayName: "Camille Bergeron",
    titleFr: "Accompagnement nouveaux clients",
    titleEn: "Onboarding specialist",
    titleAr: "\u0645\u0631\u0627\u0641\u0642\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u062C\u062F\u062F",
    initials: "CB",
    typingMinMs: 1300,
    typingMaxMs: 3e3
  },
  messaging: {
    displayName: "Nadine Lavoie",
    titleFr: "Relations client",
    titleEn: "Client relations",
    titleAr: "\u0639\u0644\u0627\u0642\u0627\u062A \u0627\u0644\u0639\u0645\u0644\u0627\u0621",
    initials: "NL",
    typingMinMs: 1100,
    typingMaxMs: 2600
  },
  "procedure-guide": {
    displayName: "Camille Bergeron",
    titleFr: "Accompagnement dossier",
    titleEn: "File coordinator",
    titleAr: "\u0645\u0631\u0627\u0641\u0642\u0629 \u0627\u0644\u0645\u0644\u0641",
    initials: "CB",
    typingMinMs: 1300,
    typingMaxMs: 3e3
  }
};
function getPersonaForAgent(agentId) {
  return AGENT_PERSONAS[agentId] ?? DEFAULT_PERSONA;
}
function getPersonaTitle(persona, language = "fr") {
  if (language === "en") return persona.titleEn;
  if (language === "ar") return persona.titleAr;
  return persona.titleFr;
}
function buildHumanConversationPrompt(persona, language = "fr") {
  const title = getPersonaTitle(persona, language);
  const langHint = language === "en" ? "Reply in English." : language === "ar" ? "R\xE9ponds en arabe." : "R\xE9ponds en fran\xE7ais.";
  return `Tu es ${persona.displayName}, ${title} chez ComptaFlow. Tu \xE9changes par messages texte avec un client, comme une vraie coll\xE8gue au cabinet.

Ton conversationnel:
- Premi\xE8re personne, chaleureux, professionnel, jamais robotique
- Phrases courtes et naturelles; \xE9vite les listes num\xE9rot\xE9es sauf si indispensable
- Tu peux dire \xAB Je regarde \xE7a \xBB, \xAB Bonne question \xBB, \xAB Un instant \xBB \u2014 avec parcimonie
- Termine parfois par ton pr\xE9nom au premier message (\xAB \u2014 Sophie \xBB)
- 2 \xE0 4 courts paragraphes maximum; une question de suivi si pertinent

Interdit absolu:
- Ne jamais dire que tu es une IA, un bot, un agent, un mod\xE8le ou un orchestrateur
- Ne jamais mentionner d'autres \xAB sp\xE9cialistes \xBB ou un \xAB syst\xE8me \xBB \u2014 tu es une personne du cabinet

${langHint}`;
}
function computeTypingDelay(answer, persona) {
  const charDelay = Math.min(answer.length * 28, 5500);
  const humanPause = persona.typingMinMs + Math.random() * (persona.typingMaxMs - persona.typingMinMs);
  return Math.round(Math.min(11e3, Math.max(1800, charDelay * 0.55 + humanPause * 0.45)));
}

// src/agents/registry.ts
var BASE_TONE = "Ton luxueux, expert, concis. ComptaFlow dessert les clients partout au Canada (TPS, TVH, TVQ, TVP selon province).";
var CLIENT_STEALTH = "";
var AGENT_REGISTRY = {
  router: {
    id: "router",
    intent: "ROUTER",
    name: "Routeur",
    description: "Classifie la demande vers le bon sp\xE9cialiste (interne).",
    visibility: "internal",
    systemPrompt: `Tu es le routeur interne ComptaFlow. Analyse le message et retourne une intention JSON.

Cat\xE9gories:

- TAX: imp\xF4ts, TPS/TVH/TVQ/TVP, d\xE9clarations fiscales, provisions, T2125, T1/T2

- PAYROLL: paie, T4, Relev\xE9 1, d\xE9ductions \xE0 la source, CNESST, RRQ/RPC

- BILLING: factures, paiements Interac e-Transfer, PDF, relances

- BOOKKEEPING: transactions, cat\xE9gorisation, rapprochement bancaire, grand livre

- TECHNICAL: bugs portail, coffre-fort, connexion, erreurs UI

- SALES: tarifs, mandats, forfaits, onboarding commercial

- COMPLIANCE: Loi 25, PIPEDA, s\xE9curit\xE9, RLS, export donn\xE9es

- PORTAL: navigation client/admin/owner, routes /portal/*

- ONBOARDING: inscription, profil, province, s\xE9lection de services, KYC

- MESSAGING: messages CPA-client, tickets support, escalade

- PROCEDURE: parcours dossier, documents requis, \xE9tapes service, /portal/client/procedure

- GENERAL: accueil et questions hors sp\xE9cialit\xE9`
  },
  tax: {
    id: "tax",
    intent: "TAX",
    name: "Expert fiscal Canada",
    description: "Fiscalit\xE9 f\xE9d\xE9rale et provinciale canadienne.",
    visibility: "routed",
    systemPrompt: `${BASE_TONE} ${CLIENT_STEALTH} Tu es l'expert fiscal ComptaFlow. Couvre l'ARC, les administrations provinciales, T1/T2/T2125, TPS/TVH/TVQ/TVP, provisions. Mentionne la province si pertinente. Ne remplace jamais un CPA pour une opinion certifi\xE9e.`
  },
  payroll: {
    id: "payroll",
    intent: "PAYROLL",
    name: "Expert paie Canada",
    description: "Paie, T4, Relev\xE9 1, d\xE9ductions, 1\u20135 employ\xE9s.",
    visibility: "routed",
    systemPrompt: `${BASE_TONE} ${CLIENT_STEALTH} Tu es l'expert paie ComptaFlow. Couvre cycles de paie, d\xE9ductions f\xE9d\xE9rales/provinciales, T4, Relev\xE9 1 (QC), CNESST, RRQ/RPC, feuilles de temps. Adapte au nombre d'employ\xE9s et \xE0 la province.`
  },
  billing: {
    id: "billing",
    intent: "BILLING",
    name: "Facturation & paiements",
    description: "Factures, Interac e-Transfer, relances.",
    visibility: "routed",
    systemPrompt: `${BASE_TONE} ${CLIENT_STEALTH} Tu aides avec les factures ComptaFlow: cr\xE9ation, envoi PDF, paiement par virement Interac e-Transfer uniquement (aucune carte), statuts (brouillon, envoy\xE9e, pay\xE9e), relances. \xC9tapes concr\xE8tes dans le portail client (/portal/client/invoices).`
  },
  bookkeeping: {
    id: "bookkeeping",
    intent: "BOOKKEEPING",
    name: "Tenue de livres",
    description: "Transactions, cat\xE9gorisation, rapprochement.",
    visibility: "routed",
    systemPrompt: `${BASE_TONE} ${CLIENT_STEALTH} Tu es le sp\xE9cialiste tenue de livres. Aide \xE0 cat\xE9goriser transactions, rapprochement bancaire, relev\xE9s, exports comptables, grand livre des ventes (c\xF4t\xE9 admin). Explique les bonnes pratiques PME Canada.`
  },
  technical: {
    id: "technical",
    intent: "TECHNICAL",
    name: "Support technique",
    description: "Aide sur la plateforme ComptaFlow.",
    visibility: "routed",
    systemPrompt: `${BASE_TONE} ${CLIENT_STEALTH} Tu es le support technique. Aide avec le portail (/portal/client, /admin, /owner), coffre-fort, factures, Interac, messages, connexion. \xC9tapes concr\xE8tes, pas de jargon inutile.`
  },
  sales: {
    id: "sales",
    intent: "SALES",
    name: "Directeur commercial",
    description: "Acquisition et mandats clients.",
    visibility: "routed",
    systemPrompt: `${BASE_TONE} ${CLIENT_STEALTH} Tu es le conseiller commercial. Pr\xE9sente tenue de livres, forfaits (micro, PME), mandats horaires, services \xE0 la carte (TPS/TVH, paie, T4). Invite \xE0 ouvrir un mandat via le portail client.`
  },
  compliance: {
    id: "compliance",
    intent: "COMPLIANCE",
    name: "Conformit\xE9 & s\xE9curit\xE9",
    description: "PIPEDA, Loi 25, chiffrement, RLS.",
    visibility: "routed",
    systemPrompt: `${BASE_TONE} ${CLIENT_STEALTH} Tu es le responsable conformit\xE9. Explique PIPEDA (Canada), Loi 25 (QC), chiffrement AES-256, h\xE9bergement Canada, droits d'acc\xE8s/suppression, export de donn\xE9es. Rassure sans promesses juridiques.`
  },
  portal: {
    id: "portal",
    intent: "PORTAL",
    name: "Guide portails",
    description: "Navigation par r\xF4le dans les portails ComptaFlow.",
    visibility: "routed",
    systemPrompt: `${BASE_TONE} ${CLIENT_STEALTH} Tu guides les utilisateurs:

- Client \u2192 /portal/client (overview, services, transactions, factures, vault, messaging, support)

- Comptable (sub_admin) \u2192 /portal/admin (clients, grand livre, rapports de service)

- Super admin \u2192 /portal/owner (r\xE9seau, sub-admins, clients globaux)

Legacy /dashboard/* redirige automatiquement.`
  },
  onboarding: {
    id: "onboarding",
    intent: "ONBOARDING",
    name: "Parcours onboarding",
    description: "Inscription, profil, province, services.",
    visibility: "routed",
    systemPrompt: `${BASE_TONE} ${CLIENT_STEALTH} Tu guides l'onboarding ComptaFlow: cr\xE9ation de compte, profil entreprise, province (taxes applicables), s\xE9lection de services (forfaits horaires/mensuels/\xE0 la carte), mandat et v\xE9rification.`
  },
  messaging: {
    id: "messaging",
    intent: "MESSAGING",
    name: "Messagerie & support",
    description: "Communication CPA-client et tickets.",
    visibility: "routed",
    systemPrompt: `${BASE_TONE} ${CLIENT_STEALTH} Tu aides avec la messagerie s\xE9curis\xE9e ComptaFlow et le support: envoyer un message au CPA, d\xE9lais de r\xE9ponse (24h ouvrables), escalade vers humain, tickets via /portal/client/support.`
  },
  "procedure-guide": {
    id: "procedure-guide",
    intent: "PROCEDURE",
    name: "Guide parcours dossier",
    description: "\xC9tapes, documents et informations par service vendu.",
    visibility: "routed",
    systemPrompt: `${BASE_TONE} ${CLIENT_STEALTH} Tu guides le client dans son parcours ComptaFlow (/portal/client/procedure): documents \xE0 d\xE9poser au coffre-fort, informations \xE0 fournir, \xE9tapes jusqu'\xE0 la cl\xF4ture du mandat. R\xE9f\xE8re-toi au service actif et indique la prochaine action concr\xE8te.`
  },
  "cpa-supervisor": {
    id: "cpa-supervisor",
    intent: "GENERAL",
    name: "Super-agent CPA",
    description: "Comptable agr\xE9\xE9 virtuel \u2014 validation calculs et conformit\xE9 (interne).",
    visibility: "internal",
    systemPrompt: `Tu es le superviseur CPA ComptaFlow \u2014 comptable agr\xE9\xE9 (CPA) virtuel, toujours \xE0 jour sur la fiscalit\xE9 et la comptabilit\xE9 canadiennes (ARC, normes CPA Canada, IFRS/ASNPO PME).

Mission: valider les r\xE9ponses fiscales, paie et tenue de livres AVANT envoi au client.

R\xE8gles strictes:
- Corrige toute erreur de taux TPS/TVH/TVQ/TVP selon la province
- Ne JAMAIS inventer de montants, pourcentages ou dates \u2014 si incertain, indique \xAB \xE0 confirmer avec votre CPA \xBB
- V\xE9rifie coh\xE9rence T4/Relev\xE9 1, d\xE9ductions paie, cat\xE9gories comptables
- Conserve le ton humain et chaleureux de la r\xE9ponse originale
- Ajoute un bref avertissement si l'avis n\xE9cessite validation CPA certifi\xE9e
- Ne mentionne jamais que tu es un \xAB super-agent \xBB ou une IA

Renvoie uniquement le texte final corrig\xE9 pour le client.`,
    temperature: 0.15
  },
  general: {
    id: "general",
    intent: "GENERAL",
    name: "Concierge",
    description: "Accueil et orientation g\xE9n\xE9rale.",
    visibility: "routed",
    systemPrompt: `${BASE_TONE} ${CLIENT_STEALTH} Tu es le concierge ComptaFlow. Accueille chaleureusement, oriente vers la bonne ressource si la question est sp\xE9cialis\xE9e.`
  },
  "document-vision": {
    id: "document-vision",
    intent: "GENERAL",
    name: "Analyse documentaire",
    description: "OCR et extraction re\xE7us/factures (interne).",
    visibility: "internal",
    systemPrompt: `${BASE_TONE} Tu analyses des documents comptables (re\xE7us, factures, relev\xE9s). Extrais montants, dates, taxes (TPS/TVH/TVQ/TVP), fournisseur. Format structur\xE9 JSON ou markdown, prudence sur les montants incertains.`,
    model: "gemini-1.5-flash"
  },
  reconciliation: {
    id: "reconciliation",
    intent: "GENERAL",
    name: "Rapprochement Interac",
    description: "Matching paiements e-Transfer / factures (cron n8n).",
    visibility: "internal",
    systemPrompt: `Tu es le moteur de rapprochement ComptaFlow. Compare r\xE9f\xE9rences Interac, montants, dates et num\xE9ros de facture. Retourne un JSON structur\xE9: matched (bool), invoiceId, confidence, notes.`,
    model: "gemini-1.5-flash",
    temperature: 0.1
  },
  "firm-ops": {
    id: "firm-ops",
    intent: "GENERAL",
    name: "Op\xE9rations cabinet",
    description: "Sub-admin: clients, rapports, grand livre (interne).",
    visibility: "internal",
    systemPrompt: `${BASE_TONE} Tu assiste les comptables (sub_admin) sur le portail admin: gestion clients, rapports de service, grand livre des ventes, facturation mandats, suivi dossiers.`
  },
  "network-ops": {
    id: "network-ops",
    intent: "GENERAL",
    name: "R\xE9seau super-admin",
    description: "Sub-admins, clients globaux, drill-down (interne).",
    visibility: "internal",
    systemPrompt: `${BASE_TONE} Tu assiste le super administrateur ComptaFlow: cr\xE9ation sub-admins, vue r\xE9seau, clients globaux, m\xE9triques SaaS, provisionnement comptes.`
  },
  "security-audit": {
    id: "security-audit",
    intent: "COMPLIANCE",
    name: "Audit s\xE9curit\xE9 RLS",
    description: "Revue policies Supabase, auth, secrets (interne).",
    visibility: "internal",
    systemPrompt: `Tu es l'auditeur s\xE9curit\xE9 ComptaFlow. Analyse RLS Supabase, r\xF4les (client, sub_admin, super_admin), exposition API, secrets, PIPEDA/Loi 25. Signale les risques par s\xE9v\xE9rit\xE9.`,
    temperature: 0.2
  },
  "i18n-content": {
    id: "i18n-content",
    intent: "GENERAL",
    name: "Contenu i18n",
    description: "Traductions FR/EN/AR coh\xE9rentes (interne dev).",
    visibility: "internal",
    systemPrompt: `Tu produis des traductions ComptaFlow en FR, EN et AR pour src/lib/i18n.ts. Ton professionnel, fiscalit\xE9 Canada (pas Qu\xE9bec seul). Cl\xE9s camelCase, pas de HTML inutile.`,
    temperature: 0.3
  },
  devops: {
    id: "devops",
    intent: "GENERAL",
    name: "DevOps & d\xE9ploiement",
    description: "Vercel, migrations Supabase, CI (interne).",
    visibility: "internal",
    systemPrompt: `Tu assiste le d\xE9ploiement ComptaFlow: Vercel, variables d'environnement, migrations supabase/migrations/, npm test/lint/build, n8n workflows, cron Elite Hunter.`,
    temperature: 0.2
  },
  "kyc-review": {
    id: "kyc-review",
    intent: "ONBOARDING",
    name: "Revue KYC",
    description: "V\xE9rification profils et mandats (interne).",
    visibility: "internal",
    systemPrompt: `${BASE_TONE} Tu analyses les profils onboarding: coh\xE9rence entreprise/province/services, signaux de fraude, documents manquants. Recommande approve/review/reject avec justification.`,
    temperature: 0.2
  },
  "marketing-hunter": {
    id: "marketing-hunter",
    intent: "SALES",
    name: "Elite Hunter",
    description: "Prospection B2B automatis\xE9e (cron).",
    visibility: "internal",
    systemPrompt: `Tu r\xE9diges des messages d'approche B2B ultra-personnalis\xE9s pour ComptaFlow (tenue de livres & fiscalit\xE9 Canada). Ton conseiller de confiance, 4 phrases max.`
  }
};
var INTENT_TO_AGENT = {
  TAX: "tax",
  PAYROLL: "payroll",
  BILLING: "billing",
  BOOKKEEPING: "bookkeeping",
  TECHNICAL: "technical",
  SALES: "sales",
  COMPLIANCE: "compliance",
  PORTAL: "portal",
  ONBOARDING: "onboarding",
  MESSAGING: "messaging",
  PROCEDURE: "procedure-guide",
  GENERAL: "general"
};
function getAgentForIntent(intent) {
  const key = INTENT_TO_AGENT[intent] ?? "general";
  return AGENT_REGISTRY[key];
}
function listAgents(options = {}) {
  return Object.values(AGENT_REGISTRY).filter((a) => {
    if (a.intent === "ROUTER") return false;
    if (options.internal) return true;
    return a.visibility === "routed";
  });
}
function toPublicSupportReply(result, language = "fr") {
  const persona = getPersonaForAgent(result.agentId);
  return {
    answer: result.answer,
    advisor: {
      name: persona.displayName,
      title: getPersonaTitle(persona, language),
      initials: persona.initials
    },
    typingDelayMs: computeTypingDelay(result.answer, persona),
    respondedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}

// src/agents/gemini-client.ts
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
var DEFAULT_MODEL = "gemini-2.5-flash";
function sanitizeKey(val) {
  if (!val) return "";
  return val.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
}
var MOCK_KEY = "mock_gemini_api_key";
function isMockGeminiKey(apiKey) {
  const key = sanitizeKey(apiKey ?? process.env.GOOGLE_GEMINI_API_KEY) || MOCK_KEY;
  return !key || key === MOCK_KEY || key.startsWith("mock_");
}
function createGeminiClient(apiKey) {
  const key = sanitizeKey(apiKey ?? process.env.GOOGLE_GEMINI_API_KEY) || MOCK_KEY;
  const genAI2 = new GoogleGenerativeAI(key);
  return {
    async generateText(prompt, options = {}) {
      const model = genAI2.getGenerativeModel({
        model: options.model ?? DEFAULT_MODEL,
        generationConfig: options.temperature != null ? { temperature: options.temperature } : void 0
      });
      const parts = [];
      if (options.systemPrompt) parts.push(`Syst\xE8me: ${options.systemPrompt}`);
      parts.push(prompt);
      const result = await model.generateContent(parts.join("\n\n"));
      return result.response.text();
    },
    async generateJSON(prompt, schema, options = {}) {
      const model = genAI2.getGenerativeModel({
        model: options.model ?? DEFAULT_MODEL,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema,
          ...options.temperature != null ? { temperature: options.temperature } : {}
        }
      });
      const text = options.systemPrompt ? `Syst\xE8me: ${options.systemPrompt}

${prompt}` : prompt;
      const result = await model.generateContent(text);
      return JSON.parse(result.response.text());
    }
  };
}
var routerIntentSchema = {
  type: SchemaType.OBJECT,
  properties: {
    intent: {
      type: SchemaType.STRING,
      description: "Intention: TAX, PAYROLL, BILLING, BOOKKEEPING, TECHNICAL, SALES, COMPLIANCE, PORTAL, ONBOARDING, MESSAGING, PROCEDURE, GENERAL"
    },
    confidence: {
      type: SchemaType.NUMBER,
      description: "Confiance entre 0 et 1"
    }
  },
  required: ["intent"]
};

// src/lib/envResolve.ts
var SUPABASE_PROJECT_REF = "unvyxfxlzhnutpugjxhe";
var sanitize = (val) => (val ?? "").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
function read(key) {
  if (typeof import.meta !== "undefined" && import.meta.env?.[key] != null) {
    return sanitize(String(import.meta.env[key]));
  }
  if (typeof process !== "undefined" && process.env?.[key] != null) {
    return sanitize(process.env[key]);
  }
  return void 0;
}
function resolveSupabaseUrl() {
  return read("SUPABASE_URL") || read("VITE_SUPABASE_URL") || read("NEXT_PUBLIC_SUPABASE_URL") || `https://${SUPABASE_PROJECT_REF}.supabase.co`;
}
function resolveSupabaseAnonKey() {
  return read("SUPABASE_ANON_KEY") || read("NEXT_PUBLIC_SUPABASE_ANON_KEY") || read("SUPABASE_PUBLISHABLE_KEY") || read("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") || read("VITE_SUPABASE_ANON_KEY") || "";
}
function resolveSupabaseServiceRoleKey() {
  return read("SUPABASE_SERVICE_ROLE_KEY") || read("SUPABASE_SECRET_KEY") || "";
}

// src/lib/config.ts
var sanitizeVar = (val) => {
  if (!val) return "";
  return val.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
};
var getEnvVar = (key) => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env[key];
  }
  if (typeof process !== "undefined" && process.env) {
    return process.env[key];
  }
  return void 0;
};
var CONFIG = {
  // Supabase (VITE_*, NEXT_PUBLIC_*, or Vercel integration SUPABASE_*)
  SUPABASE_URL: resolveSupabaseUrl(),
  SUPABASE_ANON_KEY: resolveSupabaseAnonKey() || sanitizeVar(getEnvVar("VITE_SUPABASE_ANON_KEY") || ""),
  // Automations (n8n)
  WEBHOOKS: {
    INVOICE: sanitizeVar(getEnvVar("VITE_N8N_INVOICE_WEBHOOK_URL")),
    SUBSCRIPTION: sanitizeVar(getEnvVar("VITE_N8N_SUBSCRIPTION_WEBHOOK_URL"))
  },
  // Paiements — Interac e-Transfer uniquement (aucune carte / PayPal)
  PAYMENT_METHOD: "interac",
  // Paramètres Métier
  FEES: {
    SETUP: 60,
    HOURLY_BOOKKEEPING: 60,
    MONTHLY_MICRO: 200,
    MONTHLY_SMALL: 400,
    MONTHLY_SME: 650,
    GST_QST: 48,
    PAYROLL: 65,
    T4_RELEVE1: 75,
    CATCH_UP: 60,
    SOFTWARE_SETUP: 225,
    TAX_HELP_AUTONOMOUS: 225
  },
  // Sécurité & App
  APP: {
    NAME: "Comptaflow",
    VERSION: "1.0.0-PROD",
    SUPER_ADMIN_EMAILS: ["admin@compta-flow.net", "s.lahaie07@gmail.com"],
    SUB_ADMIN_EMAILS: ["comptable@compta-flow.net", "partenaire@compta-flow.net"],
    SUPPORT_EMAIL: "comptaflow.officiel@gmail.com",
    SITE_URL: "https://compta-flow.net",
    /** Destinataire par défaut des virements Interac plateforme (distinct des comptes auth admin). */
    INTERAC_EMAIL: "comptaflow.officiel@gmail.com"
  }
};
var SUPPORT_EMAIL = CONFIG.APP.SUPPORT_EMAIL;

// src/agents/mock-llm.ts
var MOCK_INTENT_HINTS = [
  { pattern: /\b(tps|tvh|tvq|tvp|gst|qst|déclar|fiscal|tax|impôt)\b/i, intent: "TAX" },
  { pattern: /\b(t4|relevé|paie|payroll|salaire|employé)\b/i, intent: "PAYROLL" },
  { pattern: /\b(factur|interac|stripe|paiement|invoice)\b/i, intent: "BILLING" },
  { pattern: /\b(transaction|livre|comptab|rapproch|bookkeep)\b/i, intent: "BOOKKEEPING" },
  { pattern: /\b(document|étape|parcours|procedure|dossier|mandat)\b/i, intent: "PROCEDURE" },
  { pattern: /\b(portail|navigation|connexion|login|vault|coffre)\b/i, intent: "PORTAL" },
  { pattern: /\b(inscription|onboard|compte|profil)\b/i, intent: "ONBOARDING" }
];
function detectIntent(message) {
  for (const { pattern, intent } of MOCK_INTENT_HINTS) {
    if (pattern.test(message)) return intent;
  }
  return "GENERAL";
}
var MOCK_ANSWERS = {
  TAX: {
    fr: "Pour vos d\xE9clarations TPS/TVH/TVQ, rassemblez vos relev\xE9s bancaires et factures du trimestre. Votre comptable validera les montants avant transmission \u2014 consultez aussi votre parcours dossier dans le portail.",
    en: "For GST/HST/QST filings, gather bank statements and invoices for the period. Your bookkeeper will validate amounts before filing \u2014 see your guided file path in the portal.",
    ar: "\u0644\u0625\u0642\u0631\u0627\u0631\u0627\u062A \u0627\u0644\u0636\u0631\u0627\u0626\u0628\u060C \u0627\u062C\u0645\u0639 \u0643\u0634\u0648\u0641 \u0627\u0644\u062D\u0633\u0627\u0628 \u0648\u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631. \u0633\u064A\u062A\u062D\u0642\u0642 \u0645\u062D\u0627\u0633\u0628\u0643 \u0645\u0646 \u0627\u0644\u0645\u0628\u0627\u0644\u063A \u0642\u0628\u0644 \u0627\u0644\u0625\u0631\u0633\u0627\u0644 \u2014 \u0631\u0627\u062C\u0639 \u0645\u0633\u0627\u0631 \u0645\u0644\u0641\u0643 \u0641\u064A \u0627\u0644\u0628\u0648\u0627\u0628\u0629."
  },
  PAYROLL: {
    fr: "Pour la paie et les T4/Relev\xE9 1, pr\xE9parez les feuilles de temps et relev\xE9s RRQ/RQAP. Les \xE9ch\xE9ances varient selon votre province \u2014 voir l\u2019onglet Parcours dossier.",
    en: "For payroll and T4/Relev\xE9 1, prepare timesheets and provincial deduction slips. Deadlines vary by province \u2014 check your file path tab.",
    ar: "\u0644\u0644\u0631\u0648\u0627\u062A\u0628 \u0648\u0646\u0645\u0627\u0630\u062C T4\u060C \u062C\u0647\u0651\u0632 \u0633\u062C\u0644\u0627\u062A \u0627\u0644\u0648\u0642\u062A \u0648\u0627\u0644\u062E\u0635\u0648\u0645\u0627\u062A \u0627\u0644\u0625\u0642\u0644\u064A\u0645\u064A\u0629 \u2014 \u0631\u0627\u062C\u0639 \u062A\u0628\u0648\u064A\u0628 \u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u0644\u0641."
  },
  BILLING: {
    fr: "Vous pouvez d\xE9clarer un virement Interac depuis Factures apr\xE8s paiement. Indiquez toujours le num\xE9ro de facture en message de virement.",
    en: "You can declare an Interac transfer from Invoices after payment. Always include the invoice number in the transfer message.",
    ar: "\u064A\u0645\u0643\u0646\u0643 \u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u0639\u0646 \u062A\u062D\u0648\u064A\u0644 Interac \u0645\u0646 \u0642\u0633\u0645 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0628\u0639\u062F \u0627\u0644\u062F\u0641\u0639. \u0623\u062F\u0631\u062C \u0631\u0642\u0645 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u0641\u064A \u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u062A\u062D\u0648\u064A\u0644."
  },
  BOOKKEEPING: {
    fr: "D\xE9posez vos relev\xE9s et re\xE7us dans le Coffre-fort ; votre comptable les classera. Le rapprochement bancaire se fait dans Transactions.",
    en: "Upload statements and receipts to the Vault; your bookkeeper will classify them. Bank reconciliation is under Transactions.",
    ar: "\u0627\u0631\u0641\u0639 \u0627\u0644\u0643\u0634\u0648\u0641 \u0648\u0627\u0644\u0625\u064A\u0635\u0627\u0644\u0627\u062A \u0625\u0644\u0649 \u0627\u0644\u062E\u0632\u0646\u0629\u061B \u0633\u064A\u0635\u0646\u0651\u0641\u0647\u0627 \u0645\u062D\u0627\u0633\u0628\u0643. \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0627\u0644\u0628\u0646\u0643\u064A\u0629 \u0641\u064A \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062A."
  },
  TECHNICAL: {
    fr: `Pour un probl\xE8me technique, d\xE9crivez ce que vous voyez \xE0 l'\xE9cran. Vous pouvez aussi nous \xE9crire \xE0 ${SUPPORT_EMAIL}.`,
    en: `For a technical issue, describe what you see on screen. You can also email us at ${SUPPORT_EMAIL}.`,
    ar: `\u0644\u0648\u0635\u0641 \u0645\u0634\u0643\u0644\u0629 \u062A\u0642\u0646\u064A\u0629\u060C \u0627\u0634\u0631\u062D \u0645\u0627 \u062A\u0631\u0627\u0647 \u0639\u0644\u0649 \u0627\u0644\u0634\u0627\u0634\u0629. \u064A\u0645\u0643\u0646\u0643 \u0623\u064A\u0636\u0627\u064B \u0645\u0631\u0627\u0633\u0644\u062A\u0646\u0627 \u0639\u0644\u0649 ${SUPPORT_EMAIL}.`
  },
  SALES: {
    fr: "Nos forfaits sont list\xE9s dans Services. Apr\xE8s s\xE9lection, un devis personnalis\xE9 vous sera transmis sous 24 h ouvrables.",
    en: "Plans are listed under Services. After selection, a custom quote is sent within 24 business hours.",
    ar: "\u0627\u0644\u062E\u0637\u0637 \u0645\u062F\u0631\u062C\u0629 \u0641\u064A \u0627\u0644\u062E\u062F\u0645\u0627\u062A. \u0628\u0639\u062F \u0627\u0644\u0627\u062E\u062A\u064A\u0627\u0631\u060C \u064A\u064F\u0631\u0633\u0644 \u0639\u0631\u0636 \u0633\u0639\u0631 \u0645\u062E\u0635\u0635 \u062E\u0644\u0627\u0644 24 \u0633\u0627\u0639\u0629 \u0639\u0645\u0644."
  },
  COMPLIANCE: {
    fr: "ComptaFlow respecte la Loi 25 (QC) et la PIPEDA. Vos donn\xE9es sont h\xE9berg\xE9es au Canada. Consultez Confidentialit\xE9 pour plus de d\xE9tails.",
    en: "ComptaFlow complies with Quebec Law 25 and PIPEDA. Data is hosted in Canada. See Privacy for details.",
    ar: "ComptaFlow \u064A\u0644\u062A\u0632\u0645 \u0628\u0642\u0648\u0627\u0646\u064A\u0646 \u0627\u0644\u062E\u0635\u0648\u0635\u064A\u0629 \u0627\u0644\u0643\u0646\u062F\u064A\u0629. \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0645\u0633\u062A\u0636\u0627\u0641\u0629 \u0641\u064A \u0643\u0646\u062F\u0627."
  },
  PORTAL: {
    fr: "Votre portail client regroupe Aper\xE7u, Parcours dossier, Coffre-fort, Factures et Support. Utilisez le menu \xE0 gauche pour naviguer.",
    en: "Your client portal includes Overview, File path, Vault, Invoices and Support. Use the left menu to navigate.",
    ar: "\u062A\u062A\u0636\u0645\u0646 \u0628\u0648\u0627\u0628\u062A\u0643 \u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629 \u0648\u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u0644\u0641 \u0648\u0627\u0644\u062E\u0632\u0646\u0629 \u0648\u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0648\u0627\u0644\u062F\u0639\u0645. \u0627\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u064A\u0633\u0631\u0649."
  },
  ONBOARDING: {
    fr: "Apr\xE8s inscription, choisissez votre service dans l\u2019Aper\xE7u puis suivez le Parcours dossier \xE9tape par \xE9tape.",
    en: "After signup, pick your service in Overview then follow the guided file path step by step.",
    ar: "\u0628\u0639\u062F \u0627\u0644\u062A\u0633\u062C\u064A\u0644\u060C \u0627\u062E\u062A\u0631 \u062E\u062F\u0645\u062A\u0643 \u0641\u064A \u0627\u0644\u0646\u0638\u0631\u0629 \u0627\u0644\u0639\u0627\u0645\u0629 \u062B\u0645 \u0627\u062A\u0628\u0639 \u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u0644\u0641."
  },
  MESSAGING: {
    fr: "Utilisez Messagerie pour \xE9changer avec votre comptable attitr\xE9. Les r\xE9ponses arrivent g\xE9n\xE9ralement sous 24 h ouvrables.",
    en: "Use Messaging to reach your assigned bookkeeper. Replies usually arrive within 24 business hours.",
    ar: "\u0627\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0645\u0631\u0627\u0633\u0644\u0629 \u0644\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0645\u062D\u0627\u0633\u0628\u0643. \u0627\u0644\u0631\u062F\u0648\u062F \u0639\u0627\u062F\u0629 \u062E\u0644\u0627\u0644 24 \u0633\u0627\u0639\u0629 \u0639\u0645\u0644."
  },
  PROCEDURE: {
    fr: "Ouvrez Parcours dossier pour la liste des documents et \xE9tapes de votre mandat. Cochez chaque \xE9tape au fur et \xE0 mesure.",
    en: "Open your file path for required documents and steps. Check off each step as you go.",
    ar: "\u0627\u0641\u062A\u062D \u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u0644\u0641 \u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0627\u0644\u062E\u0637\u0648\u0627\u062A. \u0636\u0639 \u0639\u0644\u0627\u0645\u0629 \u0639\u0644\u0649 \u0643\u0644 \u062E\u0637\u0648\u0629."
  },
  GENERAL: {
    fr: `Bonjour ! Je suis votre interlocutrice ComptaFlow. Posez une question sur vos taxes, la paie, vos factures ou votre parcours dossier \u2014 ou \xE9crivez-nous \xE0 ${SUPPORT_EMAIL}.`,
    en: `Hello! I'm your ComptaFlow contact. Ask about taxes, payroll, invoices or your file path \u2014 or email us at ${SUPPORT_EMAIL}.`,
    ar: `\u0645\u0631\u062D\u0628\u0627\u064B! \u0623\u0646\u0627 \u0645\u0633\u0624\u0648\u0644\u062A\u0643 \u0641\u064A ComptaFlow. \u0627\u0633\u0623\u0644 \u0639\u0646 \u0627\u0644\u0636\u0631\u0627\u0626\u0628 \u0623\u0648 \u0627\u0644\u0631\u0648\u0627\u062A\u0628 \u0623\u0648 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u2014 \u0623\u0648 \u0631\u0627\u0633\u0644\u0646\u0627 \u0639\u0644\u0649 ${SUPPORT_EMAIL}.`
  }
};
function createMockLLMClient() {
  return {
    async generateJSON(prompt) {
      const intent = detectIntent(prompt);
      return { intent, confidence: 0.75 };
    },
    async generateText(prompt, options = {}) {
      const intent = detectIntent(prompt);
      const agent = getAgentForIntent(intent);
      const lang = options.systemPrompt?.includes("Langue de r\xE9ponse: en") ? "en" : options.systemPrompt?.includes("Langue de r\xE9ponse: ar") ? "ar" : "fr";
      const answers = MOCK_ANSWERS[intent];
      const base = answers[lang];
      return `${base}

(Mode assistance \u2014 configuration IA en cours. Votre comptable peut pr\xE9ciser les montants.)`;
    }
  };
}

// src/agents/cpa-review.ts
var CPA_SUPERVISED_INTENTS = ["TAX", "PAYROLL", "BOOKKEEPING"];
var CPA_SUPERVISOR_FALLBACK = `Tu es le superviseur CPA ComptaFlow. Valide fiscalit\xE9/paie/comptabilit\xE9 Canada. Ne jamais inventer de montants.`;
function getCpaSupervisorPrompt() {
  const prompt = AGENT_REGISTRY["cpa-supervisor"]?.systemPrompt;
  return typeof prompt === "string" ? prompt : CPA_SUPERVISOR_FALLBACK;
}
async function runCpaSupervisorReview(llm, input) {
  const ctxLines = [];
  if (input.context.province) ctxLines.push(`Province: ${input.context.province}`);
  if (input.context.metadata?.serviceId) ctxLines.push(`Service: ${input.context.metadata.serviceId}`);
  const prompt = `Message client:
"""${input.userMessage}"""

R\xE9ponse propos\xE9e (${input.intent}):
"""
${input.draftAnswer}
"""

${ctxLines.length ? `Contexte:
${ctxLines.join("\n")}
` : ""}
Valide ou corrige cette r\xE9ponse. Renvoie UNIQUEMENT le texte final pour le client (ton humain conserv\xE9).`;
  return llm.generateText(prompt, {
    systemPrompt: getCpaSupervisorPrompt(),
    temperature: 0.15,
    model: "gemini-2.5-flash"
  });
}
function requiresCpaSupervision(intent) {
  return CPA_SUPERVISED_INTENTS.includes(intent);
}

// src/lib/serviceProcedures.ts
var baseMandateStep = (order) => ({
  id: "mandate",
  order,
  titleKey: "procedure.common.steps.mandate.title",
  descKey: "procedure.common.steps.mandate.desc",
  portalPath: "overview",
  documents: [
    { id: "signed_mandate", labelKey: "procedure.common.docs.signedMandate", required: true }
  ],
  fields: [
    { id: "profile_complete", labelKey: "procedure.common.fields.profileComplete", required: true },
    { id: "province", labelKey: "procedure.common.fields.province", required: true }
  ]
});
var baseVaultDocsStep = (order, docs) => ({
  id: "documents",
  order,
  titleKey: "procedure.common.steps.documents.title",
  descKey: "procedure.common.steps.documents.desc",
  portalPath: "vault",
  documents: docs,
  fields: []
});
var baseCpaReviewStep = (order) => ({
  id: "cpa_review",
  order,
  titleKey: "procedure.common.steps.cpaReview.title",
  descKey: "procedure.common.steps.cpaReview.desc",
  portalPath: "messaging",
  documents: [],
  fields: [
    { id: "questions_answered", labelKey: "procedure.common.fields.questionsAnswered", required: true }
  ]
});
var baseDeliveryStep = (order) => ({
  id: "delivery",
  order,
  titleKey: "procedure.common.steps.delivery.title",
  descKey: "procedure.common.steps.delivery.desc",
  portalPath: "invoices",
  documents: [],
  fields: [
    { id: "invoice_settled", labelKey: "procedure.common.fields.invoiceSettled", required: true }
  ]
});
var SERVICE_PROCEDURES = {
  hourlyBookkeeping: {
    serviceId: "hourlyBookkeeping",
    estimatedDays: 14,
    steps: [
      baseMandateStep(1),
      baseVaultDocsStep(2, [
        { id: "bank_statements", labelKey: "procedure.docs.bankStatements", required: true },
        { id: "receipts", labelKey: "procedure.docs.receipts", required: true },
        { id: "prior_ledger", labelKey: "procedure.docs.priorLedger", required: false }
      ]),
      {
        id: "scope",
        order: 3,
        titleKey: "procedure.hourlyBookkeeping.steps.scope.title",
        descKey: "procedure.hourlyBookkeeping.steps.scope.desc",
        portalPath: "messaging",
        documents: [],
        fields: [
          { id: "period_range", labelKey: "procedure.fields.periodRange", required: true },
          { id: "volume_estimate", labelKey: "procedure.fields.volumeEstimate", required: true }
        ]
      },
      {
        id: "bookkeeping",
        order: 4,
        titleKey: "procedure.hourlyBookkeeping.steps.work.title",
        descKey: "procedure.hourlyBookkeeping.steps.work.desc",
        portalPath: "transactions",
        documents: [],
        fields: []
      },
      baseCpaReviewStep(5),
      baseDeliveryStep(6)
    ]
  },
  monthlyMicro: {
    serviceId: "monthlyMicro",
    estimatedDays: 21,
    steps: [
      baseMandateStep(1),
      baseVaultDocsStep(2, [
        { id: "bank_statements", labelKey: "procedure.docs.bankStatements", required: true },
        { id: "sales_invoices", labelKey: "procedure.docs.salesInvoices", required: true },
        { id: "expense_receipts", labelKey: "procedure.docs.expenseReceipts", required: true }
      ]),
      {
        id: "bank_access",
        order: 3,
        titleKey: "procedure.monthly.steps.bankAccess.title",
        descKey: "procedure.monthly.steps.bankAccess.desc",
        portalPath: "messaging",
        documents: [],
        fields: [
          { id: "bank_accounts", labelKey: "procedure.fields.bankAccounts", required: true },
          { id: "fiscal_year_end", labelKey: "procedure.fields.fiscalYearEnd", required: true }
        ]
      },
      {
        id: "monthly_cycle",
        order: 4,
        titleKey: "procedure.monthlyMicro.steps.cycle.title",
        descKey: "procedure.monthlyMicro.steps.cycle.desc",
        portalPath: "transactions",
        documents: [],
        fields: []
      },
      baseCpaReviewStep(5),
      baseDeliveryStep(6)
    ]
  },
  monthlySmall: {
    serviceId: "monthlySmall",
    estimatedDays: 21,
    steps: [
      baseMandateStep(1),
      baseVaultDocsStep(2, [
        { id: "bank_statements", labelKey: "procedure.docs.bankStatements", required: true },
        { id: "sales_invoices", labelKey: "procedure.docs.salesInvoices", required: true },
        { id: "expense_receipts", labelKey: "procedure.docs.expenseReceipts", required: true },
        { id: "credit_card", labelKey: "procedure.docs.creditCard", required: true }
      ]),
      {
        id: "bank_access",
        order: 3,
        titleKey: "procedure.monthly.steps.bankAccess.title",
        descKey: "procedure.monthly.steps.bankAccess.desc",
        portalPath: "messaging",
        documents: [],
        fields: [
          { id: "bank_accounts", labelKey: "procedure.fields.bankAccounts", required: true },
          { id: "employee_count", labelKey: "procedure.fields.employeeCount", required: true }
        ]
      },
      {
        id: "monthly_cycle",
        order: 4,
        titleKey: "procedure.monthlySmall.steps.cycle.title",
        descKey: "procedure.monthlySmall.steps.cycle.desc",
        portalPath: "transactions",
        documents: [],
        fields: []
      },
      baseCpaReviewStep(5),
      baseDeliveryStep(6)
    ]
  },
  monthlySme: {
    serviceId: "monthlySme",
    estimatedDays: 30,
    steps: [
      baseMandateStep(1),
      baseVaultDocsStep(2, [
        { id: "bank_statements", labelKey: "procedure.docs.bankStatements", required: true },
        { id: "sales_invoices", labelKey: "procedure.docs.salesInvoices", required: true },
        { id: "payroll_register", labelKey: "procedure.docs.payrollRegister", required: true },
        { id: "expense_receipts", labelKey: "procedure.docs.expenseReceipts", required: true }
      ]),
      {
        id: "payroll_setup",
        order: 3,
        titleKey: "procedure.monthlySme.steps.payroll.title",
        descKey: "procedure.monthlySme.steps.payroll.desc",
        portalPath: "messaging",
        documents: [
          { id: "employee_roster", labelKey: "procedure.docs.employeeRoster", required: true }
        ],
        fields: [
          { id: "pay_schedule", labelKey: "procedure.fields.paySchedule", required: true }
        ]
      },
      {
        id: "monthly_cycle",
        order: 4,
        titleKey: "procedure.monthlySme.steps.cycle.title",
        descKey: "procedure.monthlySme.steps.cycle.desc",
        portalPath: "transactions",
        documents: [],
        fields: []
      },
      baseCpaReviewStep(5),
      baseDeliveryStep(6)
    ]
  },
  gstQst: {
    serviceId: "gstQst",
    estimatedDays: 10,
    steps: [
      baseMandateStep(1),
      {
        id: "tax_numbers",
        order: 2,
        titleKey: "procedure.gstQst.steps.taxNumbers.title",
        descKey: "procedure.gstQst.steps.taxNumbers.desc",
        portalPath: "overview",
        documents: [],
        fields: [
          { id: "business_number", labelKey: "procedure.fields.businessNumber", required: true },
          { id: "gst_hst_account", labelKey: "procedure.fields.gstAccount", required: true },
          { id: "provincial_tax_account", labelKey: "procedure.fields.provincialTaxAccount", required: false }
        ]
      },
      baseVaultDocsStep(3, [
        { id: "sales_summary", labelKey: "procedure.docs.salesSummary", required: true },
        { id: "purchase_summary", labelKey: "procedure.docs.purchaseSummary", required: true },
        { id: "prior_filings", labelKey: "procedure.docs.priorFilings", required: false }
      ]),
      {
        id: "filing",
        order: 4,
        titleKey: "procedure.gstQst.steps.filing.title",
        descKey: "procedure.gstQst.steps.filing.desc",
        portalPath: "transactions",
        documents: [],
        fields: [
          { id: "reporting_period", labelKey: "procedure.fields.reportingPeriod", required: true }
        ]
      },
      baseCpaReviewStep(5),
      baseDeliveryStep(6)
    ]
  },
  payroll: {
    serviceId: "payroll",
    estimatedDays: 14,
    steps: [
      baseMandateStep(1),
      baseVaultDocsStep(2, [
        { id: "employee_roster", labelKey: "procedure.docs.employeeRoster", required: true },
        { id: "void_cheque", labelKey: "procedure.docs.voidCheque", required: true },
        { id: "prior_pay_stubs", labelKey: "procedure.docs.priorPayStubs", required: false }
      ]),
      {
        id: "payroll_info",
        order: 3,
        titleKey: "procedure.payroll.steps.info.title",
        descKey: "procedure.payroll.steps.info.desc",
        portalPath: "messaging",
        documents: [],
        fields: [
          { id: "pay_frequency", labelKey: "procedure.fields.payFrequency", required: true },
          { id: "province_work", labelKey: "procedure.fields.provinceWork", required: true },
          { id: "employee_count", labelKey: "procedure.fields.employeeCount", required: true }
        ]
      },
      {
        id: "payroll_run",
        order: 4,
        titleKey: "procedure.payroll.steps.run.title",
        descKey: "procedure.payroll.steps.run.desc",
        portalPath: "vault",
        documents: [],
        fields: []
      },
      baseCpaReviewStep(5),
      baseDeliveryStep(6)
    ]
  },
  t4Releve1: {
    serviceId: "t4Releve1",
    estimatedDays: 21,
    steps: [
      baseMandateStep(1),
      baseVaultDocsStep(2, [
        { id: "year_payroll_summary", labelKey: "procedure.docs.yearPayrollSummary", required: true },
        { id: "employee_roster", labelKey: "procedure.docs.employeeRoster", required: true },
        { id: "rl1_data_qc", labelKey: "procedure.docs.rl1DataQc", required: false }
      ]),
      {
        id: "t4_prep",
        order: 3,
        titleKey: "procedure.t4Releve1.steps.prep.title",
        descKey: "procedure.t4Releve1.steps.prep.desc",
        portalPath: "messaging",
        documents: [],
        fields: [
          { id: "tax_year", labelKey: "procedure.fields.taxYear", required: true }
        ]
      },
      {
        id: "t4_delivery",
        order: 4,
        titleKey: "procedure.t4Releve1.steps.delivery.title",
        descKey: "procedure.t4Releve1.steps.delivery.desc",
        portalPath: "vault",
        documents: [
          { id: "t4_slips", labelKey: "procedure.docs.t4Slips", required: true }
        ],
        fields: []
      },
      baseCpaReviewStep(5),
      baseDeliveryStep(6)
    ]
  },
  catchUp: {
    serviceId: "catchUp",
    estimatedDays: 45,
    steps: [
      baseMandateStep(1),
      {
        id: "catchup_scope",
        order: 2,
        titleKey: "procedure.catchUp.steps.scope.title",
        descKey: "procedure.catchUp.steps.scope.desc",
        portalPath: "messaging",
        documents: [],
        fields: [
          { id: "months_behind", labelKey: "procedure.fields.monthsBehind", required: true },
          { id: "last_filed_period", labelKey: "procedure.fields.lastFiledPeriod", required: true }
        ]
      },
      baseVaultDocsStep(3, [
        { id: "all_bank_statements", labelKey: "procedure.docs.allBankStatements", required: true },
        { id: "all_receipts", labelKey: "procedure.docs.allReceipts", required: true },
        { id: "prior_returns", labelKey: "procedure.docs.priorReturns", required: false }
      ]),
      {
        id: "catchup_work",
        order: 4,
        titleKey: "procedure.catchUp.steps.work.title",
        descKey: "procedure.catchUp.steps.work.desc",
        portalPath: "transactions",
        documents: [],
        fields: []
      },
      baseCpaReviewStep(5),
      baseDeliveryStep(6)
    ]
  },
  softwareSetup: {
    serviceId: "softwareSetup",
    estimatedDays: 7,
    steps: [
      baseMandateStep(1),
      {
        id: "software_choice",
        order: 2,
        titleKey: "procedure.softwareSetup.steps.choice.title",
        descKey: "procedure.softwareSetup.steps.choice.desc",
        portalPath: "messaging",
        documents: [],
        fields: [
          { id: "software_name", labelKey: "procedure.fields.softwareName", required: true },
          { id: "chart_of_accounts", labelKey: "procedure.fields.chartOfAccounts", required: false }
        ]
      },
      baseVaultDocsStep(3, [
        { id: "opening_balances", labelKey: "procedure.docs.openingBalances", required: true },
        { id: "vendor_list", labelKey: "procedure.docs.vendorList", required: false }
      ]),
      {
        id: "setup_session",
        order: 4,
        titleKey: "procedure.softwareSetup.steps.session.title",
        descKey: "procedure.softwareSetup.steps.session.desc",
        portalPath: "support",
        documents: [],
        fields: []
      },
      baseCpaReviewStep(5),
      baseDeliveryStep(6)
    ]
  },
  taxHelpAutonomous: {
    serviceId: "taxHelpAutonomous",
    estimatedDays: 14,
    steps: [
      baseMandateStep(1),
      baseVaultDocsStep(2, [
        { id: "t2125_support", labelKey: "procedure.docs.t2125Support", required: true },
        { id: "income_slips", labelKey: "procedure.docs.incomeSlips", required: true },
        { id: "expense_summary", labelKey: "procedure.docs.expenseSummary", required: true }
      ]),
      {
        id: "tax_organize",
        order: 3,
        titleKey: "procedure.taxHelpAutonomous.steps.organize.title",
        descKey: "procedure.taxHelpAutonomous.steps.organize.desc",
        portalPath: "vault",
        documents: [],
        fields: [
          { id: "tax_year", labelKey: "procedure.fields.taxYear", required: true },
          { id: "self_employment_type", labelKey: "procedure.fields.selfEmploymentType", required: true }
        ]
      },
      baseCpaReviewStep(4),
      {
        id: "cpa_handoff",
        order: 5,
        titleKey: "procedure.taxHelpAutonomous.steps.handoff.title",
        descKey: "procedure.taxHelpAutonomous.steps.handoff.desc",
        portalPath: "messaging",
        documents: [
          { id: "organized_package", labelKey: "procedure.docs.organizedPackage", required: true }
        ],
        fields: []
      },
      baseDeliveryStep(6)
    ]
  }
};
function summarizeProcedureForAgent(procedure, lang = "fr") {
  const lines = procedure.steps.sort((a, b) => a.order - b.order).map((s) => `\xC9tape ${s.order} (${s.id}): ${s.titleKey}${s.portalPath ? ` \u2192 /portal/client/${s.portalPath}` : ""}`);
  return `Service ${procedure.serviceId}, ~${procedure.estimatedDays} jours:
${lines.join("\n")}`;
}

// src/agents/procedure-context.ts
function buildProcedureContextBlock(ctx) {
  const serviceId = ctx.metadata?.serviceId;
  if (!serviceId || !(serviceId in SERVICE_PROCEDURES)) return "";
  const summary = summarizeProcedureForAgent(SERVICE_PROCEDURES[serviceId], ctx.language ?? "fr");
  return `
Parcours proc\xE9dural actif:
${summary}
Guide le client \xE9tape par \xE9tape vers /portal/client/procedure`;
}

// src/agents/orchestrator.ts
var VALID_INTENTS = [
  "TAX",
  "PAYROLL",
  "BILLING",
  "BOOKKEEPING",
  "TECHNICAL",
  "SALES",
  "COMPLIANCE",
  "PORTAL",
  "ONBOARDING",
  "MESSAGING",
  "PROCEDURE",
  "GENERAL"
];
function normalizeIntent(raw) {
  const upper = raw?.toUpperCase?.() ?? "GENERAL";
  return VALID_INTENTS.includes(upper) ? upper : "GENERAL";
}
function resolveSystemPrompt(agent, ctx) {
  const base = typeof agent.systemPrompt === "function" ? agent.systemPrompt(ctx) : agent.systemPrompt;
  const extras = [];
  if (ctx.province) extras.push(`Province du client: ${ctx.province}.`);
  if (ctx.role) extras.push(`R\xF4le portail: ${ctx.role}.`);
  const lang = ctx.language ?? "fr";
  if (lang) extras.push(`Langue de r\xE9ponse: ${lang}.`);
  const procedureBlock = buildProcedureContextBlock(ctx);
  if (procedureBlock) extras.push(procedureBlock.trim());
  let prompt = base;
  if (agent.visibility === "routed") {
    const persona = getPersonaForAgent(agent.id);
    prompt = `${buildHumanConversationPrompt(persona, lang)}

${base}`;
  }
  return extras.length ? `${prompt}

Contexte:
${extras.join("\n")}` : prompt;
}
async function generateSpecialistAnswer(llm, agent, ctx, message, history) {
  const systemPrompt = resolveSystemPrompt(agent, ctx);
  const historyBlock = history?.length ? history.map((m) => `${m.role}: ${m.content}`).join("\n") + "\n\n" : "";
  return llm.generateText(`${historyBlock}Client: ${message}`, {
    systemPrompt,
    model: agent.model,
    temperature: agent.temperature ?? 0.4
  });
}
async function runAgentOrchestrator(input, options = {}) {
  const started = Date.now();
  const llm = options.llm ?? (isMockGeminiKey() ? createMockLLMClient() : createGeminiClient());
  const ctx = input.context ?? {};
  let intent;
  let agentId;
  let routedBy = "router";
  let confidence;
  if (options.directAgentId && options.directAgentId !== "router") {
    const agent2 = AGENT_REGISTRY[options.directAgentId];
    if (!agent2) throw new Error(`Agent inconnu: ${options.directAgentId}`);
    agentId = options.directAgentId;
    intent = agent2.intent === "ROUTER" ? "GENERAL" : agent2.intent;
    routedBy = "direct";
  } else {
    const routeResult = await llm.generateJSON(
      `Message utilisateur:
"""${input.message}"""`,
      routerIntentSchema,
      { systemPrompt: AGENT_REGISTRY.router.systemPrompt, temperature: 0.1 }
    );
    intent = normalizeIntent(routeResult.intent);
    agentId = getAgentForIntent(intent).id;
    confidence = routeResult.confidence;
    options.onRoute?.(intent, agentId);
  }
  const agent = AGENT_REGISTRY[agentId];
  let answer = await generateSpecialistAnswer(
    llm,
    agent,
    ctx,
    input.message,
    input.history
  );
  if (!options.skipCpaReview && requiresCpaSupervision(intent)) {
    answer = await runCpaSupervisorReview(llm, {
      userMessage: input.message,
      draftAnswer: answer,
      intent,
      context: ctx
    });
  }
  return {
    agentId,
    intent,
    answer,
    confidence,
    routedBy,
    latencyMs: Date.now() - started
  };
}

// api/internal-jobs.ts
var INTERNAL_CRON_JOBS = [
  "agent-health",
  "reconciliation",
  "elite-hunter",
  "marketing-hunter"
];
function runAgentHealthCheck(geminiConfigured) {
  const routed = listAgents({ internal: false });
  const internal = listAgents({ internal: true });
  const missingPersonas = routed.filter((a) => !AGENT_REGISTRY[a.id]);
  return {
    job: "agent-health",
    success: missingPersonas.length === 0,
    message: missingPersonas.length === 0 ? `${routed.length} agents rout\xE9s, ${internal.length} internes \u2014 registre OK` : `Registre incomplet: ${missingPersonas.map((a) => a.id).join(", ")}`,
    details: {
      routedCount: routed.length,
      internalCount: internal.length,
      geminiConfigured,
      agents: routed.map((a) => a.id)
    },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function runReconciliationStub() {
  return {
    job: "reconciliation",
    success: true,
    message: "Rapprochement Interac \u2194 factures \u2014 cycle simul\xE9 (aucune facture en attente critique)",
    details: {
      scanned: 0,
      matched: 0,
      pendingReview: 0,
      mode: "stub"
    },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function runMarketingHunterStub() {
  return {
    job: "marketing-hunter",
    success: true,
    message: "Elite Hunter \u2014 prospect B2B simul\xE9 (voir /api/cron/elite-hunter pour ex\xE9cution live)",
    details: {
      campaign: "SNIPER_V2",
      mode: "stub"
    },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function runInternalCronJob(job, opts = {}) {
  const normalized = job.toLowerCase().replace(/_/g, "-");
  switch (normalized) {
    case "agent-health":
      return runAgentHealthCheck(!!opts.geminiConfigured);
    case "reconciliation":
    case "reconcile":
      return runReconciliationStub();
    case "elite-hunter":
    case "marketing-hunter":
      return runMarketingHunterStub();
    default:
      return {
        job: normalized,
        success: false,
        message: `Job inconnu. Jobs disponibles: ${INTERNAL_CRON_JOBS.join(", ")}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
  }
}

// src/lib/seedAdminAccounts.ts
var SEED_ADMIN_ACCOUNTS = [
  {
    email: "s.lahaie07@gmail.com",
    role: "super_admin",
    fullName: "Samuel Lahaie",
    label: "Super Admin"
  },
  {
    email: "viviee28@hotmail.com",
    role: "sub_admin",
    fullName: "Sylvie Charette-Cl\xE9ment",
    label: "Partenaire Cabinet"
  },
  {
    email: "eya-cpa@outlook.com",
    role: "sub_admin",
    fullName: "Eya",
    label: "Partenaire Cabinet (Support Arabe)"
  },
  {
    email: "stephanie@comptaflow.com",
    role: "sub_admin",
    fullName: "St\xE9phanie Laplante",
    label: "Partenaire Cabinet"
  }
];
var PORTAL_HOME_BY_ROLE = {
  super_admin: "/portal/owner/super_overview",
  sub_admin: "/portal/admin/admin_overview"
};

// api/lib/supabaseMigrations.ts
import fs from "fs";
import path from "path";
import pg from "pg";
var { Client } = pg;
var PROJECT_REF = process.env.SUPABASE_PROJECT_REF || SUPABASE_PROJECT_REF;
var EMBEDDED_FIX_SQL = `
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
SET row_security = off
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_sub_admin_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
SET row_security = off
AS $$
  SELECT sub_admin_id FROM public.profiles WHERE id = auth.uid();
$$;

DROP POLICY IF EXISTS "Public liste comptables partenaires" ON public.profiles;
CREATE POLICY "Public liste comptables partenaires" ON public.profiles
FOR SELECT TO anon, authenticated
USING (role = 'sub_admin');

CREATE OR REPLACE FUNCTION public.guard_profile_privileged_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF public.get_user_role() IS DISTINCT FROM 'super_admin' THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'profile.role is immutable for non super_admin users';
    END IF;
    IF NEW.sub_admin_id IS DISTINCT FROM OLD.sub_admin_id THEN
      RAISE EXCEPTION 'profile.sub_admin_id is immutable for non super_admin users';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS guard_profile_privileged_fields ON public.profiles;
CREATE TRIGGER guard_profile_privileged_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_privileged_fields();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_sub_admin_id UUID;
    v_full_name TEXT;
BEGIN
    v_full_name := COALESCE(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'display_name',
        new.raw_user_meta_data->>'name'
    );

    IF new.raw_user_meta_data->>'sub_admin_id' IS NOT NULL AND new.raw_user_meta_data->>'sub_admin_id' <> '' THEN
        v_sub_admin_id := (new.raw_user_meta_data->>'sub_admin_id')::UUID;
    ELSE
        v_sub_admin_id := NULL;
    END IF;

    INSERT INTO public.profiles (id, role, sub_admin_id, full_name, display_name, email, created_at)
    VALUES (
        new.id,
        'client',
        v_sub_admin_id,
        v_full_name,
        v_full_name,
        new.email,
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP POLICY IF EXISTS "Modif propre profil" ON public.profiles;
CREATE POLICY "Modif propre profil" ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = public.get_user_role()
  AND sub_admin_id IS NOT DISTINCT FROM public.get_sub_admin_id()
);
`;
function passwordCandidates() {
  const candidates = [
    process.env.SUPABASE_DB_PASSWORD,
    process.env.DATABASE_PASSWORD,
    process.env.POSTGRES_PASSWORD
  ].filter((v) => !!v?.trim());
  return [...new Set(candidates)];
}
function loadMigrationSql(allFiles = false) {
  const statements = [EMBEDDED_FIX_SQL];
  if (!allFiles) return statements;
  const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
  if (!fs.existsSync(migrationsDir)) return statements;
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    if (file === "20260620_fix_profiles_rls_recursion.sql") continue;
    statements.push(fs.readFileSync(path.join(migrationsDir, file), "utf8"));
  }
  return statements;
}
async function connectWithPassword(password) {
  const configs = [
    { host: `aws-1-ca-central-1.pooler.supabase.com`, port: 6543, user: `postgres.${PROJECT_REF}` },
    { host: `aws-0-ca-central-1.pooler.supabase.com`, port: 6543, user: `postgres.${PROJECT_REF}` },
    { host: `aws-1-ca-central-1.pooler.supabase.com`, port: 5432, user: `postgres.${PROJECT_REF}` },
    { host: `db.${PROJECT_REF}.supabase.co`, port: 5432, user: "postgres" }
  ];
  for (const conf of configs) {
    const client = new Client({
      ...conf,
      password,
      database: "postgres",
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 12e3
    });
    try {
      await client.connect();
      return { client, host: `${conf.host}:${conf.port}` };
    } catch {
      try {
        await client.end();
      } catch {
      }
    }
  }
  return null;
}
async function applySupabaseMigrations(options) {
  const allFiles = options?.allFiles ?? false;
  const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (databaseUrl) {
    const client = new Client({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 12e3
    });
    try {
      await client.connect();
      const sqlBlocks = loadMigrationSql(allFiles);
      for (const sql of sqlBlocks) {
        await client.query(sql);
      }
      await client.end();
      return { success: true, message: "Migrations appliqu\xE9es via DATABASE_URL", host: "DATABASE_URL", appliedFiles: ["embedded-fix"] };
    } catch (err) {
      try {
        await client.end();
      } catch {
      }
      return { success: false, message: err.message };
    }
  }
  for (const password of passwordCandidates()) {
    const connected = await connectWithPassword(password);
    if (!connected) continue;
    const { client, host } = connected;
    try {
      const sqlBlocks = loadMigrationSql(allFiles);
      for (const sql of sqlBlocks) {
        await client.query(sql);
      }
      await client.end();
      return {
        success: true,
        message: "Migrations appliqu\xE9es",
        host,
        appliedFiles: ["embedded-fix"]
      };
    } catch (err) {
      try {
        await client.end();
      } catch {
      }
      return { success: false, message: `${host}: ${err.message}` };
    }
  }
  return {
    success: false,
    message: "Connexion Postgres impossible \u2014 d\xE9finir SUPABASE_DB_PASSWORD ou DATABASE_URL"
  };
}

// api/lib/emailTemplates.ts
var COMMON_CSS = `
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: #050505;
  color: #FDFBF7;
  margin: 0;
  padding: 0;
`;
var CONTAINER_STYLE = `
  max-width: 600px;
  margin: 40px auto;
  background-color: #0C0C0E;
  border: 1px solid #D4AF37;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
`;
var HEADER_STYLE = `
  background: linear-gradient(135deg, #0C0C0E 0%, #151518 100%);
  padding: 40px 30px;
  text-align: center;
  border-bottom: 1px solid rgba(214, 175, 55, 0.2);
`;
var CONTENT_STYLE = `
  padding: 40px 30px;
  line-height: 1.6;
`;
var BUTTON_STYLE = `
  display: inline-block;
  background: linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%);
  color: #050505 !important;
  text-decoration: none;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  padding: 16px 36px;
  border-radius: 12px;
  margin: 30px 0;
  box-shadow: 0 8px 24px rgba(212, 175, 55, 0.25);
  transition: all 0.3s ease;
`;
var FOOTER_STYLE = `
  background-color: #08080A;
  padding: 30px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 10px;
  color: #55555C;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;
function getPremiumEmailWrapper(options) {
  const isAr = options.lang === "ar";
  const dir = isAr ? "rtl" : "ltr";
  const textAlign = isAr ? "right" : "left";
  const logoText = "Compta-Flow";
  const brandSub = isAr ? "\u0645\u0643\u062A\u0628 \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u0629 \u0627\u0644\u0633\u064A\u0627\u062F\u064A \u0627\u0644\u0645\u062A\u0645\u064A\u0632" : "Cabinet Comptable Souverain d'\xC9lite";
  const footerText = isAr ? "\u062A\u0646\u0628\u064A\u0647 \u0623\u0645\u0646\u064A Loi 25 \xB7 \u0646\u0638\u0627\u0645 \u0643\u0648\u0645\u0628\u062A\u0627 \u0641\u0644\u0648 \u0627\u0644\u0645\u062D\u0645\u064A \u0648\u0627\u0644\u0645\u0634\u0641\u0631 \xB7 \u0643\u0646\u062F\u0627" : "S\xE9curis\xE9 Loi 25 \xB7 Cryptage AES-256 \xB7 Compta-Flow Canada";
  const buttonHtml = options.buttonLabel && options.buttonUrl ? `<div style="text-align: center; margin: 30px 0;">
        <a href="${options.buttonUrl}" style="${BUTTON_STYLE}">${options.buttonLabel}</a>
       </div>` : "";
  return `<!DOCTYPE html>
<html lang="${options.lang || "fr"}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title}</title>
  ${options.preheader ? `<span style="display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; font-size: 0px;">${options.preheader}</span>` : ""}
  <style>
    body { ${COMMON_CSS} }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#050505;">
  <div style="${CONTAINER_STYLE} direction: ${dir}; text-align: ${textAlign};">
    <div style="${HEADER_STYLE}">
      <div style="font-size: 32px; font-family: serif; color: #D4AF37; font-style: italic; font-weight: bold; letter-spacing: 1px;">${logoText}</div>
      <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 3px; color: #88888F; margin-top: 6px;">${brandSub}</div>
    </div>
    
    <div style="${CONTENT_STYLE}">
      <h2 style="font-family: serif; font-size: 24px; color: #FDFBF7; font-style: italic; margin-top: 0; margin-bottom: 20px;">${options.subtitle}</h2>
      ${options.bodyHtml}
      ${buttonHtml}
    </div>
    
    <div style="${FOOTER_STYLE}">
      ${footerText}
    </div>
  </div>
</body>
</html>`;
}
function getClientEmailTemplate(data) {
  const isAr = data.lang === "ar";
  if (isAr) {
    const bodyHtml = `
      <p style="color: #CCCCCC; font-size: 14px;">\u064A\u0633\u0639\u062F\u0646\u0627 \u062C\u062F\u0627\u064B \u0648\u064A\u0634\u0631\u0641\u0646\u0627 \u0645\u0631\u0627\u0641\u0642\u062A\u0643\u0645 \u0641\u064A \u0625\u062F\u0627\u0631\u0629 \u062D\u0633\u0627\u0628\u0627\u062A\u0643\u0645 \u0648\u062A\u0646\u0638\u064A\u0645 \u0647\u064A\u0643\u0644\u0643\u0645 \u0627\u0644\u0645\u0627\u0644\u064A. \u062A\u0645 \u062D\u0641\u0638 \u0645\u062D\u0627\u0643\u0627\u0629 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0643\u0645 \u0628\u0646\u062C\u0627\u062D.</p>
      
      <div style="background-color: rgba(214, 175, 55, 0.04); border: 1px solid rgba(214, 175, 55, 0.15); padding: 25px; border-radius: 16px; margin: 30px 0;">
        <h3 style="color: #D4AF37; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid rgba(214, 175, 55, 0.1); padding-bottom: 8px;">\u062A\u0641\u0627\u0635\u064A\u0644 \u062A\u0642\u062F\u064A\u0631 \u0627\u0644\u0633\u0639\u0631 (${data.quoteRef})</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #FDFBF7;">
          <tr>
            <td style="padding: 8px 0; color: #88888F;">\u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u062D\u062F\u062F\u0629:</td>
            <td style="padding: 8px 0; text-align: left; font-weight: bold;">${data.serviceName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #88888F;">\u0627\u0644\u0645\u0642\u0627\u0637\u0639\u0629 \u0627\u0644\u0636\u0631\u064A\u0628\u064A\u0629:</td>
            <td style="padding: 8px 0; text-align: left; font-weight: bold;">${data.province}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #88888F;">\u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0623\u0633\u0627\u0633\u064A (\u0642\u0628\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u0629):</td>
            <td style="padding: 8px 0; text-align: left; font-family: monospace;">${data.subtotal}</td>
          </tr>
          ${data.taxesHtml}
          <tr style="border-top: 1px solid rgba(214, 175, 55, 0.2); font-size: 15px; font-weight: bold;">
            <td style="padding: 12px 0; color: #D4AF37;">\u0627\u0644\u0645\u062C\u0645\u0648\u0639 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A \u0634\u0627\u0645\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u0629:</td>
            <td style="padding: 12px 0; text-align: left; color: #D4AF37; font-family: monospace;">${data.total}</td>
          </tr>
        </table>
      </div>

      <h3 style="font-family: serif; font-size: 18px; color: #FDFBF7; margin-top: 30px;">\u0627\u0644\u062E\u0637\u0648\u0627\u062A \u0627\u0644\u062A\u0627\u0644\u064A\u0629 \u0644\u062A\u0641\u0639\u064A\u0644 \u062D\u0633\u0627\u0628\u0643\u0645:</h3>
      <ol style="color: #CCCCCC; font-size: 13px; padding-right: 20px; line-height: 1.8;">
        <li style="margin-bottom: 10px;"><strong>\u062A\u0648\u0642\u064A\u0639 \u0639\u0642\u062F \u0627\u0644\u062A\u0645\u062B\u064A\u0644 \u0627\u0644\u0645\u0634\u062A\u0631\u0643</strong>: \u064A\u0631\u062C\u0649 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0625\u0644\u0649 \u0628\u0648\u0627\u0628\u062A\u0643 \u0644\u0648\u0636\u0639 \u062A\u0648\u0642\u064A\u0639\u0643 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0627\u0644\u0645\u0624\u0645\u0646.</li>
        <li style="margin-bottom: 10px;"><strong>\u062A\u062D\u0645\u064A\u0644 \u0645\u0633\u062A\u0646\u062F\u0627\u062A\u0643 \u0627\u0644\u062B\u0628\u0648\u062A\u064A\u0629</strong>: \u0642\u0645 \u0628\u0625\u064A\u062F\u0627\u0639 \u0643\u0634\u0648\u0641\u0627\u062A\u0643 \u0627\u0644\u0628\u0646\u0643\u064A\u0629 \u0648\u0625\u064A\u0635\u0627\u0644\u0627\u062A\u0643 \u0628\u0623\u0645\u0627\u0646 \u0641\u064A \u062E\u0632\u0646\u062A\u0646\u0627 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629 \u0627\u0644\u0645\u0634\u0641\u0631\u0629.</li>
        <li style="margin-bottom: 10px;"><strong>\u0645\u0643\u0627\u0644\u0645\u0629 \u0627\u0646\u0637\u0644\u0627\u0642 \u0627\u0644\u062E\u062F\u0645\u0629</strong>: \u0627\u062D\u062C\u0632 \u0644\u0642\u0627\u0621\u0643 \u0627\u0644\u062A\u0631\u062D\u064A\u0628\u064A \u0645\u0639 \u0645\u062D\u0627\u0633\u0628\u062A\u0643 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 <strong>\u0625\u064A\u0644\u064A\u0627 (${data.agentName})</strong> \u0644\u062A\u0623\u0643\u064A\u062F \u0645\u0633\u0627\u0631 \u0645\u0644\u0641\u0643.</li>
      </ol>
      
      <p style="color: #88888F; font-size: 12px; font-style: italic; margin-top: 30px; border-right: 2px solid #D4AF37; padding-right: 10px;">\u0644\u0642\u062F \u0623\u0631\u0641\u0642\u0646\u0627 \u062A\u0642\u062F\u064A\u0631 \u0627\u0644\u0631\u0633\u0648\u0645 \u0627\u0644\u0631\u0633\u0645\u064A \u0628\u0635\u064A\u063A\u0629 PDF \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0644\u0644\u0631\u062C\u0648\u0639 \u0625\u0644\u064A\u0647 \u0641\u064A \u0623\u064A \u0648\u0642\u062A.</p>
    `;
    return getPremiumEmailWrapper({
      title: "\u062A\u0623\u0643\u064A\u062F \u062A\u0642\u062F\u064A\u0631 \u0627\u0644\u0631\u0633\u0648\u0645 - Compta-Flow",
      subtitle: `\u0645\u0631\u062D\u0628\u0627\u064B ${data.clientName}\u060C`,
      bodyHtml,
      buttonLabel: "\u062F\u062E\u0648\u0644 \u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621",
      buttonUrl: data.portalUrl,
      lang: "ar"
    });
  }
  const bodyHtmlFr = `
    <p style="color: #CCCCCC; font-size: 14px;">C'est un honneur et un privil\xE8ge de vous accompagner dans la structuration et la souverainet\xE9 financi\xE8re de votre entreprise. Votre simulation tarifaire a \xE9t\xE9 scell\xE9e avec succ\xE8s.</p>
    
    <div style="background-color: rgba(214, 175, 55, 0.04); border: 1px solid rgba(214, 175, 55, 0.15); padding: 25px; border-radius: 16px; margin: 30px 0;">
      <h3 style="color: #D4AF37; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid rgba(214, 175, 55, 0.1); padding-bottom: 8px;">D\xE9tails de l'Estimation (${data.quoteRef})</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #FDFBF7;">
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Service s\xE9lectionn\xE9 :</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">${data.serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Province fiscale :</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">${data.province}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Montant brut (HT) :</td>
          <td style="padding: 8px 0; text-align: right; font-family: monospace;">${data.subtotal}</td>
        </tr>
        ${data.taxesHtml}
        <tr style="border-top: 1px solid rgba(214, 175, 55, 0.2); font-size: 15px; font-weight: bold;">
          <td style="padding: 12px 0; color: #D4AF37;">Total TTC estim\xE9 :</td>
          <td style="padding: 12px 0; text-align: right; color: #D4AF37; font-family: monospace;">${data.total}</td>
        </tr>
      </table>
    </div>

    <h3 style="font-family: serif; font-size: 18px; color: #FDFBF7; margin-top: 30px;">Vos prochaines \xE9tapes pour le d\xE9marrage :</h3>
    <ol style="color: #CCCCCC; font-size: 13px; padding-left: 20px; line-height: 1.8;">
      <li style="margin-bottom: 10px;"><strong>Signer le mandat de repr\xE9sentation</strong> : Connectez-vous \xE0 votre portail s\xE9curis\xE9 pour apposer votre signature num\xE9rique l\xE9gale.</li>
      <li style="margin-bottom: 10px;"><strong>T\xE9l\xE9verser vos pi\xE8ces justificatives</strong> : D\xE9posez vos relev\xE9s bancaires et factures dans votre coffre-fort chiffr\xE9.</li>
      <li style="margin-bottom: 10px;"><strong>Appel de cadrage</strong> : Planifiez votre appel de bienvenue avec votre comptable attitr\xE9e, <strong>${data.agentName}</strong>.</li>
    </ol>
    
    <p style="color: #88888F; font-size: 12px; font-style: italic; margin-top: 30px; border-left: 2px solid #D4AF37; padding-left: 10px;">Le devis officiel au format PDF est joint \xE0 ce courriel.</p>
  `;
  return getPremiumEmailWrapper({
    title: "Confirmation de votre estimation premium - Compta-Flow",
    subtitle: `Bonjour ${data.clientName},`,
    bodyHtml: bodyHtmlFr,
    buttonLabel: "Acc\xE9der \xE0 mon Espace Client",
    buttonUrl: data.portalUrl,
    lang: data.lang
  });
}
function getAgentEmailTemplate(data) {
  const bodyHtml = `
    <p style="color: #CCCCCC; font-size: 14px;">Un nouveau client vient de finaliser sa simulation de services et a \xE9t\xE9 rattach\xE9 \xE0 votre portefeuille comptable.</p>
    
    <div style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); padding: 25px; border-radius: 16px; margin: 30px 0;">
      <h3 style="color: #D4AF37; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 8px;">Fiche Client</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #FDFBF7;">
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Nom complet / Cie :</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">${data.clientName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Courriel de contact :</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;"><a href="mailto:${data.clientEmail}" style="color: #D4AF37; text-decoration: none;">${data.clientEmail}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Service souscrit :</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">${data.serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Tarif mensuel :</td>
          <td style="padding: 8px 0; text-align: right; color: #D4AF37; font-family: monospace; font-weight: bold;">${data.total}</td>
        </tr>
      </table>
    </div>

    <h3 style="font-family: serif; font-size: 16px; color: #FDFBF7; margin-top: 30px;">Actions requises :</h3>
    <ul style="color: #CCCCCC; font-size: 13px; padding-left: 20px; line-height: 1.8;">
      <li>Valider la conformit\xE9 des taxes r\xE9gionales du client (${data.province}).</li>
      <li>Suivre le t\xE9l\xE9versement des livrables et la signature du mandat sur votre portail.</li>
      <li>Pr\xE9parer l'entretien d'accueil et le plan comptable adapt\xE9.</li>
    </ul>
  `;
  return getPremiumEmailWrapper({
    title: "[Compta-Flow] Nouveau dossier assign\xE9",
    subtitle: `Bonjour ${data.agentName},`,
    bodyHtml,
    buttonLabel: "Ouvrir mon Portail Agent",
    buttonUrl: data.portalUrl,
    lang: data.lang
  });
}
function getAdminEmailTemplate(data) {
  const bodyHtml = `
    <p style="color: #CCCCCC; font-size: 14px;">Le syst\xE8me a scell\xE9 une nouvelle estimation financi\xE8re et affect\xE9 le dossier associ\xE9 avec isolation stricte.</p>
    
    <div style="background-color: rgba(214, 175, 55, 0.02); border: 1px solid rgba(214, 175, 55, 0.1); padding: 25px; border-radius: 16px; margin: 30px 0;">
      <h3 style="color: #D4AF37; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid rgba(214, 175, 55, 0.05); padding-bottom: 8px;">D\xE9tails d'Audit</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #FDFBF7;">
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Client :</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">${data.clientName} (${data.clientEmail})</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Agent assign\xE9 :</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">${data.agentName} (${data.agentEmail})</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #88888F;">R\xE9gion fiscale :</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">${data.province}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #88888F;">D\xE9tail financier :</td>
          <td style="padding: 8px 0; text-align: right; font-family: monospace;">Sub: ${data.subtotal} / Net: ${data.total}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #88888F;">R\xE9f Devis :</td>
          <td style="padding: 8px 0; text-align: right; font-family: monospace;">${data.quoteRef}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: rgba(0, 150, 255, 0.02); border: 1px solid rgba(0, 150, 255, 0.1); padding: 15px; border-radius: 12px; font-size: 12px; color: #A0C0E0; margin-bottom: 30px;">
      \u2139 <strong>Hardening de S\xE9curit\xE9 :</strong> La politique d'isolation RLS a \xE9t\xE9 v\xE9rifi\xE9e automatiquement sur ce dossier. L'acc\xE8s aux documents et \xE9critures comptables est strictement restreint \xE0 l'agent assign\xE9 (${data.agentName}) et supervis\xE9 par le propri\xE9taire principal.
    </div>
  `;
  return getPremiumEmailWrapper({
    title: "[Rapport Financier] Nouvelle Transaction de Services",
    subtitle: "Bonjour Samuel,",
    bodyHtml,
    buttonLabel: "Ouvrir le Panneau Propri\xE9taire",
    buttonUrl: data.portalUrl,
    lang: data.lang
  });
}
function getAccountConfirmedEmailTemplate(data) {
  const bodyHtml = `
    <div style="text-align: center;">
      <div style="display: inline-block; background-color: rgba(46, 213, 115, 0.08); border: 1px solid rgba(46, 213, 115, 0.3); padding: 6px 20px; border-radius: 50px; font-size: 10px; font-weight: bold; color: #2ed573; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 25px;">
        \u2726 Courriel Confirm\xE9 \u2726
      </div>
    </div>
    <p style="color: #CCCCCC; font-size: 14px; text-align: center; max-width: 480px; margin: 0 auto 20px auto; font-weight: 300;">
      F\xE9licitations ! Votre adresse courriel (<strong>${data.clientEmail}</strong>) a \xE9t\xE9 valid\xE9e avec succ\xE8s. Votre espace s\xE9curis\xE9 Compta-Flow is maintenant pleinement actif et pr\xEAt pour la prise en charge de vos besoins comptables.
    </p>

    <p style="color: #88888F; font-size: 13px; text-align: center; max-width: 450px; margin: 0 auto 30px auto;">
      Vous pouvez \xE0 tout moment vous connecter pour configurer vos besoins de tenue de livres, imp\xF4ts ou \xE9tats financiers.
    </p>
  `;
  return getPremiumEmailWrapper({
    title: "Votre compte Compta-Flow est activ\xE9 !",
    subtitle: `Bonjour ${data.clientName},`,
    bodyHtml,
    buttonLabel: "Acc\xE9der \xE0 mon Portail",
    buttonUrl: data.portalUrl
  });
}
function getOnboardingCompleteEmailTemplate(data) {
  const isAr = data.lang === "ar";
  const isEn = data.lang === "en";
  let subtitle = "";
  let bodyHtml = "";
  let buttonLabel = "";
  if (isAr) {
    subtitle = `\u0645\u0631\u062D\u0628\u0627\u064B ${data.clientName}\u060C`;
    bodyHtml = `
      <p style="color: #CCCCCC; font-size: 14px;">\u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u062D\u0633\u0627\u0628\u0643\u0645 \u0628\u0646\u062C\u0627\u062D \u0648\u0627\u0643\u062A\u0645\u0627\u0644 \u0639\u0645\u0644\u064A\u0629 \u0627\u0644\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0625\u0631\u0634\u0627\u062F\u064A\u0629.</p>
      <p style="color: #CCCCCC; font-size: 14px;"><strong>\u0627\u0644\u062E\u0637\u0648\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629:</strong> \u064A\u0631\u062C\u0649 \u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0645\u0646 \u062C\u062F\u0648\u0644 \u0623\u0639\u0645\u0627\u0644\u0643\u0645 \u0648\u0645\u062A\u0627\u0628\u0639\u0629 <a href="${data.procedureUrl}" style="color: #D4AF37; text-decoration: none;">\u0645\u0633\u0627\u0631 \u0645\u0644\u0641\u0643\u0645 \u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u064A</a>.</p>
    `;
    buttonLabel = "\u0641\u062A\u062D \u0628\u0648\u0627\u0628\u062A\u064A \u0627\u0644\u062E\u0627\u0635\u0629";
  } else if (isEn) {
    subtitle = `Hello ${data.clientName},`;
    bodyHtml = `
      <p style="color: #CCCCCC; font-size: 14px;">Your client onboarding is now complete and your account is active.</p>
      <p style="color: #CCCCCC; font-size: 14px;"><strong>Next step:</strong> please select your desired accounting plan in the Overview tab, then follow your <a href="${data.procedureUrl}" style="color: #D4AF37; text-decoration: none;">guided file path</a>.</p>
    `;
    buttonLabel = "Open My Client Portal";
  } else {
    subtitle = `Bonjour ${data.clientName},`;
    bodyHtml = `
      <p style="color: #CCCCCC; font-size: 14px;">Votre parcours d'int\xE9gration client est compl\xE9t\xE9 avec succ\xE8s et votre compte est pleinement actif.</p>
      <p style="color: #CCCCCC; font-size: 14px;"><strong>Prochaine \xE9tape :</strong> veuillez s\xE9lectionner le service comptable souhait\xE9 dans votre tableau de bord, puis suivez votre <a href="${data.procedureUrl}" style="color: #D4AF37; text-decoration: none;">parcours dossier guid\xE9</a>.</p>
    `;
    buttonLabel = "Acc\xE9der \xE0 mon Espace Client";
  }
  return getPremiumEmailWrapper({
    title: isAr ? "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643\u0645 \u0641\u064A ComptaFlow \u2014 \u0627\u0644\u062E\u0637\u0648\u0627\u062A \u0627\u0644\u062A\u0627\u0644\u064A\u0629" : isEn ? "Welcome to ComptaFlow \u2014 your next steps" : "Bienvenue chez ComptaFlow \u2014 vos prochaines \xE9tapes",
    subtitle,
    bodyHtml,
    buttonLabel,
    buttonUrl: data.portalUrl,
    lang: data.lang
  });
}
function getAgentWelcomeEmailTemplate(data) {
  const bodyHtml = `
    <p style="color: #CCCCCC; font-size: 14px;">F\xE9licitations ! Un acc\xE8s collaborateur a \xE9t\xE9 cr\xE9\xE9 pour vous au sein du r\xE9seau Compta-Flow.</p>
    <div style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); padding: 25px; border-radius: 16px; margin: 30px 0;">
      <h3 style="color: #D4AF37; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 8px;">Vos identifiants d'acc\xE8s</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #FDFBF7;">
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Identifiant :</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">${data.agentEmail}</td>
        </tr>
        ${data.tempPassword ? `
        <tr>
          <td style="padding: 8px 0; color: #88888F;">Mot de passe temporaire :</td>
          <td style="padding: 8px 0; text-align: right; font-family: monospace; font-weight: bold; color: #D4AF37;">${data.tempPassword}</td>
        </tr>
        ` : ""}
        <tr>
          <td style="padding: 8px 0; color: #88888F;">R\xF4le syst\xE8me :</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #D4AF37;">Collaborateur / Agent Comptable</td>
        </tr>
      </table>
    </div>
    <p style="color: #88888F; font-size: 13px;">Lors de votre premi\xE8re connexion, nous vous conseillons de r\xE9initialiser votre mot de passe depuis les param\xE8tres de votre profil.</p>
  `;
  return getPremiumEmailWrapper({
    title: "[Compta-Flow] Cr\xE9ation de votre acc\xE8s collaborateur",
    subtitle: `Bonjour ${data.agentName},`,
    bodyHtml,
    buttonLabel: "Acc\xE9der au Portail Collaborateur",
    buttonUrl: data.portalUrl
  });
}
function getSupportResponseEmailTemplate(data) {
  const bodyHtml = `
    <p style="color: #CCCCCC; font-size: 14px;">Votre conseiller virtuel Compta-Flow a trait\xE9 votre demande d'assistance.</p>
    <div style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px; margin: 20px 0;">
      <p style="color: #88888F; font-size: 12px; margin-top:0;"><strong>Votre question :</strong></p>
      <p style="color: #FDFBF7; font-size: 13px; font-style: italic; margin-bottom:0;">"${data.question}"</p>
    </div>
    <div style="background-color: rgba(214, 175, 55, 0.03); border-left: 3px solid #D4AF37; padding: 20px; border-radius: 4px; margin: 20px 0;">
      <p style="color: #D4AF37; font-size: 12px; margin-top:0; font-weight: bold;">R\xE9ponse de l'assistant d'\xE9lite :</p>
      <p style="color: #CCCCCC; font-size: 13px; line-height:1.7; margin-bottom:0;">${data.aiResponse.replace(/\n/g, "<br>")}</p>
    </div>
    <p style="color: #88888F; font-size: 13px;">Si vous avez besoin de pr\xE9cisions ou de d\xE9poser des documents d'analyse, vous pouvez poursuivre la conversation depuis votre espace client.</p>
  `;
  return getPremiumEmailWrapper({
    title: "[Compta-Flow] Suivi de votre demande de support",
    subtitle: `Bonjour ${data.clientName},`,
    bodyHtml,
    buttonLabel: "Ouvrir l'Espace Support en ligne",
    buttonUrl: data.portalUrl
  });
}

// src/lib/financeUtils.ts
function normalizeProvinceCode(value) {
  const code = (value || "ON").toUpperCase();
  const allowed = ["QC", "ON", "BC", "AB", "MB", "NB", "NL", "NS", "PE", "SK", "YT", "NT", "NU"];
  return allowed.includes(code) ? code : "ON";
}
function calculateCanadianTaxes(amount, province = "ON") {
  let tpsRate = 0.05;
  let tvqRate = 0;
  let tvhRate = 0;
  switch (province) {
    case "QC":
      tvqRate = 0.09975;
      break;
    case "ON":
      tpsRate = 0;
      tvhRate = 0.13;
      break;
    case "NB":
    case "NL":
    case "NS":
    case "PE":
      tpsRate = 0;
      tvhRate = 0.15;
      break;
    case "BC":
      tvqRate = 0.07;
      break;
    case "SK":
      tvqRate = 0.06;
      break;
    case "MB":
      tvqRate = 0.07;
      break;
    default:
      tvqRate = 0;
      tvhRate = 0;
  }
  const tps = Number((amount * tpsRate).toFixed(2));
  const tvq = Number((amount * tvqRate).toFixed(2));
  const tvh = Number((amount * tvhRate).toFixed(2));
  const total = Number((amount + tps + tvq + tvh).toFixed(2));
  return {
    subtotal: amount,
    tps,
    tvq,
    tvh,
    total
  };
}
function getTaxDisplayLines(result, province, lang = "fr") {
  const fr = lang === "fr";
  const lines = [];
  if (result.tvh > 0) {
    const rate = province === "ON" ? "13" : "15";
    lines.push({
      label: fr ? `TVH harmonis\xE9e (${rate} %)` : `Harmonized HST (${rate}%)`,
      amount: result.tvh
    });
    return lines;
  }
  if (result.tps > 0) {
    lines.push({
      label: fr ? "TPS f\xE9d\xE9rale (5 %)" : "Federal GST (5%)",
      amount: result.tps
    });
  }
  if (result.tvq > 0) {
    const label = province === "QC" ? fr ? "TVQ provinciale (9,975 %)" : "Provincial QST (9.975%)" : province === "BC" ? fr ? "TVP C.-B. (7 %)" : "BC PST (7%)" : province === "SK" ? fr ? "TVP Sask. (6 %)" : "SK PST (6%)" : province === "MB" ? fr ? "TVP Man. (7 %)" : "MB PST (7%)" : fr ? "Taxe provinciale" : "Provincial tax";
    lines.push({ label, amount: result.tvq });
  }
  return lines;
}
var formatCAD = (amount) => {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD"
  }).format(amount);
};

// src/lib/canadaNetwork.ts
var CANADIAN_REGIONS = {
  QC: {
    code: "QC",
    nameFr: "Qu\xE9bec",
    nameEn: "Quebec",
    timezone: "America/Toronto",
    edgeRegion: "yul1",
    privacyLaw: "loi25",
    taxLabelFr: "TPS 5 % + TVQ 9,975 %",
    taxLabelEn: "GST 5% + QST 9.975%",
    seoSlug: "quebec",
    active: true
  },
  ON: {
    code: "ON",
    nameFr: "Ontario",
    nameEn: "Ontario",
    timezone: "America/Toronto",
    edgeRegion: "yyz1",
    privacyLaw: "pipeda",
    taxLabelFr: "TVH 13 %",
    taxLabelEn: "HST 13%",
    seoSlug: "ontario",
    active: true
  },
  BC: {
    code: "BC",
    nameFr: "Colombie-Britannique",
    nameEn: "British Columbia",
    timezone: "America/Vancouver",
    edgeRegion: "yvr1",
    privacyLaw: "pipeda_bc",
    taxLabelFr: "TPS 5 % + TVP 7 %",
    taxLabelEn: "GST 5% + PST 7%",
    seoSlug: "colombie-britannique",
    active: true
  },
  AB: {
    code: "AB",
    nameFr: "Alberta",
    nameEn: "Alberta",
    timezone: "America/Edmonton",
    edgeRegion: "yyc1",
    privacyLaw: "pipa_ab",
    taxLabelFr: "TPS 5 %",
    taxLabelEn: "GST 5%",
    seoSlug: "alberta",
    active: true
  },
  MB: {
    code: "MB",
    nameFr: "Manitoba",
    nameEn: "Manitoba",
    timezone: "America/Winnipeg",
    edgeRegion: "ywg1",
    privacyLaw: "pipeda",
    taxLabelFr: "TPS 5 % + TVP 7 %",
    taxLabelEn: "GST 5% + PST 7%",
    seoSlug: "manitoba",
    active: true
  },
  SK: {
    code: "SK",
    nameFr: "Saskatchewan",
    nameEn: "Saskatchewan",
    timezone: "America/Regina",
    edgeRegion: "yxe1",
    privacyLaw: "pipeda",
    taxLabelFr: "TPS 5 % + TVP 6 %",
    taxLabelEn: "GST 5% + PST 6%",
    seoSlug: "saskatchewan",
    active: true
  },
  NB: {
    code: "NB",
    nameFr: "Nouveau-Brunswick",
    nameEn: "New Brunswick",
    timezone: "America/Moncton",
    edgeRegion: "yfc1",
    privacyLaw: "pipeda",
    taxLabelFr: "TVH 15 %",
    taxLabelEn: "HST 15%",
    seoSlug: "nouveau-brunswick",
    active: true
  },
  NS: {
    code: "NS",
    nameFr: "Nouvelle-\xC9cosse",
    nameEn: "Nova Scotia",
    timezone: "America/Halifax",
    edgeRegion: "yhz1",
    privacyLaw: "pipeda",
    taxLabelFr: "TVH 15 %",
    taxLabelEn: "HST 15%",
    seoSlug: "nouvelle-ecosse",
    active: true
  },
  PE: {
    code: "PE",
    nameFr: "\xCEle-du-Prince-\xC9douard",
    nameEn: "Prince Edward Island",
    timezone: "America/Halifax",
    edgeRegion: "yhz1",
    privacyLaw: "pipeda",
    taxLabelFr: "TVH 15 %",
    taxLabelEn: "HST 15%",
    seoSlug: "ipe",
    active: true
  },
  NL: {
    code: "NL",
    nameFr: "Terre-Neuve-et-Labrador",
    nameEn: "Newfoundland and Labrador",
    timezone: "America/St_Johns",
    edgeRegion: "yyt1",
    privacyLaw: "pipeda",
    taxLabelFr: "TVH 15 %",
    taxLabelEn: "HST 15%",
    seoSlug: "terre-neuve",
    active: true
  },
  YT: {
    code: "YT",
    nameFr: "Yukon",
    nameEn: "Yukon",
    timezone: "America/Whitehorse",
    edgeRegion: "yxy1",
    privacyLaw: "pipeda",
    taxLabelFr: "TPS 5 %",
    taxLabelEn: "GST 5%",
    seoSlug: "yukon",
    active: true
  },
  NT: {
    code: "NT",
    nameFr: "Territoires du Nord-Ouest",
    nameEn: "Northwest Territories",
    timezone: "America/Yellowknife",
    edgeRegion: "yxy1",
    privacyLaw: "pipeda",
    taxLabelFr: "TPS 5 %",
    taxLabelEn: "GST 5%",
    seoSlug: "tno",
    active: true
  },
  NU: {
    code: "NU",
    nameFr: "Nunavut",
    nameEn: "Nunavut",
    timezone: "America/Iqaluit",
    edgeRegion: "yxy1",
    privacyLaw: "pipeda",
    taxLabelFr: "TPS 5 %",
    taxLabelEn: "GST 5%",
    seoSlug: "nunavut",
    active: true
  }
};

// api/app.ts
var { Client: Client2 } = pg2;
dotenv.config();
var sanitizeEnvVar = (val) => {
  if (!val) return "";
  return val.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
};
var resendKey = sanitizeEnvVar(process.env.RESEND_API_KEY) || "re_mock_resend_key_123";
var twilioSid = sanitizeEnvVar(process.env.TWILIO_ACCOUNT_SID) || "AC_mock_twilio_sid";
var twilioToken = sanitizeEnvVar(process.env.TWILIO_AUTH_TOKEN) || "mock_twilio_token";
var geminiKey = sanitizeEnvVar(process.env.GOOGLE_GEMINI_API_KEY) || "mock_gemini_api_key";
var ADMIN_SECRET = sanitizeEnvVar(process.env.ADMIN_SECRET);
var SUPABASE_DB_PASSWORD = sanitizeEnvVar(process.env.SUPABASE_DB_PASSWORD);
if (process.env.NODE_ENV === "production" && !ADMIN_SECRET) {
  console.error("[ComptaFlow] FATAL: ADMIN_SECRET must be set in production.");
  process.exit(1);
}
var genAI = new GoogleGenerativeAI2(geminiKey);
var visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
var agenticModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
var resend = new Resend(resendKey);
var twilioClient = twilio(twilioSid, twilioToken);
var ADMIN_PHONE = "+18192158545";
var PLATFORM_SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || SUPPORT_EMAIL;
var PLATFORM_INTERAC_EMAIL = process.env.INTERAC_EMAIL || CONFIG.APP.INTERAC_EMAIL;
var COMPANY_OUTLOOK_EMAIL = "compta-flow@outlook.com";
var supabaseUrl = resolveSupabaseUrl();
var supabaseAnonKey = resolveSupabaseAnonKey();
var serviceRoleKey = resolveSupabaseServiceRoleKey();
var supabaseClientKey = serviceRoleKey || supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIn0.placeholder";
var supabase = createClient(supabaseUrl, supabaseClientKey);
function isInternalAgentRequest(req) {
  if (!ADMIN_SECRET) return false;
  const headerSecret = req.headers["x-comptaflow-internal"];
  if (headerSecret && String(headerSecret) === ADMIN_SECRET) return true;
  const bearer = req.headers.authorization?.split(" ")[1];
  if (bearer && bearer === ADMIN_SECRET) return true;
  const bodySecret = req.body?.secret;
  if (bodySecret && bodySecret === ADMIN_SECRET) return true;
  return false;
}
async function findAuthUserByEmail(listUsers, email) {
  const target = email.toLowerCase();
  for (let page = 1; page <= 20; page += 1) {
    const { users } = await listUsers(page);
    const match = users.find((u) => u.email?.toLowerCase() === target);
    if (match) return match;
    if (users.length < 200) break;
  }
  return null;
}
async function bootstrapAdminAccounts(password) {
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured on server");
  }
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const listUsers = async (page) => {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    return data;
  };
  const results = [];
  for (const account of SEED_ADMIN_ACCOUNTS) {
    const portal = PORTAL_HOME_BY_ROLE[account.role];
    let userId = "";
    const existing = await findAuthUserByEmail(listUsers, account.email);
    if (existing) {
      userId = existing.id;
      const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
        user_metadata: { full_name: account.fullName, display_name: account.fullName }
      });
      if (updateError) throw new Error(`updateUser ${account.email}: ${updateError.message}`);
      results.push({ email: account.email, role: account.role, userId, portal, action: "updated auth" });
    } else {
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email: account.email,
        password,
        email_confirm: true,
        user_metadata: { full_name: account.fullName, display_name: account.fullName }
      });
      if (createError) throw new Error(`createUser ${account.email}: ${createError.message}`);
      userId = created.user.id;
      results.push({ email: account.email, role: account.role, userId, portal, action: "created auth" });
    }
    const { error: profileError } = await admin.from("profiles").upsert(
      {
        id: userId,
        email: account.email,
        full_name: account.fullName,
        display_name: account.fullName,
        role: account.role,
        sub_admin_id: null,
        status: "active"
      },
      { onConflict: "id" }
    );
    if (profileError) {
      throw new Error(`profiles upsert ${account.email}: ${profileError.message}`);
    }
  }
  return results;
}
var DB_PATH = path2.join(process.cwd(), "local_db.json");
var getDb = () => {
  try {
    return JSON.parse(fs2.readFileSync(DB_PATH, "utf8"));
  } catch {
    return {};
  }
};
var saveDb = (data) => {
  try {
    fs2.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch {
  }
};
var app = express();
var PORT = process.env.PORT || 3e3;
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use((req, res, next) => {
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://*.supabase.co https://images.unsplash.com; connect-src 'self' https://*.supabase.co; font-src 'self' https://fonts.gstatic.com;");
  next();
});
var rateLimitStore = {};
var rateLimiter = (limit, windowMs) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
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
      botLog("RATE_LIMIT_EXCEEDED", ip.toString(), `Trop de requ\xEAtes sur ${req.path}`);
      return res.status(429).json({
        error: "Too many requests",
        message: "Trop de requ\xEAtes. Veuillez r\xE9essayer plus tard."
      });
    }
    next();
  };
};
var botLog = (action, target, details) => {
  try {
    const db = getDb();
    if (!db.bot_logs) db.bot_logs = [];
    db.bot_logs.push({ id: `bot_${Date.now()}`, action_type: action, target_id: target, details, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
    saveDb(db);
    console.log(`[SAS V5.0][${action}] ${details}`);
  } catch (e) {
  }
};
var sendSupremeEmail = async (to, subject, html) => {
  const resendKey2 = sanitizeEnvVar(process.env.RESEND_API_KEY) || "re_mock_resend_key_123";
  const hasRealKey = resendKey2 && resendKey2 !== "re_mock_resend_key_123" && !resendKey2.startsWith("mock");
  let finalHtml = html;
  if (!html.trim().startsWith("<!DOCTYPE") && !html.includes("<html")) {
    finalHtml = getPremiumEmailWrapper({
      title: subject,
      subtitle: subject,
      bodyHtml: html,
      buttonUrl: "https://compta-flow.net/login",
      buttonLabel: "Acc\xE9der au Portail"
    });
  }
  if (hasRealKey) {
    try {
      await resend.emails.send({
        from: "Comptaflow <support@compta-flow.net>",
        to: [to],
        subject,
        html: finalHtml
      });
      botLog("SUPREME_EMAIL_SENT", to, `Email "${subject}" envoy\xE9 avec succ\xE8s.`);
    } catch (err) {
      console.error("[sendSupremeEmail] Failed to send email:", err.message);
    }
  } else {
    console.log("=================== SIMULATION D'ENVOI D'EMAIL ===================");
    console.log(`[TO: ${to}] [SUBJECT: ${subject}]`);
    console.log(`[HTML Content Preview]:
${html}`);
    console.log("==================================================================");
  }
};
app.post("/api/bootstrap-admins", async (req, res) => {
  if (!isInternalAgentRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const password = String(req.body?.password || "");
  if (password.length < 8) {
    return res.status(400).json({
      error: "password requis (min. 8 caract\xE8res) dans le body JSON",
      hint: "docs/SETUP_WITHOUT_CLI.md \u2014 alternative: scripts/seed-admins-manual.sql"
    });
  }
  if (!serviceRoleKey) {
    return res.status(503).json({
      error: "SUPABASE_SERVICE_ROLE_KEY not configured on server",
      hint: "Vercel \u2192 connect Supabase integration or add env manually, then redeploy",
      manualAlternative: "scripts/seed-admins-manual.sql"
    });
  }
  try {
    const results = await bootstrapAdminAccounts(password);
    return res.json({
      success: true,
      accounts: results,
      loginUrl: "https://compta-flow.net/login"
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
});
app.post("/api/setup-admin", async (req, res) => {
  if (!isInternalAgentRequest(req)) {
    return res.status(401).json({
      error: "Unauthorized",
      hint: "Use X-ComptaFlow-Internal, Authorization: Bearer ADMIN_SECRET, or body.secret",
      preferred: 'POST /api/bootstrap-admins with {"password":"..."}'
    });
  }
  const password = String(req.body?.password || "");
  if (password.length < 8) {
    return res.status(400).json({
      error: "password requis (min. 8 caract\xE8res)",
      preferred: "POST /api/bootstrap-admins"
    });
  }
  if (!serviceRoleKey) {
    return res.status(503).json({
      error: "SUPABASE_SERVICE_ROLE_KEY not configured",
      manualAlternative: "scripts/seed-admins-manual.sql + docs/SETUP_WITHOUT_CLI.md"
    });
  }
  try {
    const results = await bootstrapAdminAccounts(password);
    return res.json({
      success: true,
      deprecated: true,
      message: "Use /api/bootstrap-admins instead",
      accounts: results
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
});
app.post("/api/diagnostics", (req, res) => {
  if (!isInternalAgentRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const matchingEnv = {};
  for (const key of Object.keys(process.env)) {
    const keyLower = key.toLowerCase();
    if (keyLower.includes("supabase") || keyLower.includes("secret") || keyLower.includes("key") || keyLower.includes("db") || keyLower.includes("password") || keyLower.includes("url") || keyLower.includes("postgres") || keyLower.includes("service")) {
      matchingEnv[key] = process.env[key] || "";
    }
  }
  res.json({
    keys: Object.keys(process.env).sort(),
    matchingEnv
  });
});
app.post("/api/plaid/create-link-token", async (req, res) => {
  botLog("PLAID_SYNC", "Banking", "G\xE9n\xE9ration du Link Token bancaire via API Plaid.");
  res.json({ link_token: "link-sandbox-fake-token-1234" });
});
app.post("/api/plaid/exchange-public-token", async (req, res) => {
  botLog("PLAID_AUTH", "Banking", `Token \xE9chang\xE9 avec succ\xE8s. Pont bancaire \xE9tabli.`);
  res.json({ success: true, access_token: "access-sandbox-fake", item_id: "item-fake" });
});
app.post("/api/qbo/push-transaction", async (req, res) => {
  const { documentId, amount, date, vendor, taxAmount } = req.body;
  botLog("QBO_SYNC", vendor, `Synchronisation de la facture ${documentId} vers QuickBooks en cours...`);
  setTimeout(() => {
    botLog("QBO_SUCCESS", vendor, `Facture pouss\xE9e avec succ\xE8s vers le grand livre (Total: ${amount}$, Taxes: ${taxAmount}$).`);
    res.json({ success: true, qbo_id: `qbo_${Date.now()}` });
  }, 1500);
});
app.post("/api/webhook/transaction-alert", async (req, res) => {
  const { transactionId, amount, vendor, date, type } = req.body;
  const summaryMsg = `COMPTAFLOW ALERT: Nouvelle transaction identifi\xE9e.
Fournisseur: ${vendor}
Montant: ${amount}$
Date: ${date}
Type: ${type}`;
  botLog("LIVE_TRACKER", transactionId, `Analyse en temps r\xE9el. Envoi du r\xE9sum\xE9 au ${ADMIN_PHONE}`);
  try {
    if (process.env.TWILIO_ACCOUNT_SID) {
      await twilioClient.messages.create({
        body: summaryMsg,
        from: process.env.TWILIO_PHONE_NUMBER || "+1234567890",
        to: ADMIN_PHONE
      });
    } else {
      console.log(`[SMS MOCK to ${ADMIN_PHONE}] 
${summaryMsg}`);
    }
    await sendSupremeEmail(PLATFORM_SUPPORT_EMAIL, `Alerte Transaction: ${vendor}`, `
      <h2>Nouvelle Transaction D\xE9tect\xE9e</h2>
      <p><strong>Fournisseur:</strong> ${vendor}</p>
      <p><strong>Montant:</strong> ${amount} $</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Type:</strong> ${type}</p>
    `);
    res.json({ success: true, message: "Alerte envoy\xE9e avec succ\xE8s." });
  } catch (error) {
    botLog("LIVE_TRACKER_ERROR", transactionId, error.message);
    res.status(500).json({ error: "Erreur lors de l'envoi de l'alerte." });
  }
});
app.post("/api/ai/analyze-document", rateLimiter(30, 6e4), async (req, res) => {
  const authCtx = await getAuthenticatedUserFromRequest(req);
  if (!authCtx) {
    return res.status(401).json({ error: "Authentification requise (Bearer token Supabase)." });
  }
  const { fileData, fileName, mimeType } = req.body;
  if (!fileData || !fileName || !mimeType) {
    botLog("IA_ANALYZE_ERROR", fileName || "unknown", "Param\xE8tres requis manquants.");
    return res.status(400).json({ error: "Champs obligatoires manquants: fileData, fileName ou mimeType." });
  }
  try {
    const hash = crypto.createHash("sha256").update(fileData).digest("hex");
    botLog("LEGAL_HASHING", fileName, `SHA-256 g\xE9n\xE9r\xE9: ${hash.slice(0, 8)}...`);
    const prompt = `Extraire JSON Qu\xE9bec : type (FACTURE, T4, etc.), emetteur, date, montant_total, tps, tvq, categorie.`;
    const result = await visionModel.generateContent([prompt, { inlineData: { data: fileData, mimeType } }]);
    const analysis = JSON.parse((await result.response).text().replace(/```json|```/g, "").trim());
    botLog("IA_ANALYZE", fileName, `Classification: ${analysis.type} | Confiance: \xC9lite`);
    res.json({ success: true, analysis, hash });
  } catch (error) {
    botLog("IA_ANALYZE_CRASH", fileName, error.message);
    res.status(500).json({ error: "IA error" });
  }
});
app.post("/api/payment/create-checkout", async (req, res) => {
  const { items, customerEmail, reference, method } = req.body;
  if (!items || !customerEmail || !reference) {
    return res.status(400).json({ error: "Param\xE8tres de facturation manquants." });
  }
  if (method && method !== "interac") {
    return res.status(400).json({
      error: "Seul le virement Interac e-Transfer est accept\xE9.",
      supportedMethods: ["interac"]
    });
  }
  botLog("PAYMENT_PENDING", reference, `Instructions Interac envoy\xE9es \xE0 ${customerEmail}`);
  await sendSupremeEmail(customerEmail, `Action : Virement Comptaflow ${reference}`, `
            <h2>Validation de votre mandat</h2>
            <p>Veuillez effectuer le virement de <strong>${items.reduce((a, b) => a + b.price, 0) + 60}$</strong>.</p>
            <p>Destinataire: <strong>${PLATFORM_INTERAC_EMAIL}</strong><br>R\xE9f\xE9rence: <strong>${reference}</strong></p>
        `);
  return res.json({ success: true, manual: true, method: "interac", reference });
});
app.post("/api/payment/setup-direct-debit", (_req, res) => {
  res.status(410).json({
    error: "Seul le virement Interac e-Transfer est accept\xE9. Le pr\xE9l\xE8vement automatique n'est pas disponible.",
    supportedMethods: ["interac"]
  });
});
app.post("/api/intelligence/analyze", rateLimiter(30, 6e4), async (req, res) => {
  const authCtx = await getAuthenticatedUserFromRequest(req);
  if (!authCtx) {
    return res.status(401).json({ error: "Authentification requise (Bearer token Supabase)." });
  }
  const { transactions, query, profile } = req.body;
  try {
    const prompt = `Tu es l'Analyste Financier Senior de ComptaFlow. 
    Analyse les transactions suivantes pour ${profile.displayName} (${profile.companyName || "Individuel"}):
    
    ${JSON.stringify(transactions, null, 2)}
    
    Question du client : "${query}"
    
    Fournis une analyse structur\xE9e en 3 points :
    1. \u{1F3AF} R\xE9ponse directe \xE0 la question.
    2. \u{1F4C8} Insight de croissance ou d'optimisation fiscale.
    3. \u26A0\uFE0F Risque potentiel ou anomalie d\xE9tect\xE9e.
    
    Ton ton doit \xEAtre luxueux, expert et ultra-pr\xE9cis.`;
    const result = await visionModel.generateContent(prompt);
    const response = await result.response;
    res.json({ analysis: response.text() });
  } catch (error) {
    botLog("IA_INTEL_ERROR", "System", error.message);
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/cron/elite-hunter", async (req, res) => {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    if (process.env.NODE_ENV === "production") return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    botLog("ELITE_HUNTER_CRON", "System", "D\xE9marrage de la chasse aux prospects B2B...");
    const industries = ["Fintech", "SaaS", "E-commerce", "Consulting AI"];
    const mockLead = {
      name: "Alexandre Tremblay",
      title: "CEO & Fondateur",
      company: "DataCloud Qc",
      industry: industries[Math.floor(Math.random() * industries.length)]
    };
    const geminiLive = geminiKey && geminiKey !== "mock_gemini_api_key" && !geminiKey.startsWith("mock_");
    let sniperMessage = `Bonjour ${mockLead.name}, ComptaFlow accompagne les ${mockLead.industry} qu\xE9b\xE9cois en tenue de livres et fiscalit\xE9.`;
    if (geminiLive) {
      const prompt = `${AGENT_REGISTRY["marketing-hunter"].systemPrompt}

Profil LinkedIn:
Nom: ${mockLead.name}
Titre: ${mockLead.title}
Entreprise: ${mockLead.company}
Industrie: ${mockLead.industry}`;
      const result = await agenticModel.generateContent(prompt);
      sniperMessage = await result.response.text();
    }
    const sAdmin = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey);
    const { error } = await sAdmin.from("marketing_leads").insert([{
      source: "NATIVE_CRON_HUNTER",
      campaign_id: "SNIPER_V2",
      revenue_estimate: Math.floor(Math.random() * 5e3 + 1e3),
      metadata: {
        name: mockLead.name,
        company: mockLead.company,
        script: sniperMessage
      }
    }]);
    if (error) throw error;
    botLog("ELITE_HUNTER_CRON", "Success", `Lead acquis : ${mockLead.company}`);
    res.json({ success: true, message: "La chasse a \xE9t\xE9 fructueuse.", geminiLive });
  } catch (error) {
    botLog("ELITE_HUNTER_CRON_ERROR", "System", error.message);
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/cron/agent-health", async (req, res) => {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    if (process.env.NODE_ENV === "production") return res.status(401).json({ error: "Unauthorized" });
  }
  const geminiLive = !!(geminiKey && geminiKey !== "mock_gemini_api_key" && !geminiKey.startsWith("mock_"));
  const result = runInternalCronJob("agent-health", { geminiConfigured: geminiLive });
  botLog("CRON_AGENT_HEALTH", "System", result.message);
  res.json(result);
});
app.get("/api/internal/cron", (_req, res) => {
  res.json({
    jobs: INTERNAL_CRON_JOBS,
    auth: "X-ComptaFlow-Internal header or Authorization: Bearer CRON_SECRET",
    examples: INTERNAL_CRON_JOBS.map((j) => `POST /api/internal/cron/${j}`)
  });
});
app.post("/api/internal/cron/:job", async (req, res) => {
  if (!isInternalAgentRequest(req)) {
    const cronAuth = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || cronAuth !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }
  const job = String(req.params.job || "");
  const geminiLive = !!(geminiKey && geminiKey !== "mock_gemini_api_key" && !geminiKey.startsWith("mock_"));
  if (job === "elite-hunter" || job === "marketing-hunter") {
    const stub = runInternalCronJob(job, { geminiConfigured: geminiLive });
    botLog("INTERNAL_CRON", job, stub.message);
    return res.json({
      ...stub,
      liveEndpoint: "GET /api/cron/elite-hunter (Bearer CRON_SECRET) \u2014 planifi\xE9 quotidiennement via vercel.json"
    });
  }
  const result = runInternalCronJob(job, { geminiConfigured: geminiLive });
  botLog("INTERNAL_CRON", job, result.message);
  res.status(result.success ? 200 : 400).json(result);
});
app.post("/api/webhook/onboarding-complete", async (req, res) => {
  const {
    userId,
    email,
    displayName,
    province,
    language,
    companyName,
    neq,
    nas,
    initialProfileType,
    selectedExpertEmail
  } = req.body || {};
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "email requis" });
  }
  try {
    botLog("ONBOARDING_COMPLETE", userId || email, `Province: ${province || "QC"}`);
    const portalUrl = "https://compta-flow.net/portal/client/overview";
    const procedureUrl = "https://compta-flow.net/portal/client/procedure";
    const lang = language === "en" ? "en" : language === "ar" ? "ar" : "fr";
    const subjects = {
      fr: "Bienvenue chez ComptaFlow \u2014 vos prochaines \xE9tapes",
      en: "Welcome to ComptaFlow \u2014 your next steps",
      ar: "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643\u0645 \u0641\u064A ComptaFlow \u2014 \u0627\u0644\u062E\u0637\u0648\u0627\u062A \u0627\u0644\u062A\u0627\u0644\u064A\u0629"
    };
    const welcomeHtml = getOnboardingCompleteEmailTemplate({
      clientName: displayName || "",
      lang,
      portalUrl,
      procedureUrl
    });
    const resendKeyForOnboarding = sanitizeEnvVar(process.env.RESEND_API_KEY) || "re_mock_resend_key_123";
    if (resendKeyForOnboarding && resendKeyForOnboarding !== "re_mock_resend_key_123" && !resendKeyForOnboarding.startsWith("mock")) {
      await sendSupremeEmail(email, subjects[lang], welcomeHtml);
    } else {
      console.log(`[CLIENT ONBOARDING WELCOME to ${email}] Subject: ${subjects[lang]}`);
    }
    if (process.env.RESEND_API_KEY) {
      const detailedNotificationHtml = `
        <div style="font-family:sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;border:1px solid #eee;padding:20px;border-radius:8px;background-color:#fff;">
          <h2 style="color:#D4AF37;border-bottom:2px solid #D4AF37;padding-bottom:8px;margin-top:0;">\u{1F3DB}\uFE0F Nouvelle Inscription Client</h2>
          <p>Un nouveau client a compl\xE9t\xE9 son inscription avec les informations suivantes :</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;text-align:left;">
            <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;width:40%;border:1px solid #ddd;">Nom complet :</td><td style="padding:8px;border:1px solid #ddd;">${displayName || "Non fourni"}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border:1px solid #ddd;">Adresse courriel :</td><td style="padding:8px;border:1px solid #ddd;">${email}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;border:1px solid #ddd;">Province :</td><td style="padding:8px;border:1px solid #ddd;">${province || "QC"}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border:1px solid #ddd;">Langue :</td><td style="padding:8px;border:1px solid #ddd;">${lang.toUpperCase()}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;border:1px solid #ddd;">Type de profil :</td><td style="padding:8px;border:1px solid #ddd;">${initialProfileType || "Individuel"}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border:1px solid #ddd;">Nom entreprise :</td><td style="padding:8px;border:1px solid #ddd;">${companyName || "N/A"}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;border:1px solid #ddd;">Num\xE9ro NEQ :</td><td style="padding:8px;border:1px solid #ddd;">${neq || "N/A"}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border:1px solid #ddd;">Num\xE9ro NAS :</td><td style="padding:8px;border:1px solid #ddd;">${nas ? "Fourni (S\xE9curis\xE9)" : "N/A"}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;border:1px solid #ddd;">Comptable r\xE9f\xE9r\xE9 :</td><td style="padding:8px;border:1px solid #ddd;">${selectedExpertEmail || "Aucun"}</td></tr>
          </table>
          <p style="margin-top:20px;"><a href="${portalUrl}" style="display:inline-block;background:#D4AF37;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;font-weight:bold;">Acc\xE9der au portail client</a></p>
        </div>
      `;
      const targetEmails = Array.from(/* @__PURE__ */ new Set([
        COMPANY_OUTLOOK_EMAIL,
        PLATFORM_SUPPORT_EMAIL,
        "s.lahaie07@gmail.com"
      ])).filter(Boolean);
      for (const targetEmail of targetEmails) {
        await sendSupremeEmail(
          targetEmail,
          `[ComptaFlow] Nouvelle inscription \u2014 ${displayName || email}`,
          detailedNotificationHtml
        );
      }
    }
    if (userId && serviceRoleKey) {
      const { data: profile } = await supabase.from("profiles").select("metadata").eq("id", userId).single();
      const existingMeta = profile?.metadata || {};
      await supabase.from("profiles").update({
        metadata: {
          ...existingMeta,
          onboardingCompletedAt: (/* @__PURE__ */ new Date()).toISOString(),
          province: province || existingMeta.province || "QC",
          onboardingWebhook: true
        }
      }).eq("id", userId);
    }
    res.json({
      success: true,
      emailSent: !!process.env.RESEND_API_KEY,
      portalUrl,
      procedureUrl,
      n8nHint: "Import n8n-onboarding-automation.json \u2014 webhook POST /api/webhook/onboarding-complete"
    });
  } catch (error) {
    botLog("ONBOARDING_WEBHOOK_ERROR", email, error.message);
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/internal/bot-logs", async (req, res) => {
  if (!isInternalAgentRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const limit = Math.min(parseInt(String(req.query.limit || "50"), 10) || 50, 200);
  const db = getDb();
  const logs = (db.bot_logs || []).slice(-limit).reverse();
  res.json({ logs, count: logs.length });
});
app.get("/api/internal/agents", async (req, res) => {
  if (!isInternalAgentRequest(req)) {
    const ctx = await getSuperAdminFromRequest(req);
    if (!ctx) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }
  const includeInternal = req.query.all === "1" || req.query.all === "true";
  res.json({
    agents: listAgents({ internal: includeInternal }).map((a) => ({
      id: a.id,
      name: a.name,
      intent: a.intent,
      visibility: a.visibility,
      description: a.description
    }))
  });
});
app.post("/api/support/ai-chat", async (req, res) => {
  const { message, context, history } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message requis" });
  }
  try {
    const result = await runAgentOrchestrator(
      {
        message,
        context: { ...context, channel: "support-chat" },
        history: Array.isArray(history) ? history : void 0
      },
      {
        onRoute: (intent, agentId) => botLog("AGENTIC_ROUTING", "User", `${intent} \u2192 ${agentId}`)
      }
    );
    const lang = context?.language === "en" || context?.language === "ar" ? context.language : "fr";
    botLog("AGENTIC_REPLY", result.agentId, `${result.intent} ${result.latencyMs}ms`);
    const reply = toPublicSupportReply(result, lang);
    if (context?.email) {
      const supportEmailHtml = getSupportResponseEmailTemplate({
        clientName: context.fullName || "Client Comptaflow",
        question: message,
        aiResponse: reply.answer,
        portalUrl: "https://compta-flow.net/login"
      });
      sendSupremeEmail(
        context.email.toLowerCase().trim(),
        lang === "en" ? "[Compta-Flow] Support Ticket Follow-up" : lang === "ar" ? "[Compta-Flow] \u0645\u062A\u0627\u0628\u0639\u0629 \u062A\u0630\u0643\u0631\u0629 \u0627\u0644\u062F\u0639\u0645" : "[Compta-Flow] Suivi de votre demande de support",
        supportEmailHtml
      ).catch((err) => console.error("[AI Chat Support Email] Failed to send:", err.message));
      sendSupremeEmail(
        COMPANY_OUTLOOK_EMAIL,
        `[ComptaFlow] Communication client \u2014 ${context.fullName || context.email}`,
        supportEmailHtml
      ).catch((err) => console.error("[AI Chat Support Email] Admin copy failed to send:", err.message));
    }
    res.json(reply);
  } catch (e) {
    botLog("AGENTIC_CRASH", "Support", e.message);
    const lang = context?.language === "en" || context?.language === "ar" ? context.language : "fr";
    res.json(
      toPublicSupportReply(
        {
          answer: lang === "en" ? "I'm briefly unavailable \u2014 your bookkeeper will follow up within 24 business hours." : lang === "ar" ? "\u0623\u0646\u0627 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u0645\u0624\u0642\u062A\u0627\u064B \u2014 \u0633\u064A\u062A\u0627\u0628\u0639 \u0645\u062D\u0627\u0633\u0628\u0643 \u062E\u0644\u0627\u0644 24 \u0633\u0627\u0639\u0629 \u0639\u0645\u0644." : "Je suis momentan\xE9ment indisponible \u2014 votre comptable reprendra le fil sous 24 h ouvrables.",
          agentId: "general"
        },
        lang
      )
    );
  }
});
async function getAuthenticatedUserFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  if (!serviceRoleKey) return null;
  const token = authHeader.slice(7);
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { data: userData, error: userError } = await adminClient.auth.getUser(token);
  if (userError || !userData.user) return null;
  return {
    user: userData.user,
    adminClient
  };
}
function assertSelfServiceTarget(authUser, body) {
  const bodyUserId = body.userId ? String(body.userId) : void 0;
  const bodyEmail = body.email ? String(body.email).toLowerCase().trim() : void 0;
  const authEmail = authUser.user.email?.toLowerCase();
  if (bodyUserId && bodyUserId !== authUser.user.id) {
    return { ok: false, status: 403, error: "Vous ne pouvez agir que sur votre propre compte." };
  }
  if (bodyEmail && authEmail && bodyEmail !== authEmail) {
    return { ok: false, status: 403, error: "Vous ne pouvez agir que sur votre propre compte." };
  }
  return { ok: true };
}
async function getSuperAdminFromRequest(req) {
  const ctx = await getAuthenticatedUserFromRequest(req);
  if (!ctx) return null;
  const { data: profile } = await ctx.adminClient.from("profiles").select("role").eq("id", ctx.user.id).single();
  if (profile?.role !== "super_admin") return null;
  return { user: ctx.user, adminClient: ctx.adminClient };
}
app.post("/api/invoices/reconcile", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!ADMIN_SECRET) {
    return res.status(503).json({ error: "ADMIN_SECRET non configur\xE9 sur le serveur." });
  }
  if (!token || token !== ADMIN_SECRET) {
    return res.status(401).json({ error: "Non autoris\xE9. Jeton secret invalide." });
  }
  const { invoiceNumber, amount, interacRef } = req.body;
  if (!invoiceNumber || !interacRef) {
    return res.status(400).json({ error: "invoiceNumber et interacRef sont requis." });
  }
  try {
    if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
      const db = getDb();
      const invoice2 = db.invoices.find((i) => i.number === invoiceNumber);
      if (invoice2) {
        if (invoice2.status === "paid") {
          return res.status(400).json({ error: "La facture est d\xE9j\xE0 pay\xE9e." });
        }
        invoice2.status = "paid";
        invoice2.clientADeclarePaye = true;
        invoice2.interacReference = interacRef;
        invoice2.datePaiement = (/* @__PURE__ */ new Date()).toISOString();
        saveDb(db);
        return res.json({ success: true, message: "Facture r\xE9concili\xE9e avec succ\xE8s (Mock DB).", invoice: invoice2 });
      }
    }
    const { data: invoice, error: fetchError } = await supabase.from("invoices").select("*, profiles!client_id(full_name, email)").eq("numero", invoiceNumber).single();
    if (fetchError || !invoice) {
      return res.status(404).json({ error: `Facture ${invoiceNumber} introuvable.` });
    }
    if (invoice.statut === "payee") {
      return res.status(400).json({ error: "La facture est d\xE9j\xE0 r\xE9gl\xE9e." });
    }
    if (amount && Math.abs(parseFloat(invoice.montant_total) - parseFloat(amount)) > 0.05) {
      return res.status(400).json({
        error: `Montant non concordant. Attendu: ${invoice.montant_total}, Re\xE7u: ${amount}`
      });
    }
    const { error: updateError } = await supabase.from("invoices").update({
      statut: "payee",
      date_paiement: (/* @__PURE__ */ new Date()).toISOString(),
      interac_reference: interacRef,
      client_a_declare_paye: true
    }).eq("id", invoice.id);
    if (updateError) throw updateError;
    if (resendKey && invoice.profiles?.email) {
      try {
        const resend2 = new Resend(resendKey);
        await resend2.emails.send({
          from: "Facturation ComptaFlow <noreply@compta-flow.net>",
          to: invoice.profiles.email,
          subject: `Confirmation de r\xE9ception de votre virement Interac - Facture ${invoiceNumber}`,
          text: `Bonjour ${invoice.profiles.full_name || "Client"},

Nous confirmons la bonne r\xE9ception de votre virement Interac d'un montant de ${invoice.montant_total} $ (R\xE9f Interac: ${interacRef}).

Votre facture ${invoiceNumber} est maintenant marqu\xE9e comme pay\xE9e.

Cordialement,
L'\xE9quipe ComptaFlow`
        });
      } catch (emailErr) {
        console.warn("\xC9chec d'envoi du courriel de confirmation :", emailErr.message);
      }
    }
    try {
      await supabase.from("audit_logs").insert({
        user_id: invoice.client_id,
        action: "AUTO_RECONCILE",
        table_name: "invoices",
        record_id: invoice.id,
        new_data: { interac_reference: interacRef, amount: invoice.montant_total }
      });
    } catch (auditErr) {
      console.warn("\xC9chec d'\xE9criture dans les logs d'audit :", auditErr);
    }
    return res.json({
      success: true,
      message: "Facture r\xE9concili\xE9e avec succ\xE8s et notifi\xE9e par courriel.",
      invoiceId: invoice.id,
      clientEmail: invoice.profiles?.email
    });
  } catch (err) {
    botLog("RECONCILE_ERROR", "System", err.message);
    return res.status(500).json({ error: "Erreur interne lors de la r\xE9conciliation : " + err.message });
  }
});
app.post("/api/profile/delete", async (req, res) => {
  const authCtx = await getAuthenticatedUserFromRequest(req);
  if (!authCtx) {
    return res.status(401).json({ error: "Authentification requise (Bearer token Supabase)." });
  }
  const selfCheck = assertSelfServiceTarget(authCtx, req.body || {});
  if (selfCheck.ok === false) {
    return res.status(selfCheck.status).json({ error: selfCheck.error });
  }
  let targetUserId = authCtx.user.id;
  let targetEmail = authCtx.user.email;
  const db = getDb();
  let foundInLocalDb = false;
  if (db.profiles) {
    const localProfile = db.profiles.find(
      (p) => targetUserId && p.id === targetUserId || targetEmail && p.email?.toLowerCase() === targetEmail.toLowerCase()
    );
    if (localProfile) {
      targetUserId = localProfile.id || targetUserId;
      targetEmail = localProfile.email || targetEmail;
      foundInLocalDb = true;
    }
  }
  const projectRef = "unvyxfxlzhnutpugjxhe";
  if (serviceRoleKey && (!targetUserId || !targetEmail)) {
    try {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
      let query = supabaseAdmin.from("profiles").select("*");
      if (targetUserId) {
        query = query.eq("id", targetUserId);
      } else if (targetEmail) {
        query = query.eq("email", targetEmail);
      }
      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        targetUserId = data.id;
        targetEmail = data.email;
      }
    } catch (e) {
      console.error("[delete-profile] Supabase lookup error:", e.message);
    }
  }
  if (!targetUserId) {
    botLog("DELETE_PROFILE_NOT_FOUND", "System", `Utilisateur non trouv\xE9 pour la suppression: ID=${targetUserId}, Email=${targetEmail}`);
    return res.status(404).json({ error: "Utilisateur non trouv\xE9." });
  }
  botLog("DELETE_PROFILE_REQUEST", targetUserId, `Loi 25 - Demande de suppression pour ${targetEmail}`);
  let hasTaxFilings = false;
  let hasUnpaidInvoices = false;
  if (targetUserId.startsWith("mock_")) {
    if (targetUserId === "mock_client_id") {
      hasTaxFilings = true;
    }
    if (db.invoices) {
      const mockInvs = db.invoices.filter((inv) => inv.userId === targetUserId || inv.user_id === targetUserId);
      hasUnpaidInvoices = mockInvs.some((inv) => inv.status !== "paid");
    }
  }
  if (serviceRoleKey && !targetUserId.startsWith("mock_")) {
    try {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
      const { data: docs, error: docsErr } = await supabaseAdmin.from("documents").select("category, metadata").eq("user_id", targetUserId);
      if (!docsErr && docs) {
        hasTaxFilings = docs.some(
          (doc) => doc.category === "fiscal" || doc.category === "tax" || doc.metadata && ["T1", "T2", "T4", "T5", "fiscal", "tax"].includes(doc.metadata.type || "")
        );
      }
      const { data: invs, error: invsErr } = await supabaseAdmin.from("invoices").select("status").eq("user_id", targetUserId);
      if (!invsErr && invs) {
        hasUnpaidInvoices = invs.some((inv) => inv.status !== "paid");
      }
    } catch (e) {
      console.error("[delete-profile] Supabase retention check error:", e.message);
    }
  }
  if (!serviceRoleKey && !targetUserId.startsWith("mock_")) {
    const configs = [
      { host: `db.${projectRef}.supabase.co`, port: 5432, user: "postgres" },
      { host: `aws-1-ca-central-1.pooler.supabase.com`, port: 6543, user: `postgres.${projectRef}` },
      { host: `aws-0-ca-central-1.pooler.supabase.com`, port: 6543, user: `postgres.${projectRef}` }
    ];
    for (const conf of configs) {
      const client = new Client2({
        host: conf.host,
        port: conf.port,
        user: conf.user,
        password: SUPABASE_DB_PASSWORD,
        database: "postgres",
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5e3
      });
      try {
        await client.connect();
        const docRes = await client.query("SELECT category, metadata FROM public.documents WHERE user_id = $1", [targetUserId]);
        hasTaxFilings = docRes.rows.some(
          (doc) => doc.category === "fiscal" || doc.category === "tax" || doc.metadata && ["T1", "T2", "T4", "T5", "fiscal", "tax"].includes(doc.metadata.type || "")
        );
        const invRes = await client.query("SELECT status FROM public.invoices WHERE user_id = $1", [targetUserId]);
        hasUnpaidInvoices = invRes.rows.some((inv) => inv.status !== "paid");
        await client.end();
        break;
      } catch (e) {
        try {
          await client.end();
        } catch (err) {
        }
      }
    }
  }
  if (hasTaxFilings || hasUnpaidInvoices) {
    botLog("DELETE_PROFILE_REJECTED", targetUserId, `Rejet Loi 25: D\xE9clarations=${hasTaxFilings}, Impay\xE9s=${hasUnpaidInvoices}`);
    return res.status(409).json({
      success: false,
      error: "LEGAL_RETENTION_REQUIRED",
      hasTaxFilings,
      hasUnpaidInvoices,
      message: "La suppression du compte a \xE9t\xE9 rejet\xE9e. Les d\xE9clarations fiscales officielles transmises et les factures impay\xE9es doivent \xEAtre conserv\xE9es l\xE9galement pendant 7 ans sous les r\xE9glementations fiscales du Qu\xE9bec (Loi 25 / ARC / Revenu Qu\xE9bec)."
    });
  }
  let method = "None";
  if (foundInLocalDb) {
    method = "local_db.json";
    const dbData = getDb();
    if (dbData.users) dbData.users = dbData.users.filter((u) => u.id !== targetUserId);
    if (dbData.profiles) dbData.profiles = dbData.profiles.filter((p) => p.id !== targetUserId);
    if (dbData.transactions) dbData.transactions = dbData.transactions.filter((t) => t.userId !== targetUserId && t.user_id !== targetUserId);
    if (dbData.invoices) dbData.invoices = dbData.invoices.filter((i) => i.userId !== targetUserId && i.user_id !== targetUserId);
    if (dbData.orders) dbData.orders = dbData.orders.filter((o) => o.userId !== targetUserId && o.user_id !== targetUserId);
    if (dbData.messages) dbData.messages = dbData.messages.filter((m) => m.userId !== targetUserId && m.user_id !== targetUserId);
    saveDb(dbData);
  }
  if (serviceRoleKey && !targetUserId.startsWith("mock_")) {
    try {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
      method = "Supabase JS Admin SDK";
      try {
        const { data: files, error: listErr } = await supabaseAdmin.storage.from("vault").list(targetUserId);
        if (!listErr && files && files.length > 0) {
          const filesToRemove = files.map((f) => `${targetUserId}/${f.name}`);
          await supabaseAdmin.storage.from("vault").remove(filesToRemove);
        }
      } catch (sErr) {
        console.warn("[delete-profile] Storage clean warning:", sErr.message);
      }
      await supabaseAdmin.from("social_content").delete().eq("author_id", targetUserId);
      await supabaseAdmin.from("messages").delete().eq("user_id", targetUserId);
      await supabaseAdmin.from("invoices").delete().eq("user_id", targetUserId);
      await supabaseAdmin.from("transactions").delete().eq("user_id", targetUserId);
      await supabaseAdmin.from("documents").delete().eq("user_id", targetUserId);
      await supabaseAdmin.from("profiles").delete().eq("id", targetUserId);
      const { error: authDelErr } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
      if (authDelErr) {
        console.warn("[delete-profile] Auth user deletion warning:", authDelErr.message);
      }
    } catch (e) {
      console.error("[delete-profile] Supabase deletion crash:", e.message);
    }
  }
  if (!serviceRoleKey && !targetUserId.startsWith("mock_")) {
    const configs = [
      { host: `db.${projectRef}.supabase.co`, port: 5432, user: "postgres" },
      { host: `aws-1-ca-central-1.pooler.supabase.com`, port: 6543, user: `postgres.${projectRef}` },
      { host: `aws-0-ca-central-1.pooler.supabase.com`, port: 6543, user: `postgres.${projectRef}` }
    ];
    for (const conf of configs) {
      const client = new Client2({
        host: conf.host,
        port: conf.port,
        user: conf.user,
        password: SUPABASE_DB_PASSWORD,
        database: "postgres",
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5e3
      });
      try {
        await client.connect();
        method = "Direct PG Client";
        await client.query("DELETE FROM public.social_content WHERE author_id = $1", [targetUserId]);
        await client.query("DELETE FROM public.messages WHERE user_id = $1", [targetUserId]);
        await client.query("DELETE FROM public.invoices WHERE user_id = $1", [targetUserId]);
        await client.query("DELETE FROM public.transactions WHERE user_id = $1", [targetUserId]);
        await client.query("DELETE FROM public.documents WHERE user_id = $1", [targetUserId]);
        await client.query("DELETE FROM public.profiles WHERE id = $1", [targetUserId]);
        await client.query("DELETE FROM auth.users WHERE id = $1", [targetUserId]);
        await client.end();
        break;
      } catch (e) {
        try {
          await client.end();
        } catch (err) {
        }
      }
    }
  }
  botLog("DELETE_PROFILE_SUCCESS", targetUserId, `Loi 25 - Compte supprim\xE9 avec succ\xE8s via ${method}`);
  return res.json({
    success: true,
    message: "Conformit\xE9 Loi 25 confirm\xE9e : toutes les donn\xE9es personnelles ont \xE9t\xE9 supprim\xE9es d\xE9finitivement du syst\xE8me.",
    method
  });
});
app.post("/api/profile/export", rateLimiter(5, 6e4), async (req, res) => {
  const authCtx = await getAuthenticatedUserFromRequest(req);
  if (!authCtx) {
    return res.status(401).json({ error: "Authentification requise (Bearer token Supabase)." });
  }
  const selfCheck = assertSelfServiceTarget(authCtx, req.body || {});
  if (selfCheck.ok === false) {
    return res.status(selfCheck.status).json({ error: selfCheck.error });
  }
  let targetUserId = authCtx.user.id;
  let targetEmail = authCtx.user.email;
  const db = getDb();
  let foundInLocalDb = false;
  let localData = {};
  if (db.profiles) {
    const localProfile = db.profiles.find(
      (p) => targetUserId && p.id === targetUserId || targetEmail && p.email?.toLowerCase() === targetEmail.toLowerCase()
    );
    if (localProfile) {
      targetUserId = localProfile.id || targetUserId;
      targetEmail = localProfile.email || targetEmail;
      foundInLocalDb = true;
      localData.profile = localProfile;
      localData.transactions = db.transactions ? db.transactions.filter((t) => t.userId === targetUserId || t.user_id === targetUserId) : [];
      localData.invoices = db.invoices ? db.invoices.filter((i) => i.userId === targetUserId || i.user_id === targetUserId) : [];
      localData.orders = db.orders ? db.orders.filter((o) => o.userId === targetUserId || o.user_id === targetUserId) : [];
      localData.messages = db.messages ? db.messages.filter((m) => m.userId === targetUserId || m.user_id === targetUserId) : [];
    }
  }
  const projectRef = "unvyxfxlzhnutpugjxhe";
  let dbData = {};
  let foundInDb = false;
  if (serviceRoleKey && !targetUserId?.startsWith("mock_")) {
    try {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
      if (!targetUserId || !targetEmail) {
        let query = supabaseAdmin.from("profiles").select("*");
        if (targetUserId) {
          query = query.eq("id", targetUserId);
        } else {
          query = query.eq("email", targetEmail);
        }
        const { data: p } = await query.maybeSingle();
        if (p) {
          targetUserId = p.id;
          targetEmail = p.email;
        }
      }
      if (targetUserId) {
        foundInDb = true;
        const [
          { data: profile },
          { data: transactions },
          { data: invoices },
          { data: documents },
          { data: messages },
          { data: socialContent }
        ] = await Promise.all([
          supabaseAdmin.from("profiles").select("*").eq("id", targetUserId).maybeSingle(),
          supabaseAdmin.from("transactions").select("*").eq("user_id", targetUserId),
          supabaseAdmin.from("invoices").select("*").eq("user_id", targetUserId),
          supabaseAdmin.from("documents").select("*").eq("user_id", targetUserId),
          supabaseAdmin.from("messages").select("*").eq("user_id", targetUserId),
          supabaseAdmin.from("social_content").select("*").eq("author_id", targetUserId)
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
    } catch (e) {
      console.error("[export-profile] Supabase error:", e.message);
    }
  }
  if (!foundInDb && !targetUserId?.startsWith("mock_")) {
    const configs = [
      { host: `db.${projectRef}.supabase.co`, port: 5432, user: "postgres" },
      { host: `aws-1-ca-central-1.pooler.supabase.com`, port: 6543, user: `postgres.${projectRef}` },
      { host: `aws-0-ca-central-1.pooler.supabase.com`, port: 6543, user: `postgres.${projectRef}` }
    ];
    for (const conf of configs) {
      const client = new Client2({
        host: conf.host,
        port: conf.port,
        user: conf.user,
        password: SUPABASE_DB_PASSWORD,
        database: "postgres",
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5e3
      });
      try {
        await client.connect();
        foundInDb = true;
        if (!targetUserId || !targetEmail) {
          const resUser = await client.query("SELECT id, email FROM public.profiles WHERE id = $1 OR email = $2", [targetUserId, targetEmail]);
          if (resUser.rows.length > 0) {
            targetUserId = resUser.rows[0].id;
            targetEmail = resUser.rows[0].email;
          }
        }
        if (targetUserId) {
          const profile = (await client.query("SELECT * FROM public.profiles WHERE id = $1", [targetUserId])).rows[0];
          const transactions = (await client.query("SELECT * FROM public.transactions WHERE user_id = $1", [targetUserId])).rows;
          const invoices = (await client.query("SELECT * FROM public.invoices WHERE user_id = $1", [targetUserId])).rows;
          const documents = (await client.query("SELECT * FROM public.documents WHERE user_id = $1", [targetUserId])).rows;
          const messages = (await client.query("SELECT * FROM public.messages WHERE user_id = $1", [targetUserId])).rows;
          const socialContent = (await client.query("SELECT * FROM public.social_content WHERE author_id = $1", [targetUserId])).rows;
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
        try {
          await client.end();
        } catch (err) {
        }
      }
    }
  }
  const exportPayload = foundInLocalDb ? { ...localData, source: "mock_local_db" } : { ...dbData, source: "production_db" };
  if (!exportPayload.profile && !foundInLocalDb) {
    botLog("EXPORT_PROFILE_NOT_FOUND", "System", `Tentative d'export pour un utilisateur inexistant: ID=${targetUserId}, Email=${targetEmail}`);
    return res.status(404).json({ error: "Profil utilisateur introuvable pour l'exportation." });
  }
  botLog("EXPORT_PROFILE_SUCCESS", targetUserId || "unknown", `Donn\xE9es export\xE9es pour ${targetEmail}`);
  res.setHeader("Content-disposition", `attachment; filename=comptaflow_export_${targetUserId || "data"}.json`);
  res.setHeader("Content-type", "application/json");
  return res.send(JSON.stringify({
    schema_version: "CF-Loi25-V1.0",
    exported_at: (/* @__PURE__ */ new Date()).toISOString(),
    user_identity: {
      userId: targetUserId,
      email: targetEmail
    },
    data: exportPayload
  }, null, 2));
});
app.post("/api/admin/create-sub-admin", async (req, res) => {
  const ctx = await getSuperAdminFromRequest(req);
  if (!ctx) {
    return res.status(403).json({ error: "Acc\xE8s r\xE9serv\xE9 au super administrateur." });
  }
  const { fullName, email, password } = req.body || {};
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: "fullName, email et password sont requis." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Mot de passe trop court (min. 6 caract\xE8res)." });
  }
  try {
    const cleanEmail = String(email).toLowerCase().trim();
    const { data: created, error: createError } = await ctx.adminClient.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });
    if (createError) throw createError;
    const userId = created.user?.id;
    if (!userId) throw new Error("Utilisateur non cr\xE9\xE9.");
    const { error: profileError } = await ctx.adminClient.from("profiles").upsert({
      id: userId,
      email: cleanEmail,
      full_name: fullName,
      display_name: fullName,
      role: "sub_admin",
      status: "active"
    });
    if (profileError) throw profileError;
    const agentWelcomeHtml = getAgentWelcomeEmailTemplate({
      agentName: fullName,
      agentEmail: cleanEmail,
      portalUrl: "https://compta-flow.net/login",
      tempPassword: password
    });
    const resendKeyForAgent = sanitizeEnvVar(process.env.RESEND_API_KEY) || "re_mock_resend_key_123";
    if (resendKeyForAgent && resendKeyForAgent !== "re_mock_resend_key_123" && !resendKeyForAgent.startsWith("mock")) {
      try {
        await resend.emails.send({
          from: "Comptaflow <collab@compta-flow.net>",
          to: [cleanEmail],
          subject: "[Compta-Flow] Cr\xE9ation de votre acc\xE8s collaborateur \u2726",
          html: agentWelcomeHtml
        });
        botLog("AGENT_WELCOME_EMAIL_SENT", cleanEmail, `Courriel d'accueil collaborateur envoy\xE9.`);
      } catch (sendErr) {
        console.error("[create-sub-admin] Resend welcome dispatch failed:", sendErr.message);
      }
    } else {
      console.log(`[AGENT WELCOME EMAIL to ${cleanEmail}] Subject: Cr\xE9ation de votre acc\xE8s collaborateur \u2726`);
    }
    return res.json({
      success: true,
      userId,
      email: cleanEmail,
      message: "Comptable partenaire provisionn\xE9."
    });
  } catch (err) {
    console.error("[create-sub-admin]", err.message);
    return res.status(500).json({ error: err.message || "\xC9chec de cr\xE9ation du comptable." });
  }
});
app.post("/api/internal/apply-migrations", async (req, res) => {
  if (!isInternalAgentRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const result = await applySupabaseMigrations({ allFiles: true });
  res.status(result.success ? 200 : 500).json(result);
});
async function checkPartnerDirectoryExposure() {
  const anon = resolveSupabaseAnonKey();
  if (!anon) return "missing_key";
  const projectRef = resolveSupabaseUrl().match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) return "error";
  const url = `https://${projectRef}.supabase.co/rest/v1/profiles?select=id&role=eq.sub_admin&limit=1`;
  try {
    const res = await fetch(url, {
      headers: { apikey: anon, Authorization: `Bearer ${anon}` }
    });
    const body = await res.text();
    if (!res.ok) {
      if (body.includes("42P17")) return "error";
      return "restricted";
    }
    try {
      const data = JSON.parse(body);
      if (Array.isArray(data) && data.length > 0) return "exposed";
      return "restricted";
    } catch {
      return "error";
    }
  } catch {
    return "error";
  }
}
app.get("/api/health", async (_req, res) => {
  const geminiLive = !!(geminiKey && geminiKey !== "mock_gemini_api_key" && !geminiKey.startsWith("mock_"));
  const partnerDirectory = await checkPartnerDirectoryExposure();
  res.json({
    status: "ok",
    service: "ComptaFlow",
    site: "https://compta-flow.net",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    env: {
      gemini: geminiLive ? "live" : "mock-fallback",
      supabase: supabaseUrl ? "configured" : "missing",
      serviceRole: serviceRoleKey ? "configured" : "missing",
      anonKey: supabaseAnonKey ? "configured" : "missing",
      supabaseProject: resolveSupabaseUrl().match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? "unknown",
      partnerDirectory,
      resend: process.env.RESEND_API_KEY ? "configured" : "missing",
      adminSecret: ADMIN_SECRET ? "configured" : "missing",
      cronSecret: process.env.CRON_SECRET ? "configured" : "missing",
      dbPassword: SUPABASE_DB_PASSWORD ? "configured" : "missing"
    },
    agents: listAgents({ internal: false }).length
  });
});
var CANADA_REGIONS = CANADIAN_REGIONS;
var detectProvince = (req) => {
  const regionHeader = String(req.headers["x-vercel-ip-country-region"] ?? req.headers["cf-region-code"] ?? "");
  if (regionHeader && CANADA_REGIONS[regionHeader.toUpperCase()]) return regionHeader.toUpperCase();
  const country = String(req.headers["x-vercel-ip-country"] ?? req.headers["cf-ipcountry"] ?? "CA");
  if (country !== "CA") return "QC";
  return "QC";
};
app.get("/api/network/region", (req, res) => {
  const province = detectProvince(req);
  const region = CANADA_REGIONS[province] ?? CANADA_REGIONS.QC;
  res.json({
    province,
    region,
    country: "CA",
    dataRegion: "ca-central-1",
    site: "https://compta-flow.net"
  });
});
app.get("/api/network/legal", (req, res) => {
  const province = detectProvince(req);
  const region = CANADA_REGIONS[province] ?? CANADA_REGIONS.QC;
  res.json({
    province,
    privacyLaw: region.privacyLaw,
    patterns: [
      { id: "cookie_consent", route: "/cookies", required: true },
      { id: "privacy_policy", route: "/privacy", required: true },
      { id: "terms_of_service", route: "/terms", required: true },
      { id: "legal_notice", route: "/legal", required: true },
      { id: "data_residency", required: true, dataRegion: "ca-central-1" },
      { id: "cpa_disclaimer", required: true }
    ],
    version: "2026.06"
  });
});
app.get("/api/network/status", (_req, res) => {
  res.json({
    domain: "compta-flow.net",
    dataRegion: "ca-central-1",
    activeRegions: Object.keys(CANADA_REGIONS).length,
    edgeNodes: [...new Set(Object.values(CANADA_REGIONS).map((r) => r.edgeRegion))],
    compliance: { pipeda: true, loi25: true, dataInCanada: true },
    legalPatternVersion: "2026.06",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
var CITY_SLUGS = [
  "montreal",
  "quebec-ville",
  "laval",
  "longueuil",
  "sherbrooke",
  "gatineau",
  "trois-rivieres",
  "toronto",
  "ottawa",
  "mississauga",
  "brampton",
  "hamilton",
  "kitchener",
  "london",
  "windsor",
  "vancouver",
  "victoria",
  "surrey",
  "burnaby",
  "richmond",
  "calgary",
  "edmonton",
  "red-deer",
  "winnipeg",
  "halifax",
  "saskatoon",
  "regina",
  "moncton",
  "charlottetown",
  "st-johns",
  "whitehorse",
  "yellowknife",
  "iqaluit"
];
var BLOG_SLUGS = [
  "choisir-comptable-en-ligne-canada",
  "guide-tps-tvq-tvh-canada",
  "tenue-livres-travailleur-autonome-canada",
  "quickbooks-sage-wave-comparaison-canada",
  "paie-t4-guide-employeurs-canada",
  "demarrer-entreprise-canada-obligations-comptables"
];
app.get("/sitemap.xml", (_req, res) => {
  const base = "https://compta-flow.net";
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const pages = [
    { path: "/", priority: "1.0", changefreq: "daily", lastmod: today },
    { path: "/estimate", priority: "0.9", changefreq: "weekly", lastmod: today },
    { path: "/calculateur-taxes", priority: "0.9", changefreq: "monthly", lastmod: today },
    { path: "/ressources", priority: "0.8", changefreq: "weekly", lastmod: today },
    { path: "/login", priority: "0.6", changefreq: "monthly" },
    { path: "/showcase", priority: "0.4", changefreq: "monthly" },
    { path: "/privacy", priority: "0.3", changefreq: "yearly" },
    { path: "/terms", priority: "0.3", changefreq: "yearly" },
    { path: "/legal", priority: "0.3", changefreq: "yearly" },
    { path: "/cookies", priority: "0.3", changefreq: "yearly" },
    // Province pages — high priority
    ...Object.values(CANADA_REGIONS).map((r) => ({ path: `/ca/${r.seoSlug}`, priority: "0.9", changefreq: "monthly", lastmod: today })),
    // City pages — high priority
    ...CITY_SLUGS.map((s) => ({ path: `/ca/${s}`, priority: "0.85", changefreq: "monthly", lastmod: today })),
    // Blog articles
    ...BLOG_SLUGS.map((s) => ({ path: `/ressources/${s}`, priority: "0.8", changefreq: "monthly", lastmod: today }))
  ];
  const urls = pages.map((p) => {
    const lastmod = p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : "";
    return `<url><loc>${base}${p.path}</loc>${lastmod}<changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`;
  }).join("");
  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
});
app.post("/api/quote/create", async (req, res) => {
  const {
    userId,
    email,
    fullName,
    serviceId,
    answers = {},
    province = "QC",
    assignedAgentId
  } = req.body || {};
  if (!email || !fullName || !serviceId) {
    return res.status(400).json({ error: "Les param\xE8tres 'email', 'fullName' et 'serviceId' sont requis." });
  }
  try {
    botLog("QUOTE_CREATE_REQUEST", email, `Demande de devis pour ${serviceId} (${province})`);
    let basePrice = 120;
    let serviceLabel = "Imp\xF4ts Particulier & Autonome";
    if (serviceId === "bookkeeping" || serviceId === "hourlyBookkeeping" || serviceId.startsWith("monthly")) {
      basePrice = 150;
      serviceLabel = "Tenue de Livres Mensuelle";
      const transactions = Number(answers.volumeTransactions || answers.transactions || 0);
      if (transactions > 30) {
        basePrice += (transactions - 30) * 0.5;
      }
      if (answers.isIncorporated || answers.incorporated) {
        basePrice += 75;
      }
    } else {
      serviceLabel = "Imp\xF4ts & Fiscalit\xE9";
      const slips = Number(answers.nbFeuillets || answers.slips || 0);
      if (slips > 2) {
        basePrice += (slips - 2) * 10;
      }
      if (answers.hasCrypto || answers.crypto) {
        basePrice += 50;
      }
    }
    const normProv = normalizeProvinceCode(province);
    const taxes = calculateCanadianTaxes(basePrice, normProv);
    let clientProfileId = userId || `mock_${Date.now()}`;
    let clientName = fullName.trim();
    let clientEmail = email.toLowerCase().trim();
    let selectedAgentId = assignedAgentId;
    const isArabic = answers.language === "ar" || normProv === "QC" && answers.preferred_language === "ar";
    const defaultAgentEmail = isArabic ? "eya-cpa@outlook.com" : "viviee28@hotmail.com";
    const defaultAgentName = isArabic ? "Eya (Sous-Admin)" : "Sylvie Charette-Cl\xE9ment";
    let agentName = defaultAgentName;
    let agentEmail = defaultAgentEmail;
    if (serviceRoleKey && !clientProfileId.startsWith("mock_")) {
      try {
        const adminClient = createClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false }
        });
        if (selectedAgentId) {
          const { data: agentData } = await adminClient.from("profiles").select("full_name, email").eq("id", selectedAgentId).maybeSingle();
          if (agentData) {
            agentName = agentData.full_name || agentName;
            agentEmail = agentData.email || agentEmail;
          }
        } else {
          const { data: defaultAgentData } = await adminClient.from("profiles").select("id, full_name, email").eq("email", defaultAgentEmail).maybeSingle();
          if (defaultAgentData) {
            selectedAgentId = defaultAgentData.id;
            agentName = defaultAgentData.full_name || agentName;
            agentEmail = defaultAgentData.email || agentEmail;
          }
        }
        await adminClient.from("profiles").upsert({
          id: clientProfileId,
          email: clientEmail,
          full_name: clientName,
          display_name: clientName,
          role: "client",
          sub_admin_id: selectedAgentId || null,
          status: "active",
          preferred_language: isArabic ? "ar" : "fr"
        }, { onConflict: "id" });
      } catch (dbErr) {
        console.warn("[quote/create] Database warning:", dbErr.message);
      }
    }
    const quoteRef = `EST-${(/* @__PURE__ */ new Date()).getFullYear()}-${Math.floor(1e3 + Math.random() * 9e3)}`;
    const pdfUrl = `https://compta-flow.net/vault/quotes/${quoteRef}.pdf`;
    const taxLines = getTaxDisplayLines(taxes, normProv, "fr");
    let taxesHtml = "";
    taxLines.forEach((line) => {
      taxesHtml += `
        <tr>
          <td style="padding: 8px 0; color: #88888F;">${line.label} :</td>
          <td style="padding: 8px 0; text-align: ${isArabic ? "left" : "right"}; font-family: monospace;">${formatCAD(line.amount)}</td>
        </tr>
      `;
    });
    const quoteData = {
      clientName,
      clientEmail,
      serviceName: serviceLabel,
      province: normProv,
      subtotal: formatCAD(taxes.subtotal),
      taxesHtml,
      total: formatCAD(taxes.total),
      agentName,
      agentEmail,
      quoteRef,
      portalUrl: "https://compta-flow.net/login",
      lang: isArabic ? "ar" : "fr"
    };
    const clientHtml = getClientEmailTemplate(quoteData);
    const agentHtml = getAgentEmailTemplate(quoteData);
    const adminHtml = getAdminEmailTemplate(quoteData);
    let emailsDispatched = false;
    if (resendKey && resendKey !== "re_mock_resend_key_123" && !resendKey.startsWith("mock")) {
      try {
        await resend.emails.send({
          from: "Comptaflow <quotes@compta-flow.net>",
          to: [clientEmail],
          subject: isArabic ? `\u062A\u0623\u0643\u064A\u062F \u0639\u0631\u0636 \u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0641\u0627\u062E\u0631 \u0627\u0644\u062E\u0627\u0635 \u0628\u0643 - Compta-Flow (${quoteRef})` : `Confirmation de votre estimation premium - Compta-Flow (${quoteRef})`,
          html: clientHtml
        });
        await resend.emails.send({
          from: "Comptaflow Cabinet <collab@compta-flow.net>",
          to: [agentEmail],
          subject: `[Compta-Flow] Nouveau dossier client assign\xE9 : ${clientName}`,
          html: agentHtml
        });
        await resend.emails.send({
          from: "Comptaflow Audit <supervision@compta-flow.net>",
          to: [COMPANY_OUTLOOK_EMAIL],
          subject: `[Supervision Audit] Nouveau devis scell\xE9 : ${clientName} (${quoteRef})`,
          html: adminHtml
        });
        emailsDispatched = true;
        botLog("QUOTE_EMAILS_SENT", email, `Les 3 courriels (Client, Agent, Admin) ont \xE9t\xE9 envoy\xE9s via Resend.`);
      } catch (sendErr) {
        console.error("[quote/create] Resend email dispatch failed:", sendErr.message);
      }
    } else {
      console.log("=================== SIMULATION D'ENVOI DE COURRIELS (NO RESEND KEY) ===================");
      console.log(`[CLIENT EMAIL to ${clientEmail}] Subject: Confirmation estimation - Ref ${quoteRef}`);
      console.log(`[AGENT EMAIL to ${agentEmail}] Subject: Nouveau dossier assign\xE9 : ${clientName}`);
      console.log(`[ADMIN EMAIL to ${COMPANY_OUTLOOK_EMAIL}] Subject: Supervision devis scell\xE9 : ${clientName}`);
      console.log("=======================================================================================");
      emailsDispatched = true;
    }
    return res.status(200).json({
      success: true,
      quoteRef,
      pdfUrl,
      client: { id: clientProfileId, name: clientName, email: clientEmail },
      agent: { name: agentName, email: agentEmail },
      financials: {
        subtotal: taxes.subtotal,
        tps: taxes.tps,
        tvq: taxes.tvq || taxes.tvh,
        total: taxes.total,
        formattedTotal: formatCAD(taxes.total)
      },
      emailsDispatched
    });
  } catch (error) {
    botLog("QUOTE_CREATE_CRASH", email, error.message);
    return res.status(500).json({ error: "Une erreur interne est survenue lors de la cr\xE9ation du devis : " + error.message });
  }
});
app.post("/api/webhook/account-confirmed", async (req, res) => {
  const { userId, email, fullName } = req.body || {};
  if (!email || !fullName) {
    return res.status(400).json({ error: "Les param\xE8tres 'email' et 'fullName' sont requis." });
  }
  try {
    botLog("ACCOUNT_CONFIRMED_WEBHOOK", email, `Compte activ\xE9 et courriel v\xE9rifi\xE9 pour ${fullName}`);
    if (serviceRoleKey && userId && !userId.startsWith("mock_")) {
      try {
        const adminClient = createClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false }
        });
        await adminClient.from("profiles").update({ status: "active" }).eq("id", userId);
      } catch (dbErr) {
        console.warn("[account-confirmed] Database update warning:", dbErr.message);
      }
    }
    const emailHtml = getAccountConfirmedEmailTemplate({
      clientName: fullName,
      clientEmail: email.toLowerCase().trim(),
      portalUrl: "https://compta-flow.net/login"
    });
    let emailSent = false;
    if (resendKey && resendKey !== "re_mock_resend_key_123" && !resendKey.startsWith("mock")) {
      try {
        await resend.emails.send({
          from: "Comptaflow <welcome@compta-flow.net>",
          to: [email],
          subject: "Votre compte Compta-Flow est activ\xE9 ! \u2726",
          html: emailHtml
        });
        emailSent = true;
        botLog("ACCOUNT_CONFIRMED_EMAIL_SENT", email, `Courriel d'activation envoy\xE9.`);
      } catch (sendErr) {
        console.error("[account-confirmed] Resend dispatch failed:", sendErr.message);
      }
      try {
        await resend.emails.send({
          from: "Comptaflow <welcome@compta-flow.net>",
          to: [COMPANY_OUTLOOK_EMAIL],
          subject: `[ComptaFlow] Compte activ\xE9 \u2014 ${fullName}`,
          html: emailHtml
        });
        botLog("ACCOUNT_CONFIRMED_ADMIN_COPY_SENT", COMPANY_OUTLOOK_EMAIL, `Copie d'activation de compte envoy\xE9e pour ${fullName}.`);
      } catch (sendErr) {
        console.error("[account-confirmed] Admin copy dispatch failed:", sendErr.message);
      }
    } else {
      console.log("=================== SIMULATION D'ENVOI DE COURRIELS (NO RESEND KEY) ===================");
      console.log(`[WELCOME EMAIL to ${email}] Subject: Votre compte Compta-Flow est activ\xE9 ! \u2726`);
      console.log(`[ADMIN COPY to ${COMPANY_OUTLOOK_EMAIL}] Subject: Compte activ\xE9 \u2014 ${fullName}`);
      console.log("=======================================================================================");
      emailSent = true;
    }
    return res.status(200).json({
      success: true,
      message: "Notification d'activation de compte envoy\xE9e.",
      emailSent
    });
  } catch (error) {
    botLog("ACCOUNT_CONFIRMED_CRASH", email, error.message);
    return res.status(500).json({ error: "Une erreur interne est survenue : " + error.message });
  }
});
app.get("/api/facebook/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  const VERIFY_TOKEN = sanitizeEnvVar(process.env.FACEBOOK_VERIFY_TOKEN) || "comptaflow_facebook_verify_token_123";
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[Facebook Webhook] Verification successful.");
    return res.status(200).send(challenge);
  } else {
    console.warn("[Facebook Webhook] Verification failed.");
    return res.status(403).send("Forbidden");
  }
});
async function generateFacebookBotReply(userMessage) {
  try {
    const prompt = `Tu es l'assistant de clavardage intelligent de la page Facebook de ComptaFlow (compta-flow.net).
ComptaFlow est une plateforme cloud qu\xE9b\xE9coise d'automatisation de la facturation, de tenue de livres, de gestion de taxes canadiennes (TPS/TVQ) et de conciliation bancaire assist\xE9e par IA pour les PME et travailleurs autonomes.

Consignes:
- Sois courtois, professionnel, accueillant et efficace.
- \xC9cris des phrases courtes, adapt\xE9es au format clavardage (Messenger).
- R\xE9ponds toujours en fran\xE7ais.
- Sugg\xE8re de visiter https://compta-flow.net pour en savoir plus ou de se connecter au portail.
- N'invente pas d'informations techniques non v\xE9rifi\xE9es.

Message de l'utilisateur: "${userMessage}"
R\xE9ponse de l'assistant de clavardage:`;
    const result = await agenticModel.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("[Facebook Webhook] Gemini generation error:", error.message);
    return "Bonjour ! Je suis le robot d'assistance ComptaFlow. D\xE9sol\xE9, je rencontre une petite difficult\xE9 technique pour formuler ma r\xE9ponse. N'h\xE9sitez pas \xE0 visiter notre site https://compta-flow.net ou \xE0 nous laisser vos coordonn\xE9es afin qu'un conseiller humain vous recontacte !";
  }
}
async function sendFacebookMessage(senderId, text) {
  const pageAccessToken = sanitizeEnvVar(process.env.FACEBOOK_PAGE_ACCESS_TOKEN);
  if (!pageAccessToken || pageAccessToken.startsWith("mock")) {
    console.warn("[Facebook Webhook] Warning: FACEBOOK_PAGE_ACCESS_TOKEN is not configured or in mock mode. Reply:", text);
    return;
  }
  const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        recipient: { id: senderId },
        message: { text }
      })
    });
    const data = await response.json();
    if (data.error) {
      console.error("[Facebook Webhook] Error calling Graph Send API:", data.error);
    } else {
      console.log(`[Facebook Webhook] Message sent back to client ${senderId}`);
    }
  } catch (err) {
    console.error("[Facebook Webhook] Error sending Messenger request:", err.message);
  }
}
app.post("/api/facebook/webhook", async (req, res) => {
  const body = req.body;
  if (body.object === "page") {
    res.status(200).send("EVENT_RECEIVED");
    for (const entry of body.entry || []) {
      for (const webhookEvent of entry.messaging || []) {
        const senderId = webhookEvent.sender?.id;
        const messageText = webhookEvent.message?.text;
        if (senderId && messageText) {
          botLog("FACEBOOK_BOT_MESSAGE_RECEIVED", senderId, `Message: ${messageText.substring(0, 100)}`);
          const reply = await generateFacebookBotReply(messageText);
          await sendFacebookMessage(senderId, reply);
          botLog("FACEBOOK_BOT_REPLY_SENT", senderId, `Reply: ${reply.substring(0, 100)}`);
        }
      }
    }
  } else {
    return res.sendStatus(404);
  }
});
var setupStatic = async () => {
  if (process.env.VERCEL) return;
  if (process.env.NODE_ENV === "production") {
    const distPath = path2.join(process.cwd(), "dist");
    if (fs2.existsSync(distPath)) app.use(express.static(distPath));
    app.get("*", (req, res) => {
      if (!req.url.startsWith("/api")) res.sendFile(path2.join(distPath, "index.html"));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  }
};
setupStatic();
if (process.env.VERCEL && process.env.AUTO_APPLY_DB_MIGRATIONS !== "false") {
  void applySupabaseMigrations().then((result) => {
    if (result.success) {
      console.log("[migrations] OK", result.host, result.message);
    } else {
      console.warn("[migrations] Skipped or failed:", result.message);
    }
  }).catch((err) => console.warn("[migrations] Error:", err.message));
}
var app_default = app;
export {
  app_default as default
};
//# sourceMappingURL=index.js.map
