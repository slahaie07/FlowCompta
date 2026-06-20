/**
 * Build-time sanity check for Canada network module (replaces GitHub Actions inline script).
 * Usage: npm run verify:canada-module
 */
import { buildSitemapUrls, getActiveRegions, getNetworkStatus } from '../src/lib/canadaNetwork.ts';

const status = getNetworkStatus();
const regions = getActiveRegions();
const sitemap = buildSitemapUrls();

if (status.activeRegions !== 13) {
  console.error(`Expected 13 active regions, got ${status.activeRegions}`);
  process.exit(1);
}

if (sitemap.length < 18) {
  console.error(`Sitemap too short: ${sitemap.length} URLs (expected >= 18)`);
  process.exit(1);
}

console.log(`Canada network OK — ${regions.length} regions, ${status.edgeNodes.length} edge nodes, ${sitemap.length} sitemap URLs`);
