# lib-mapa

Libreria compartida del mapa de Colportores: el estilo MapLibre (con los numeros de puerta de OpenStreetMap), los glifos, los sprites y los tokens de zonas y estados de casa. La usan el panel de coordinadores y la app movil, para que los dos dibujen el mismo mapa.

**Estado: en construccion** — el estilo, la paleta, los glifos y los sprites (lib-mapa#2), los numeros de puerta de OSM (lib-mapa#3) y los tokens con sus paquetes Dart y TS (lib-mapa#4) ya estan aca; falta la primera release (lib-mapa#5).

## Contexto

Parte del sistema [Colportores](https://github.com/Colportores). La arquitectura y las decisiones viven en la documentacion de la organizacion (`docs-organizacion`: ADR-019 libreria del mapa, ADR-011 mapas offline).

- El estilo se genera aca (`estilo/src/estilo.mjs` + `estilo/paleta.json`); vino de `backend-supabase/tiles/`, que se queda con el publicador de tiles y los secretos (la historia anterior sigue en ese repo).
- Lo consumen: la app movil (paquete Dart `colportores_mapa`: dependencia git de pub con tag `vX.Y.Z`, ruta `dart`) y el panel y el backend (paquete npm `@colportores/lib-mapa`: `github:Colportores/lib-mapa#vX.Y.Z`, el `package.json` de la raiz exporta `ts/` y `estilo/`).
- Stack: Node 22 para el estilo y los tokens; salidas en Dart y TypeScript.

## Lo que este repo no puede hacer

- No guarda secretos, claves de servicio ni acceso a la base: el publicador de tiles y el bucket `mapas` viven en `backend-supabase`.
- No guarda PMTiles completos (pesan y son datos ODbL): solo una muestra chica de prueba con su aviso.
- No contiene codigo de interfaz (widgets Flutter, componentes React): cada front mantiene el suyo.

## Estructura

| Carpeta | Que tiene |
|---|---|
| `estilo/` | Estilo MapLibre v8, paleta, ajustes y fragmentos de capa; `validar.mjs` (`gl-style-validate`) |
| `assets/` | Glyphs Noto Sans (OFL) y sprites de Protomaps (MIT) |
| `tokens/` | `tokens.json`, la unica fuente de los tokens |
| `generadores/` | Generadores de los tokens a Dart y TypeScript |
| `dart/` | Paquete Dart `colportores_mapa` (app movil) |
| `ts/` | Paquete TypeScript (panel y publicador) |
| `pruebas/` | Tests, fixtures y capturas |

## Desarrollo

Todo corre en Docker (Node 22, el mismo que usa el CI):

```sh
docker compose -f compose.dev.yml build                       # solo si cambia dockerfile.dev
docker compose -f compose.dev.yml run --rm app npm ci         # si cambia package-lock.json (node_modules vive en un volumen)
docker compose -f compose.dev.yml run --rm app npm test       # tests
docker compose -f compose.dev.yml run --rm app npm run check  # tests + tokens al dia + typecheck + genera dist/estilo/ y dist/capas/ + gl-style-validate
docker compose -f compose.dev.yml run --rm app npm run generar-tokens  # tokens/tokens.json -> dart/lib/tokens.g.dart y ts/src/*.g.ts
docker compose -f compose.dev.yml run --rm app node estilo/src/cli.mjs --url-base <URL donde van los glyphs y sprites>
```

Ramas: `feature/* -> develop -> staging -> production` (integracion en `develop`, default `production`), siempre por PR.

## Licencias y atribucion

Los mapas se dibujan con datos de © OpenStreetMap contributors (ODbL). Los avisos de terceros (ODbL, OFL, MIT, BSD-3) estan en [NOTICE.md](./NOTICE.md).

## Licencia

Uso propio — todos los derechos reservados. Ver [LICENSE](./LICENSE).
