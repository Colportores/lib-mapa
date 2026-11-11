# Cambios

Lo que cambia en cada release de `lib-mapa` (tag `vX.Y.Z`). Los fronts suben el tag a mano: la app en su `pubspec.yaml` (`ref:`), el panel y el publicador de `backend-supabase` en su `package.json` (`github:Colportores/lib-mapa#vX.Y.Z`).

## Cómo se numera (semver, ADR-019)

- **major**: cambia un id de fuente o de capa que usan los fronts (`protomaps`, `colportores-*`, `colportores:*`, los ids de las capas de basemaps que tocan `estilo_mapa.dart` o el panel), o se quita o se renombra un token o un export.
- **minor**: cambia el aspecto (paleta, ajustes, un token con otro valor, una capa nueva) o se suma un token o un export.
- **patch**: un arreglo que no cambia el aspecto ni los ids.

La versión va en `package.json` y en `dart/pubspec.yaml` (las dos iguales) y dentro del estilo (`metadata["colportores:estilo"]`). Cómo sacar una release: ver «Release» en el [README](./README.md#release).

## [1.1.0] - 2026-11-11

### Cambiado

- `zonaSinColor` es un solo valor, el gris `#8A94A6` («sin color»), para el panel y el móvil (decisión de Cristian del 11/11, lib-mapa#12). Antes era `{ pendiente, panel, movil }`: ahora `TokensMapa.zonaSinColor` (Dart) es un `int` y `ZONA_SIN_COLOR` (TS) un `"#8A94A6"`. En la app, una zona sin color pasa de azul (#13407A) a gris: deja de leer `.movil` (front-colportores-mobile#695); el panel toma el token en vez de su constante (front-coordinadores-web#176). El borde sigue por `bordeDeZona` (3:1). `ValorPendiente` se sigue exportando para el próximo valor sin decidir.

### Decidido

- El aspecto de los fragmentos de capa (P4 de lib-mapa#4): cada app con su diseño aprobado. Los fragmentos quedan con el aspecto del panel (más el rótulo de zona, común) y el móvil sigue con los suyos; nada cambia en esta librería.

## [1.0.0] - 2026-11-10

Primera release: lo que dibuja el mapa de Colportores, en un solo lugar para la app, el panel y el publicador (ADR-019).

### Agregado

- Estilo MapLibre v8 de Colportores (`estilo/src/estilo.mjs`), uno solo para la app y el panel, armado con `@protomaps/basemaps` 5.7.2 y la paleta del canvas; traído de `backend-supabase/tiles/` sin cambiar el aspecto (lib-mapa#2).
- Glyphs Noto Sans (OFL) y sprites `grayscale` de Protomaps (MIT) en `assets/` (lib-mapa#2).
- Números de puerta de OSM (`address_label`) desde el zoom 16 de MapLibre, letra 11, halo 1,5, color AA `#5B6B82` (lib-mapa#3).
- Tokens del mapa en `tokens/tokens.json` (estados de casa, paleta de zonas, zona sin color, contraste, zooms, grupos y atribución), generados a Dart (`dart/`, paquete `colportores_mapa`) y a TypeScript (`ts/`), con test de paridad (lib-mapa#4).
- Fragmentos de capa (zonas, casas de lejos y grupos) con ids fijos `colportores-*` y `colportores:*`, y casos de prueba del catálogo de mapas (lib-mapa#4).
- Capturas de referencia a z16, z17 y z18 con MapLibre Native en Docker sobre una muestra chica de Montevideo (`npm run capturas`), skills del repo en `.claude/skills/` y workflow de release (lib-mapa#5).
- El estilo, los glyphs, los sprites y los avisos de licencia dentro del paquete Dart (`dart/assets/mapa/`, declarados en `flutter: assets:`): la app los lee como `packages/colportores_mapa/assets/mapa/…` (P1 de lib-mapa#5, ADR-019). Es una copia generada (`npm run generar-assets-dart`) con test de desfase.
- `bordeDeZona` en TS (`@colportores/lib-mapa/contraste`) y Dart (`ContrasteMapa`): el borde de una zona oscurecido hasta 3:1 sobre la tierra y los parques, la misma regla que `ColoresZona.borde` del móvil, con casos en `pruebas/contraste/casos.json` para los dos lados. El fragmento `colportores:zonas-borde` dibuja la propiedad `borde` de cada zona (y `color` si no la trae) (P1 de la revisión de lib-mapa#4).
- `zoom.maximo` = 19 (escala MapLibre) en las dos apps y franja clara de «Entrega y pago» #4D76B1 (AA) en las dos (P2 y P3 de lib-mapa#4, decididas el 10/11).

### Pendiente de decisión

- `zonaSinColor` va como `{ pendiente, panel, movil }` (gris #8A94A6 en el panel, azul #13407A en el móvil): cada front usa su valor hasta que se decida (front-coordinadores-web#148).
- Que la app dibuje con los fragmentos de capa (zonas, casas de lejos, grupos): hoy tienen el aspecto del panel y el móvil sigue con los suyos (P4 de lib-mapa#4).

[1.1.0]: https://github.com/Colportores/lib-mapa/releases/tag/v1.1.0
[1.0.0]: https://github.com/Colportores/lib-mapa/releases/tag/v1.0.0
