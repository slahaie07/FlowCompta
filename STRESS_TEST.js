import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Montée en charge progressive
    { duration: '1m', target: 200 },  // Charge soutenue (Ads Simulation)
    { duration: '30s', target: 0 },   // Descente
  ],
};

const BASE_URL = 'https://comptaflow-elite.vercel.app';

export default function () {
  // 1. Navigation Landing Page
  const resLanding = http.get(`${BASE_URL}/`);
  check(resLanding, { 'landing_ok': (r) => r.status === 200 });

  // 2. Simulation démarrage Onboarding
  const resOnboarding = http.get(`${BASE_URL}/onboarding`);
  check(resOnboarding, { 'onboarding_ok': (r) => r.status === 200 });

  // 3. Appel API Health (Deep Guard Check)
  const resHealth = http.get(`${BASE_URL}/api/health`);
  check(resHealth, { 'api_health_ok': (r) => r.status === 200 });

  sleep(1);
}
