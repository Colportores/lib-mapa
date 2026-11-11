---
name: maplibre-estilo
description: Cambiar o revisar el estilo MapLibre de lib-mapa (spec v8): capas de @protomaps/basemaps, paleta, ajustes (address_label), expresiones, colisión de símbolos, orden de capas, zoom de MapLibre (512 px) frente al de OSM/flutter_map (256 px) y validación con gl-style-validate. Usala antes de tocar estilo/src/, estilo/paleta.json o estilo/capas/.
---

# Estilo MapLibre de lib-mapa

Un solo estilo para la app y el panel (ADR-011, ADR-019). **Se genera**: nunca se edita `dist/estilo/colportores.json` a mano.

## Dónde está cada cosa

| Archivo | Qué decide |
|---|---|
| `estilo/src/estilo.mjs` | `armarEstilo({ urlBase, paleta, version? })`: capas de `@protomaps/basemaps` (versión fijada en `package.json`) con la paleta, `metadata` (`colportores:estilo` = versión de la librería), fuente `protomaps` con `url: pmtiles://REEMPLAZAR`, glyphs y sprite bajo `urlBase` |
| `estilo/paleta.json` | Colores del canvas (vistas 06 y 24) sobre el flavor `light`, idioma de los rótulos y capas que no se dibujan (`sin_capas`) |
| `estilo/src/ajustes.mjs` | Lo que la paleta no alcanza (desde qué zoom, tamaño, halo). Hoy: `address_label`. Si basemaps deja de traer una capa ajustada, `armarEstilo` falla |
| `estilo/capas/capas.mjs` | Fragmentos propios que van ENCIMA (zonas, casas de lejos, grupos), con ids fijos `colportores-*`/`colportores:*` |

La firma de `armarEstilo` es la que usa el publicador de `backend-supabase` (#256): no la cambies sin coordinar.

## Reglas del spec v8 que más se usan acá

- **Zoom de MapLibre = zoom de OSM/flutter_map − 1.** MapLibre usa teselas de 512 px; OSM Carto, el prototipo y flutter_map, de 256 px. El «z17 del prototipo» es el **z16** de MapLibre (`zoom.calle` y `zoom.numerosDePuerta` en los tokens). Escribí siempre los zooms en escala MapLibre.
- **Overzoom**: los PMTiles se cortan a z15 (ADR-011); por encima, MapLibre estira las teselas z15. Un `minzoom` 16 en una capa no pide teselas nuevas, solo decide desde cuándo se dibuja.
- **Expresiones**: `['get', 'prop']`, `['match', input, v1, out1, ..., fallback]`, `['case', cond, a, b]`, `['step', ['zoom'], ...]`, `['interpolate', ['linear'], ['zoom'], z1, v1, ...]`. `['zoom']` solo puede ir como entrada de un `step`/`interpolate` de primer nivel. Los fragmentos usan `['boolean', ['get', 'elegida'], false]` para no fallar con propiedades ausentes.
- **`text-max-width`** está en ems; la coma **no** es punto de corte: «1528,1530» queda en una línea. `split`/`join` existen en el spec pero no se usan (soporte dudoso en MapLibre Native del móvil).
- **Fuentes**: los `text-font` tienen que existir en `assets/glyphs/` (`NotoSans-Regular`, `NotoSans-Medium`, `NotoSans-Italic`, sin espacios). Solo hay tres rangos (0-255, 256-511, 8192-8447): otro alfabeto sale sin esos caracteres.

## Colisión de símbolos (por qué un número se ve o no)

- Las capas `symbol` se ubican **de arriba hacia abajo**: la que está más arriba en `layers` gana el lugar. Por eso nuestras capas van al final y el cuadrado M·02 esconde el número de OSM que choca.
- `text-allow-overlap` / `icon-allow-overlap`: se dibuja aunque choque. `*-ignore-placement`: no ocupa lugar (los demás pueden dibujarse encima). El cuadrado M·02 del panel usa `allow-overlap: true` + `ignore-placement: false`; el del móvil hoy usa `icon-ignore-placement: true` (el número de OSM queda abajo; ver PR #8).
- Dentro de una capa, `symbol-sort-key` decide quién se ubica primero (menor primero). `symbol-z-order` solo cambia el orden de dibujo.
- Ningún símbolo de basemaps tiene allow-overlap ni ignore-placement: no los agregues sin decisión.

## Contraste

Rótulos AA 4,5:1 y bordes 3:1 contra `contraste.fondosDelMapa` (tokens). `address_label` usa `#5B6B82` sobre `#F6F5F0`. **Cambiar un color es decisión de Cristian**: dejala pendiente, no la tomes vos.

## Validar y probar (siempre en Docker)

```sh
docker compose -f compose.dev.yml run --rm -T app npm run check
# = npm test + comprobar-tokens + typecheck + generar-estilo + generar-capas + validar-estilo (gl-style-validate) + capturas
```

- `npm run validar-estilo` corre `gl-style-validate` sobre `dist/estilo/` y `dist/capas/`. En los tests se usa `validateStyleMin` de `@maplibre/maplibre-gl-style-spec`.
- Tests: `pruebas/estilo.test.mjs` (AA, una sola fuente, sin POIs, glyphs y sprites, metadata), `pruebas/ajustes.test.mjs`, `pruebas/capas.test.mjs`.
- Si cambia el aspecto, las capturas fallan a propósito: regeneralas (skill `capturas-mapa`) y poné las imágenes en el PR.
- Versionado: cambiar un id de fuente o de capa que usan los fronts es **major**; cambiar el aspecto, **minor** (ver `CHANGELOG.md`).
