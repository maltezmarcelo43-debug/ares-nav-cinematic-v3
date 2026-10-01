# Colaborar en ARES NAV

## Flujo de trabajo

1. Actualiza `main` antes de comenzar.
2. Crea una rama corta y descriptiva, por ejemplo `feature/elevation-layer` o `fix/mobile-camera`.
3. Mantén cada cambio enfocado en una sola tarea.
4. Ejecuta `npm run lint` y `npm run build`.
5. Abre un pull request con una explicación breve del problema, la solución y la forma en que la comprobaste.

## Criterios del proyecto

- Distingue claramente los datos reales de NASA de los valores simulados por ARES NAV.
- No presentes una estimación del prototipo como una recomendación operativa real.
- Mantén disponibles las versiones en español e inglés cuando agregues texto a la interfaz principal.
- Prueba los cambios de la escena en escritorio y en una pantalla móvil.
- No subas claves privadas, archivos `.env` ni credenciales.

## Convenciones

- Componentes de React en `PascalCase`.
- Funciones y variables en `camelCase`.
- Commits breves escritos como una acción: `Add elevation cost layer`.
- Comentarios solo cuando expliquen una decisión que no resulte evidente en el código.

Si una propuesta cambia los cálculos de ruta, documenta la fórmula, la unidad de cada variable y el origen del conjunto de datos utilizado.
