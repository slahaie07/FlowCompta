/**
 * Ping search engines with sitemap URL after deploy.
 * Usage: npx tsx scripts/ping-search-engines.ts
 */
const SITEMAP = 'https://compta-flow.net/sitemap.xml';

const PING_URLS = [
  `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP)}`,
  `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP)}`,
  `https://webmaster.yandex.com/ping?sitemap=${encodeURIComponent(SITEMAP)}`,
];

async function ping(url: string): Promise<void> {
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow' });
    const host = new URL(url).hostname;
    console.log(`${host}: ${res.status} ${res.statusText}`);
  } catch (err) {
    const host = new URL(url).hostname;
    console.error(`${host}: FAILED —`, err instanceof Error ? err.message : err);
  }
}

async function main(): Promise<void> {
  console.log(`Pinging search engines for ${SITEMAP}\n`);
  await Promise.all(PING_URLS.map(ping));
  console.log('\nDone. Verify in Google Search Console and Bing Webmaster Tools.');
}

main();
