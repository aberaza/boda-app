import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animation } from '../config/theme';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import flightRoutes from '../data/flight-routes.json';
import type { FlightRoute, FlightRouteData } from '../components/home/types';

// ── URL state helpers ─────────────────────────────────────────────
// ?slide=<name> restores scroll position (stable by slide key)
// ?slide=N      legacy support for old numeric links
// ?detail=<key> re-opens the named overlay
const _urlP = new URLSearchParams(window.location.search);
const initSlideRaw = _urlP.get('slide');
const initDetail = _urlP.get('detail');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const navigationBehavior: ScrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

function setUrlParam(key: string, value: string | null) {
  const p = new URLSearchParams(window.location.search);
  if (value === null) p.delete(key);
  else p.set(key, value);
  const qs = p.toString();
  history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
}

const navBtns = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-slide-btn]'));
const slideKeys = navBtns.map((btn) => (btn.dataset.slideKey ?? '').toLowerCase());
const maxSlideIndex = Math.max(navBtns.length - 1, 0);

function clampSlide(index: number) {
  return Math.min(Math.max(index, 0), maxSlideIndex);
}

function getSlideParamValue(index: number) {
  return index === 0 ? null : (slideKeys[index] ?? String(index));
}

function resolveInitSlide(raw: string | null) {
  if (!raw) return 0;
  const normalized = raw.trim().toLowerCase();
  const keyIndex = slideKeys.indexOf(normalized);
  if (keyIndex !== -1) return keyIndex;
  const parsed = parseInt(normalized, 10);
  if (Number.isNaN(parsed)) return 0;
  return clampSlide(parsed);
}

const initSlide = resolveInitSlide(initSlideRaw);
let activeSlideIndex = initSlide;
let goToMainSlide: (index: number, behavior?: ScrollBehavior) => void = () => {};
let goToJerezSlide: ((index: number, behavior?: ScrollBehavior) => void) | null = null;
let activeJerezSlideIndex = 0;

function setMainActive(index: number) {
  activeSlideIndex = clampSlide(index);
  navBtns.forEach((btn, i) => {
    const active = i === activeSlideIndex;
    btn.toggleAttribute('data-active', active);
    if (active) btn.setAttribute('aria-current', 'step');
    else btn.removeAttribute('aria-current');
  });
  document.querySelectorAll<HTMLElement>('.slide').forEach((slide, i) => {
    const active = i === activeSlideIndex;
    slide.setAttribute('aria-hidden', String(!active));
    if ('inert' in slide) slide.inert = !active;
  });
  setUrlParam('slide', getSlideParamValue(activeSlideIndex));
}

function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || target.matches('input, textarea, select, option'))
  );
}

function keyboardDirection(key: string): -1 | 1 | null {
  const normalized = key.toLowerCase();
  if (['arrowdown', 'arrowright', 's', 'd', 'j', 'l'].includes(normalized)) return 1;
  if (['arrowup', 'arrowleft', 'w', 'a', 'k', 'h'].includes(normalized)) return -1;
  return null;
}

// ══════════════════════════════════════════════════════════════════
// GENERIC OVERLAY SYSTEM
// Trigger:  data-open-overlay="<key>"  on any clickable element
// Dismiss:  data-close-overlay          on any button inside overlay
// Overlay:  data-overlay-key="<key>"    on the full-screen panel
// ══════════════════════════════════════════════════════════════════

// Per-overlay callbacks — called once after the open animation ends
const overlayOnOpen: Record<string, () => void> = {
  finca: initFincaMap,
  jerez: initJerezOverlay,
};

let currentOverlay: HTMLElement | null = null;
let overlayTrigger: HTMLElement | null = null;

function setOverlayVisibility(el: HTMLElement, visible: boolean) {
  el.classList.toggle('is-open', visible);
  el.setAttribute('aria-hidden', String(!visible));
  if ('inert' in el) el.inert = !visible;
}

