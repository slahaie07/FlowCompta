/**
 * Bootstrap n8n : compte propriétaire + import des workflows ComptaFlow.
 */
import { spawnSync } from 'node:child_process';

const steps = [
  ['n8n:setup', 'tsx scripts/n8n-create-account.ts'],
  ['n8n:import', 'tsx scripts/n8n-import-workflows.ts'],
] as const;

for (const [label, cmd] of steps) {
  console.log(`\n── ${label} ──\n`);
  const [bin, ...args] = cmd.split(' ');
  const result = spawnSync(bin, args, { stdio: 'inherit', cwd: process.cwd() });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log('\nBootstrap n8n terminé.');
