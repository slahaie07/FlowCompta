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
    if (!res.ok) {
       // Support direct fetch from local_db if profile is not in /api/profile
       const profileRes = await fetch(`/api/admin/clients`);
       const clients = await profileRes.json();
       return clients.find((c: any) => c.id === id) || null;
    }
    return res.json();
  },

  async fetchTransactions(userId: string, isAdmin: boolean) {
    const res = await fetch(`/api/transactions?userId=${userId}&isAdmin=${isAdmin}`);
    return res.json();
  },

  async addTransaction(data: any) {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async fetchInvoices(userId: string) {
    const res = await fetch(`/api/invoices?userId=${userId}`);
    return res.json();
  },

  async addInvoice(data: any) {
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async fetchAdminClients() {
    const res = await fetch('/api/admin/clients');
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
