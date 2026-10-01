# ARES NAV

ARES NAV es un prototipo de navegación para exploración humana en Marte. La versión actual se concentra en el cráter Jezero y combina una introducción cinematográfica en 3D con una consola de planificación de misión.

El proyecto nació para el reto **Interplanetary Survival Guide: Martian Map** de NASA Space Apps. La idea es convertir imágenes, topografía y datos de misiones en información que ayude a comparar rutas de superficie.

**Demo:** [ares-nav-cinematic-v3.vercel.app](https://ares-nav-cinematic-v3.vercel.app)

## Qué incluye esta versión

- Recorrido Tierra → espacio profundo → Marte → cráter Jezero.
- Modelos 3D de Perseverance y Mars Reconnaissance Orbiter proporcionados por NASA.
- Texturas planetarias e imagen orbital real de Jezero.
- Consola con tres alternativas de ruta: segura, rápida y científica.
- Consulta del manifiesto y fotografías de rovers mediante la API pública de NASA.
- Interfaz en español e inglés; la preferencia queda guardada en el navegador.
- Ajustes de calidad para teléfonos y equipos con menor capacidad gráfica.

## Tecnologías

- **Next.js y React** para la aplicación y sus componentes.
- **TypeScript** para mantener tipos claros entre la interfaz y la escena.
- **Three.js, React Three Fiber y Drei** para el entorno 3D.
- **GSAP, ScrollTrigger y Lenis** para coordinar el desplazamiento con la cámara.
- **React Three Postprocessing** para bloom, ruido y viñeta.
- **Vercel** para el despliegue.

## Ejecutarlo localmente

Necesitas Node.js 20.9 o posterior.

```bash
npm install
npm run dev
```

Después abre [http://localhost:3000](http://localhost:3000).

Los comandos disponibles son:

```bash
npm run dev      # servidor de desarrollo
npm run lint     # revisión de TypeScript y ESLint
npm run build    # compilación de producción
npm run start    # ejecuta la compilación de producción
```

## Estructura

```text
app/
  layout.tsx                 metadatos y estructura base
  page.tsx                   recorrido principal y cambio de idioma
components/
  scene/SceneCanvas.tsx      escena 3D, cámara, planetas y modelos NASA
  ui/CinematicLoader.tsx     pantalla de carga de recursos
  ui/MissionConsole.tsx      acceso y modal de la consola
lib/
  cinematic.ts               estado y funciones de interpolación
  i18n.ts                    textos en español e inglés
public/
  dashboard.html             prototipo operativo de rutas y datos NASA
```

## Datos y alcance actual

Jezero es la zona de referencia de esta versión. La imagen del mapa y los recursos 3D provienen de NASA, pero las distancias, tiempos EVA, consumo de oxígeno, niveles de riesgo y puntuaciones de las rutas son valores simulados para demostrar la interfaz.

Las tres rutas de la consola están preparadas manualmente. Todavía no se ejecuta A* sobre un modelo digital de elevación. La siguiente etapa consiste en convertir datos de pendiente, elevación, obstáculos, consumo energético y valor científico en una cuadrícula de costos; A* podrá buscar la ruta y Haversine permitirá comprobar distancias entre coordenadas.

La consola utiliza `DEMO_KEY` para consultar la API de fotografías de rovers. NASA limita la cantidad de solicitudes de esa clave pública, por lo que una sincronización puede fallar aunque el mapa local continúe funcionando.

## Fuentes visuales

- NASA 3D Resources: Tierra, Marte, Perseverance y Mars Reconnaissance Orbiter.
- NASA Mars 2020: imagen orbital de la región de Jezero.
- NASA Mars Rover Photos API: manifiestos y fotografías de rovers.

Los recursos de NASA conservan sus condiciones de uso y atribución. El repositorio contiene el código de integración; los modelos y texturas se cargan desde sus direcciones oficiales.

## Colaboración

Las propuestas deben partir de una rama nueva y explicar qué cambia en la experiencia, los datos o el cálculo de rutas. Antes de abrir un pull request ejecuta:

```bash
npm run lint
npm run build
```

Consulta [CONTRIBUTING.md](CONTRIBUTING.md) para el flujo de trabajo del equipo.
