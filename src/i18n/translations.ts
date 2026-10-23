/**
 * ─── TRANSLATIONS ────────────────────────────────────────────────────────────
 * Three locales: es (default), fr, en.
 * Event facts (times, venue name, URLs) live in content.ts and are language-
 * agnostic; everything that is *rendered as copy* lives here.
 */

export const locales = ['es', 'fr', 'en'] as const;
export type Locale = (typeof locales)[number];

type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer Item)[]
        ? readonly Widen<Item>[]
        : T extends object
          ? { -readonly [Key in keyof T]: Widen<T[Key]> }
          : T;

export type Translation = Widen<{
  meta: { title: string; description: string };
  event: { date: string; dateShort: string; venueDescription: string };
  hero: { tagline: string; scrollCue: string; rsvpCta: string };
  cuando: { eyebrow: string; quote: string; labels: { ceremony: string; city: string } };
  finca: { eyebrow: string; photoAlt: string; photoCaption: string; linkLabel: string };
  pronto: { eyebrow: string; title: string; body: string; imgAlt: string };
  lang: { switcher: { es: string; fr: string; en: string } };
  nav: {
    hero: string;
    cuando: string;
    finca: string;
    eventDetail: string;
    pronto: string;
    sectionLabel: string;
    keyboardHelp: string;
  };
  eventDetail: {
    open: string;
    close: string;
    eyebrow: string;
    lead: string;
    leadSub: string;
    scheduleTitle: string;
    s1time: string;
    s1label: string;
    s2time: string;
    s2label: string;
    s3time: string;
    s3label: string;
    dressCodeLabel: string;
    dressCodeValue: string;
    adultsOnlyLabel: string;
    adultsOnlyNote: string;
    addressLabel: string;
    mapsLabel: string;
  };
  jerez: {
    eyebrow: string;
    title: string;
    titleSub: string;
    overview: string;
    history: string;
    highlights: string;
    openLabel: string;
    nav: readonly string[];
    map: {
      label: string;
      caption: string;
      cityLat: number;
      cityLng: number;
      sevillaLat: number;
      sevillaLng: number;
      cadizLat: number;
      cadizLng: number;
    };
    gettingThere: {
      eyebrow: string;
      title: string;
      airports: string;
      routesTitle: string;
      direct: string;
      connectionLabel: string;
      steps: string;
      fastest: string;
      cheapest: string;
      totalDurationLabel: string;
      durationPending: string;
      flightMode: string;
      trainMode: string;
      transferMode: string;
      groundConnection: string;
      combinationsLabel: string;
      layoversLabel: string;
      stopSingular: string;
      showOnMapLabel: string;
      openSearchLabel: string;
      flightSearchLabel: string;
      trainSearchLabel: string;
      pricePending: string;
      flightPriceOnlyNote: string;
      trainPricePending: string;
      trainConnectionNote: string;
      priceDisclaimer: string;
      departureDateLabel: string;
      originAirportLabel: string;
    };
    stay: {
      eyebrow: string;
      title: string;
      intro: string;
      accommodations: readonly {
        id: string;
        name: string;
        location: string;
        details: readonly string[];
        links: readonly { label: string; url: string }[];
      }[];
      transportTitle: string;
      transportNote: string;
    };
    surroundings: {
      eyebrow: string;
      title: string;
      eventsTitle: string;
      events: readonly { name: string; date: string; details: string }[];
      placesTitle: string;
      places: readonly { name: string; details: string }[];
      map: {
        label: string;
        caption: string;
        jerezLat: number;
        jerezLng: number;
        sevillaLat: number;
        sevillaLng: number;
        sevillaDrive: string;
        puertoLat: number;
        puertoLng: number;
        puertoDrive: string;
        sanlucarLat: number;
        sanlucarLng: number;
        sanlucarDrive: string;
      };
    };
    routesMap: {
      label: string;
      caption: string;
      jerezLat: number;
      jerezLng: number;
      barcelonaLat: number;
      barcelonaLng: number;
      parisLat: number;
      parisLng: number;
      pamplonaLat: number;
      pamplonaLng: number;
      madridLat: number;
      madridLng: number;
      granadaLat: number;
      granadaLng: number;
      valenciaLat: number;
      valenciaLng: number;
      avilesLat: number;
      avilesLng: number;
    };
  };
}>;

