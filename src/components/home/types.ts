import type { Translation } from '../../i18n/translations';

export type { Translation };

export interface RouteSegment {
  from: { code: string; city: string; lat: number; lng: number };
  to: { code: string; city: string; lat: number; lng: number };
  airline: string;
  logo: string | null;
  duration: number;
}

export interface FlightRoute {
  type: 'direct' | 'connecting';
  airline: string;
  totalDuration: number;
  price: number;
  segments: RouteSegment[];
  layovers: Array<{ code: string; city: string; lat: number; lng: number; duration: number }>;
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
  steps: number;
  isDirect: boolean;
  fastestDuration: number;
  cheapestPrice: number;
  avgPriceShortest: number;
  airlines: Array<{ name: string; logo: string }>;
}
