import { describe, expect, it } from 'vitest';
import data from '../../src/data/flight-routes.json';

describe('generated flight-route data', () => {
  it('has the expected top-level schema', () => {
    expect(data.searchDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(data.destinations.length).toBeGreaterThan(0);
    expect(data.origins.length).toBeGreaterThan(0);
  });

  it('contains valid route entries when routes are available', () => {
    for (const origin of data.origins) {
      for (const route of origin.routes) {
        expect(['direct', 'connecting']).toContain(route.type);
        expect(route.segments.length).toBeGreaterThan(0);
        expect(route.price).toEqual(expect.any(Number));
        expect(route.totalDuration).toEqual(expect.any(Number));
      }
    }
  });
});
