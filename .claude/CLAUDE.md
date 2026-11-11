# lib-mapa

Libreria compartida del mapa de Colportores (ADR-019): estilo MapLibre (v8), glifos, sprites y tokens de zonas/estados de casa, consumida por el panel de coordinadores y el publicador de `backend-supabase` (npm `github:Colportores/lib-mapa#vX.Y.Z`) y la app movil (pub, dependencia git con tag, `path: dart`). No se despliega sola.

## Stack
- Node 22 + ESM (`.mjs`), tests con `node --test`. Validacion del estilo con `gl-style-validate` (`@maplibre/maplibre-gl-style-spec`).
- Capturas de referencia a z16/z17/z18 con MapLibre Native (`@maplibre/maplibre-gl-native`) sin pantalla: `dockerfile.dev` es Ubuntu 24.04 + Node 22 + Mesa + Xvfb (`npm run capturas`, `npm run capturas:regenerar`; ver la skill `capturas-mapa`).
- Salidas: paquete Dart `colportores_mapa` (`dart/`) y paquete TS (`ts/`, exportado por el `package.json` de la raiz), generados desde `tokens/tokens.json` con `npm run generar-tokens`. Paridad: TS == JSON en `npm test`; Dart == JSON con `dart/tool/paridad.dart` (job `dart` del CI, imagen `dart:3.12`).

## Reglas
- **Docker obligatorio**: nada se instala ni se corre fuera del contenedor.
  - `docker compose -f compose.dev.yml run --rm app npm run check` (tests + `gl-style-validate` + capturas); `npm test` solo los tests.
  - `docker compose -f compose.dev.yml build` solo si cambia `dockerfile.dev`; si cambia `package*.json`, `npm ci` dentro del contenedor (node_modules vive en un volumen).
  - El CI corre lo mismo sobre la imagen de `dockerfile.dev` (Node 22 en los dos).
- **Sin secretos**: nada de claves de servicio, tokens ni acceso a la base. El publicador de tiles, el catalogo y el bucket `mapas` viven en `backend-supabase`.
- **Sin PMTiles completos**: solo una muestra chica de prueba con su NOTICE. Los datos de OSM son ODbL; la atribucion «© OpenStreetMap contributors» no cambia.
- El estilo y los tokens **se generan**: no se edita el JSON de `dist/` ni los `.g.dart`/`.g.ts`.
- Ramas: `feature/<N>-<slug>` desde `develop` -> `develop` (integracion) -> `staging` -> `production` (default del repo), siempre por PR. Squash a `develop`.
- Semver por tag `vX.Y.Z`: major si cambia un id de fuente o de capa que usan los fronts, minor si cambia el aspecto, patch para arreglos. Version en `package.json` y `dart/pubspec.yaml` (iguales) + seccion en `CHANGELOG.md`; el tag dispara `release.yml` (ver «Release» en el README).
- Skills del repo en `.claude/skills/` (`maplibre-estilo`, `protomaps-tiles`, `mapa-tokens`, `capturas-mapa`, `licencias-osm`): cargá las que apliquen antes de tocar el estilo, los tiles, los tokens, las capturas o las licencias.

## Estructura
- `estilo/`: estilo + paleta + ajustes + fragmentos de capa (`capas/`); `validar.mjs` corre `gl-style-validate`.
- `assets/`: glyphs (Noto Sans, OFL) y sprites (Protomaps, MIT).
- `tokens/`: `tokens.json`, la unica fuente de los tokens.
- `generadores/`: generadores de tokens a Dart y TS.
- `dart/`, `ts/`: paquetes que consumen la app y el panel.
- `pruebas/`: tests, fixtures y capturas.

## Documentacion
`docs-organizacion`: ADR-019 (esta libreria), ADR-011 (mapas offline), ADR-016 (repos, capa `lib`).
