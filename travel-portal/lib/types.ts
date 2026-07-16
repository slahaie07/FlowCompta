export type OfferCategory = 'flash' | 'last-minute' | 'luxury' | 'budget';

export interface TravelOffer {
  id: string;
  category: OfferCategory;
  destination: string;
  destinationCode: string;
  origin: string;
  originCode: string;
  price: number;
  originalPrice: number;
  currency: 'CAD';
  discountPct: number;
  departureDate: string;
  returnDate: string;
  nights: number;
  image: string;
  emoji: string;
  airline: string;
  hotelName: string;
  hotelStars: number;
  seatsLeft: number;
  expiresAt: string;
  includes: string[];
  fetchedAt: string;
  badge: string;
  isHot: boolean;
}

export interface OffersPayload {
  offers: TravelOffer[];
  lastUpdated: string;
  nextRefreshAt: string;
  totalFound: number;
  source: 'amadeus' | 'demo';
}
