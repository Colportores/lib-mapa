# pruebas/

Tests de la librería (`node --test`, corren en Docker y en el CI con `npm test`).

- `*.test.mjs`: tests del esqueleto, del validador del estilo y del estilo (`estilo.test.mjs`: contraste AA, una sola fuente, sin puntos de interés, glyphs y sprites, versión de la librería en `metadata`).
- `ajustes.test.mjs`: los ajustes propios sobre basemaps (números de puerta de OSM desde z16, letra 11, halo 1,5, AA, sin tapar nuestras capas).
- `tokens.test.mjs`: los tokens (forma, contraste, valores pendientes), los `.g.` al día y la paridad TS == JSON (la de Dart == JSON es `dart/tool/paridad.dart`).
- `contraste.test.mjs` + `contraste/casos.json`: `bordeDeZona` (borde de zona con 3:1 sobre el mapa) y la paleta de zonas contra `contraste.bordes`; el lado Dart corre los mismos casos con `dart/tool/contraste.dart`. `ayudas/ts-sin-extension.mjs` deja importar `ts/src/` (imports sin extensión) desde los tests.
- `assets-dart.test.mjs`: la copia de `dart/assets/mapa/` al día y declarada en `flutter: assets:`.
- `capas.test.mjs`: los fragmentos de capa (spec v8, ids fijos, colores de los tokens, agrupado).
- `catalogo/`: casos de prueba del catálogo de mapas (`casos.json` y `catalogo-de-ejemplo.json`: elegir el paquete por `ambito_id`, partes, URL relativa) para que los corran el panel y la app; `catalogo.test.mjs` los corre contra un traslado de la lógica de cada uno.
- `release.test.mjs`: una sola versión (package.json, `dart/pubspec.yaml` y el estilo), la sección del CHANGELOG y el workflow de release (lib-mapa#5).
- `visual.test.mjs`: lo que las capturas necesitan y se prueba sin pantalla: la comparación con tolerancia, la muestra y su aviso, las vistas y sus referencias, el estilo que se dibuja.
- `visual/` (lib-mapa#5): capturas de referencia a z16, z17 y z18 (y dos con los fragmentos de capa encima), dibujadas con MapLibre Native en Docker (Xvfb + Mesa) y comparadas con tolerancia. `npm run capturas` compara y `npm run capturas:regenerar` reescribe las referencias; si una no coincide, la nueva y las diferencias quedan en `dist/capturas/`. Detalle en la skill `capturas-mapa`.
- `fixtures/`: estilos chicos de prueba para el validador y la muestra chica de Montevideo (`montevideo-z15-muestra.pmtiles`: cuatro teselas z15 de Pocitos, datos ODbL, con su [NOTICE.md](./fixtures/NOTICE.md)); nunca PMTiles completos.

Datos de las capturas y de la muestra: © OpenStreetMap contributors (ODbL).
