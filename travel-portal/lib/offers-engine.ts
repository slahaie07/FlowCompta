import type { TravelOffer, OfferCategory, OffersPayload } from './types';
import { isAmadeusConfigured, fetchFlightDeals, type AmadeusFlightDestination } from './amadeus-client';

const DESTINATIONS = [
  { code: 'CUN', name: 'Cancún',      emoji: '🌊', image: 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800', base: 799,  luxury: false },
  { code: 'PUJ', name: 'Punta Cana',  emoji: '🏝️', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', base: 749,  luxury: false },
  { code: 'VRA', name: 'Varadero',    emoji: '🌴', image: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=800', base: 649,  luxury: false },
  { code: 'CDG', name: 'Paris',       emoji: '🗼', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', base: 899,  luxury: true  },
  { code: 'BCN', name: 'Barcelone',   emoji: '🏛️', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800', base: 849,  luxury: false },
  { code: 'LIS', name: 'Lisbonne',    emoji: '🏰', image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800', base: 799,  luxury: false },
  { code: 'RAK', name: 'Marrakech',   emoji: '🕌', image: 'https://images.unsplash.com/photo-1539020140153-e479b8b7a590?w=800', base: 849,  luxury: false },
  { code: 'DXB', name: 'Dubai',       emoji: '🌆', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', base: 1799, luxury: true  },
  { code: 'MLE', name: 'Maldives',    emoji: '🐠', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800', base: 3499, luxury: true  },
  { code: 'NRT', name: 'Tokyo',       emoji: '⛩️', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', base: 1299, luxury: false },
  { code: 'DPS', name: 'Bali',        emoji: '🌺', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', base: 1599, luxury: false },
  { code: 'MIA', name: 'Miami',       emoji: '🌴', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', base: 499,  luxury: false },
  { code: 'JFK', name: 'New York',    emoji: '🗽', image: 'https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?w=800', base: 299,  luxury: false },
  { code: 'LAS', name: 'Las Vegas',   emoji: '🎰', image: 'https://images.unsplash.com/photo-1581351721010-8cf859cb14a4?w=800', base: 449,  luxury: false },
  { code: 'SXM', name: 'Saint-Martin',emoji: '⛵', image: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800', base: 1199, luxury: true  },
  { code: 'GVA', name: 'Genève',      emoji: '🏔️', image: 'https://images.unsplash.com/photo-1485871800883-1e3c843d0c9f?w=800', base: 999,  luxury: true  },
];

const DEST_MAP = Object.fromEntries(DESTINATIONS.map(d => [d.code, d]));

const AIRLINES  = ['Air Transat', 'Air Canada', 'WestJet', 'Sunwing', 'Corsair', 'TAP Portugal', 'Emirates'];
const LUX_HOTELS = ['Four Seasons', 'Ritz-Carlton', 'Aman Resort', 'Park Hyatt', 'St. Regis', 'Bulgari Hotel'];
const STD_HOTELS = ['Royalton', 'Riu Hotels', 'BlueBay Resorts', 'Occidental', 'Sunscape', 'Club Lookéa'];

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

function addDays(n: number) {
  return new Date(Date.now() + n * 86400000).toISOString().split('T')[0];
}

function pickCategory(price: number, daysOut: number, luxury: boolean): OfferCategory {
  if (daysOut <= 7)              return 'last-minute';
  if (luxury && price >= 2000)   return 'luxury';
  if (price < 700)               return 'budget';
  return 'flash';
}

export function generateDemoOffers(): TravelOffer[] {
  // Seed rotates every 2 minutes → fresh offers on each auto-refresh
  const seed = Math.floor(Date.now() / (2 * 60 * 1000));
  const rng  = seededRng(seed);
  const now  = new Date().toISOString();

  const shuffled = [...DESTINATIONS].sort(() => rng() - 0.5);
  const offers: TravelOffer[] = [];

  shuffled.slice(0, 12).forEach((dest, i) => {
    const isLuxury     = dest.luxury && rng() > 0.35;
    const isLastMin    = i < 4;
    const isFlash      = i >= 9 && !isLastMin;
    const daysOut      = isLastMin ? Math.floor(rng() * 6) + 1 : Math.floor(rng() * 50) + 8;
    const nights       = isLuxury  ? Math.floor(rng() * 7) + 7  : Math.floor(rng() * 10) + 5;
    const discount     = isLastMin ? 35 + Math.floor(rng() * 30)
                       : isFlash   ? 30 + Math.floor(rng() * 35)
                       : isLuxury  ? 15 + Math.floor(rng() * 20)
                       :             20 + Math.floor(rng() * 25);
    const originalPrice = Math.round(dest.base * (1 + rng() * 0.3) * (isLuxury ? 2.5 : 1));
    const price         = Math.round(originalPrice * (1 - discount / 100));
    const airline       = AIRLINES[Math.floor(rng() * AIRLINES.length)];
    const hotel         = isLuxury ? LUX_HOTELS[Math.floor(rng() * LUX_HOTELS.length)]
                                   : STD_HOTELS[Math.floor(rng() * STD_HOTELS.length)];
    const stars         = isLuxury ? 5 : 4;
    const seatsLeft     = isLastMin ? Math.floor(rng() * 4) + 1 : Math.floor(rng() * 10) + 3;
    const expiresHours  = isFlash ? Math.floor(rng() * 3) + 1 : isLastMin ? 12 : 48;
    const category      = pickCategory(price, daysOut, isLuxury);
    const badge         = isLastMin ? '🔥 Dernière minute'
                        : isFlash   ? '⚡ Vente Flash'
                        : isLuxury  ? '👑 Luxe'
                        :             '💰 Budget';
    const includes = ['Vol A/R', 'Hôtel', 'Taxes'];
    if (isLuxury || stars === 5) includes.push('Tout inclus');
    else                         includes.push('Petit-déjeuner');

    offers.push({
      id: `demo-${dest.code}-${seed}-${i}`,
      category,
      destination: dest.name,
      destinationCode: dest.code,
      origin: 'Montréal',
      originCode: 'YUL',
      price,
      originalPrice,
      currency: 'CAD',
      discountPct: discount,
      departureDate: addDays(daysOut),
      returnDate: addDays(daysOut + nights),
      nights,
      image: dest.image,
      emoji: dest.emoji,
      airline,
      hotelName: hotel,
      hotelStars: stars,
      seatsLeft,
      expiresAt: new Date(Date.now() + expiresHours * 3600000).toISOString(),
      includes,
      fetchedAt: now,
      badge,
      isHot: seatsLeft <= 3 || discount >= 45,
    });
  });

  const order: OfferCategory[] = ['flash', 'last-minute', 'luxury', 'budget'];
  return offers.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
}

function mapAmadeusToOffers(deals: AmadeusFlightDestination[]): TravelOffer[] {
  const now = new Date().toISOString();
  return deals.slice(0, 12).map((deal, i) => {
    const dest = DEST_MAP[deal.destination];
    const price = Math.round(parseFloat(deal.price.total) * 1.35); // USD → CAD approx
    const originalPrice = Math.round(price * 1.4);
    const discountPct   = Math.round((1 - price / originalPrice) * 100);
    const daysOut = Math.round((new Date(deal.departureDate).getTime() - Date.now()) / 86400000);
    const nights  = deal.returnDate
      ? Math.round((new Date(deal.returnDate).getTime() - new Date(deal.departureDate).getTime()) / 86400000)
      : 7;
    const category = pickCategory(price, daysOut, false);
    return {
      id: `amadeus-${deal.destination}-${i}`,
      category,
      destination: dest?.name ?? deal.destination,
      destinationCode: deal.destination,
      origin: 'Montréal',
      originCode: deal.origin,
      price,
      originalPrice,
      currency: 'CAD',
      discountPct,
      departureDate: deal.departureDate,
      returnDate:    deal.returnDate ?? '',
      nights,
      image:  dest?.image ?? 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
      emoji:  dest?.emoji ?? '✈️',
      airline: 'Air Canada',
      hotelName: STD_HOTELS[i % STD_HOTELS.length],
      hotelStars: 4,
      seatsLeft: Math.floor(Math.random() * 8) + 1,
      expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
      includes: ['Vol A/R', 'Taxes'],
      fetchedAt: now,
      badge: category === 'last-minute' ? '🔥 Dernière minute' : '✈️ Vol direct',
      isHot: daysOut <= 7,
    };
  });
}

// Server-side cache: refreshes every 2 minutes
let cache: { payload: OffersPayload; generatedAt: number } | null = null;
const TTL = 2 * 60 * 1000;

export async function getOffers(): Promise<OffersPayload> {
  if (cache && Date.now() - cache.generatedAt < TTL) return cache.payload;

  let offers: TravelOffer[];
  let source: 'amadeus' | 'demo' = 'demo';

  if (isAmadeusConfigured()) {
    try {
      const deals = await fetchFlightDeals('YUL', 2500);
      offers = mapAmadeusToOffers(deals);
      source  = 'amadeus';
    } catch {
      offers = generateDemoOffers();
    }
  } else {
    offers = generateDemoOffers();
  }

  const now = new Date().toISOString();
  const payload: OffersPayload = {
    offers,
    lastUpdated:   now,
    nextRefreshAt: new Date(Date.now() + TTL).toISOString(),
    totalFound:    offers.length,
    source,
  };

  cache = { payload, generatedAt: Date.now() };
  return payload;
}
