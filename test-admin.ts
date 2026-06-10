import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

async function test() {
  try {
    const app = initializeApp();
    const auth = getAuth(app);
    const user = await auth.createUser({
      email: 's.lahaie07@gmail.com',
      password: 'password123'
    });
    console.log("SUCCESS:", user.uid);
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
        process.exit(0);
    }
    console.error("FAILED:", err);
    process.exit(1);
  }
}
test();
