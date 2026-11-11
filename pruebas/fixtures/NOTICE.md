# Aviso de la muestra de Montevideo

`montevideo-z15-muestra.pmtiles` es una muestra chica (cuatro teselas z15 de Pocitos, ~210 kB) para las capturas
de `pruebas/visual/` (lib-mapa#5). No es un mapa para usar: los PMTiles completos viven en el bucket `mapas` de
`backend-supabase` (ADR-011).

- **Datos**: © OpenStreetMap contributors, bajo la [Open Database License (ODbL) 1.0](https://opendatacommons.org/licenses/odbl/1-0/).
  Ver <https://www.openstreetmap.org/copyright>. La muestra es una base de datos derivada: se comparte bajo la misma licencia.
- **Teselas**: esquema de [Protomaps](https://protomaps.com) (basemaps v4), cortado por el publicador de `backend-supabase`.
- **De dónde sale**: el paquete publicado `paquetes/ciudad/montevideo.97694b7a6c56.pmtiles` (build `20261028`), recortado con
  el CLI de PMTiles (`protomaps/go-pmtiles:v1.28.0`):

  ```sh
  pmtiles extract <bucket>/mapas/paquetes/ciudad/montevideo.97694b7a6c56.pmtiles montevideo-z15-muestra.pmtiles \
    --bbox=-56.157,-34.915,-56.144,-34.906 --minzoom=15 --maxzoom=15
  ```

La atribución «© OpenStreetMap contributors» va en toda captura que se publique con estos datos.
