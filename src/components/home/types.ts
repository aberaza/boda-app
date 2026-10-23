import type { Translation } from '../../i18n/translations';

export type { Translation };

export type RouteMode = 'flight' | 'train' | 'transfer';

export interface RouteLink {
  mode: 'flight' | 'train';
  url: string;
}

export interface RouteSegment {
  mode: RouteMode;
  from: { code: string; city: string; lat: number; lng: number };
  to: { code: string; city: string; lat: number; lng: number };
  airline?: string;
  operator?: string;
  flightNumber?: string | null;
  logo?: string | null;
  duration: number | null;
  departureTime?: string | null;
  arrivalTime?: string | null;
  note?: string;
}

export interface FlightRoute {
  type: 'direct' | 'connecting' | 'multimodal';
  label?: string;
  airline?: string;
  totalDuration: number | null;
  price: number | null;
  priceScope?: 'total' | 'flight-only' | 'unknown';
  note?: string;
  bookingUrl?: string;
  links?: RouteLink[];
  segments: RouteSegment[];
  layovers: Array<{
    code: string;
    city: string;
    lat: number;
    lng: number;
    duration: number | null;
    overnight?: boolean;
  }>;
}

export interface FlightRouteData {
  generated?: string;
  searchDate?: string;
  partial?: boolean;
  failedQueries?: number;
  destinations?: Array<{ city: string; airport: string; lat: number; lng: number }>;
  origins: Array<{
    city: string;
    airport: string;
    lat: number;
    lng: number;
    routes: FlightRoute[];
  }>;
}

export interface ProcessedRoute {
  city: string;
  airport: string;
  lat: number;
  lng: number;
  routes: FlightRoute[];
  searchDate?: string;
  generated?: string;
  steps: number;
  isDirect: boolean;
  hasGroundConnection: boolean;
  fastestDuration: number | null;
  cheapestPrice: number | null;
  airlines: Array<{ name: string; logo: string }>;
}
