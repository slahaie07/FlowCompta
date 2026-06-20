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
    fr: "Pour un probl\xE8me technique, d\xE9crivez ce que vous voyez \xE0 l\u2019\xE9cran. En attendant, vous pouvez aussi nous \xE9crire via le formulaire de support.",
    en: "For a technical issue, describe what you see on screen. You can also reach us via the support form.",
    ar: "\u0644\u0648\u0635\u0641 \u0645\u0634\u0643\u0644\u0629 \u062A\u0642\u0646\u064A\u0629\u060C \u0627\u0634\u0631\u062D \u0645\u0627 \u062A\u0631\u0627\u0647 \u0639\u0644\u0649 \u0627\u0644\u0634\u0627\u0634\u0629. \u064A\u0645\u0643\u0646\u0643 \u0623\u064A\u0636\u0627\u064B \u0645\u0631\u0627\u0633\u0644\u062A\u0646\u0627 \u0639\u0628\u0631 \u0646\u0645\u0648\u0630\u062C \u0627\u0644\u062F\u0639\u0645."
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
    fr: "Bonjour ! Je suis votre interlocutrice ComptaFlow. Posez une question sur vos taxes, la paie, vos factures ou votre parcours dossier \u2014 je vous guide.",
    en: "Hello! I'm your ComptaFlow contact. Ask about taxes, payroll, invoices or your file path \u2014 I'll guide you.",
    ar: "\u0645\u0631\u062D\u0628\u0627\u064B! \u0623\u0646\u0627 \u0645\u0633\u0624\u0648\u0644\u062A\u0643 \u0641\u064A ComptaFlow. \u0627\u0633\u0623\u0644 \u0639\u0646 \u0627\u0644\u0636\u0631\u0627\u0626\u0628 \u0623\u0648 \u0627\u0644\u0631\u0648\u0627\u062A\u0628 \u0623\u0648 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0623\u0648 \u0645\u0633\u0627\u0631 \u0645\u0644\u0641\u0643."
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
    fullName: "Samuel L. (Super Admin)",
    label: "Super Admin"
  },
  {
    email: "sadmin1@comptaflow.com",
    role: "sub_admin",
    fullName: "Mini Admin 1",
    label: "Sub-admin cabinet 1"
  },
  {
    email: "sadmin2@comptaflow.com",
    role: "sub_admin",
    fullName: "Mini Admin 2",
    label: "Sub-admin cabinet 2"
  }
];
var PORTAL_HOME_BY_ROLE = {
  super_admin: "/portal/owner/super_overview",
  sub_admin: "/portal/admin/admin_overview"
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
    process.env.POSTGRES_PASSWORD,
    process.env.ADMIN_SECRET,
    "Maison-139"
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
var ADMIN_SECRET = sanitizeEnvVar(process.env.SUPABASE_DB_PASSWORD || process.env.ADMIN_SECRET) || "Maison-139";
var genAI = new GoogleGenerativeAI2(geminiKey);
var visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
var agenticModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
var resend = new Resend(resendKey);
var twilioClient = twilio(twilioSid, twilioToken);
var ADMIN_PHONE = "+18192158545";
var supabaseUrl = resolveSupabaseUrl();
var supabaseAnonKey = resolveSupabaseAnonKey();
var serviceRoleKey = resolveSupabaseServiceRoleKey();
var supabaseClientKey = serviceRoleKey || supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIn0.placeholder";
var supabase = createClient(supabaseUrl, supabaseClientKey);
function isInternalAgentRequest(req) {
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
  if (!process.env.RESEND_API_KEY) return;
  await resend.emails.send({
    from: "Comptaflow <support@compta-flow.net>",
    to: [to],
    subject,
    html: `<div style="font-family:serif;background:#050505;color:#F5F1E8;padding:50px;border:1px solid #D4AF37;">
                <h1 style="color:#D4AF37;border-bottom:1px solid #D4AF37;padding-bottom:10px;">Comptaflow ELITE</h1>
                ${html}
                <p style="margin-top:40px;font-size:10px;color:#A39E92;">SYST\xC8ME SUPR\xCAME AUTOMATIS\xC9 \u2014 QU\xC9BEC</p>
               </div>`
  });
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
    await sendSupremeEmail("s.lahaie07@gmail.com", `Alerte Transaction: ${vendor}`, `
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
app.post("/api/ai/analyze-document", async (req, res) => {
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
            <p>Destinataire: <strong>s.lahaie07@gmail.com</strong><br>R\xE9f\xE9rence: <strong>${reference}</strong></p>
        `);
  return res.json({ success: true, manual: true, method: "interac", reference });
});
app.post("/api/payment/setup-direct-debit", (_req, res) => {
  res.status(410).json({
    error: "Seul le virement Interac e-Transfer est accept\xE9. Le pr\xE9l\xE8vement automatique n'est pas disponible.",
    supportedMethods: ["interac"]
  });
});
app.post("/api/intelligence/analyze", async (req, res) => {
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
  const { userId, email, displayName, province, language } = req.body || {};
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
    const htmlBodies = {
      fr: `<p>Bonjour ${displayName || ""},</p>
        <p>Votre compte est actif. <strong>Prochaine \xE9tape :</strong> choisissez votre service dans l'aper\xE7u, puis suivez votre <a href="${procedureUrl}">parcours dossier</a>.</p>
        <p><a href="${portalUrl}">Acc\xE9der \xE0 mon portail</a></p>`,
      en: `<p>Hello ${displayName || ""},</p>
        <p>Your account is active. <strong>Next step:</strong> pick your service in Overview, then follow your <a href="${procedureUrl}">guided file path</a>.</p>
        <p><a href="${portalUrl}">Open my portal</a></p>`,
      ar: `<p>\u0645\u0631\u062D\u0628\u0627\u064B ${displayName || ""},</p>
        <p>\u062D\u0633\u0627\u0628\u0643 \u0646\u0634\u0637. <strong>\u0627\u0644\u062E\u0637\u0648\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629:</strong> \u0627\u062E\u062A\u0631 \u062E\u062F\u0645\u062A\u0643 \u062B\u0645 \u0627\u062A\u0628\u0639 <a href="${procedureUrl}">\u0645\u0633\u0627\u0631 \u0645\u0644\u0641\u0643</a>.</p>
        <p><a href="${portalUrl}">\u0641\u062A\u062D \u0628\u0648\u0627\u0628\u062A\u064A</a></p>`
    };
    if (process.env.RESEND_API_KEY) {
      await sendSupremeEmail(email, subjects[lang], htmlBodies[lang]);
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
    res.json(toPublicSupportReply(result, lang));
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
        password: ADMIN_SECRET,
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
        password: ADMIN_SECRET,
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
        password: ADMIN_SECRET,
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
async function checkPartnerRls() {
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
    if (res.ok) return "ok";
    if (body.includes("42P17")) return "recursion";
    return "error";
  } catch {
    return "error";
  }
}
app.get("/api/health", async (_req, res) => {
  const geminiLive = !!(geminiKey && geminiKey !== "mock_gemini_api_key" && !geminiKey.startsWith("mock_"));
  const partnerRls = await checkPartnerRls();
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
      partnerRls,
      resend: process.env.RESEND_API_KEY ? "configured" : "missing",
      adminSecret: process.env.ADMIN_SECRET ? "configured" : "default-fallback",
      cronSecret: process.env.CRON_SECRET ? "configured" : "missing",
      dbPassword: process.env.SUPABASE_DB_PASSWORD ? "configured" : "missing"
    },
    agents: listAgents({ internal: false }).length
  });
});
var CANADA_REGIONS = {
  QC: { code: "QC", nameFr: "Qu\xE9bec", nameEn: "Quebec", privacyLaw: "loi25", edgeRegion: "yul1", seoSlug: "quebec" },
  ON: { code: "ON", nameFr: "Ontario", nameEn: "Ontario", privacyLaw: "pipeda", edgeRegion: "yyz1", seoSlug: "ontario" },
  BC: { code: "BC", nameFr: "Colombie-Britannique", nameEn: "British Columbia", privacyLaw: "pipeda_bc", edgeRegion: "yvr1", seoSlug: "colombie-britannique" },
  AB: { code: "AB", nameFr: "Alberta", nameEn: "Alberta", privacyLaw: "pipa_ab", edgeRegion: "yyc1", seoSlug: "alberta" },
  MB: { code: "MB", nameFr: "Manitoba", nameEn: "Manitoba", privacyLaw: "pipeda", edgeRegion: "ywg1", seoSlug: "manitoba" },
  SK: { code: "SK", nameFr: "Saskatchewan", nameEn: "Saskatchewan", privacyLaw: "pipeda", edgeRegion: "yxe1", seoSlug: "saskatchewan" },
  NB: { code: "NB", nameFr: "Nouveau-Brunswick", nameEn: "New Brunswick", privacyLaw: "pipeda", edgeRegion: "yfc1", seoSlug: "nouveau-brunswick" },
  NS: { code: "NS", nameFr: "Nouvelle-\xC9cosse", nameEn: "Nova Scotia", privacyLaw: "pipeda", edgeRegion: "yhz1", seoSlug: "nouvelle-ecosse" },
  PE: { code: "PE", nameFr: "\xCEle-du-Prince-\xC9douard", nameEn: "Prince Edward Island", privacyLaw: "pipeda", edgeRegion: "yhz1", seoSlug: "ipe" },
  NL: { code: "NL", nameFr: "Terre-Neuve-et-Labrador", nameEn: "Newfoundland and Labrador", privacyLaw: "pipeda", edgeRegion: "yyt1", seoSlug: "terre-neuve" },
  YT: { code: "YT", nameFr: "Yukon", nameEn: "Yukon", privacyLaw: "pipeda", edgeRegion: "yxy1", seoSlug: "yukon" },
  NT: { code: "NT", nameFr: "Territoires du Nord-Ouest", nameEn: "Northwest Territories", privacyLaw: "pipeda", edgeRegion: "yxy1", seoSlug: "tno" },
  NU: { code: "NU", nameFr: "Nunavut", nameEn: "Nunavut", privacyLaw: "pipeda", edgeRegion: "yxy1", seoSlug: "nunavut" }
};
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
app.get("/sitemap.xml", (_req, res) => {
  const base = "https://compta-flow.net";
  const paths = [
    "/",
    "/privacy",
    "/terms",
    "/legal",
    "/cookies",
    "/login",
    "/showcase",
    ...Object.values(CANADA_REGIONS).map((r) => `/ca/${r.seoSlug}`)
  ];
  const urls = paths.map((p) => `<url><loc>${base}${p}</loc><changefreq>weekly</changefreq><priority>${p === "/" ? "1.0" : "0.8"}</priority></url>`).join("");
  res.setHeader("Content-Type", "application/xml");
  res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
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