// ─── Spanish (default) ───────────────────────────────────────────────────────
const es = {
  meta: {
    title: 'Aritz & Sandra · 8 mayo 2027',
    description:
      'Boda de Aritz Beraza Garayalde y Sandra Vargas Benavente. 8 de mayo de 2027, Finca La Carreña, Jerez de la Frontera.',
  },

  event: {
    date: '8 de mayo de 2027',
    dateShort: '8 mayo 2027',
    venueDescription:
      'Viña histórica en las afueras de Jerez. Arquitectura de cortijo andaluz, ' +
      'jardines, capilla, caballerizas y una gran sala de celebraciones.',
  },

  hero: {
    tagline: 'Nos casamos',
    scrollCue: 'Desliza',
    rsvpCta: 'Confirmar asistencia',
  },

  cuando: {
    eyebrow: 'Cuándo',
    quote: 'Una tarde de primavera entre viñedos, bajo el sol de Jerez.',
    labels: {
      ceremony: 'Ceremonia & Celebración',
      city: 'Ciudad',
    },
  },

  finca: {
    eyebrow: 'El lugar',
    photoAlt: 'Finca La Carreña, acceso iluminado',
    photoCaption: 'Jerez de la Frontera, Cádiz',
    linkLabel: 'lacarrena.com',
  },

  pronto: {
    eyebrow: 'En preparación',
    title: 'Pronto más información',
    body:
      'Seguiremos actualizando esta página con detalles sobre alojamiento, ' +
      'transporte y agenda. Recibirás un enlace personalizado para tu confirmación.',
    imgAlt: 'Finca La Carreña',
  },

  lang: {
    switcher: { es: 'ES', fr: 'FR', en: 'EN' },
  },
  nav: {
    hero: 'Inicio',
    cuando: 'Cuándo',
    finca: 'El lugar',
    eventDetail: 'Nuestra boda',
    pronto: 'Info',
    sectionLabel: 'Navegación por secciones',
    keyboardHelp: 'Usa las flechas, WASD o HJKL para cambiar de sección.',
  },
  eventDetail: {
    open: 'Ver detalles del evento',
    close: 'Volver',
    eyebrow: '8 mayo 2027',
    lead: 'Únete a nosotros',
    leadSub: 'en nuestra boda',
    scheduleTitle: 'El día',
    s1time: 'Mediodía',
    s1label: 'Ceremonia civil',
    s2time: 'Tarde',
    s2label: 'Cóctel & almuerzo',
    s3time: 'Tarde-noche',
    s3label: 'Baile y fiesta',
    dressCodeLabel: 'Dress code',
    dressCodeValue: 'Etiqueta formal',
    adultsOnlyLabel: 'Solo adultos',
    adultsOnlyNote:
      'Con mucho cariño, os pedimos que esta celebración sea solo para adultos (sin niños). Gracias por comprenderlo.',
    addressLabel: 'Cómo llegar',
    mapsLabel: 'Abrir en Google Maps',
    parkingNote: 'Aparcamiento disponible en la finca.',
    transportNote:
      'El día de la boda habrá autobuses de ida y vuelta desde Jerez y desde Rota hasta la finca.',
  },
  jerez: {
    eyebrow: 'Jerez de la Frontera',
    title: 'La ciudad',
    titleSub: 'entre viñedos y arte',
    overview:
      'Jerez se descubre a través de tres tradiciones vivas: el vino, el flamenco y el caballo andaluz.',
    history:
      'En el casco histórico, el Alcázar almohade del siglo XII conserva la mezquita y los baños árabes. Cerca, la Catedral de San Salvador combina los estilos gótico, barroco y neoclásico.',
    highlights:
      'Visita una bodega del Marco de Jerez, recorre los barrios flamencos de Santiago y San Miguel o descubre el espectáculo ecuestre «Cómo bailan los caballos andaluces» de la Real Escuela.',
    map: {
      label: 'Mapa de Jerez',
      caption: 'Jerez con Sevilla y Cádiz en contexto.',
      cityLat: 36.685,
      cityLng: -6.126,
      sevillaLat: 37.389,
      sevillaLng: -5.984,
      cadizLat: 36.529,
      cadizLng: -6.292,
    },
    gettingThere: {
      eyebrow: 'Cómo llegar',
      title: 'Llegar a Jerez',
      airports:
        'El aeropuerto más cercano es Jerez (XRY). También puedes volar a Sevilla (SVQ) y continuar hasta Jerez en tren desde Sevilla-Santa Justa.',
      routesTitle: 'Rutas sugeridas',
      direct: 'Directo',
      connectionLabel: 'Con conexión',
      steps: 'escalas',
      fastest: 'Vuelo más rápido',
      cheapest: 'Vuelo más barato',
      totalDurationLabel: 'Duración total',
      durationPending: 'Duración por confirmar',
      flightMode: 'Avión',
      trainMode: 'Tren',
      transferMode: 'Traslado',
      groundConnection: 'Conexión terrestre',
      combinationsLabel: 'Combinaciones y escalas',
      layoversLabel: 'Escalas',
      stopSingular: 'escala',
      showOnMapLabel: 'Ver en el mapa',
      openSearchLabel: 'Buscar este trayecto',
      flightSearchLabel: 'Buscar vuelos',
      trainSearchLabel: 'Consultar trenes',
      pricePending: 'Consultar tarifa',
      flightPriceOnlyNote:
        'El importe indicado corresponde solo al vuelo; trenes y traslados no incluidos.',
      trainPricePending: 'Consulta horarios y tarifas ferroviarias en Renfe.',
      trainConnectionNote:
        'Las conexiones ferroviarias son orientativas: confirma horarios, estaciones y enlaces con el vuelo para la fecha elegida.',
      priceDisclaimer: 'Precios orientativos de vuelos, consultados el',
      departureDateLabel: 'para viajar el',
      originAirportLabel: 'Aeropuerto de referencia',
    },
    routesMap: {
      label: 'Mapa de rutas a Jerez',
      caption: 'Selecciona una ciudad para ver sus opciones de viaje.',
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
      avilesLat: 43.5632,
      avilesLng: -6.0346,
    },
    stay: {
      eyebrow: 'Dónde dormir',
      title: 'Dónde alojarse',
      intro:
        'Opciones en Jerez de la Frontera y Rota. Consulta las tarifas y condiciones de reserva de cada alojamiento.',
      accommodations: [
        {
          id: 'maquinilla',
          name: 'AT La Maquinilla',
          location: 'Jerez de la Frontera',
          details: [
            'Tarifa para invitados: solicítala por correo e indica que eres invitado/a de la boda de Sandra y Aritz.',
          ],
          links: [
            { label: 'Web oficial', url: 'https://www.atlamaquinilla.com/' },
            { label: 'direccion@atlamaquinilla.com', url: 'mailto:direccion@atlamaquinilla.com' },
          ],
        },
        {
          id: 'gitanilla',
          name: 'Apartamentos La Gitanilla',
          location: 'Jerez de la Frontera',
          details: [
            '329 € por noche y habitación doble. Al reservar, indica que eres invitado/a de la boda de Sandra y Aritz.',
          ],
          links: [
            { label: 'Web oficial', url: 'https://www.lagitanilla.com/' },
            { label: 'Llamar a Virginia · 680 795 288', url: 'tel:+34680795288' },
          ],
        },
        {
          id: 'aladro',
          name: 'Apartamentos Aladro',
          location: 'Jerez de la Frontera',
          details: [
            'Cama doble y sofá cama: 720 € en total · 6–9 de mayo de 2027 (3 noches).',
            'Dos habitaciones dobles y sofá cama en el salón: 1.100 € en total · 6–9 de mayo de 2027 (3 noches).',
          ],
          links: [{ label: 'Web oficial', url: 'https://aladroapartamentos.com/' }],
        },
        {
          id: 'playa-de-la-luz',
          name: 'Hotel Playa de la Luz',
          location: 'Rota',
          details: ['No hay tarifa negociada: se aplica el precio público del hotel.'],
          links: [
            { label: 'Web oficial', url: 'https://www.hace.es/hotel-playa-de-la-luz/' },
            {
              label: 'Reservar · 7–9 mayo 2027 · 2 adultos',
              url: 'https://www.hace.es/bookingstep1/?chainSelectorValue=21440&checkin=07%2F05%2F2027&idtokenprovider=100121951&currency=EUR&idchain=500151&clientCode=&hsri=02080&lang=es&nights=2&parties=W3siYWR1bHRzIjoyLCJjaGlsZHJlbiI6W119XQ%3D%3D&type=chain&step=1',
            },
          ],
        },
      ],
      transportTitle: 'Autobuses para el día de la boda',
      transportNote:
        'Habrá autobuses de ida y vuelta desde Jerez y desde Rota hasta la finca el día de la boda.',
    },
    surroundings: {
      eyebrow: 'Alrededores',
      title: 'Alargar la estancia',
      eventsTitle: 'Fechas destacadas',
      events: [
        {
          name: 'Feria del Caballo',
          date: '24 de abril – 1 de mayo de 2027',
          details: 'Se celebra la semana anterior a la boda.',
        },
        {
          name: 'Gran Premio de España de MotoGP',
          date: '7–9 de mayo de 2027',
          details:
            'Coincide con el fin de semana de la boda; la carrera principal está prevista para el domingo 9.',
        },
      ],
      placesTitle: 'Escapadas para descubrir la zona',
      places: [
        {
          name: 'Cádiz',
          details: 'Casco histórico, Catedral, Torre Tavira y la playa de La Caleta.',
        },
        {
          name: 'El Puerto de Santa María',
          details: 'Castillo de San Marcos, bodegas y playas.',
        },
        {
          name: 'Sanlúcar de Barrameda',
          details: 'Bajo de Guía, playas y excursiones por Doñana desde el Guadalquivir.',
        },
        {
          name: 'Arcos de la Frontera',
          details:
            'Casco histórico, miradores y puerta de entrada a la Ruta de los Pueblos Blancos.',
        },
      ],
      map: {
        label: 'Mapa de alrededores',
        caption: 'Tiempos orientativos en coche hasta Jerez de la Frontera.',
        jerezLabel: 'Jerez de la Frontera',
        jerezLat: 36.685,
        jerezLng: -6.126,
        sevillaLabel: 'Sevilla',
        sevillaLat: 37.389,
        sevillaLng: -5.984,
        sevillaDrive: '1 h 05 min hasta Jerez',
        puertoLabel: 'El Puerto de Santa María',
        puertoLat: 36.602,
        puertoLng: -6.228,
        puertoDrive: '25 min hasta Jerez',
        sanlucarLabel: 'Sanlúcar de Barrameda',
        sanlucarLat: 36.779,
        sanlucarLng: -6.354,
        sanlucarDrive: '35 min hasta Jerez',
      },
    },
    nav: ['Ciudad', 'Llegar', 'Dormir', 'Alrededores'],
    openLabel: 'Detalles',
  },
} as const;

