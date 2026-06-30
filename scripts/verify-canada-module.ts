/**
 * Build-time sanity check for Canada network module (replaces GitHub Actions inline script).
 * Usage: npm run verify:canada-module
 */
import { getActiveRegions, getNetworkStatus } from '../src/lib/canadaNetwork.ts';

const status = getNetworkStatus();
const regions = getActiveRegions();

if (status.activeRegions !== 13) {
  console.error(`Expected 13 active regions, got ${status.activeRegions}`);
  process.exit(1);
}

console.log(`Canada network OK — ${regions.length} regions, ${status.edgeNodes.length} edge nodes`);