function openOverlay(key: string, trigger?: HTMLElement | null) {
  const el = document.querySelector<HTMLElement>('[data-overlay-key="' + key + '"]');
  if (!el || currentOverlay === el) return;
  if (currentOverlay) {
    gsap.set(currentOverlay, { autoAlpha: 0 });
    setOverlayVisibility(currentOverlay, false);
  }
  overlayTrigger = trigger ?? (document.activeElement as HTMLElement | null);
  currentOverlay = el;
  setOverlayVisibility(el, true);
  gsap.fromTo(
    el,
    { autoAlpha: 0, y: prefersReducedMotion ? 0 : 30 },
    {
      autoAlpha: 1,
      y: 0,
      duration: prefersReducedMotion ? 0 : 0.55,
      ease: 'power3.out',
      onComplete: () => {
        overlayOnOpen[key]?.();
        el.querySelector<HTMLElement>('[data-close-overlay]')?.focus({ preventScroll: true });
      },
    },
  );
  document.body.style.overflow = 'hidden';
  setUrlParam('detail', key);
}

function closeOverlay() {
  if (!currentOverlay) return;
  const el = currentOverlay;
  const trigger = overlayTrigger;
  currentOverlay = null;
  overlayTrigger = null;
  gsap.to(el, {
    autoAlpha: 0,
    y: prefersReducedMotion ? 0 : 20,
    duration: prefersReducedMotion ? 0 : 0.4,
    ease: 'power2.in',
    onComplete: () => {
      setOverlayVisibility(el, false);
      trigger?.focus({ preventScroll: true });
    },
  });
  document.body.style.overflow = '';
  setUrlParam('detail', null);
}

// Wire all trigger / close buttons globally
document.querySelectorAll<HTMLElement>('[data-open-overlay]').forEach((btn) => {
  btn.addEventListener('click', () => openOverlay(btn.dataset.openOverlay!, btn));
});
document.querySelectorAll<HTMLElement>('[data-close-overlay]').forEach((btn) => {
  btn.addEventListener('click', closeOverlay);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && currentOverlay) {
    event.preventDefault();
    closeOverlay();
    return;
  }
  if (event.key === 'Tab' && currentOverlay) {
    const focusable = Array.from(
      currentOverlay.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => element.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (
      first &&
      last &&
      (event.shiftKey ? document.activeElement === first : document.activeElement === last)
    ) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    }
    return;
  }
  if (event.metaKey || event.ctrlKey || event.altKey || isEditableTarget(event.target)) return;

  const direction = keyboardDirection(event.key);
  if (direction === null) return;

  if (currentOverlay?.dataset.overlayKey === 'jerez' && goToJerezSlide) {
    event.preventDefault();
    goToJerezSlide(activeJerezSlideIndex + direction);
    return;
  }
  if (currentOverlay) return;

  event.preventDefault();
  goToMainSlide(activeSlideIndex + direction);
});

// Guarantee all overlays are hidden and removed from the accessibility tree on load.
document.querySelectorAll<HTMLElement>('[data-overlay-key]').forEach((el) => {
  gsap.set(el, { autoAlpha: 0 });
  setOverlayVisibility(el, false);
});

// ── Pointer, wheel and touch navigation ───────────────────────────
// Coarse pointers use native vertical scroll snapping; wheel/trackpad devices
// retain the scrubbed GSAP presentation. Keyboard navigation calls the same
// goToMainSlide function in both modes.
const isTouch = window.matchMedia('(any-pointer: coarse)').matches;

