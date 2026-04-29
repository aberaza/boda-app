/**
 * ─── WEDDING CONTENT ────────────────────────────────────────────────────────
 * Edit this file to update all text, dates, images and copy across the site.
 * No code knowledge needed — just change the string/number values.
 */

// ─── The couple ─────────────────────────────────────────────────────────────
export const couple = {
  partner1: {
    firstName: 'Aritz',
    lastName:  'Beraza Garayalde',
  },
  partner2: {
    firstName: 'Sandra',
    lastName:  'Vargas Benavente',
  },
} as const;

// Derived helpers used in templates
export const names = {
  short:   `${couple.partner1.firstName} & ${couple.partner2.firstName}`,
  full:    `${couple.partner1.firstName} ${couple.partner1.lastName} + ${couple.partner2.firstName} ${couple.partner2.lastName}`,
  display: `${couple.partner1.firstName} ${couple.partner1.lastName.split(' ')[0]}`, // "Aritz Beraza"
  display2:`${couple.partner2.firstName} ${couple.partner2.lastName.split(' ')[0]}`, // "Sandra Vargas"
};

// ─── Event details ───────────────────────────────────────────────────────────
export const event = {
  date:        '1 de mayo de 2026',
  dateShort:   '1 mayo 2026',
  time:        '12:00 – 01:00 h',
  city:        'Jerez de la Frontera',
  region:      'Cádiz',
  venue:       'Finca La Carreña',
  venueUrl:    'https://lacarrena.com',
  venueDescription:
    'Viña histórica en las afueras de Jerez. Arquitectura de cortijo andaluz, ' +
    'jardines, capilla, caballerizas y una gran sala de celebraciones.',
} as const;

// ─── Images ──────────────────────────────────────────────────────────────────
// Swap any URL here to change a photo across the whole site.
export const images = {
  /** Hero: B&W hands photo. CSS grayscale is applied automatically. */
  hero:   'https://images.unsplash.com/photo-1529651737248-dad5e287768e?auto=format&fit=crop&w=1920&q=80',
  /** "Cuándo" slide background texture (vineyard of La Carreña). */
  cuando: 'https://cdn0.bodas.net/vendor/40644/3_2/1280/jpg/6_1_40644-162500944294411.jpeg',
  /** "La Finca" slide — inset photo panel. */
  finca:  'https://lacarrena.com/wp-content/uploads/2018/09/la-carre%C3%B1a-acceso-iluminado-boda.jpg',
  /** "Pronto más" slide — closing image. */
  boda:   'https://lacarrena.com/wp-content/uploads/2018/09/la-carre%C3%B1a-bodas-unicas-jerez.jpg',
} as const;

// ─── Slide copy ──────────────────────────────────────────────────────────────
export const copy = {
  meta: {
    title:       `${names.short} · ${event.dateShort}`,
    description: `Boda de ${names.full}. ${event.date}, ${event.venue}, ${event.city}.`,
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
    photoCaption: `${event.city}, ${event.region}`,
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
} as const;
