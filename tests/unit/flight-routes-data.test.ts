import { describe, expect, it } from 'vitest';
import data from '../../src/data/flight-routes.json';

describe('generated flight-route data', () => {
  it('has the expected top-level schema', () => {
    expect(data.searchDate).toBe('2027-05-07');
    expect(data.destinations.length).toBeGreaterThan(0);
    expect(data.origins.length).toBeGreaterThan(0);
    expect(data.origins.map((origin) => origin.city)).toEqual(
      expect.arrayContaining(['Granada', 'Madrid', 'Avilés']),
    );
    expect(data.origins.find((origin) => origin.city === 'Avilés')?.airport).toBe('OVD');
  });

  it('contains valid route entries when routes are available', () => {
    for (const origin of data.origins) {
      for (const route of origin.routes) {
        expect(['direct', 'connecting', 'multimodal']).toContain(route.type);
        expect(route.segments.length).toBeGreaterThan(0);
        expect(
          route.segments.filter((segment) => segment.mode === 'flight').length,
        ).toBeLessThanOrEqual(2);
        for (const segment of route.segments) {
          expect(['flight', 'train', 'transfer']).toContain(segment.mode);
          expect(segment.from.lat).not.toBe(0);
          expect(segment.from.lng).not.toBe(0);
          expect(segment.to.lat).not.toBe(0);
          expect(segment.to.lng).not.toBe(0);
        }
        expect(route.links?.length).toBeGreaterThan(0);
        for (const link of route.links ?? []) {
          expect(['flight', 'train']).toContain(link.mode);
          expect(link.url).toMatch(/^https:\/\//);
        }
        if (route.price !== null) expect(route.price).toEqual(expect.any(Number));
        if (route.totalDuration !== null) expect(route.totalDuration).toEqual(expect.any(Number));
      }
    }
  });

  it('includes accurate train connections and avoids implying a total fare', () => {
    const madrid = data.origins.find((origin) => origin.city === 'Madrid');
    const pamplona = data.origins.find((origin) => origin.city === 'Pamplona');

    const madridTrain = madrid?.routes.find(
      (route) =>
        route.priceScope === 'unknown' &&
        route.segments.some((segment) => segment.mode === 'train'),
    );
    expect(madridTrain?.price).toBeNull();
    expect(madridTrain?.links?.[0]).toMatchObject({ mode: 'train' });
    expect(
      madridTrain?.segments.map((segment) => `${segment.from.code}→${segment.to.code}`),
    ).toEqual(['MAD-ATO→SVQ-STA', 'SVQ-STA→XRY-RENFE']);
    expect(madridTrain?.layovers[0]?.duration).toBeNull();

    expect(
      pamplona?.routes.some(
        (route) =>
          route.type === 'multimodal' &&
          route.priceScope === 'flight-only' &&
          route.segments.map((segment) => segment.mode).join(',') === 'train,transfer,flight' &&
          route.segments[0].from.code === 'PNA-RENFE' &&
          route.segments[0].to.code === 'MAD-CH' &&
          route.segments[1].to.code === 'MAD',
      ),
    ).toBe(true);

    const multimodalPamplona = pamplona?.routes.find(
      (route) =>
        route.type === 'multimodal' && route.segments.some((segment) => segment.mode === 'train'),
    );
    expect(multimodalPamplona?.links?.map((link) => link.mode)).toEqual(['flight', 'train']);
  });

  it('does not present late Sevilla arrivals as same-day train connections', () => {
    for (const origin of data.origins) {
      for (const route of origin.routes) {
        const hasSevilleTrainLeg = route.segments.some(
          (segment) => segment.mode === 'train' && segment.to.code === 'XRY-RENFE',
        );
        const lastFlight = [...route.segments]
          .reverse()
          .find((segment) => segment.mode === 'flight');
        if (!hasSevilleTrainLeg || !lastFlight || lastFlight.to.code !== 'SVQ') continue;

        const arrivalTime = 'arrivalTime' in lastFlight ? lastFlight.arrivalTime : undefined;
        const arrival = arrivalTime?.match(/(\d{2}):(\d{2})$/);
        expect(arrival).not.toBeNull();
        const arrivalMinutes = Number(arrival?.[1]) * 60 + Number(arrival?.[2]);
        expect(arrivalMinutes).toBeLessThanOrEqual(19 * 60);
      }
    }
  });
});
