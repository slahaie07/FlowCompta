import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const auth = getAuth(app);

async function test() {
  try {
    const cred = await signInAnonymously(auth);
    console.log("Anonymous Auth SUCCESS:", cred.user.uid);
    process.exit(0);
  } catch (err) {
    console.error("Anonymous Auth FAILED:", err.code, err.message);
    process.exit(1);
  }
}
test();
