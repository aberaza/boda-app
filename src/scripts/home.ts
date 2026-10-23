import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animation } from '../config/theme';
import { initHorizontalCarousels } from './horizontal-carousel';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-providers';
import flightRoutes from '../data/flight-routes.json';
import type { FlightRouteData } from '../components/home/types';

// ── URL state helpers ─────────────────────────────────────────────
// ?slide=<name> restores scroll position (stable by slide key)
// ?slide=N      legacy support for old numeric links
const _urlP = new URLSearchParams(window.location.search);
const initSlideRaw = _urlP.get('slide');
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
const mainSlides = Array.from(document.querySelectorAll<HTMLElement>('#slides-wrap > .slide'));
const horizontalCarousels = initHorizontalCarousels();

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
let navigationViewportHeight = window.innerHeight;
let resizingNavigation = false;
let resizeTimer: ReturnType<typeof setTimeout>;
let resizeSlideIndex = initSlide;
let goToMainSlide: (index: number, behavior?: ScrollBehavior) => void = () => {};

function setMainActive(index: number) {
  activeSlideIndex = clampSlide(index);
  navBtns.forEach((btn, i) => {
    const active = i === activeSlideIndex;
    btn.toggleAttribute('data-active', active);
    if (active) btn.setAttribute('aria-current', 'step');
    else btn.removeAttribute('aria-current');
  });
  mainSlides.forEach((slide, i) => {
    const active = i === activeSlideIndex;
    slide.setAttribute('aria-hidden', String(!active));
    if ('inert' in slide) slide.inert = !active;
    if (prefersReducedMotion) gsap.set(slide, { autoAlpha: active ? 1 : 0, scale: 1 });
  });
  setUrlParam('slide', getSlideParamValue(activeSlideIndex));
  const activeSection = mainSlides[activeSlideIndex];
  horizontalCarousels.forEach(({ root }) => {
    if (activeSection?.contains(root)) root.dispatchEvent(new Event('horizontal:refresh'));
  });
  if (slideKeys[activeSlideIndex] === 'evento') requestAnimationFrame(initFincaMap);
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

// Horizontal Jerez panels progressively initialize their maps when first visited.
horizontalCarousels.forEach(({ root }) => {
  root.addEventListener('horizontal:change', (event) => {
    const index = (event as CustomEvent<number>).detail;
    if (root.id !== 'venue-carousel' || index < 1) return;
    initJerezMaps();
    requestAnimationFrame(() => {
      jerezCityMap?.invalidateSize();
      jerezRoutesMap?.invalidateSize();
      jerezSurroundingsMap?.invalidateSize();
    });
  });
});

document.addEventListener('keydown', (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey || isEditableTarget(event.target)) return;

  const direction = keyboardDirection(event.key);
  if (direction === null) return;

  const horizontalKey = ['arrowleft', 'arrowright', 'a', 'd', 'h', 'l'].includes(
    event.key.toLowerCase(),
  );
  if (horizontalKey) {
    const carousel = horizontalCarousels.find(({ root }) =>
      mainSlides[activeSlideIndex]?.contains(root),
    );
    if (carousel) {
      event.preventDefault();
      carousel.move(direction);
      return;
    }
  }
  event.preventDefault();
  goToMainSlide(activeSlideIndex + direction);
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

  const slides = mainSlides;
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

  if (!prefersReducedMotion)
    ScrollTrigger.create({
      trigger: '#scroll-driver',
      start: 'top top',
      end: 'bottom bottom',
      scrub: prefersReducedMotion ? false : animation.scrub,
      animation: master,
      onUpdate: (self) => {
        if (!resizingNavigation && window.innerHeight === navigationViewportHeight) {
          setMainActive(Math.round(self.progress * maxSlideIndex));
        }
      },
    });

  if (!prefersReducedMotion && initSlide === 0) {
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
      if (resizingNavigation || window.innerHeight !== navigationViewportHeight) return;
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
    if (!resizingNavigation) resizeSlideIndex = activeSlideIndex;
    resizingNavigation = true;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      navigationViewportHeight = window.innerHeight;
      if (!isTouch) ScrollTrigger.refresh();
      goToMainSlide(resizeSlideIndex, 'auto');
      requestAnimationFrame(() => {
        resizingNavigation = false;
      });
    }, 250);
  },
  { passive: true },
);

// ── Venue and Jerez Leaflet maps ─────────────────────────────────
const MAP_API_KEY = import.meta.env.PUBLIC_MAP_API_KEY?.trim() ?? '';
console.info(
  `[maps] MAP_API_KEY ${MAP_API_KEY ? 'found and defined' : 'was not found or is empty'}.`,
);

