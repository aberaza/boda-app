/**
 * ─── TRANSLATIONS ────────────────────────────────────────────────────────────
 * Three locales: es (default), fr, en.
 * Event facts (times, venue name, URLs) live in content.ts and are language-
 * agnostic; everything that is *rendered as copy* lives here.
 */

export const locales = ['es', 'fr', 'en'] as const;
export type Locale = (typeof locales)[number];

// ─── Spanish (default) ───────────────────────────────────────────────────────
const es = {
  meta: {
    title:       'Aritz & Sandra · 1 mayo 2026',
    description: 'Boda de Aritz Beraza Garayalde y Sandra Vargas Benavente. 1 de mayo de 2026, Finca La Carreña, Jerez de la Frontera.',
  },

  event: {
    date:      '1 de mayo de 2026',
    dateShort: '1 mayo 2026',
    venueDescription:
      'Viña histórica en las afueras de Jerez. Arquitectura de cortijo andaluz, ' +
      'jardines, capilla, caballerizas y una gran sala de celebraciones.',
  },

  hero: {
    tagline:   'Nos casamos',
    scrollCue: 'Desliza',
  },

  cuando: {
    eyebrow: 'Cuándo',
    quote:   'Una tarde de primavera entre viñedos, bajo el sol de Jerez.',
    labels: {
      ceremony: 'Ceremonia & Celebración',
      city:     'Ciudad',
    },
  },

  finca: {
    eyebrow:      'El lugar',
    photoAlt:     'Finca La Carreña, acceso iluminado',
    photoCaption: 'Jerez de la Frontera, Cádiz',
    linkLabel:    'lacarrena.com',
  },

  pronto: {
    eyebrow: 'En preparación',
    title:   'Pronto más información',
    body:
      'Seguiremos actualizando esta página con detalles sobre alojamiento, ' +
      'transporte y agenda. Recibirás un enlace personalizado para tu confirmación.',
    imgAlt: 'Finca La Carreña',
  },

  lang: {
    switcher: { es: 'ES', fr: 'FR', en: 'EN' },
  },
} as const;


// ─── French ──────────────────────────────────────────────────────────────────
const fr = {
  meta: {
    title:       'Aritz & Sandra · 1er mai 2026',
    description: 'Mariage d\'Aritz Beraza Garayalde et Sandra Vargas Benavente. 1er mai 2026, Finca La Carreña, Jerez de la Frontera.',
  },

  event: {
    date:      '1er mai 2026',
    dateShort: '1 mai 2026',
    venueDescription:
      'Vignoble historique aux portes de Jerez. Architecture de cortijo andalou, ' +
      'jardins, chapelle, écuries et une grande salle de réception.',
  },

  hero: {
    tagline:   'On se marie',
    scrollCue: 'Défiler',
  },

  cuando: {
    eyebrow: 'Quand',
    quote:   'Un après-midi de printemps entre les vignes, sous le soleil de Jerez.',
    labels: {
      ceremony: 'Cérémonie & Réception',
      city:     'Ville',
    },
  },

  finca: {
    eyebrow:      'Le lieu',
    photoAlt:     'Finca La Carreña, accès illuminé',
    photoCaption: 'Jerez de la Frontera, Cádiz',
    linkLabel:    'lacarrena.com',
  },

  pronto: {
    eyebrow: 'En préparation',
    title:   'Plus d\'informations bientôt',
    body:
      'Nous continuerons à mettre à jour cette page avec des détails sur l\'hébergement, ' +
      'le transport et le programme. Vous recevrez un lien personnalisé pour confirmer votre présence.',
    imgAlt: 'Finca La Carreña',
  },

  lang: {
    switcher: { es: 'ES', fr: 'FR', en: 'EN' },
  },
} as const;

// ─── English ─────────────────────────────────────────────────────────────────
const en = {
  meta: {
    title:       'Aritz & Sandra · 1 May 2026',
    description: 'Wedding of Aritz Beraza Garayalde and Sandra Vargas Benavente. 1 May 2026, Finca La Carreña, Jerez de la Frontera.',
  },

  event: {
    date:      '1 May 2026',
    dateShort: '1 May 2026',
    venueDescription:
      'A historic vineyard on the outskirts of Jerez. Andalusian cortijo architecture, ' +
      'gardens, chapel, stables and a grand celebration hall.',
  },

  hero: {
    tagline:   "We're getting married",
    scrollCue: 'Scroll',
  },

  cuando: {
    eyebrow: 'When',
    quote:   'A spring afternoon among the vineyards, under the Jerez sun.',
    labels: {
      ceremony: 'Ceremony & Reception',
      city:     'City',
    },
  },

  finca: {
    eyebrow:      'The venue',
    photoAlt:     'Finca La Carreña, illuminated entrance',
    photoCaption: 'Jerez de la Frontera, Cádiz',
    linkLabel:    'lacarrena.com',
  },

  pronto: {
    eyebrow: 'Coming soon',
    title:   'More details soon',
    body:
      'We will keep updating this page with details on accommodation, ' +
      'transport and schedule. You will receive a personalised link to confirm your attendance.',
    imgAlt: 'Finca La Carreña',
  },

  lang: {
    switcher: { es: 'ES', fr: 'FR', en: 'EN' },
  },
} as const;

// Defined after all locale consts to avoid "cannot access before initialization"
export const translations: Record<Locale, typeof en> = { es, fr, en };
