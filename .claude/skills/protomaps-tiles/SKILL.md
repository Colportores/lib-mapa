---
name: protomaps-tiles
description: Los tiles vectoriales de Protomaps (esquema basemaps v4) en PMTiles que dibuja lib-mapa: qué capas y propiedades traen, en qué zoom vienen los números de puerta (addr_housenumber, solo z15), cómo se leen con la librería pmtiles y cómo se inspeccionan o recortan con el CLI pmtiles en Docker. Usala al tocar una capa que depende de datos de los tiles, la muestra de pruebas/fixtures o al investigar por qué falta algo en el mapa.
---

# Tiles de Protomaps (PMTiles, esquema v4)

Los mapas salen de OpenStreetMap, cortados por el publicador de `backend-supabase` en archivos PMTiles por ciudad (bucket `mapas`, `catalogo.json`). Este repo **no** corta ni publica tiles (eso tiene secretos): solo los dibuja y guarda una muestra chica de prueba.

## El esquema (basemaps v4, el de `@protomaps/basemaps` 5.x)

Capas vectoriales (source-layer): `earth`, `water`, `landcover`, `landuse`, `natural`, `roads`, `transit`, `buildings`, `places`, `pois`, `boundaries`. Cada feature trae `kind` (y a veces `kind_detail`), `min_zoom` y `name`/`name:<idioma>`.

- **Números de puerta**: van en `buildings`, como **puntos** con `kind: "address"` y la propiedad `addr_housenumber` (texto: puede ser una lista «1528,1530,1532» o «3174 BIS»). La capa del estilo es `address_label` (`NotoSans-Italic`).
- **Solo vienen en las teselas z15** (medido en el PMTiles de Montevideo: 0 en z14). Por eso el corte es siempre a z15 y, si una ciudad no entra en 50 MB, se parte; nunca se baja el zoom máximo (ADR-011, ADR-019, P3).
- `pois` no se dibuja: los sprites `grayscale` no traen sus íconos (`sin_capas` en `estilo/paleta.json`).

## Zoom

Los PMTiles usan el esquema XYZ de 256 px (z15 = 2^15 teselas por lado). MapLibre las dibuja como teselas de 512 px: la tesela z15 cubre el zoom 15 de MapLibre y por encima se estira (overzoom). El zoom de calle (16 en MapLibre) ya ve los números.

## Leerlos desde Node (librería `pmtiles`, devDependency)

```js
import { PMTiles } from 'pmtiles';
const archivo = new PMTiles(fuente);           // fuente: { getKey(), getBytes(offset, length) } o una URL
const cabecera = await archivo.getHeader();     // minZoom, maxZoom, minLon/minLat/maxLon/maxLat, tileCompression
const tesela = await archivo.getZxy(15, x, y);  // { data: ArrayBuffer } ya descomprimido, o undefined si no está
```

`pruebas/visual/renderizar.mjs` tiene una fuente en memoria (`FuenteEnMemoria`) que sirve para un archivo local. Coordenadas de una tesela: `x = floor((lon+180)/360 · 2^z)`, `y = floor((1 − ln(tan φ + sec φ)/π)/2 · 2^z)`.

## CLI `pmtiles` (en Docker, nunca instalado en el host)

Imagen fijada `protomaps/go-pmtiles:v1.28.0`. Desde Git Bash, `MSYS_NO_PATHCONV=1` para que no convierta las rutas.

```sh
P=protomaps/go-pmtiles:v1.28.0
URL=https://<proyecto>.supabase.co/storage/v1/object/public/mapas/paquetes/ciudad/montevideo.<sha12>.pmtiles   # ver catalogo.json
docker run --rm $P show $URL                       # cabecera: zooms, bbox, compresión, metadata
docker run --rm $P tile $URL 15 11272 19792 | wc -c # una tesela (la del centro de Pocitos)
docker run --rm -v "$PWD/pruebas/fixtures:/out" $P extract $URL /out/montevideo-z15-muestra.pmtiles \
  --bbox=-56.157,-34.915,-56.144,-34.906 --minzoom=15 --maxzoom=15
docker run --rm -v "$PWD/pruebas/fixtures:/w" $P verify /w/montevideo-z15-muestra.pmtiles
```

El bucket es público para lectura (sin claves). No subas nada al bucket desde acá.

## La muestra de prueba

`pruebas/fixtures/montevideo-z15-muestra.pmtiles`: cuatro teselas z15 de Pocitos (~210 kB), con su `NOTICE.md` (ODbL). La usan las capturas (`pruebas/visual/`). Reglas:

- **Nunca** un PMTiles completo en el repo (pesa y son datos ODbL): `pruebas/visual.test.mjs` falla si la muestra pasa 1 MB.
- Si la recortás de nuevo (otro build de la ciudad), actualizá el `NOTICE.md` con el archivo de origen y regenerá las capturas de referencia (skill `capturas-mapa`).
