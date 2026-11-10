# estilo/

Estilo MapLibre (spec v8) de Colportores, uno solo para la app y el panel (ADR-011, ADR-019).

- Se completa en lib-mapa#2: se trae de `backend-supabase/tiles/` con su historia (`src/estilo.mjs`, `paleta.json`). Los ajustes propios sobre `@protomaps/basemaps` (números de puerta de OSM) llegan en lib-mapa#3 (`src/ajustes.mjs`) y los fragmentos de capa compartidos en lib-mapa#4 (`capas/`).
- El JSON se **genera**: nunca se edita a mano el de `dist/`.
- `validar.mjs` corre `gl-style-validate` sobre los estilos generados (`npm run validar-estilo`, también en el CI). Por defecto mira `dist/estilo/*.json`; mientras no haya estilo generado avisa y no falla.
