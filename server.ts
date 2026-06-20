import app from './api/app.ts';
import dotenv from 'dotenv';
import { openUrl } from './src/lib/openUrl.ts';

dotenv.config();

const PORT = process.env.PORT || 3000;
const localUrl = `http://localhost:${PORT}`;

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Comptaflow Local Live: ${localUrl}`);
  if (process.env.NODE_ENV !== 'production' && process.env.OPEN_BROWSER !== 'false') {
    openUrl(localUrl);
  }
});
