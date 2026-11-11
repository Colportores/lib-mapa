---
name: licencias-osm
description: Licencias de lo que usa lib-mapa y dónde se ve la atribución: datos de OpenStreetMap (ODbL), letras Noto Sans (OFL), sprites de Protomaps (MIT) y @protomaps/basemaps (BSD-3). Usala antes de sumar un asset, una fuente de datos, una muestra de tiles, una captura publicada o de tocar la atribución, los NOTICE.md o el token atribucion.
---

# Licencias y atribución

| Qué | Licencia | Dónde está el aviso |
|---|---|---|
| Datos de OpenStreetMap (calles, edificios, **números de puerta**) | ODbL 1.0 | `NOTICE.md` (raíz); `pruebas/fixtures/NOTICE.md` para la muestra |
| Letras Noto Sans (glyphs PBF) | SIL OFL 1.1 | `assets/glyphs/OFL.txt`, `assets/NOTICE.md` |
| Sprites `grayscale` de Protomaps (derivados de tangrams/icons) | MIT | `assets/NOTICE.md` (texto completo) |
| `@protomaps/basemaps` (arma las capas del estilo) | BSD-3-Clause | `NOTICE.md` (raíz) |
| Código propio | Uso propio, todos los derechos reservados | `LICENSE` |

`pruebas/esqueleto.test.mjs` falla si el `NOTICE.md` de la raíz pierde «© OpenStreetMap contributors» o alguna de las cuatro licencias, o si el README pierde la atribución.

## La atribución «© OpenStreetMap contributors» no cambia

ODbL pide atribución visible donde se usan los datos. Sale de **un solo lugar**, el token `atribucion` (`tokens/tokens.json`):

| Variante | Dónde se ve |
|---|---|
| `texto`: «© OpenStreetMap contributors» | avisos de licencia, catálogo de mapas (`fuente.atribucion`), NOTICE |
| `corto`: «© OpenStreetMap» | la que dibuja la app sobre el mapa |
| `html`: Protomaps © OpenStreetMap (con links) | `sources.protomaps.attribution` del estilo; la muestra el control de atribución del panel |

No la acortes, no la saques de una vista ni la cambies sin decisión de Cristian.

## Reglas

- **Nunca PMTiles completos** en el repo: pesan y son una base de datos ODbL. Solo la muestra chica (`pruebas/fixtures/montevideo-z15-muestra.pmtiles`, < 1 MB, lo controla `pruebas/visual.test.mjs`), con su `NOTICE.md`: origen, licencia y cómo se recortó. Una muestra es una base derivada: se comparte bajo ODbL.
- **Capturas publicadas** (PR, README, release): llevan la atribución «© OpenStreetMap contributors» en el texto al lado.
- **Asset nuevo** (otra fuente tipográfica, otro rango de glyphs, otra hoja de sprites): solo con licencia que permita redistribuir (OFL, MIT, BSD, Apache); copiá su licencia al lado del archivo, anotá origen y commit en `assets/NOTICE.md` y sumalo a la tabla del `NOTICE.md` de la raíz. Si la licencia no es una de estas, es una decisión (Cristian), no la tomes vos.
- **Dependencia npm nueva que termina en lo que se distribuye** (el estilo, los assets, los paquetes Dart/TS): sumala a `NOTICE.md` con su licencia. Las de desarrollo (validador, capturas) no van.
- **Release**: el tar de recursos (`generadores/release.mjs`) lleva `NOTICE.md` y `NOTICE-assets.md`; no lo armes sin ellos.
- Nada de datos personales, correos, claves ni tokens de servicio en assets, capturas o fixtures (el repo es público).
