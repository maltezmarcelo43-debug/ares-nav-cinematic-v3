export type Locale = "en" | "es";

type SceneCopy = {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  meta: string[];
};

type Copy = {
  status: string;
  openConsole: string;
  enterConsole: string;
  launchConsole: string;
  closeConsole: string;
  closeConsoleLabel: string;
  consoleKicker: string;
  consoleSubtitle: string;
  consoleSection: string;
  consoleTitle: [string, string];
  consoleDescription: string;
  loader: {
    fallback: string;
    syncing: string;
    initializing: string;
  };
  scenes: SceneCopy[];
  footer: string;
  languageLabel: string;
};

export const copy: Record<Locale, Copy> = {
  en: {
    status: "NASA DATA EXPERIENCE",
    openConsole: "OPEN CONSOLE",
    enterConsole: "ENTER MISSION CONSOLE",
    launchConsole: "LAUNCH CONSOLE",
    closeConsole: "CLOSE",
    closeConsoleLabel: "Close mission console",
    consoleKicker: "ARES MISSION CONSOLE",
    consoleSubtitle: "Jezero surface operations",
    consoleSection: "06 · MISSION SYSTEM",
    consoleTitle: ["ARES MISSION", "CONSOLE"],
    consoleDescription:
      "Route planning, mission metrics, rover context and EVA simulation live in the operational layer preserved from V2.",
    loader: {
      fallback: "Fallback visuals ready",
      syncing: "Synchronizing mission assets",
      initializing: "Initializing navigation systems",
    },
    scenes: [
      {
        id: "earth",
        eyebrow: "01 · ORIGIN",
        title: "EARTH",
        text: "Every human mission begins here. ARES NAV turns planetary data into a path for the day exploration moves beyond Earth.",
        meta: ["Home planet", "NASA imagery", "Scroll to travel"],
      },
      {
        id: "journey",
        eyebrow: "02 · TRANSFER",
        title: "THE\nJOURNEY",
        text: "The interface gives way to distance. Scroll becomes mission time while the camera leaves Earth and begins the transfer toward Mars.",
        meta: ["Cinematic scroll", "Reversible timeline", "Deep-space scene"],
      },
      {
        id: "mars",
        eyebrow: "03 · DESTINATION",
        title: "MARS",
        text: "Mars resolves from a distant body into an operational environment. Real NASA visual assets anchor the cinematic layer to mission context.",
        meta: ["NASA texture", "MRO 3D model", "Orbital context"],
      },
      {
        id: "data",
        eyebrow: "04 · ORBITAL INTELLIGENCE",
        title: "DATA\nBECOMES\nDIRECTION",
        text: "MRO, topography and rover context are the bridge between exploration imagery and navigable surface decisions.",
        meta: ["MRO", "MOLA planned", "Mars 2020"],
      },
      {
        id: "jezero",
        eyebrow: "05 · LANDING ZONE",
        title: "JEZERO\nCRATER",
        text: "The visual transition moves from Mars as a planet to Mars as a place. Here the cinematic experience hands control to the route-planning console.",
        meta: ["18.4446° N", "77.4509° E", "Mars 2020 region"],
      },
    ],
    footer: "NASA assets + simulated/derived route-planning prototype",
    languageLabel: "Choose language",
  },
  es: {
    status: "EXPERIENCIA CON DATOS NASA",
    openConsole: "ABRIR CONSOLA",
    enterConsole: "ENTRAR A LA CONSOLA DE MISIÓN",
    launchConsole: "INICIAR CONSOLA",
    closeConsole: "CERRAR",
    closeConsoleLabel: "Cerrar consola de misión",
    consoleKicker: "CONSOLA DE MISIÓN ARES",
    consoleSubtitle: "Operaciones de superficie en Jezero",
    consoleSection: "06 · SISTEMA DE MISIÓN",
    consoleTitle: ["MISIÓN ARES", "CONSOLA"],
    consoleDescription:
      "La planificación de rutas, las métricas de misión, el contexto del rover y la simulación EVA forman la capa operativa conservada desde V2.",
    loader: {
      fallback: "Visuales alternativos listos",
      syncing: "Sincronizando recursos de misión",
      initializing: "Iniciando sistemas de navegación",
    },
    scenes: [
      {
        id: "earth",
        eyebrow: "01 · ORIGEN",
        title: "TIERRA",
        text: "Toda misión humana comienza aquí. ARES NAV convierte datos planetarios en una ruta para el día en que la exploración avance más allá de la Tierra.",
        meta: ["Planeta de origen", "Imágenes NASA", "Desliza para viajar"],
      },
      {
        id: "journey",
        eyebrow: "02 · TRAYECTO",
        title: "EL\nVIAJE",
        text: "La interfaz da paso a la distancia. El desplazamiento se convierte en tiempo de misión mientras la cámara deja la Tierra y comienza el viaje hacia Marte.",
        meta: ["Recorrido cinematográfico", "Línea de tiempo reversible", "Espacio profundo"],
      },
      {
        id: "mars",
        eyebrow: "03 · DESTINO",
        title: "MARTE",
        text: "Marte pasa de ser un cuerpo distante a convertirse en un entorno operativo. Los recursos visuales reales de NASA conectan la experiencia con el contexto de la misión.",
        meta: ["Textura NASA", "Modelo 3D de MRO", "Contexto orbital"],
      },
      {
        id: "data",
        eyebrow: "04 · INTELIGENCIA ORBITAL",
        title: "DATOS\nQUE GUÍAN",
        text: "MRO, la topografía y el contexto del rover crean el puente entre las imágenes de exploración y las decisiones de navegación en la superficie.",
        meta: ["MRO", "MOLA planificado", "Mars 2020"],
      },
      {
        id: "jezero",
        eyebrow: "05 · ZONA DE ATERRIZAJE",
        title: "CRÁTER\nJEZERO",
        text: "La transición visual convierte a Marte de planeta en lugar. Aquí la experiencia cinematográfica entrega el control a la consola de planificación de rutas.",
        meta: ["18.4446° N", "77.4509° E", "Región Mars 2020"],
      },
    ],
    footer: "Recursos NASA + prototipo de rutas simuladas y derivadas",
    languageLabel: "Elegir idioma",
  },
};
