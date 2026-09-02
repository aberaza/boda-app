import { describe, expect, it } from 'vitest';
import { summarizeOrigin } from '../../src/lib/flight-routes';
import type { FlightRoute } from '../../src/components/home/types';

const segment = (from: string, to: string, airline: string, duration: number) => ({
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
  it('selects shortest, fastest, cheapest and calculates the short-route average', () => {
    const summary = summarizeOrigin('Test city', {
      city: 'Test city',
      airport: 'AAA',
      lat: 0,
      lng: 0,
      routes: [direct, connection],
    });

    expect(summary).toMatchObject({
      city: 'Test city',
      steps: 1,
      isDirect: true,
      fastestDuration: 120,
      cheapestPrice: 60,
      avgPriceShortest: 90,
    });
    expect(summary?.airlines.map(({ name }) => name)).toEqual(['Direct Air', 'Connect Air']);
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