// ─── French ──────────────────────────────────────────────────────────────────
const fr = {
  meta: {
    title: 'Aritz & Sandra · 8 mai 2027',
    description:
      "Mariage d'Aritz Beraza Garayalde et Sandra Vargas Benavente. 8 mai 2027, Finca La Carreña, Jerez de la Frontera.",
  },

  event: {
    date: '8 mai 2027',
    dateShort: '8 mai 2027',
    venueDescription:
      'Vignoble historique aux portes de Jerez. Architecture de cortijo andalou, ' +
      'jardins, chapelle, écuries et une grande salle de réception.',
  },

  hero: {
    tagline: 'On se marie',
    scrollCue: 'Défiler',
    rsvpCta: 'Confirmer votre présence',
  },

  cuando: {
    eyebrow: 'Quand',
    quote: 'Un après-midi de printemps entre les vignes, sous le soleil de Jerez.',
    labels: {
      ceremony: 'Cérémonie & Réception',
      city: 'Ville',
    },
  },

  finca: {
    eyebrow: 'Le lieu',
    photoAlt: 'Finca La Carreña, accès illuminé',
    photoCaption: 'Jerez de la Frontera, Cádiz',
    linkLabel: 'lacarrena.com',
  },

  pronto: {
    eyebrow: 'En préparation',
    title: "Plus d'informations bientôt",
    body:
      "Nous continuerons à mettre à jour cette page avec des détails sur l'hébergement, " +
      'le transport et le programme. Vous recevrez un lien personnalisé pour confirmer votre présence.',
    imgAlt: 'Finca La Carreña',
  },

  lang: {
    switcher: { es: 'ES', fr: 'FR', en: 'EN' },
  },
  nav: {
    hero: 'Accueil',
    cuando: 'Quand',
    finca: 'Le lieu',
    eventDetail: 'Notre mariage',
    pronto: 'Info',
    sectionLabel: 'Navigation par sections',
    keyboardHelp: 'Utilisez les flèches, WASD ou HJKL pour changer de section.',
  },
  eventDetail: {
    open: 'Voir les détails',
    close: 'Retour',
    eyebrow: '8 mai 2027',
    lead: 'Rejoignez-nous',
    leadSub: 'pour notre mariage',
    scheduleTitle: 'Le programme',
    s1time: 'Midi',
    s1label: 'Cérémonie civile',
    s2time: 'Après-midi',
    s2label: 'Cocktail & déjeuner',
    s3time: 'Soirée',
    s3label: 'Bal et fête',
    dressCodeLabel: 'Dress code',
    dressCodeValue: 'Tenue de soirée',
    adultsOnlyLabel: 'Réservé aux adultes',
    adultsOnlyNote:
      'Avec toute notre affection, nous vous demandons que cette célébration soit réservée aux adultes (sans enfants). Merci de votre compréhension.',
    addressLabel: 'Comment venir',
    mapsLabel: 'Ouvrir dans Google Maps',
    parkingNote: 'Parking disponible sur place.',
    transportNote:
      'Le jour du mariage, des autobus assureront l’aller-retour depuis Jerez et Rota jusqu’à la finca.',
  },
  jerez: {
    eyebrow: 'Jerez de la Frontera',
    title: 'La ville',
    titleSub: 'entre vignes et art',
    overview:
      'Jerez se découvre à travers trois traditions vivantes : le vin, le flamenco et le cheval andalou.',
    history:
      'Dans le centre historique, l’Alcázar almohade du XIIe siècle conserve sa mosquée et ses bains arabes. À proximité, la cathédrale San Salvador réunit les styles gothique, baroque et néoclassique.',
    highlights:
      'Visitez une cave du Marco de Jerez, parcourez les quartiers flamencos de Santiago et San Miguel ou découvrez le spectacle équestre « Cómo bailan los caballos andaluces » de la Real Escuela.',
    map: {
      label: 'Carte de Jerez',
      caption: 'Jerez avec Séville et Cadix en contexte.',
      cityLat: 36.685,
      cityLng: -6.126,
      sevillaLat: 37.389,
      sevillaLng: -5.984,
      cadizLat: 36.529,
      cadizLng: -6.292,
    },
    gettingThere: {
      eyebrow: 'Comment venir',
      title: 'Aller à Jerez',
      airports:
        'L’aéroport le plus proche est Jerez (XRY). Vous pouvez aussi atterrir à Séville (SVQ), puis rejoindre Jerez en train depuis Sevilla-Santa Justa.',
      routesTitle: 'Itinéraires suggérés',
      direct: 'Direct',
      connectionLabel: 'Avec correspondance',
      steps: 'escales',
      fastest: 'Vol le plus rapide',
      cheapest: 'Vol le moins cher',
      totalDurationLabel: 'Durée totale',
      durationPending: 'Durée à confirmer',
      flightMode: 'Avion',
      trainMode: 'Train',
      transferMode: 'Transfert',
      groundConnection: 'Correspondance terrestre',
      combinationsLabel: 'Itinéraires et escales',
      layoversLabel: 'Escale(s)',
      stopSingular: 'escale',
      showOnMapLabel: 'Voir sur la carte',
      openSearchLabel: 'Rechercher ce trajet',
      flightSearchLabel: 'Rechercher des vols',
      trainSearchLabel: 'Consulter les trains',
      pricePending: 'Tarif à consulter',
      flightPriceOnlyNote:
        'Le prix indiqué concerne uniquement le vol ; train et transferts non inclus.',
      trainPricePending: 'Consultez les horaires et tarifs ferroviaires auprès de Renfe.',
      trainConnectionNote:
        'Les liaisons ferroviaires sont indicatives : vérifiez les horaires, les gares et la correspondance avec le vol à la date choisie.',
      priceDisclaimer: 'Prix indicatifs des vols, consultés le',
      departureDateLabel: 'pour un départ le',
      originAirportLabel: 'Aéroport de référence',
    },
    routesMap: {
      label: 'Carte des routes vers Jerez',
      caption: 'Sélectionnez une ville pour afficher ses options de trajet.',
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
      avilesLat: 43.5632,
      avilesLng: -6.0346,
    },
    stay: {
      eyebrow: 'Où dormir',
      title: 'Où séjourner',
      intro:
        'Options à Jerez de la Frontera et à Rota. Consultez les tarifs et les conditions de réservation de chaque établissement.',
      accommodations: [
        {
          id: 'maquinilla',
          name: 'AT La Maquinilla',
          location: 'Jerez de la Frontera',
          details: [
            'Tarif invité : demandez-le par e-mail en précisant que vous assistez au mariage de Sandra et Aritz.',
          ],
          links: [
            { label: 'Site officiel', url: 'https://www.atlamaquinilla.com/' },
            {
              label: 'direccion@atlamaquinilla.com',
              url: 'mailto:direccion@atlamaquinilla.com',
            },
          ],
        },
        {
          id: 'gitanilla',
          name: 'Apartamentos La Gitanilla',
          location: 'Jerez de la Frontera',
          details: [
            '329 € par nuit et par chambre double. Lors de la réservation, précisez que vous assistez au mariage de Sandra et Aritz.',
          ],
          links: [
            { label: 'Site officiel', url: 'https://www.lagitanilla.com/' },
            { label: 'Appeler Virginia · 680 795 288', url: 'tel:+34680795288' },
          ],
        },
        {
          id: 'aladro',
          name: 'Apartamentos Aladro',
          location: 'Jerez de la Frontera',
          details: [
            'Lit double et canapé-lit : 720 € au total · 6–9 mai 2027 (3 nuits).',
            'Deux chambres doubles et canapé-lit dans le salon : 1 100 € au total · 6–9 mai 2027 (3 nuits).',
          ],
          links: [{ label: 'Site officiel', url: 'https://aladroapartamentos.com/' }],
        },
        {
          id: 'playa-de-la-luz',
          name: 'Hotel Playa de la Luz',
          location: 'Rota',
          details: ['Aucun tarif négocié : le tarif public de l’hôtel s’applique.'],
          links: [
            { label: 'Site officiel', url: 'https://www.hace.es/hotel-playa-de-la-luz/' },
            {
              label: 'Réserver · 7–9 mai 2027 · 2 adultes',
              url: 'https://www.hace.es/bookingstep1/?chainSelectorValue=21440&checkin=07%2F05%2F2027&idtokenprovider=100121951&currency=EUR&idchain=500151&clientCode=&hsri=02080&lang=es&nights=2&parties=W3siYWR1bHRzIjoyLCJjaGlsZHJlbiI6W119XQ%3D%3D&type=chain&step=1',
            },
          ],
        },
      ],
      transportTitle: 'Autobus le jour du mariage',
      transportNote:
        'Le jour du mariage, des autobus assureront l’aller-retour depuis Jerez et Rota jusqu’à la finca.',
    },
    surroundings: {
      eyebrow: 'Alentours',
      title: 'Prolonger le séjour',
      eventsTitle: 'Dates à retenir',
      events: [
        {
          name: 'Feria del Caballo',
          date: 'Du 24 avril au 1er mai 2027',
          details: 'Elle a lieu la semaine précédant le mariage.',
        },
        {
          name: 'Grand Prix d’Espagne MotoGP',
          date: 'Du 7 au 9 mai 2027',
          details:
            'Il coïncide avec le week-end du mariage ; la course principale est prévue le dimanche 9.',
        },
      ],
      placesTitle: 'Escapades pour découvrir la région',
      places: [
        {
          name: 'Cadix',
          details: 'Centre historique, cathédrale, Torre Tavira et plage de La Caleta.',
        },
        {
          name: 'El Puerto de Santa María',
          details: 'Château de San Marcos, caves et plages.',
        },
        {
          name: 'Sanlúcar de Barrameda',
          details: 'Bajo de Guía, plages et excursions vers Doñana depuis le Guadalquivir.',
        },
        {
          name: 'Arcos de la Frontera',
          details:
            'Centre historique, belvédères et porte d’entrée de la Route des villages blancs.',
        },
      ],
      map: {
        label: 'Carte des alentours',
        caption: 'Temps de trajet indicatifs en voiture vers Jerez de la Frontera.',
        jerezLabel: 'Jerez de la Frontera',
        jerezLat: 36.685,
        jerezLng: -6.126,
        sevillaLabel: 'Séville',
        sevillaLat: 37.389,
        sevillaLng: -5.984,
        sevillaDrive: '1 h 05 min jusqu’à Jerez',
        puertoLabel: 'El Puerto de Santa María',
        puertoLat: 36.602,
        puertoLng: -6.228,
        puertoDrive: '25 min jusqu’à Jerez',
        sanlucarLabel: 'Sanlúcar de Barrameda',
        sanlucarLat: 36.779,
        sanlucarLng: -6.354,
        sanlucarDrive: '35 min jusqu’à Jerez',
      },
    },
    nav: ['Ville', 'Venir', 'Dormir', 'Alentours'],
    openLabel: 'Détails',
  },
} as const;

