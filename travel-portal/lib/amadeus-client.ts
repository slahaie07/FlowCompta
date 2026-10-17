const AUTH_URL = 'https://test.api.amadeus.com/v1/security/oauth2/token';
const BASE_URL = 'https://test.api.amadeus.com';

interface TokenCache { token: string; expiresAt: number }
let tokenCache: TokenCache | null = null;

export function isAmadeusConfigured(): boolean {
  return !!(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);
}

async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) return tokenCache.token;

  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.AMADEUS_CLIENT_ID!,
      client_secret: process.env.AMADEUS_CLIENT_SECRET!,
    }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Amadeus auth: ${res.status}`);
  const data = await res.json();
  tokenCache = { token: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return tokenCache.token;
}

async function amadeusGet<T>(path: string): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Amadeus ${path}: ${res.status}`);
  return res.json();
}

export interface AmadeusFlightDestination {
  type: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  price: { total: string };
  links: { flightDates: string; flightOffers: string };
}

export async function fetchFlightDeals(origin = 'YUL', maxPrice = 2500): Promise<AmadeusFlightDestination[]> {
  const data = await amadeusGet<{ data: AmadeusFlightDestination[] }>(
    `/v1/shopping/flight-destinations?origin=${origin}&maxPrice=${maxPrice}&currency=CAD`
  );
  return data.data ?? [];
}

export async function fetchLastMinuteDeals(origin = 'YUL'): Promise<AmadeusFlightDestination[]> {
  const depart = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
  const data = await amadeusGet<{ data: AmadeusFlightDestination[] }>(
    `/v1/shopping/flight-dates?origin=${origin}&destination=MAD&departureDate=${depart}&duration=7&currency=CAD`
  );
  return data.data ?? [];
}