function cartoTileLayer(style: 'light_all' | 'light_nolabels') {
  const provider = style === 'light_nolabels' ? 'CartoDB.PositronNoLabels' : 'CartoDB.Positron';
  return L.tileLayer.provider(provider, {
    apikey: MAP_API_KEY,
    maxZoom: 19,
  });
}

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

  cartoTileLayer('light_nolabels').addTo(leafletMap);

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

function initJerezMaps() {
  if (jerezInited) return;
  jerezInited = true;
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

  cartoTileLayer('light_all').addTo(jerezCityMap);

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
  const AVILAT = parseFloat(routesEl.dataset.avilesLat!);
  const AVILNG = parseFloat(routesEl.dataset.avilesLng!);

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

  // Use the same CARTO provider for the routes map, which has the largest viewport.
  cartoTileLayer('light_all').addTo(jerezRoutesMap);

  const routeCities = [
    { name: 'Jerez', lat: JLAT, lng: JLNG, icon: clayPin },
    { name: 'Barcelona', lat: BLAT, lng: BLNG, icon: routePin },
    { name: 'Paris', lat: PLAT, lng: PLNG, icon: routePin },
    { name: 'Pamplona', lat: PAMLat, lng: PAMLNG, icon: routePin },
    { name: 'Madrid', lat: MADLAT, lng: MADLNG, icon: routePin },
    { name: 'Granada', lat: GRXLAT, lng: GRXLNG, icon: routePin },
    { name: 'Valencia', lat: VLCLAT, lng: VLCLNG, icon: routePin },
    { name: 'Avilés', lat: AVILAT, lng: AVILNG, icon: routePin },
  ];

  let activePolylines: L.Polyline[] = [];
  let activeMarkers: L.Marker[] = [];

  const flightData = flightRoutes as FlightRouteData;

  routeCities.forEach((city) => {
    const marker = L.marker([city.lat, city.lng], { icon: city.icon }).addTo(jerezRoutesMap!);

    // Tooltip minimalista: fondo transparente, sin borde, solo texto
    marker.bindTooltip(city.name === 'Avilés' ? 'Avilés (OVD)' : city.name, {
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
    button.addEventListener('click', () => {
      if (button.hasAttribute('data-route-card-trigger')) {
        const details = button.closest<HTMLElement>('[data-route-card]')?.querySelector('details');
        if (details) details.open = true;
      }
      showRoute(button.dataset.routeCity ?? '', Number(button.dataset.routeIndex ?? 0));
    });
  });

  jerezRoutesMap.fitBounds(L.latLngBounds(routeCities.map((c) => [c.lat, c.lng])), {
    padding: [10, 10],
  });

  // --- Interactive Routes Logic ---
  function showRoute(cityName: string, routeIndex = 0) {
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

    const selectedRoute = origin.routes[routeIndex] ?? origin.routes[0];

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

    // Flights keep their curved arcs; train and ground links are drawn as straight,
    // dashed lines so each transport mode can be distinguished at a glance.
    selectedRoute.segments.forEach((segment, index) => {
      const from = L.latLng(segment.from.lat, segment.from.lng);
      const to = L.latLng(segment.to.lat, segment.to.lng);
      const line =
        segment.mode === 'flight'
          ? L.polyline(getParabolicPoints(from, to), {
              color: ['#bc6c4d', '#d4845e', '#a55840', '#c97d5f'][index % 4],
              weight: 3,
              opacity: 0.9,
              smoothFactor: 1,
              lineCap: 'round',
            })
          : L.polyline([from, to], {
              color: segment.mode === 'train' ? '#497567' : '#7b7063',
              weight: segment.mode === 'train' ? 3 : 2,
              opacity: 0.9,
              dashArray: segment.mode === 'train' ? '8, 5' : '2, 5',
              lineCap: 'round',
            });
      line.addTo(jerezRoutesMap!);
      line.bindTooltip(`${segment.from.city} → ${segment.to.city}`, {
        sticky: true,
        className: 'minimal-tooltip',
      });
      activePolylines.push(line);

      if (index < selectedRoute.segments.length - 1) {
        const marker = L.marker([segment.to.lat, segment.to.lng], { icon: routePin })
          .addTo(jerezRoutesMap!)
          .bindTooltip(segment.to.city, { direction: 'top' });
        activeMarkers.push(marker);
      }
    });
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

  cartoTileLayer('light_all').addTo(jerezSurroundingsMap);

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