if (isTouch) {
  document.documentElement.classList.add('snap-mode');
  const wrap = document.getElementById('slides-wrap')!;

  goToMainSlide = (index, behavior = navigationBehavior) => {
    const target = clampSlide(index);
    wrap.scrollTo({ top: target * wrap.clientHeight, behavior });
    setMainActive(target);
  };

  navBtns.forEach((btn) => {
    btn.addEventListener('click', () => goToMainSlide(Number(btn.dataset.slideBtn)));
  });
  wrap.addEventListener(
    'scroll',
    () => {
      setMainActive(Math.round(wrap.scrollTop / Math.max(wrap.clientHeight, 1)));
    },
    { passive: true },
  );

  requestAnimationFrame(() => goToMainSlide(initSlide, 'auto'));
} else {
  gsap.registerPlugin(ScrollTrigger);

  const slides = gsap.utils.toArray<HTMLElement>('.slide');
  const slideStep = () =>
    Math.max(document.documentElement.scrollHeight - window.innerHeight, 0) / maxSlideIndex;
  const scrollPositionForSlide = (index: number) => clampSlide(index) * slideStep();
  const ease = 'power2.inOut';
  const master = gsap.timeline({ paused: true });

  if (prefersReducedMotion) {
    document.documentElement.classList.add('reduced-motion');
  }

  gsap.set(slides, { autoAlpha: 0, scale: prefersReducedMotion ? 1 : 1.03 });
  gsap.set(slides[0], { autoAlpha: 1, scale: 1 });

  slides.forEach((slide, i) => {
    master.to({}, { duration: animation.hold });
    if (i < slides.length - 1) {
      master
        .to(
          slide,
          {
            autoAlpha: 0,
            scale: prefersReducedMotion ? 1 : 0.97,
            duration: prefersReducedMotion ? 0.01 : animation.xfade,
            ease,
          },
          '>',
        )
        .fromTo(
          slides[i + 1],
          { autoAlpha: 0, scale: prefersReducedMotion ? 1 : 1.03 },
          { autoAlpha: 1, scale: 1, duration: prefersReducedMotion ? 0.01 : animation.xfade, ease },
          '<',
        );
    }
  });

  ScrollTrigger.create({
    trigger: '#scroll-driver',
    start: 'top top',
    end: 'bottom bottom',
    scrub: prefersReducedMotion ? false : animation.scrub,
    animation: master,
    onUpdate: (self) => setMainActive(Math.round(self.progress * maxSlideIndex)),
  });

  if (!prefersReducedMotion && initSlide === 0 && !initDetail) {
    gsap.set(['#hero-photo', '#hero-parchment'], { autoAlpha: 0 });
    gsap.set('#hero-bauhaus', { autoAlpha: 0, x: '-18%' });
    gsap.set('#hero-almohade', { autoAlpha: 0, x: '18%' });
    gsap.set(['#hero-date', '#hero-names', '#hero-tagline', '#hero-cue'], { autoAlpha: 0, y: 20 });

    gsap
      .timeline({ delay: animation.heroDelay })
      .to('#hero-bauhaus', { autoAlpha: 1, x: 0, duration: 1.4, ease: 'power3.out' })
      .to('#hero-almohade', { autoAlpha: 1, x: 0, duration: 1.4, ease: 'power3.out' }, '<0.08')
      .to('#hero-names', { autoAlpha: 1, y: 0, duration: 0.85, ease: 'power2.out' }, '-=0.5')
      .to('#hero-date', { autoAlpha: 1, y: 0, duration: 0.75, ease: 'power2.out' }, '-=0.4')
      .to('#hero-parchment', { autoAlpha: 1, duration: 1.2, ease: 'power2.inOut' }, '+=0.1')
      .to('#hero-photo', { autoAlpha: 1, duration: 1.4, ease: 'power2.inOut' }, '<')
      .to('#hero-tagline', { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out' }, '<0.15')
      .to('#hero-cue', { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.2');
  }

  if (!prefersReducedMotion) {
    slides.slice(1).forEach((slide) => {
      const elements = slide.querySelectorAll(
        '.slide-label, .slide-title, .slide-body, .slide-right',
      );
      gsap.set(elements, { opacity: 0, y: 18 });
      ScrollTrigger.create({
        trigger: '#scroll-driver',
        start: 'top top',
        end: 'bottom bottom',
        onUpdate() {
          const visibility = parseFloat(gsap.getProperty(slide, 'autoAlpha') as string);
          if (visibility > 0.5) {
            gsap.to(elements, {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.1,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          }
        },
      });
    });
  }

  goToMainSlide = (index, behavior = navigationBehavior) => {
    const target = clampSlide(index);
    window.scrollTo({ top: scrollPositionForSlide(target), behavior });
    setMainActive(target);
  };

  navBtns.forEach((btn) => {
    btn.addEventListener('click', () => goToMainSlide(Number(btn.dataset.slideBtn)));
  });
  window.addEventListener(
    'scroll',
    () => {
      const step = slideStep();
      setMainActive(step > 0 ? Math.round(window.scrollY / step) : 0);
    },
    { passive: true },
  );

  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    goToMainSlide(initSlide, 'auto');
  });
}

window.addEventListener(
  'resize',
  () => {
    if (currentOverlay?.dataset.overlayKey === 'jerez' && goToJerezSlide) {
      goToJerezSlide(activeJerezSlideIndex, 'auto');
    }
    goToMainSlide(activeSlideIndex, 'auto');
  },
  { passive: true },
);

// ── FINCA overlay: Leaflet map ────────────────────────────────────
const clayPin = L.divIcon({
  html: `<svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 9.94 14 22 14 22S28 23.94 28 14C28 6.27 21.73 0 14 0z" fill="#bc6c4d"/>
    <circle cx="14" cy="14" r="5.5" fill="#f5f0e8" opacity="0.92"/>
  </svg>`,
  className: '',
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -38],
});
const cityPin = L.divIcon({
  html: `<svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="6" r="5" fill="#1a1208" opacity="0.35"/>
    <circle cx="6" cy="6" r="3" fill="#1a1208" opacity="0.6"/>
  </svg>`,
  className: '',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});
const routePin = L.divIcon({
  html: `<svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
    <circle cx="5" cy="5" r="4" fill="#bc6c4d" opacity="0.5"/>
  </svg>`,
  className: '',
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

let leafletMap: ReturnType<typeof L.map> | null = null;
let mapInited = false;
let jerezCityMap: ReturnType<typeof L.map> | null = null;
let jerezRoutesMap: ReturnType<typeof L.map> | null = null;
let jerezSurroundingsMap: ReturnType<typeof L.map> | null = null;
let jerezInited = false;

function initFincaMap() {
  if (mapInited) return;
  mapInited = true;
  const mapEl = document.getElementById('venue-map') as HTMLElement;
  const LAT = parseFloat(mapEl.dataset.lat!);
  const LNG = parseFloat(mapEl.dataset.lng!);
  const NAME = mapEl.dataset.name ?? 'La Carreña';
  const CLAT = parseFloat(mapEl.dataset.cityLat!);
  const CLNG = parseFloat(mapEl.dataset.cityLng!);

  leafletMap = L.map('venue-map', {
    center: [(LAT + CLAT) / 2, (LNG + CLNG) / 2],
    zoom: 11,
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    touchZoom: false,
    keyboard: false,
    attributionControl: false,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(leafletMap);

  L.marker([LAT, LNG], { icon: clayPin }).addTo(leafletMap).bindPopup(NAME);
  L.marker([CLAT, CLNG], { icon: cityPin }).addTo(leafletMap);

  leafletMap.whenReady(() => {
    const pt = leafletMap!.latLngToContainerPoint(L.latLng(CLAT, CLNG));
    const label = document.createElement('div');
    label.textContent = 'Jerez';
    label.className = 'jerez-city-label';
    label.style.left = pt.x + 10 + 'px';
    label.style.top = pt.y - 8 + 'px';
    leafletMap!.getContainer().appendChild(label);
  });

  leafletMap.invalidateSize();
}

function initJerezOverlay() {
  if (!jerezInited) {
    jerezInited = true;
    initJerezSlides();
    initJerezMaps();
  }
  requestAnimationFrame(() => {
    jerezCityMap?.invalidateSize();
    jerezRoutesMap?.invalidateSize();
    jerezSurroundingsMap?.invalidateSize();
  });
}

function initJerezSlides() {
  const wrap = document.getElementById('jerez-slides');
  if (!wrap) return;
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-jerez-nav]'));
  const slides = Array.from(document.querySelectorAll<HTMLElement>('.jerez-slide'));

  function setActive(index: number) {
    activeJerezSlideIndex = Math.min(Math.max(index, 0), slides.length - 1);
    buttons.forEach((btn, i) => {
      const active = i === activeJerezSlideIndex;
      btn.toggleAttribute('data-active', active);
      if (active) btn.setAttribute('aria-current', 'step');
      else btn.removeAttribute('aria-current');
    });
  }

  goToJerezSlide = (index, behavior = navigationBehavior) => {
    const target = Math.min(Math.max(index, 0), slides.length - 1);
    wrap.scrollTo({ left: target * wrap.clientWidth, behavior });
    setActive(target);
  };

  setActive(0);

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => goToJerezSlide?.(Number(btn.dataset.jerezNav)));
  });

  wrap.addEventListener(
    'scroll',
    () => {
      const index = Math.round(wrap.scrollLeft / Math.max(wrap.clientWidth, 1));
      setActive(index);
    },
    { passive: true },
  );
}

function initJerezMaps() {
  const cityEl = document.getElementById('jerez-city-map') as HTMLElement | null;
  const routesEl = document.getElementById('jerez-routes-map') as HTMLElement | null;
  const surroundingsEl = document.getElementById('jerez-surroundings-map') as HTMLElement | null;
  if (!cityEl || !routesEl || !surroundingsEl) return;

  const CLAT = parseFloat(cityEl.dataset.cityLat!);
  const CLNG = parseFloat(cityEl.dataset.cityLng!);
  const SEVLAT = parseFloat(cityEl.dataset.sevillaLat!);
  const SEVLNG = parseFloat(cityEl.dataset.sevillaLng!);
  const CADLAT = parseFloat(cityEl.dataset.cadizLat!);
  const CADLNG = parseFloat(cityEl.dataset.cadizLng!);

  jerezCityMap = L.map('jerez-city-map', {
    center: [CLAT, CLNG],
    zoom: 9,
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    touchZoom: false,
    keyboard: false,
    attributionControl: false,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(jerezCityMap);

  L.marker([CLAT, CLNG], { icon: clayPin }).addTo(jerezCityMap).bindPopup('Jerez de la Frontera');
  L.marker([SEVLAT, SEVLNG], { icon: cityPin }).addTo(jerezCityMap).bindPopup('Sevilla');
  L.marker([CADLAT, CADLNG], { icon: cityPin }).addTo(jerezCityMap).bindPopup('Cádiz');

  jerezCityMap.fitBounds(
    L.latLngBounds([
      [SEVLAT, SEVLNG],
      [CADLAT, CADLNG],
      [CLAT, CLNG],
    ]),
    { padding: [30, 30] },
  );

  const JLAT = parseFloat(routesEl.dataset.jerezLat!);
  const JLNG = parseFloat(routesEl.dataset.jerezLng!);
  const BLAT = parseFloat(routesEl.dataset.barcelonaLat!);
  const BLNG = parseFloat(routesEl.dataset.barcelonaLng!);
  const PLAT = parseFloat(routesEl.dataset.parisLat!);
  const PLNG = parseFloat(routesEl.dataset.parisLng!);
  const PAMLat = parseFloat(routesEl.dataset.pamplonaLat!);
  const PAMLNG = parseFloat(routesEl.dataset.pamplonaLng!);
  const MADLAT = parseFloat(routesEl.dataset.madridLat!);
  const MADLNG = parseFloat(routesEl.dataset.madridLng!);
  const GRXLAT = parseFloat(routesEl.dataset.granadaLat!);
  const GRXLNG = parseFloat(routesEl.dataset.granadaLng!);
  const VLCLAT = parseFloat(routesEl.dataset.valenciaLat!);
  const VLCLNG = parseFloat(routesEl.dataset.valenciaLng!);

  jerezRoutesMap = L.map('jerez-routes-map', {
    center: [JLAT, JLNG],
    zoom: 3,
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    touchZoom: false,
    keyboard: false,
    attributionControl: false,
  });

  // Use a different tile layer for routes map that works better with the larger height
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(jerezRoutesMap);

  const routeCities = [
    { name: 'Jerez', lat: JLAT, lng: JLNG, icon: clayPin },
    { name: 'Barcelona', lat: BLAT, lng: BLNG, icon: routePin },
    { name: 'Paris', lat: PLAT, lng: PLNG, icon: routePin },
    { name: 'Pamplona', lat: PAMLat, lng: PAMLNG, icon: routePin },
    { name: 'Madrid', lat: MADLAT, lng: MADLNG, icon: routePin },
    { name: 'Granada', lat: GRXLAT, lng: GRXLNG, icon: routePin },
    { name: 'Valencia', lat: VLCLAT, lng: VLCLNG, icon: routePin },
  ];

  let activePolylines: L.Polyline[] = [];
  let activeMarkers: L.Marker[] = [];

  const flightData = flightRoutes as FlightRouteData;

  routeCities.forEach((city) => {
    const marker = L.marker([city.lat, city.lng], { icon: city.icon }).addTo(jerezRoutesMap!);

    // Tooltip minimalista: fondo transparente, sin borde, solo texto
    marker.bindTooltip(`${city.name}`, {
      permanent: false,
      direction: 'top',
      className: 'minimal-tooltip',
      offset: [0, -5],
    });

    // Eventos nativos de Leaflet (on) para interacción
    marker.on('mouseover', () => showRoute(city.name));
    marker.on('click', () => showRoute(city.name));
  });

  document.querySelectorAll<HTMLButtonElement>('[data-route-city]').forEach((button) => {
    button.addEventListener('click', () => showRoute(button.dataset.routeCity ?? ''));
  });

  jerezRoutesMap.fitBounds(L.latLngBounds(routeCities.map((c) => [c.lat, c.lng])), {
    padding: [10, 10],
  });

  // --- Interactive Routes Logic ---
  function showRoute(cityName: string) {
    if (!jerezRoutesMap) return;

    // Clear previous polylines and markers
    activePolylines.forEach((p) => jerezRoutesMap!.removeLayer(p));
    activePolylines = [];
    activeMarkers.forEach((m) => jerezRoutesMap!.removeLayer(m));
    activeMarkers = [];

    const origin = flightData.origins.find(
      (o) =>
        o.city
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') ===
        cityName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, ''),
    );
    if (!origin || !origin.routes.length) return;

    const shortest = origin.routes.reduce(
      (min: FlightRoute, r: FlightRoute) => (r.segments.length < min.segments.length ? r : min),
      origin.routes[0],
    );

    function getParabolicPoints(start: L.LatLng, end: L.LatLng, pointsCount = 50) {
      const pts = [];
      for (let i = 0; i <= pointsCount; i++) {
        const t = i / pointsCount;
        const lat = start.lat + (end.lat - start.lat) * t;
        const lng = start.lng + (end.lng - start.lng) * t;
        const offset = Math.sin(Math.PI * t) * (Math.abs(start.lng - end.lng) * 0.15);
        pts.push(L.latLng(lat + offset, lng));
      }
      return pts;
    }

    // Draw each segment as a parabolic arc with different colors
    shortest.segments.forEach((segment, index: number) => {
      const arcPoints = getParabolicPoints(
        L.latLng(segment.from.lat, segment.from.lng),
        L.latLng(segment.to.lat, segment.to.lng),
      );

      // Generate different colors or shades for each segment
      const colors = [
        '#bc6c4d', // original clay
        '#d4845e', // lighter
        '#a55840', // darker
        '#c97d5f', // medium-light
        '#9d4f38', // dark
      ];
      const color = colors[index % colors.length];
      const opacity = 1 - index * 0.1; // slightly decrease opacity for later segments

      const polyline = L.polyline(arcPoints, {
        color: color,
        weight: 2.5 + index * 0.3, // slightly increase weight for each segment
        opacity: Math.max(0.6, opacity),
        smoothFactor: 1,
        lineCap: 'round',
        dashArray: index > 0 ? '5, 5' : undefined, // dashed lines for segments after first
      }).addTo(jerezRoutesMap!);

      activePolylines.push(polyline);
    });

    // Add markers for layovers if any
    if (shortest.segments.length > 1) {
      shortest.segments.slice(0, -1).forEach((seg) => {
        const m = L.marker([seg.to.lat, seg.to.lng], { icon: routePin })
          .addTo(jerezRoutesMap!)
          .bindTooltip(seg.to.city, { direction: 'top' });
        activeMarkers.push(m);
      });
    }
  }

  const SJLAT = parseFloat(surroundingsEl.dataset.jerezLat!);
  const SJLNG = parseFloat(surroundingsEl.dataset.jerezLng!);
  const SURSEVLAT = parseFloat(surroundingsEl.dataset.sevillaLat!);
  const SURSEVLNG = parseFloat(surroundingsEl.dataset.sevillaLng!);
  const PRTLAT = parseFloat(surroundingsEl.dataset.puertoLat!);
  const PRTLNG = parseFloat(surroundingsEl.dataset.puertoLng!);
  const SNLLAT = parseFloat(surroundingsEl.dataset.sanlucarLat!);
  const SNLLNG = parseFloat(surroundingsEl.dataset.sanlucarLng!);

  const sevillaDrive = surroundingsEl.dataset.sevillaDrive ?? '';
  const puertoDrive = surroundingsEl.dataset.puertoDrive ?? '';
  const sanlucarDrive = surroundingsEl.dataset.sanlucarDrive ?? '';

  jerezSurroundingsMap = L.map('jerez-surroundings-map', {
    center: [SJLAT, SJLNG],
    zoom: 10,
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    touchZoom: false,
    keyboard: false,
    attributionControl: false,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(jerezSurroundingsMap);

  L.marker([SJLAT, SJLNG], { icon: clayPin }).addTo(jerezSurroundingsMap);

  [
    { drive: sevillaDrive, lat: SURSEVLAT, lng: SURSEVLNG },
    { drive: puertoDrive, lat: PRTLAT, lng: PRTLNG },
    { drive: sanlucarDrive, lat: SNLLAT, lng: SNLLNG },
  ].forEach((city) => {
    const marker = L.marker([city.lat, city.lng], { icon: cityPin }).addTo(jerezSurroundingsMap!);
    marker.bindTooltip(city.drive, {
      permanent: false,
      direction: 'top',
      className: 'minimal-tooltip',
      offset: [0, -5],
    });
    L.polyline(
      [
        [SJLAT, SJLNG],
        [city.lat, city.lng],
      ],
      {
        color: '#bc6c4d',
        weight: 1.5,
        opacity: 0.35,
        dashArray: '4, 6',
      },
    ).addTo(jerezSurroundingsMap!);
  });

  jerezSurroundingsMap.fitBounds(
    L.latLngBounds([
      [SJLAT, SJLNG],
      [SURSEVLAT, SURSEVLNG],
      [PRTLAT, PRTLNG],
      [SNLLAT, SNLLNG],
    ]),
    { padding: [30, 30] },
  );
}

// ── Restore overlay state from URL ────────────────────────────────
if (initDetail) openOverlay(initDetail, null);
