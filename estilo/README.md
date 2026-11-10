# estilo/

Estilo MapLibre (spec v8) de Colportores, uno solo para la app y el panel (ADR-011, ADR-019).

- `src/estilo.mjs`: arma el estilo (`armarEstilo({ urlBase, paleta })`) con las capas de `@protomaps/basemaps` (fijado en el `package.json`) pintadas con `paleta.json`. `metadata["colportores:estilo"]` lleva la versión de la librería.
- `paleta.json`: los colores del canvas (vistas 06 y 24) y las capas que no se dibujan (`sin_capas`).
- `src/cli.mjs`: escribe `colportores.json` (`node estilo/src/cli.mjs --url-base URL [--salida DIR]`). `npm run generar-estilo` lo genera en `dist/estilo/` con `https://REEMPLAZAR/estilo`, solo para validarlo; el publicador de backend-supabase pasa la URL de su bucket.
- Vino de `backend-supabase/tiles/` en lib-mapa#2 (copiado, sin la historia: el repo es público; la historia queda en backend-supabase, `git log --follow tiles/src/estilo.mjs`). Los ajustes propios sobre `@protomaps/basemaps` (números de puerta de OSM) llegan en lib-mapa#3 (`src/ajustes.mjs`) y los fragmentos de capa compartidos en lib-mapa#4 (`capas/`).
- El JSON se **genera**: nunca se edita a mano el de `dist/`.
- `validar.mjs` corre `gl-style-validate` sobre los estilos generados (`npm run validar-estilo`, también en el CI). Por defecto mira `dist/estilo/*.json` (sin estilo generado avisa y no falla; `npm run check` y el CI lo generan antes).
