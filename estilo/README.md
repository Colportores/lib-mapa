# estilo/

Estilo MapLibre (spec v8) de Colportores, uno solo para la app y el panel (ADR-011, ADR-019).

- `src/estilo.mjs`: arma el estilo (`armarEstilo({ urlBase, paleta })`) con las capas de `@protomaps/basemaps` (fijado en el `package.json`) pintadas con `paleta.json`. `metadata["colportores:estilo"]` lleva la versión de la librería.
- `src/ajustes.mjs`: lo que la paleta no alcanza a decir sobre las capas de basemaps (desde qué zoom, tamaño, halo). Hoy, los números de puerta de OSM (`address_label`): desde z16 de MapLibre (el token `zoom.numerosDePuerta`), letra 11, halo 1,5 (lib-mapa#3, ADR-019). Si basemaps deja de traer una capa ajustada, armar el estilo falla.
- `paleta.json`: los colores del canvas (vistas 06 y 24) y las capas que no se dibujan (`sin_capas`).
- `src/cli.mjs`: escribe `colportores.json` (`node estilo/src/cli.mjs --url-base URL [--salida DIR]`). `npm run generar-estilo` lo genera en `dist/estilo/` con `https://REEMPLAZAR/estilo`, solo para validarlo; el publicador de backend-supabase pasa la URL de su bucket.
- Vino de `backend-supabase/tiles/` en lib-mapa#2 (copiado, sin la historia: el repo es público; la historia queda en backend-supabase, `git log --follow tiles/src/estilo.mjs`). Los fragmentos de capa están en `capas/`.
- El JSON se **genera**: nunca se edita a mano el de `dist/`.
- `capas/capas.mjs`: los fragmentos de capa que se dibujan encima del estilo (lib-mapa#4): zonas (relleno, borde y rótulo), casas de lejos por estado y grupos, con ids de fuente y de capa fijos (`colportores-*` y `colportores:*`) y los colores de `tokens/tokens.json`. El aspecto es el del panel, que es quien los usa (ADR-019); el rótulo de zona, el del móvil. Se generan a `ts/src/capas.g.ts`; `npm run generar-capas` escribe un estilo de prueba con todos en `dist/capas/` para validarlos.
- `validar.mjs` corre `gl-style-validate` sobre los estilos generados (`npm run validar-estilo`, también en el CI). Por defecto mira `dist/estilo/*.json` y `dist/capas/*.json` (sin nada generado avisa y no falla; `npm run check` y el CI los generan antes).
