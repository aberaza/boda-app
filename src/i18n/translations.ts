/**
 * ─── TRANSLATIONS ────────────────────────────────────────────────────────────
 * Three locales: es (default), fr, en.
 * Event facts (times, venue name, URLs) live in content.ts and are language-
 * agnostic; everything that is *rendered as copy* lives here.
 */

export const locales = ["es", "fr", "en"] as const;
export type Locale = (typeof locales)[number];

// ─── Spanish (default) ───────────────────────────────────────────────────────
const es = {
  meta: {
    title: "Aritz & Sandra · 1 mayo 2027",
    description:
      "Boda de Aritz Beraza Garayalde y Sandra Vargas Benavente. 1 de mayo de 2026, Finca La Carreña, Jerez de la Frontera.",
  },

  event: {
    date: "1 de mayo de 2027",
    dateShort: "1 mayo 2027",
    venueDescription:
      "Viña histórica en las afueras de Jerez. Arquitectura de cortijo andaluz, " +
      "jardines, capilla, caballerizas y una gran sala de celebraciones.",
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
    photoCaption: "Jerez de la Frontera, Cádiz",
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

  lang: {
    switcher: { es: "ES", fr: "FR", en: "EN" },
  },
  nav: {
    hero: "Inicio",
    cuando: "Cuándo",
    finca: "El lugar",
    pronto: "Info",
  },
  eventDetail: {
    open: "Ver detalles del evento",
    close: "Volver",
    eyebrow: "1 mayo 2027",
    lead: "Únete a nosotros",
    leadSub: "en nuestra boda",
    scheduleTitle: "El día",
    s1time: "Mediodía",
    s1label: "Ceremonia civil",
    s2time: "Tarde",
    s2label: "Cóctel & almuerzo",
    s3time: "Tarde-noche",
    s3label: "Baile y fiesta",
    dressCodeLabel: "Dress code",
    dressCodeValue: "Etiqueta formal",
    addressLabel: "Cómo llegar",
    mapsLabel: "Abrir en Google Maps",
    parkingNote: "Aparcamiento disponible en la finca.",
    transportNote:
      "Estamos valorando ofrecer transporte entre Jerez y la finca — más detalles próximamente.",
  },
  jerez: {
    eyebrow: "Jerez de la Frontera",
    title: "La ciudad",
    titleSub: "entre viñedos y arte",
    overview:
      "Jerez de la Frontera es una ciudad andaluza luminosa, con bodegas de jerez, tradición ecuestre y plazas animadas. Este texto es provisional y debe sustituirse por el resumen definitivo.",
    history:
      "Su historia está marcada por el comercio del vino, la herencia andalusí y la cultura contemporánea. Sustituye este párrafo por la versión final.",
    highlights:
      "Incluye bodegas, flamenco, el Alcázar y mercados locales. Texto provisional pendiente de reemplazo.",
    festivals:
      "MotoGP Jerez se celebra en la segunda mitad de abril y la Feria de Jerez alrededor del 8 de mayo, fechas cercanas a la boda.",
    map: {
      label: "Mapa de Jerez",
      caption: "Jerez con Sevilla y Cádiz en contexto.",
      cityLat: 36.685,
      cityLng: -6.126,
      sevillaLat: 37.389,
      sevillaLng: -5.984,
      cadizLat: 36.529,
      cadizLng: -6.292,
    },
    gettingThere: {
      eyebrow: "Cómo llegar",
      title: "Llegar a Jerez",
      airports:
        "Aeropuerto más cercano: Jerez (XRY). Alternativas: Sevilla (SVQ) y Málaga (AGP). ",
      routesTitle: "Rutas sugeridas",
      direct: "Directo",
      steps: "escalas",
      fastest: "Más rápido",
      cheapest: "Más barato",
      avgShortest: "Precio medio (ruta corta)",
      routes: [
        "Barcelona → Jerez (vuelo directo o vía Madrid).",
        "París → Jerez (vuelo directo o vía Sevilla).",
        "Pamplona → Jerez (vuelo a Sevilla y tren/bus).",
        "Madrid → Jerez (tren AVE + Media Distancia).",
      ],
    },
    routesMap: {
      label: "Mapa de rutas a Jerez",
      caption: "Rutas desde Barcelona, París, Pamplona y Madrid.",
      jerezLat: 36.685,
      jerezLng: -6.126,
      barcelonaLat: 41.385,
      barcelonaLng: 2.173,
      parisLat: 48.857,
      parisLng: 2.352,
      pamplonaLat: 42.817,
      pamplonaLng: -1.644,
      madridLat: 40.416,
      madridLng: -3.703,
      granadaLat: 37.1887,
      granadaLng: -3.7774,
      valenciaLat: 39.4893,
      valenciaLng: -0.4816,
    },
    stay: {
      eyebrow: "Dónde dormir",
      title: "Alojamiento en Jerez",
      intro:
        "Pronto compartiremos acuerdos y tarifas especiales. Sustituye este texto por las recomendaciones definitivas.",
      linkLabel: "Ver hotel",
      hotels: [
        {
          name: "Hotel Placeholder 01",
          details:
            "Tarifa especial disponible. Sustituye por detalles y código.",
          url: "https://example.com",
        },
        {
          name: "Hotel Placeholder 02",
          details:
            "Tarifa especial disponible. Sustituye por detalles y código.",
          url: "https://example.com",
        },
        {
          name: "Hotel Placeholder 03",
          details:
            "Tarifa especial disponible. Sustituye por detalles y código.",
          url: "https://example.com",
        },
      ],
      bookingTitle: "Reservas",
      bookingInfo:
        "Instrucciones provisionales para reservas con tarifa acordada. Sustituye por email, ventanas de reserva y cómo aplicar el descuento.",
      bookingNote: "Si necesitas ayuda, avísanos y te ayudaremos.",
    },
    nav: ["Ciudad", "Llegar", "Dormir"],
    openLabel: "Detalles",
  },
} as const;

// ─── French ──────────────────────────────────────────────────────────────────
const fr = {
  meta: {
    title: "Aritz & Sandra · 1er mai 2027",
    description:
      "Mariage d'Aritz Beraza Garayalde et Sandra Vargas Benavente. 1er mai 2027, Finca La Carreña, Jerez de la Frontera.",
  },

  event: {
    date: "1er mai 2027",
    dateShort: "1 mai 2027",
    venueDescription:
      "Vignoble historique aux portes de Jerez. Architecture de cortijo andalou, " +
      "jardins, chapelle, écuries et une grande salle de réception.",
  },

  hero: {
    tagline: "On se marie",
    scrollCue: "Défiler",
  },

  cuando: {
    eyebrow: "Quand",
    quote:
      "Un après-midi de printemps entre les vignes, sous le soleil de Jerez.",
    labels: {
      ceremony: "Cérémonie & Réception",
      city: "Ville",
    },
  },

  finca: {
    eyebrow: "Le lieu",
    photoAlt: "Finca La Carreña, accès illuminé",
    photoCaption: "Jerez de la Frontera, Cádiz",
    linkLabel: "lacarrena.com",
  },

  pronto: {
    eyebrow: "En préparation",
    title: "Plus d'informations bientôt",
    body:
      "Nous continuerons à mettre à jour cette page avec des détails sur l'hébergement, " +
      "le transport et le programme. Vous recevrez un lien personnalisé pour confirmer votre présence.",
    imgAlt: "Finca La Carreña",
  },

  lang: {
    switcher: { es: "ES", fr: "FR", en: "EN" },
  },
  nav: {
    hero: "Accueil",
    cuando: "Quand",
    finca: "Le lieu",
    pronto: "Info",
  },
  eventDetail: {
    open: "Voir les détails",
    close: "Retour",
    eyebrow: "1er mai 2027",
    lead: "Rejoignez-nous",
    leadSub: "pour notre mariage",
    scheduleTitle: "Le programme",
    s1time: "Midi",
    s1label: "Cérémonie civile",
    s2time: "Après-midi",
    s2label: "Cocktail & déjeuner",
    s3time: "Soirée",
    s3label: "Bal et fête",
    dressCodeLabel: "Dress code",
    dressCodeValue: "Tenue de soirée",
    addressLabel: "Comment venir",
    mapsLabel: "Ouvrir dans Google Maps",
    parkingNote: "Parking disponible sur place.",
    transportNote:
      "Nous étudions la mise en place d'un transport entre Jerez et la finca — plus de détails bientôt.",
  },
  jerez: {
    eyebrow: "Jerez de la Frontera",
    title: "La ville",
    titleSub: "entre vignes et art",
    overview:
      "Jerez de la Frontera est une ville andalouse lumineuse, réputée pour ses bodegas, son héritage équestre et ses places animées. Texte provisoire à remplacer.",
    history:
      "Son histoire est marquée par le commerce du xérès, les racines mauresques et la culture contemporaine. Remplacez ce paragraphe par la version finale.",
    highlights:
      "Inclure bodegas, flamenco, l’Alcázar et les marchés locaux. Texte provisoire.",
    festivals:
      "Le MotoGP de Jerez a lieu dans la seconde moitié d’avril et la Feria de Jerez autour du 8 mai, des dates proches du mariage.",
    map: {
      label: "Carte de Jerez",
      caption: "Jerez avec Séville et Cadix en contexte.",
      cityLat: 36.685,
      cityLng: -6.126,
      sevillaLat: 37.389,
      sevillaLng: -5.984,
      cadizLat: 36.529,
      cadizLng: -6.292,
    },
    gettingThere: {
      eyebrow: "Comment venir",
      title: "Aller à Jerez",
      airports:
        "Aéroport le plus proche : Jerez (XRY). Alternatives : Séville (SVQ) et Malaga (AGP).",
      routesTitle: "Itinéraires suggérés",
      direct: "Direct",
      steps: "escales",
      fastest: "Le plus rapide",
      cheapest: "Le moins cher",
      avgShortest: "Prix moyen (route courte)",
      routes: [
        "Barcelone → Jerez (vol direct ou via Madrid).",
        "Paris → Jerez (vol direct ou via Séville).",
        "Pampelune → Jerez (vol vers Séville puis train/bus).",
        "Madrid → Jerez (train AVE + Media Distancia).",
      ],
    },
    routesMap: {
      label: "Carte des routes vers Jerez",
      caption: "Routes depuis Barcelone, Paris, Pampelune et Madrid.",
      jerezLat: 36.685,
      jerezLng: -6.126,
      barcelonaLat: 41.385,
      barcelonaLng: 2.173,
      parisLat: 48.857,
      parisLng: 2.352,
      pamplonaLat: 42.817,
      pamplonaLng: -1.644,
      madridLat: 40.416,
      madridLng: -3.703,
      granadaLat: 37.1887,
      granadaLng: -3.7774,
      valenciaLat: 39.4893,
      valenciaLng: -0.4816,
    },
    stay: {
      eyebrow: "Où dormir",
      title: "Hébergement à Jerez",
      intro:
        "Nous partagerons bientôt les accords et tarifs spéciaux. Texte provisoire à remplacer.",
      linkLabel: "Voir l’hôtel",
      hotels: [
        {
          name: "Hotel Placeholder 01",
          details:
            "Tarif spécial disponible. Remplacer par les détails et code.",
          url: "https://example.com",
        },
        {
          name: "Hotel Placeholder 02",
          details:
            "Tarif spécial disponible. Remplacer par les détails et code.",
          url: "https://example.com",
        },
        {
          name: "Hotel Placeholder 03",
          details:
            "Tarif spécial disponible. Remplacer par les détails et code.",
          url: "https://example.com",
        },
      ],
      bookingTitle: "Réservations",
      bookingInfo:
        "Instructions provisoires pour réserver au tarif négocié. Remplacer par l’email, les dates et la marche à suivre.",
      bookingNote: "Si vous avez besoin d’aide, dites-le-nous.",
    },
    nav: ["Ville", "Venir", "Dormir"],
    openLabel: "Détails",
  },
} as const;

// ─── English ─────────────────────────────────────────────────────────────────
const en = {
  meta: {
    title: "Aritz & Sandra · 1 May 2027",
    description:
      "Wedding of Aritz Beraza Garayalde and Sandra Vargas Benavente. 1 May 2027, Finca La Carreña, Jerez de la Frontera.",
  },

  event: {
    date: "1 May 2027",
    dateShort: "1 May 2027",
    venueDescription:
      "A historic vineyard on the outskirts of Jerez. Andalusian cortijo architecture, " +
      "gardens, chapel, stables and a grand celebration hall.",
  },

  hero: {
    tagline: "We're getting married",
    scrollCue: "Scroll",
  },

  cuando: {
    eyebrow: "When",
    quote: "A spring afternoon among the vineyards, under the Jerez sun.",
    labels: {
      ceremony: "Ceremony & Reception",
      city: "City",
    },
  },

  finca: {
    eyebrow: "The venue",
    photoAlt: "Finca La Carreña, illuminated entrance",
    photoCaption: "Jerez de la Frontera, Cádiz",
    linkLabel: "lacarrena.com",
  },

  pronto: {
    eyebrow: "Coming soon",
    title: "More details soon",
    body:
      "We will keep updating this page with details on accommodation, " +
      "transport and schedule. You will receive a personalised link to confirm your attendance.",
    imgAlt: "Finca La Carreña",
  },

  lang: {
    switcher: { es: "ES", fr: "FR", en: "EN" },
  },
  nav: {
    hero: "Home",
    cuando: "When",
    finca: "The venue",
    pronto: "Info",
  },
  eventDetail: {
    open: "View event details",
    close: "Back",
    eyebrow: "1 May 2027",
    lead: "Join us",
    leadSub: "on our wedding day",
    scheduleTitle: "The day",
    s1time: "Midday",
    s1label: "Civil ceremony",
    s2time: "Afternoon",
    s2label: "Cocktail & seated lunch",
    s3time: "Evening",
    s3label: "Dancing & celebrations",
    dressCodeLabel: "Dress code",
    dressCodeValue: "Formal attire",
    addressLabel: "Getting there",
    mapsLabel: "Open in Google Maps",
    parkingNote: "Parking available at the venue.",
    transportNote:
      "We are looking into providing transport between Jerez and the venue — details to follow.",
  },
  jerez: {
    eyebrow: "Jerez de la Frontera",
    title: "La ciudad",
    titleSub: "entre viñedos y arte",
    overview:
      "Jerez de la Frontera is a sunlit Andalusian city known for its sherry bodegas, equestrian heritage, and lively plazas. This is placeholder copy; replace it with the final summary of the city’s identity, architecture, and pace of life.",
    history:
      "Historically shaped by the sherry trade, Moorish roots, and modern winemaking, Jerez blends centuries-old traditions with contemporary culture. Replace this paragraph with your preferred historical overview.",
    highlights:
      "Add highlights such as bodegas, flamenco, the Alcázar, and local food markets. This is placeholder text that should be replaced once the final highlights are chosen.",
    festivals:
      "MotoGP Jerez takes place in the second half of April, and Feria de Jerez is around 8 May — both surround our wedding dates.",
    map: {
      label: "Mapa de Jerez",
      caption: "Jerez con Sevilla y Cádiz en contexto.",
      cityLat: 36.685,
      cityLng: -6.126,
      sevillaLat: 37.389,
      sevillaLng: -5.984,
      cadizLat: 36.529,
      cadizLng: -6.292,
    },
    gettingThere: {
      eyebrow: "Cómo llegar",
      title: "Llegar a Jerez",
      airports:
        "Nearest airport: Jerez (XRY). Alternatives include Sevilla (SVQ) and Málaga (AGP).",
      routesTitle: "Suggested routes",
      direct: "Direct",
      steps: "steps",
      fastest: "Fastest",
      cheapest: "Cheapest",
      avgShortest: "Avg price (short route)",
      routes: [
        "Barcelona → Jerez (vuelo directo o vía Madrid).",
        "Paris → Jerez (vuelo directo o vía Sevilla).",
        "Pamplona → Jerez (vuelo a Sevilla y tren/bus).",
        "Madrid → Jerez (tren AVE + Media Distancia).",
      ],
    },
    routesMap: {
      label: "Mapa de rutas a Jerez",
      caption: "Rutas desde Barcelona, Párís, Pamplona y Madrid.",
      jerezLat: 36.685,
      jerezLng: -6.126,
      barcelonaLat: 41.385,
      barcelonaLng: 2.173,
      parisLat: 48.857,
      parisLng: 2.352,
      pamplonaLat: 42.817,
      pamplonaLng: -1.644,
      madridLat: 40.416,
      madridLng: -3.703,
      granadaLat: 37.1887,
      granadaLng: -3.7774,
      valenciaLat: 39.4893,
      valenciaLng: -0.4816,
    },
    stay: {
      eyebrow: "Where to stay",
      title: "Staying in Jerez",
      intro:
        "We will share hotel agreements and special rates soon. This placeholder text should be replaced with specific recommendations and booking notes.",
      linkLabel: "View hotel",
      hotels: [
        {
          name: "Hotel Placeholder 01",
          details:
            "Special rate available. Replace with final details and booking code.",
          url: "https://example.com",
        },
        {
          name: "Hotel Placeholder 02",
          details:
            "Special rate available. Replace with final details and booking code.",
          url: "https://example.com",
        },
        {
          name: "Hotel Placeholder 03",
          details:
            "Special rate available. Replace with final details and booking code.",
          url: "https://example.com",
        },
      ],
      bookingTitle: "Reservations",
      bookingInfo:
        "Placeholder instructions for booking with negotiated rates. Replace with contact emails, booking windows, and how to claim the discount.",
      bookingNote: "If you need help, let us know and we will assist.",
    },
    nav: ["City", "Getting there", "Stay"],
    openLabel: "Details",
  },
} as const;

// Defined after all locale consts to avoid "cannot access before initialization"
export const translations: Record<Locale, typeof en> = { es, fr, en };
