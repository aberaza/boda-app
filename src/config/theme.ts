/**
 * ─── VISUAL / THEME PARAMETERS ──────────────────────────────────────────────
 * All inline-style visual knobs in one place.
 *
 * For Tailwind utility tokens (colors, fonts, shadows) see:
 *   src/styles/global.css  →  @theme { … }
 *
 * This file covers everything that lives in inline styles or JS:
 *   • Pattern colors & stroke opacity
 *   • CSS mask gradient stops (controls where each pattern fades out)
 *   • Overlay transparencies (photo washes, texture opacities)
 *   • Slide background colours
 *   • GSAP animation timing
 */

// ─── Patterns ────────────────────────────────────────────────────────────────
export const patterns = {
  bauhaus: {
    /** Stroke/fill color of the Bauhaus grid SVG. */
    color: '#1a1208',
    /** Overall opacity passed to <BauhausPattern>. 0–1. */
    opacity: 0.9,
  },
  almohade: {
    /** Stroke/fill color of the Almohade star SVG. */
    color: '#bc6c4d',
    /** Overall opacity passed to <GeoPattern>. 0–1. */
    opacity: 0.9,
  },
  mask: {
    /**
     * Peak alpha of the CSS mask gradient (how strong the pattern is at its
     * strongest edge). Range 0–1.  Lower → more see-through even at the edge.
     */
    peakAlpha: 0.7,
    /**
     * Up to this % the pattern is at full (peakAlpha) strength.
     * After this point it starts fading toward the centre.
     */
    solidEnd: '40%',
    /**
     * At this % the pattern becomes fully transparent.
     * The overlap zone between solidEnd and fadeEnd of each side is
     * where both patterns co-exist → the visual amalgam in the centre.
     */
    fadeEnd: '68%',
  },
} as const;

// Pre-built mask strings (used as inline style values)
const { peakAlpha, solidEnd, fadeEnd } = patterns.mask;
const half = +(peakAlpha * 0.55).toFixed(2);
export const masks = {
  /** Applied to the Bauhaus layer:  strong on left, fades right. */
  bauhaus: `linear-gradient(to right, rgba(0,0,0,${peakAlpha}) 0%, rgba(0,0,0,${half}) ${solidEnd}, transparent ${fadeEnd})`,
  /** Applied to the Almohade layer: strong on right, fades left. */
  almohade: `linear-gradient(to left,  rgba(0,0,0,${peakAlpha}) 0%, rgba(0,0,0,${half}) ${solidEnd}, transparent ${fadeEnd})`,
} as const;

// ─── Overlays & photo treatments ─────────────────────────────────────────────
export const overlays = {
  /**
   * Warm parchment wash over the hero B&W photo.
   * Pulls the monochrome image into the warm palette.
   * Adjust the last value (0–1) to make it warmer or cooler.
   */
  heroParchment: 'rgba(245, 240, 232, 0.72)',

  /**
   * Opacity of the vineyard photo used as a background *texture*
   * behind the patterns in the "Cuándo" slide. Very low by design.
   * Range 0–1. Try 0.12–0.18 for more visibility.
   */
  cuandoPhotoOpacity: 0.17,

  /** CSS filter applied to the hero photo to force true B&W. */
  heroFilter: 'grayscale(1) contrast(1.05)',
} as const;

// ─── Slide background colours ────────────────────────────────────────────────
// These sit behind the pattern layers. Adjust to shift the overall mood.
export const slideBg = {
  hero: 'var(--color-paper)', // references the CSS @theme token
  cuando: '#f2ebe0',
  finca: '#ede8de',
  pronto: 'var(--color-paper)',
} as const;

// ─── GSAP animation timing ────────────────────────────────────────────────────
// This object is imported by the client-side <script> in index.astro.
export const animation = {
  /**
   * ScrollTrigger scrub lag in seconds.
   * Higher = transitions feel heavier/more physical.
   * Lower = snappier, more responsive to scroll.
   */
  scrub: 1.2,

  /** How long (in timeline units) each slide holds before transitioning. */
  hold: 0.5,

  /** Duration of the crossfade between slides (opacity + scale). */
  xfade: 0.5,

  /** Delay before the hero entrance animation fires on page load. */
  heroDelay: 0.4,
} as const;
