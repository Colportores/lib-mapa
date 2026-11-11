# Procedencia de las skills de este repo

Las cinco skills son **propias** de `lib-mapa` (escritas en lib-mapa#5 para el implementador del carril): no vienen de un catálogo de terceros. Resumen lo que ya está decidido en ADR-019 y ADR-011 (`docs-organizacion`), en los issues lib-mapa#1 a #5 y en el código del repo; si algo de acá contradice al código o a un ADR, gana el código o el ADR, y la skill se corrige.

| Skill | Para qué |
|---|---|
| `maplibre-estilo` | Spec v8, expresiones, colisión de símbolos, zoom 512 frente a 256 px (z−1), `gl-style-validate` |
| `protomaps-tiles` | Esquema basemaps v4, `addr_housenumber` solo en z15, librería y CLI `pmtiles`, la muestra de prueba |
| `mapa-tokens` | Sumar o cambiar un token, regenerar, paridad Dart == TS == JSON, versión y tag en los fronts |
| `capturas-mapa` | Capturas con MapLibre Native en Docker (Xvfb + Mesa): correr, regenerar, leer una falla |
| `licencias-osm` | ODbL, OFL, MIT y BSD-3, y dónde se ve la atribución |

Cuando cambie el flujo (otro comando, otra versión de basemaps o de MapLibre Native, una decisión nueva), actualizá la skill en el mismo PR.
