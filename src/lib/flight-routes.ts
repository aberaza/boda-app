import flightRoutes from '../data/flight-routes.json';
import type { FlightRouteData, ProcessedRoute } from '../components/home/types';

export const suggestedCities = [
  'Barcelona',
  'París',
  'Pamplona',
  'Madrid',
  'Granada',
  'Avilés',
  'Valencia',
];

export function summarizeOrigin(
  city: string,
  origin: FlightRouteData['origins'][number],
  metadata?: Pick<FlightRouteData, 'generated' | 'searchDate'>,
): ProcessedRoute | null {
  if (origin.routes.length === 0) return null;

  const comparableRoutes = origin.routes.filter(
    (route) =>
      route.priceScope !== 'flight-only' &&
      typeof route.price === 'number' &&
      typeof route.totalDuration === 'number' &&
      route.segments.every((segment) => segment.mode === 'flight'),
  );
  const flightRoutes = origin.routes.filter((route) =>
    route.segments.some((segment) => segment.mode === 'flight'),
  );
  const shortestPool = comparableRoutes.length ? comparableRoutes : flightRoutes;
  const shortest = shortestPool.length
    ? shortestPool.reduce((best, route) =>
        route.segments.filter((segment) => segment.mode === 'flight').length <
        best.segments.filter((segment) => segment.mode === 'flight').length
          ? route
          : best,
      )
    : origin.routes[0];
  const timedRoutes = comparableRoutes.filter((route) => typeof route.totalDuration === 'number');
  const pricedRoutes = comparableRoutes.filter((route) => typeof route.price === 'number');
  const fastest = timedRoutes.length
    ? timedRoutes.reduce((best, route) =>
        (route.totalDuration ?? Infinity) < (best.totalDuration ?? Infinity) ? route : best,
      )
    : null;
  const cheapest = pricedRoutes.length
    ? pricedRoutes.reduce((best, route) =>
        (route.price ?? Infinity) < (best.price ?? Infinity) ? route : best,
      )
    : null;
  const shortestFlightCount = shortest.segments.filter(
    (segment) => segment.mode === 'flight',
  ).length;
  const airlines = Array.from(
    new Map(
      origin.routes.flatMap((route) =>
        route.segments
          .filter((segment) => segment.mode === 'flight' && segment.airline)
          .map((segment) => [segment.airline!, segment.logo ?? null] as const),
      ),
    ).entries(),
  ).map(([name, logo]) => ({ name, logo: logo ?? '' }));

  return {
    city,
    airport: origin.airport,
    lat: origin.lat,
    lng: origin.lng,
    routes: origin.routes,
    generated: metadata?.generated,
    searchDate: metadata?.searchDate,
    steps: Math.max(0, shortestFlightCount - 1),
    isDirect:
      shortest.type === 'direct' && shortest.segments.every((segment) => segment.mode === 'flight'),
    hasGroundConnection: shortest.segments.some((segment) => segment.mode !== 'flight'),
    fastestDuration: fastest?.totalDuration ?? null,
    cheapestPrice: cheapest?.price ?? null,
    airlines,
  };
}

export function getSuggestedRoutes(): ProcessedRoute[] {
  const data = flightRoutes as unknown as FlightRouteData;
  return suggestedCities
    .map((city) => {
      const origin = data.origins.find((candidate) => candidate.city === city);
      return origin ? summarizeOrigin(city, origin, data) : null;
    })
    .filter((route): route is ProcessedRoute => route !== null);
}
