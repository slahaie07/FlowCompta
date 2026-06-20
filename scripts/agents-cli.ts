#!/usr/bin/env tsx

/**

 * CLI multi-agents ComptaFlow (usage interne — dev / ops)

 * Usage:

 *   npm run agents:ask -- "Comment déclarer ma TVH en Ontario?"

 *   npm run agents:ask -- --agent tax "Question fiscale"

 *   npm run agents:list

 *   npm run agents:list -- --all

 */

import 'dotenv/config';

import { listAgents, runAgentOrchestrator } from '../src/agents/index';

import type { AgentId } from '../src/agents/types';



const args = process.argv.slice(2);



if (args.includes('--list') || args.includes('-l')) {

  const showAll = args.includes('--all');

  console.log('\n🤖 Agents ComptaFlow (interne):\n');

  for (const agent of listAgents({ internal: showAll })) {

    const tag = agent.visibility === 'internal' ? '[interne]' : '[support]';

    console.log(`  • ${agent.id.padEnd(18)} ${tag} ${agent.name} — ${agent.description}`);

  }

  console.log('\nRouteur: router (automatique si --agent omis)');

  console.log('Liste complète: npm run agents:list -- --all\n');

  process.exit(0);

}



const agentFlagIdx = args.findIndex((a) => a === '--agent' || a === '-a');

let directAgentId: AgentId | undefined;

if (agentFlagIdx >= 0) {

  directAgentId = args[agentFlagIdx + 1] as AgentId;

  args.splice(agentFlagIdx, 2);

}



const message = args.join(' ').trim();

if (!message) {

  console.error('Usage: npm run agents:ask -- [--agent tax] "Votre question"');

  console.error('       npm run agents:list [-- --all]');

  process.exit(1);

}



console.log('⏳ Orchestration en cours...\n');



runAgentOrchestrator(

  { message, context: { channel: 'cli', language: 'fr' } },

  { directAgentId, onRoute: (intent, agentId) => console.log(`🔀 Route: ${intent} → ${agentId}`) }

)

  .then((result) => {

    console.log(`\n✅ Agent: ${result.agentId} (${result.intent}) — ${result.latencyMs}ms\n`);

    console.log(result.answer);

    console.log('');

  })

  .catch((err) => {

    console.error('Erreur:', err.message);

    process.exit(1);

  });


