# Capturas de lib-mapa#3: números de puerta de OSM

Capturas manuales del estilo con los ajustes de `estilo/src/ajustes.mjs`, mientras no exista la captura automática de lib-mapa#5 (que las reemplaza por las de `pruebas/visual/`).

- Lugar: Pocitos, Montevideo (`-56.1505, -34.9105`), 600 × 600 px, sobre el paquete publicado `paquetes/ciudad/montevideo.97694b7a6c56.pmtiles` (cortado a z15).
- Cómo: MapLibre GL JS 5 en Chromium headless, dentro de un contenedor efímero de `lib-mapa-dev` (glyphs y sprites de `assets/`).

| Archivo | Zoom (MapLibre) | Números de OSM dibujados |
| --- | --- | --- |
| `z15.png` | 15 | 0: todavía no se ven |
| `z16.png` | 16, el zoom de calle | 96 |
| `z17.png` | 17 | 60 |
| `z18.png` | 18 | 46 |
| `z18-cuadrados.png` | 18, con cinco cuadrados de prueba (M·02) sobre números de OSM | 40: donde hay un cuadrado, el número de OSM se esconde |

Las listas («2978,2980,2982,2984,2986,2990,2996», «3174,3176,3174 BIS») se ven enteras.

Los cuadrados de prueba usan `icon-allow-overlap: true` e `icon-ignore-placement: false`: se dibujan siempre y ocupan su lugar, así que el número de OSM que chocaría con ellos no se dibuja.

Datos © OpenStreetMap contributors (ODbL), por Protomaps. Ver `NOTICE.md`.