// ─── English ─────────────────────────────────────────────────────────────────
const en = {
  meta: {
    title: 'Aritz & Sandra · 8 May 2027',
    description:
      'Wedding of Aritz Beraza Garayalde and Sandra Vargas Benavente. 8 May 2027, Finca La Carreña, Jerez de la Frontera.',
  },

  event: {
    date: '8 May 2027',
    dateShort: '8 May 2027',
    venueDescription:
      'A historic vineyard on the outskirts of Jerez. Andalusian cortijo architecture, ' +
      'gardens, chapel, stables and a grand celebration hall.',
  },

  hero: {
    tagline: "We're getting married",
    scrollCue: 'Scroll',
    rsvpCta: 'Confirm attendance',
  },

  cuando: {
    eyebrow: 'When',
    quote: 'A spring afternoon among the vineyards, under the Jerez sun.',
    labels: {
      ceremony: 'Ceremony & Reception',
      city: 'City',
    },
  },

  finca: {
    eyebrow: 'The venue',
    photoAlt: 'Finca La Carreña, illuminated entrance',
    photoCaption: 'Jerez de la Frontera, Cádiz',
    linkLabel: 'lacarrena.com',
  },

  pronto: {
    eyebrow: 'Coming soon',
    title: 'More details soon',
    body:
      'We will keep updating this page with details on accommodation, ' +
      'transport and schedule. You will receive a personalised link to confirm your attendance.',
    imgAlt: 'Finca La Carreña',
  },

  lang: {
    switcher: { es: 'ES', fr: 'FR', en: 'EN' },
  },
  nav: {
    hero: 'Home',
    cuando: 'When',
    finca: 'The venue',
    eventDetail: 'Our wedding',
    pronto: 'Info',
    sectionLabel: 'Section navigation',
    keyboardHelp: 'Use the arrow keys, WASD or HJKL to change sections.',
  },
  eventDetail: {
    open: 'View event details',
    close: 'Back',
    eyebrow: '8 May 2027',
    lead: 'Join us',
    leadSub: 'on our wedding day',
    scheduleTitle: 'The day',
    s1time: 'Midday',
    s1label: 'Civil ceremony',
    s2time: 'Afternoon',
    s2label: 'Cocktail & seated lunch',
    s3time: 'Evening',
    s3label: 'Dancing & celebrations',
    dressCodeLabel: 'Dress code',
    dressCodeValue: 'Formal attire',
    adultsOnlyLabel: 'Adults only',
    adultsOnlyNote:
      'With lots of love, we kindly ask that this celebration be adults-only (no children). Thank you for understanding.',
    addressLabel: 'Getting there',
    mapsLabel: 'Open in Google Maps',
    parkingNote: 'Parking available at the venue.',
    transportNote:
      'There will be return buses from both Jerez and Rota to the venue on the wedding day.',
  },
  jerez: {
    eyebrow: 'Jerez de la Frontera',
    title: 'La ciudad',
    titleSub: 'among vineyards and art',
    overview:
      'Discover Jerez through three living traditions: sherry, flamenco and the Andalusian horse.',
    history:
      'In the historic centre, the 12th-century Almohad Alcázar preserves its mosque and Arab baths. Nearby, San Salvador Cathedral brings together Gothic, Baroque and Neoclassical styles.',
    highlights:
      'Visit a sherry bodega, explore the flamenco neighbourhoods of Santiago and San Miguel, or see the Royal Andalusian School of Equestrian Art’s “How the Andalusian Horses Dance” show.',
    map: {
      label: 'Map of Jerez',
      caption: 'Jerez shown in context with Seville and Cádiz.',
      cityLat: 36.685,
      cityLng: -6.126,
      sevillaLat: 37.389,
      sevillaLng: -5.984,
      cadizLat: 36.529,
      cadizLng: -6.292,
    },
    gettingThere: {
      eyebrow: 'Getting there',
      title: 'Getting to Jerez',
      airports:
        'The nearest airport is Jerez (XRY). You can also fly to Sevilla (SVQ) and continue by train from Sevilla-Santa Justa.',
      routesTitle: 'Suggested routes',
      direct: 'Direct',
      connectionLabel: 'Connecting flight',
      steps: 'stopovers',
      fastest: 'Fastest flight',
      cheapest: 'Cheapest flight',
      totalDurationLabel: 'Total duration',
      durationPending: 'Duration to be confirmed',
      flightMode: 'Flight',
      trainMode: 'Train',
      transferMode: 'Transfer',
      groundConnection: 'Ground connection',
      combinationsLabel: 'Routes and stopovers',
      layoversLabel: 'Stopover(s)',
      stopSingular: 'stopover',
      showOnMapLabel: 'Show on map',
      openSearchLabel: 'Search this route',
      flightSearchLabel: 'Search flights',
      trainSearchLabel: 'Check trains',
      pricePending: 'Check price',
      flightPriceOnlyNote:
        'The listed amount is for the flight only; train and transfers are not included.',
      trainPricePending: 'Check train times and fares with Renfe.',
      trainConnectionNote:
        'Rail connections are indicative: check schedules, stations and the connection with your flight for your travel date.',
      priceDisclaimer: 'Indicative flight prices, checked on',
      departureDateLabel: 'for travel on',
      originAirportLabel: 'Primary airport',
    },
    routesMap: {
      label: 'Routes to Jerez',
      caption: 'Select a city to see its travel options.',
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
      avilesLat: 43.5632,
      avilesLng: -6.0346,
    },
    stay: {
      eyebrow: 'Where to stay',
      title: 'Where to stay',
      intro:
        'Options in Jerez de la Frontera and Rota. Check each listing for rates and booking terms.',
      accommodations: [
        {
          id: 'maquinilla',
          name: 'AT La Maquinilla',
          location: 'Jerez de la Frontera',
          details: [
            'Guest rate: ask by email and mention that you are attending Sandra and Aritz’s wedding.',
          ],
          links: [
            { label: 'Official website', url: 'https://www.atlamaquinilla.com/' },
            {
              label: 'direccion@atlamaquinilla.com',
              url: 'mailto:direccion@atlamaquinilla.com',
            },
          ],
        },
        {
          id: 'gitanilla',
          name: 'Apartamentos La Gitanilla',
          location: 'Jerez de la Frontera',
          details: [
            '€329 per night for a double room. When booking, mention that you are attending Sandra and Aritz’s wedding.',
          ],
          links: [
            { label: 'Official website', url: 'https://www.lagitanilla.com/' },
            { label: 'Call Virginia · 680 795 288', url: 'tel:+34680795288' },
          ],
        },
        {
          id: 'aladro',
          name: 'Apartamentos Aladro',
          location: 'Jerez de la Frontera',
          details: [
            'Double bed and sofa bed: €720 total · 6–9 May 2027 (3 nights).',
            'Two double bedrooms and a sofa bed in the living room: €1,100 total · 6–9 May 2027 (3 nights).',
          ],
          links: [{ label: 'Official website', url: 'https://aladroapartamentos.com/' }],
        },
        {
          id: 'playa-de-la-luz',
          name: 'Hotel Playa de la Luz',
          location: 'Rota',
          details: ['There is no negotiated rate; the hotel’s public rate applies.'],
          links: [
            { label: 'Official website', url: 'https://www.hace.es/hotel-playa-de-la-luz/' },
            {
              label: 'Book · 7–9 May 2027 · 2 adults',
              url: 'https://www.hace.es/bookingstep1/?chainSelectorValue=21440&checkin=07%2F05%2F2027&idtokenprovider=100121951&currency=EUR&idchain=500151&clientCode=&hsri=02080&lang=es&nights=2&parties=W3siYWR1bHRzIjoyLCJjaGlsZHJlbiI6W119XQ%3D%3D&type=chain&step=1',
            },
          ],
        },
      ],
      transportTitle: 'Wedding-day buses',
      transportNote:
        'There will be return buses from both Jerez and Rota to the venue on the wedding day.',
    },
    surroundings: {
      eyebrow: 'Surroundings',
      title: 'Extending your stay',
      eventsTitle: 'Dates to note',
      events: [
        {
          name: 'Feria del Caballo',
          date: '24 April–1 May 2027',
          details: 'It takes place in the week before the wedding.',
        },
        {
          name: 'Spanish MotoGP Grand Prix',
          date: '7–9 May 2027',
          details:
            'It overlaps with the wedding weekend; the main race is scheduled for Sunday 9 May.',
        },
      ],
      placesTitle: 'Places to explore nearby',
      places: [
        {
          name: 'Cádiz',
          details: 'Historic centre, cathedral, Torre Tavira and La Caleta beach.',
        },
        {
          name: 'El Puerto de Santa María',
          details: 'San Marcos Castle, sherry bodegas and beaches.',
        },
        {
          name: 'Sanlúcar de Barrameda',
          details: 'Bajo de Guía, beaches and Doñana excursions across the Guadalquivir.',
        },
        {
          name: 'Arcos de la Frontera',
          details: 'Historic centre, viewpoints and a gateway to the White Villages route.',
        },
      ],
      map: {
        label: 'Surroundings map',
        caption: 'Estimated driving times to Jerez de la Frontera.',
        jerezLabel: 'Jerez de la Frontera',
        jerezLat: 36.685,
        jerezLng: -6.126,
        sevillaLabel: 'Seville',
        sevillaLat: 37.389,
        sevillaLng: -5.984,
        sevillaDrive: '1h 05m to Jerez',
        puertoLabel: 'El Puerto de Santa María',
        puertoLat: 36.602,
        puertoLng: -6.228,
        puertoDrive: '25m to Jerez',
        sanlucarLabel: 'Sanlúcar de Barrameda',
        sanlucarLat: 36.779,
        sanlucarLng: -6.354,
        sanlucarDrive: '35m to Jerez',
      },
    },
    nav: ['City', 'Getting there', 'Stay', 'Surroundings'],
    openLabel: 'Details',
  },
} as const;

// All locales satisfy the same widened translation contract while retaining localized strings.
export const translations: Record<Locale, Translation> = { es, fr, en };
