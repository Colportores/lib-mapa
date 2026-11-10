# pruebas/

Tests de la librería (`node --test`, corren en Docker y en el CI con `npm test`).

- `*.test.mjs`: tests del esqueleto, del validador del estilo y del estilo (`estilo.test.mjs`: contraste AA, una sola fuente, sin puntos de interés, glyphs y sprites, versión de la librería en `metadata`).
- `fixtures/`: estilos chicos de prueba para el validador. Desde lib-mapa#5, la muestra chica de Montevideo (`montevideo-z15-muestra.pmtiles`, datos ODbL, con su aviso); nunca PMTiles completos.
- `visual/` (lib-mapa#5): capturas de referencia a z16, z17 y z18.
