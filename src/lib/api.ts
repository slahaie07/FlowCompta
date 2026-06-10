import { UserData } from '../types';

/**
 * Client API Autonome ComptaFlow
 * Gère la communication avec le backend interne si les services tiers sont absents.
 */
export const internalApi = {
  async register(data: any) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async login(data: any) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async saveProfile(profile: any) {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    return res.json();
  },

  async fetchProfile(id: string) {
    const res = await fetch(`/api/profile/${id}`);
    if (!res.ok) return null;
    return res.json();
  },

  async simulatePayment(customerData: any, amount: number) {
    const res = await fetch('/api/payment/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerData, amount })
    });
    return res.json();
  }
};
