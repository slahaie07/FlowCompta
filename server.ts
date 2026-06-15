import app from './api/index.ts';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`🚀 Comptaflow Local Live: http://localhost:${PORT}`);
});
