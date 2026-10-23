import { describe, expect, it } from 'vitest';
import { summarizeOrigin } from '../../src/lib/flight-routes';
import type { FlightRoute } from '../../src/components/home/types';

const segment = (from: string, to: string, airline: string, duration: number) => ({
  mode: 'flight' as const,
  from: { code: from, city: from, lat: 0, lng: 0 },
  to: { code: to, city: to, lat: 0, lng: 0 },
  airline,
  logo: null,
  duration,
});

const direct: FlightRoute = {
  type: 'direct',
  airline: 'Direct Air',
  totalDuration: 120,
  price: 90,
  segments: [segment('AAA', 'XRY', 'Direct Air', 120)],
  layovers: [],
};

const connection: FlightRoute = {
  type: 'connecting',
  airline: 'Connect Air',
  totalDuration: 240,
  price: 60,
  segments: [segment('AAA', 'MAD', 'Connect Air', 100), segment('MAD', 'XRY', 'Connect Air', 80)],
  layovers: [],
};

describe('summarizeOrigin', () => {
  it('summarizes flight routes without treating connections as stops in the origin city', () => {
    const summary = summarizeOrigin('Test city', {
      city: 'Test city',
      airport: 'AAA',
      lat: 0,
      lng: 0,
      routes: [direct, connection],
    });

    expect(summary).toMatchObject({
      city: 'Test city',
      steps: 0,
      isDirect: true,
      fastestDuration: 120,
      cheapestPrice: 60,
      hasGroundConnection: false,
    });
    expect(summary?.airlines.map(({ name }) => name)).toEqual(['Direct Air', 'Connect Air']);
  });

  it('does not include a flight-only fare in the total-route price summary', () => {
    const multimodal: FlightRoute = {
      type: 'multimodal',
      totalDuration: null,
      price: 20,
      priceScope: 'flight-only',
      segments: [
        segment('AAA', 'SVQ', 'Budget Air', 90),
        {
          mode: 'train',
          from: { code: 'SVQ-STA', city: 'Sevilla', lat: 37.39, lng: -5.97 },
          to: { code: 'XRY-RENFE', city: 'Jerez', lat: 36.68, lng: -6.12 },
          operator: 'Renfe',
          duration: null,
        },
      ],
      layovers: [],
    };
    const summary = summarizeOrigin('Test city', {
      city: 'Test city',
      airport: 'AAA',
      lat: 0,
      lng: 0,
      routes: [direct, multimodal],
    });

    expect(summary?.cheapestPrice).toBe(90);
  });

  it('returns null when an origin has no routes', () => {
    expect(
      summarizeOrigin('Empty city', {
        city: 'Empty city',
        airport: 'AAA',
        lat: 0,
        lng: 0,
        routes: [],
      }),
    ).toBeNull();
  });
});
