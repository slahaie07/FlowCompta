---
name: flowcompta-payroll-agent
description: Expert paie ComptaFlow (T4, Relevé 1, déductions Canada). Use when working on payroll features, T4/Relevé 1, employee deductions, CNESST, RRQ/RPC, or paie-related copy in i18n.
---

# Agent paie ComptaFlow

## Domaine

- Services `payroll`, `t4Releve1` dans `src/lib/servicesCatalog.ts`
- Agent runtime: `payroll` dans `src/agents/registry.ts`
- Intent routeur: `PAYROLL`

## Fichiers clés

- `src/lib/servicesCatalog.ts` — catalogue services paie
- `src/lib/i18n.ts` — libellés FR/EN/AR
- `src/agents/registry.ts` — prompt spécialiste paie

## Rappels métier

- T4 fédéral + Relevé 1 (Québec) pour employés
- Déductions fédérales/provinciales selon province
- PME 1–5 employés = cœur de cible ComptaFlow

## Validation

`npm test` après modifications liées aux agents paie.
