import type { getT } from '../../i18n';

export type Translation = ReturnType<typeof getT>;

export interface ProcessedRoute {
  city: string;
  steps: number;
  isDirect: boolean;
  fastestDuration: number;
  cheapestPrice: number;
  avgPriceShortest: number;
  airlines: Array<{ name: string; logo: string }>;
}
