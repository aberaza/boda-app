import { locales, translations, type Locale, type Translation } from './translations';

/**
 * Reads the `lang` querystring param from a URL and returns a valid Locale.
 * Falls back to `'es'` (Spanish) if the param is absent or unrecognised.
 *
 * Usage in Astro frontmatter:
 *   import { getLang, getT } from '../i18n';
 *   const lang = getLang(Astro.url);
 *   const t = getT(lang);
 */
export function getLang(url: URL): Locale {
  const param = url.searchParams.get('lang');
  if (param && (locales as readonly string[]).includes(param)) {
    return param as Locale;
  }
  return 'es';
}

/** Returns the translation object for a given locale. */
export function getT(lang: Locale): Translation {
  return translations[lang];
}

/** Builds a same-page URL with a different `lang` param. */
export function langUrl(url: URL, lang: Locale): string {
  const next = new URL(url);
  next.searchParams.set('lang', lang);
  // Remove default locale from URL to keep it clean
  if (lang === 'es') next.searchParams.delete('lang');
  return next.pathname + (next.search || '');
}

export { locales, type Locale };
