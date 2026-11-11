# Cambios

Lo que cambia en cada release de `lib-mapa` (tag `vX.Y.Z`). Los fronts suben el tag a mano: la app en su `pubspec.yaml` (`ref:`), el panel y el publicador de `backend-supabase` en su `package.json` (`github:Colportores/lib-mapa#vX.Y.Z`).

## Cómo se numera (semver, ADR-019)

- **major**: cambia un id de fuente o de capa que usan los fronts (`protomaps`, `colportores-*`, `colportores:*`, los ids de las capas de basemaps que tocan `estilo_mapa.dart` o el panel), o se quita o se renombra un token o un export.
- **minor**: cambia el aspecto (paleta, ajustes, un token con otro valor, una capa nueva) o se suma un token o un export.
- **patch**: un arreglo que no cambia el aspecto ni los ids.

La versión va en `package.json` y en `dart/pubspec.yaml` (las dos iguales) y dentro del estilo (`metadata["colportores:estilo"]`). Cómo sacar una release: ver «Release» en el [README](./README.md#release).

## [1.0.0] - 2026-11-10

Primera release: lo que dibuja el mapa de Colportores, en un solo lugar para la app, el panel y el publicador (ADR-019).

### Agregado

- Estilo MapLibre v8 de Colportores (`estilo/src/estilo.mjs`), uno solo para la app y el panel, armado con `@protomaps/basemaps` 5.7.2 y la paleta del canvas; traído de `backend-supabase/tiles/` sin cambiar el aspecto (lib-mapa#2).
- Glyphs Noto Sans (OFL) y sprites `grayscale` de Protomaps (MIT) en `assets/` (lib-mapa#2).
- Números de puerta de OSM (`address_label`) desde el zoom 16 de MapLibre, letra 11, halo 1,5, color AA `#5B6B82` (lib-mapa#3).
- Tokens del mapa en `tokens/tokens.json` (estados de casa, paleta de zonas, zona sin color, contraste, zooms, grupos y atribución), generados a Dart (`dart/`, paquete `colportores_mapa`) y a TypeScript (`ts/`), con test de paridad (lib-mapa#4).
- Fragmentos de capa (zonas, casas de lejos y grupos) con ids fijos `colportores-*` y `colportores:*`, y casos de prueba del catálogo de mapas (lib-mapa#4).
- Capturas de referencia a z16, z17 y z18 con MapLibre Native en Docker sobre una muestra chica de Montevideo (`npm run capturas`), skills del repo en `.claude/skills/` y workflow de release (lib-mapa#5).

### Pendiente de decisión

- `zonaSinColor`, `zoom.maximo` y la franja clara de «Entrega y pago» van como `{ pendiente, panel, movil }`: cada front usa su valor hasta que se decida (lib-mapa#4).

[1.0.0]: https://github.com/Colportores/lib-mapa/releases/tag/v1.0.0
