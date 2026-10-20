import type { Locale } from './translations';

export const horizontalCopy = {
  es: {
    previous: 'Panel anterior',
    next: 'Panel siguiente',
    hint: 'Desliza horizontalmente',
    discover: 'Descubrir Jerez →',
  },
  fr: {
    previous: 'Panneau précédent',
    next: 'Panneau suivant',
    hint: 'Glissez horizontalement',
    discover: 'Découvrir Jerez →',
  },
  en: {
    previous: 'Previous panel',
    next: 'Next panel',
    hint: 'Swipe horizontally',
    discover: 'Discover Jerez →',
  },
} satisfies Record<Locale, Record<string, string>>;

export type HorizontalCopy = (typeof horizontalCopy)[Locale];
