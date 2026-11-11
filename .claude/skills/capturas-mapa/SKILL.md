---
name: capturas-mapa
description: Capturas de referencia del mapa de lib-mapa con MapLibre Native (@maplibre/maplibre-gl-native) sin pantalla en Docker (Xvfb + Mesa): correrlas, leer una falla, regenerar las referencias cuando el cambio de aspecto es a propósito, sumar una vista y ponerlas en el PR. Usala cuando cambie el estilo, la paleta, los ajustes, los fragmentos o los tokens, o cuando falle el paso «Capturas» del CI.
---

# Capturas del mapa (pruebas/visual/)

El estilo se dibuja con **MapLibre Native** (el mismo motor que usa la app, `maplibre_gl` en Android/iOS) dentro de la imagen de `dockerfile.dev`, a z16, z17 y z18 sobre la muestra chica de Montevideo, y se compara con las referencias commiteadas con tolerancia.

## Piezas

| Archivo | Qué hace |
|---|---|
| `pruebas/visual/vistas.mjs` | Las vistas (`z16`, `z17`, `z18`, `z16-capas`, `z18-capas`), el centro (Pocitos, `-56.1505, -34.9105`), el tamaño (600 × 600, densidad 1) y la zona y las casas de prueba de las `-capas` |
| `pruebas/visual/renderizar.mjs` | Arma el estilo de la librería apuntado a la muestra y lo dibuja; responde los pedidos de MapLibre con archivos locales (teselas de la muestra, `assets/glyphs`, `assets/sprites`): **nunca** usa la red |
| `pruebas/visual/comparar.mjs` | pixelmatch con `UMBRAL` 0,1 por píxel y `MAXIMO_DISTINTOS` 0,5 % de la imagen |
| `pruebas/visual/capturas.mjs` | El CLI: compara o regenera |
| `pruebas/visual/referencia/*.png` | Las referencias |
| `pruebas/visual.test.mjs` | Lo que se prueba sin pantalla (en `npm test`): la comparación, la muestra y su aviso, las vistas y sus referencias, el estilo de las capturas |

## Correrlas (siempre en Docker)

```sh
docker compose -f compose.dev.yml run --rm -T app sh -c 'npm ci && npm run capturas'
docker compose -f compose.dev.yml run --rm -T app sh -c 'npm run capturas:regenerar'      # a propósito
docker compose -f compose.dev.yml run --rm -T app sh -c 'npm run capturas -- --solo z18'
```

- Los scripts ya llaman a `xvfb-run -a`. **No pongas `xvfb-run` como proceso 1 del contenedor** (`docker run … xvfb-run node …`): se queda colgado al terminar. Usá `npm run …` o `sh -c '…'`.
- `npm run check` las corre al final; el CI, en el paso «Capturas z16, z17 y z18».
- Las cinco vistas tardan unos segundos; MapLibre Native dibuja con Mesa (llvmpipe, por software): no hace falta GPU.

## Cuando fallan

1. Leé el porcentaje: `✗ z16: 12072 píxeles distintos (3.353 %, tope 0.500 %)`.
2. Mirá `dist/capturas/<vista>.png` (la nueva) y `<vista>.diferencias.png` (en rojo lo que cambió). En el CI están en el artefacto `capturas` del run.
3. ¿El cambio es a propósito (paleta, ajuste, token, versión de basemaps)? Regenerá, revisá las imágenes una por una, commitealas y ponelas en el PR. ¿No lo es? Es un bug: arreglalo, no regeneres.

Referencias de sensibilidad (medidas en lib-mapa#5): sacar los números de OSM da 3,35 % a z16 y 1,63 % a z18; letra 12 en vez de 11, 3,58 %. Un cambio de color muy chico (por ejemplo, el fondo `#F6F5F0` → `#F2F1EC`) queda **debajo** del umbral: los colores los cuidan los tests de la paleta y de los tokens.

Para medir qué ve la comparación con un cambio a mano: `renderizar(vista, { modificar: (estilo) => { … } })` y `comparar(png, referencia)`, desde un script en `dist/` (gitignored).

## Sumar una vista

Agregala en `VISTAS` (`nombre` único; el zoom en escala MapLibre), regenerá solo esa (`--solo <nombre>`) y commiteá el PNG. Si necesita otro lugar, el centro tiene que caer dentro de la muestra (o recortá otra: skill `protomaps-tiles`).

## En el PR

Cuando cambia el aspecto, poné las capturas en el cuerpo del PR, con link al commit (no a la rama, que se borra):
`![z16](https://github.com/Colportores/lib-mapa/raw/<sha>/pruebas/visual/referencia/z16.png)`, y la atribución «© OpenStreetMap contributors» (skill `licencias-osm`).

## La imagen

`dockerfile.dev` es Ubuntu 24.04 porque el binario precompilado de `@maplibre/maplibre-gl-native` 6.x pide glibc 2.38, ICU 74 y libjpeg-turbo 8. Node 22 se copia de la imagen oficial. Si subís `@maplibre/maplibre-gl-native`, mirá con `ldd node_modules/@maplibre/maplibre-gl-native/lib/*/mbgl.node | grep 'not found'` si la imagen alcanza, y regenerá las referencias si el dibujo cambia.
