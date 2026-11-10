# pruebas/

Tests de la librería (`node --test`, corren en Docker y en el CI con `npm test`).

- `*.test.mjs`: tests del esqueleto, del validador del estilo y del estilo (`estilo.test.mjs`: contraste AA, una sola fuente, sin puntos de interés, glyphs y sprites, versión de la librería en `metadata`).
- `ajustes.test.mjs`: los ajustes propios sobre basemaps (números de puerta de OSM desde z16, letra 11, halo 1,5, AA, sin tapar nuestras capas).
- `capturas/lib-mapa-3/`: capturas manuales a z15–z18 de los números de puerta de OSM, hasta que lib-mapa#5 traiga las automáticas.
- `fixtures/`: estilos chicos de prueba para el validador. Desde lib-mapa#5, la muestra chica de Montevideo (`montevideo-z15-muestra.pmtiles`, datos ODbL, con su aviso); nunca PMTiles completos.
- `visual/` (lib-mapa#5): capturas de referencia a z16, z17 y z18.
