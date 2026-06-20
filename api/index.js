/**
 * Vercel serverless entry (committed stub).
 * `npm run build` overwrites this file with the esbuild bundle from api/app.ts.
 */
export default function handler(_req, res) {
  res.status(503).json({
    error: 'API bundle not built. Run npm run build before deploy.',
  });
}
