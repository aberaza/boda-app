/**
 * ─── WEDDING CONTENT ────────────────────────────────────────────────────────
 * Edit this file to update all text, dates, images and copy across the site.
 * No code knowledge needed — just change the string/number values.
 */

// ─── The couple ─────────────────────────────────────────────────────────────
export const couple = {
  partner1: {
    firstName: "Aritz",
    lastName: "Beraza Garayalde",
  },
  partner2: {
    firstName: "Sandra",
    lastName: "Vargas Benavente",
  },
} as const;

// Derived helpers used in templates
export const names = {
  short: `${couple.partner1.firstName} & ${couple.partner2.firstName}`,
  full: `${couple.partner1.firstName} ${couple.partner1.lastName} + ${couple.partner2.firstName} ${couple.partner2.lastName}`,
  display: `${couple.partner1.firstName} ${couple.partner1.lastName.split(" ")[0]}`, // "Aritz Beraza"
  display2: `${couple.partner2.firstName} ${couple.partner2.lastName.split(" ")[0]}`, // "Sandra Vargas"
};

// ─── Event details ───────────────────────────────────────────────────────────
export const event = {
  date: "9 de mayo de 2027",
  dateShort: "9 mayo 2027",
  time: "12:00 – 01:00 h",
  city: "Jerez de la Frontera",
  region: "Cádiz",
  venue: "Finca La Carreña",
  venueUrl: "https://lacarrena.com",
  venueAddress: "Ctra. de Trebujena, Km 6,5, 11405 Jerez de la Frontera, Cádiz",
  /** Coordinates verified against Google Maps. */
  venueLat: 36.75303816857168,
  venueLng: -6.170034182773936,
  venueMapsUrl:
    "https://maps.google.com/?q=Finca+La+Carre%C3%B1a+Jerez+de+la+Frontera",
  venueDescription:
    "Viña histórica en las afueras de Jerez. Arquitectura de cortijo andaluz, " +
    "jardines, capilla, caballerizas y una gran sala de celebraciones.",
} as const;

// ─── Images ──────────────────────────────────────────────────────────────────
// Swap any URL here to change a photo across the whole site.
export const images = {
  /** Hero: golden ring in pink roses bouquet (Unsplash M2T1j-6Fn8w), locally hosted. */
  hero: "/images/hero.jpg",
  /** "Cuándo" slide background texture (vineyard of La Carreña). */
  cuando:
    "https://cdn0.bodas.net/vendor/40644/3_2/1280/jpg/6_1_40644-162500944294411.jpeg",
  /** "La Finca" slide — inset photo panel. */
  finca:
    "https://lacarrena.com/wp-content/uploads/2018/09/la-carre%C3%B1a-acceso-iluminado-boda.jpg",
  /** "Pronto más" slide — closing image (La Carreña, locally hosted). */
  boda: "/images/pronto.jpg",
} as const;

// ─── Slide copy ──────────────────────────────────────────────────────────────
export const copy = {
  meta: {
    title: `${names.short} · ${event.dateShort}`,
    description: `Boda de ${names.full}. ${event.date}, ${event.venue}, ${event.city}.`,
  },

  hero: {
    tagline: "Nos casamos",
    scrollCue: "Desliza",
  },

  cuando: {
    eyebrow: "Cuándo",
    quote: "Una tarde de primavera entre viñedos, bajo el sol de Jerez.",
    labels: {
      ceremony: "Ceremonia & Celebración",
      city: "Ciudad",
    },
  },

  finca: {
    eyebrow: "El lugar",
    photoAlt: "Finca La Carreña, acceso iluminado",
    photoCaption: `${event.city}, ${event.region}`,
    linkLabel: "lacarrena.com",
  },

  pronto: {
    eyebrow: "En preparación",
    title: "Pronto más información",
    body:
      "Seguiremos actualizando esta página con detalles sobre alojamiento, " +
      "transporte y agenda. Recibirás un enlace personalizado para tu confirmación.",
    imgAlt: "Finca La Carreña",
  },
} as const;
