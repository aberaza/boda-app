import flightRoutes from '../data/flight-routes.json';
import type { ProcessedRoute } from '../components/home/types';

const suggestedCities = ['Barcelona', 'París', 'Pamplona', 'Madrid', 'Granada', 'Valencia'];

export function getSuggestedRoutes(): ProcessedRoute[] {
  return suggestedCities.flatMap((city) => {
    const origin = flightRoutes.origins.find((candidate) => candidate.city === city);
    if (!origin || origin.routes.length === 0) return [];

    const shortest = origin.routes.reduce((best, route) =>
      route.segments.length < best.segments.length ? route : best
    );
    const fastest = origin.routes.reduce((best, route) =>
      route.totalDuration < best.totalDuration ? route : best
    );
    const cheapest = origin.routes.reduce((best, route) =>
      route.price < best.price ? route : best
    );
    const routesWithSameSteps = origin.routes.filter(
      (route) => route.segments.length === shortest.segments.length,
    );
    const avgPriceShortest = Math.round(
      routesWithSameSteps.reduce((sum, route) => sum + route.price, 0) / routesWithSameSteps.length,
    );
    const airlines = Array.from(
      new Map(origin.routes.flatMap((route) =>
        route.segments.map((segment) => [segment.airline, segment.logo] as const),
      )).entries(),
    ).map(([name, logo]) => ({ name, logo }));

    return [{
      city,
      steps: shortest.segments.length,
      isDirect: shortest.type === 'direct',
      fastestDuration: fastest.totalDuration,
      cheapestPrice: cheapest.price,
      avgPriceShortest,
      airlines,
    }];
  });
}
