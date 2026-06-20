/**
 * Vérifie la santé du réseau ComptaFlow Canada (Windows / macOS / Linux — no bash).
 * Usage: npm run verify:network
 */
const BASE_URL = (process.env.COMPTAFLOW_URL || 'https://compta-flow.net').replace(/\/$/, '');

let pass = 0;
let fail = 0;

async function check(name: string, url: string, expected?: string): Promise<void> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.text();
    if (expected && !body.includes(expected)) {
      console.log(`❌ ${name} — réponse inattendue`);
      fail += 1;
      return;
    }
    console.log(`✅ ${name}`);
    pass += 1;
  } catch {
    console.log(`❌ ${name} — inaccessible (${url})`);
    fail += 1;
  }
}

async function checkStatus(name: string, url: string): Promise<void> {
  try {
    const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(15_000) });
    if (res.status === 200) {
      console.log(`✅ ${name}`);
      pass += 1;
    } else {
      console.log(`❌ ${name} — HTTP ${res.status} (${url})`);
      fail += 1;
    }
  } catch {
    console.log(`❌ ${name} — inaccessible (${url})`);
    fail += 1;
  }
}

async function main() {
  console.log(`🔍 Vérification réseau ComptaFlow — ${BASE_URL}\n`);

  await check('Health API', `${BASE_URL}/api/health`, 'ok');
  await check('Région API', `${BASE_URL}/api/network/region`, 'province');
  await check('Légal API', `${BASE_URL}/api/network/legal`, 'privacyLaw');
  await check('Status réseau', `${BASE_URL}/api/network/status`, 'activeRegions');
  await check('Sitemap', `${BASE_URL}/sitemap.xml`, 'urlset');
  await check('Robots.txt', `${BASE_URL}/robots.txt`, 'Sitemap');
  await checkStatus('Page Québec', `${BASE_URL}/ca/quebec`);
  await checkStatus('Politique cookies', `${BASE_URL}/cookies`);
  await checkStatus('Mentions légales', `${BASE_URL}/legal`);

  console.log(`\nRésultat : ${pass} OK, ${fail} échecs`);

  if (fail > 0) process.exit(1);
  console.log('✅ Réseau Canada opérationnel');
}

main();
