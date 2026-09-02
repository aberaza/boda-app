import flightRoutes from '../data/flight-routes.json';
import type { FlightRouteData, ProcessedRoute } from '../components/home/types';

export const suggestedCities = ['Barcelona', 'París', 'Pamplona', 'Madrid', 'Granada', 'Valencia'];

export function summarizeOrigin(
  city: string,
  origin: FlightRouteData['origins'][number],
): ProcessedRoute | null {
  if (origin.routes.length === 0) return null;

  const shortest = origin.routes.reduce((best, route) =>
    route.segments.length < best.segments.length ? route : best,
  );
  const fastest = origin.routes.reduce((best, route) =>
    route.totalDuration < best.totalDuration ? route : best,
  );
  const cheapest = origin.routes.reduce((best, route) => (route.price < best.price ? route : best));
  const routesWithSameSteps = origin.routes.filter(
    (route) => route.segments.length === shortest.segments.length,
  );
  const avgPriceShortest = Math.round(
    routesWithSameSteps.reduce((sum, route) => sum + route.price, 0) / routesWithSameSteps.length,
  );
  const airlines = Array.from(
    new Map(
      origin.routes.flatMap((route) =>
        route.segments.map((segment) => [segment.airline, segment.logo] as const),
      ),
    ).entries(),
  ).map(([name, logo]) => ({ name, logo: logo ?? '' }));

  return {
    city,
    steps: shortest.segments.length,
    isDirect: shortest.type === 'direct',
    fastestDuration: fastest.totalDuration,
    cheapestPrice: cheapest.price,
    avgPriceShortest,
    airlines,
  };
}

export function getSuggestedRoutes(): ProcessedRoute[] {
  const data = flightRoutes as unknown as FlightRouteData;
  return suggestedCities
    .map((city) => {
      const origin = data.origins.find((candidate) => candidate.city === city);
      return origin ? summarizeOrigin(city, origin) : null;
    })
    .filter((route): route is ProcessedRoute => route !== null);
}
