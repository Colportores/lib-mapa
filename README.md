# lib-mapa

Libreria compartida del mapa de Colportores: el estilo MapLibre (con los numeros de puerta de OpenStreetMap), los glifos, los sprites y los tokens de zonas y estados de casa. La usan el panel de coordinadores y la app movil, para que los dos dibujen el mismo mapa.

**Estado: v1.1.0** — el estilo, la paleta, los glifos y los sprites (lib-mapa#2), los numeros de puerta de OSM (lib-mapa#3), los tokens con sus paquetes Dart y TS (lib-mapa#4), las capturas de referencia, las skills y la release (lib-mapa#5) y la zona sin color unica, gris #8A94A6 (lib-mapa#12). Los cambios de cada version estan en [CHANGELOG.md](./CHANGELOG.md).

## Contexto

Parte del sistema [Colportores](https://github.com/Colportores). La arquitectura y las decisiones viven en la documentacion de la organizacion (`docs-organizacion`: ADR-019 libreria del mapa, ADR-011 mapas offline).

- El estilo se genera aca (`estilo/src/estilo.mjs` + `estilo/paleta.json`); vino de `backend-supabase/tiles/`, que se queda con el publicador de tiles y los secretos (la historia anterior sigue en ese repo).
- Lo consumen: la app movil (paquete Dart `colportores_mapa`: dependencia git de pub con tag `vX.Y.Z`, ruta `dart`; trae los tokens y el estilo, los glyphs y los sprites en `assets/mapa/`) y el panel y el backend (paquete npm `@colportores/lib-mapa`: `github:Colportores/lib-mapa#vX.Y.Z`, el `package.json` de la raiz exporta `ts/` y `estilo/`).
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
| `generadores/` | Generadores de los tokens a Dart y TypeScript, de la copia de `dart/assets/mapa/` y de la release |
| `dart/` | Paquete Dart `colportores_mapa` (app movil): tokens, contraste de bordes y copia generada del estilo, glyphs y sprites en `dart/assets/mapa/` |
| `ts/` | Paquete TypeScript (panel y publicador): tokens, fragmentos de capa y contraste de bordes |
| `pruebas/` | Tests, fixtures (con la muestra chica de Montevideo) y capturas de referencia (`visual/`) |
| `.claude/skills/` | Skills del repo para quien lo trabaja con Claude Code (ver `PROCEDENCIA.md`) |

## Desarrollo

Todo corre en Docker (`dockerfile.dev`: Ubuntu 24.04 con Node 22, Mesa y Xvfb para las capturas; la misma imagen que usa el CI):

```sh
docker compose -f compose.dev.yml build                       # solo si cambia dockerfile.dev
docker compose -f compose.dev.yml run --rm app npm ci         # si cambia package-lock.json (node_modules vive en un volumen)
docker compose -f compose.dev.yml run --rm app npm test       # tests
docker compose -f compose.dev.yml run --rm app npm run check  # tests + tokens y dart/assets/mapa/ al dia + typecheck + genera dist/estilo/ y dist/capas/ + gl-style-validate + capturas
docker compose -f compose.dev.yml run --rm app npm run generar-tokens  # tokens/tokens.json -> dart/lib/tokens.g.dart y ts/src/*.g.ts
docker compose -f compose.dev.yml run --rm app npm run generar-assets-dart  # estilo/ y assets/ -> dart/assets/mapa/ (la copia para la app)
docker compose -f compose.dev.yml run --rm app npm run capturas            # capturas z16/z17/z18 contra pruebas/visual/referencia/
docker compose -f compose.dev.yml run --rm app npm run capturas:regenerar  # cuando el cambio de aspecto es a proposito
docker compose -f compose.dev.yml run --rm app node estilo/src/cli.mjs --url-base <URL donde van los glyphs y sprites>
```

Ramas: `feature/* -> develop -> staging -> production` (integracion en `develop`, default `production`), siempre por PR.

## Release

Cada release es un tag `vX.Y.Z` (semver, ADR-019: ver [CHANGELOG.md](./CHANGELOG.md)); los fronts usan el tag, nada se publica en npm ni en pub.dev.

1. En el PR: subir la version en `package.json` y en `dart/pubspec.yaml` (las dos iguales) y sumar su seccion `## [X.Y.Z]` al `CHANGELOG.md`. El CI arma la release sin publicarla (`npm run armar-release`) y falla si algo no coincide.
2. Despues del merge, el orquestador sube el tag `vX.Y.Z` sobre el commit del squash en `develop`, apenas mergea y con el CI verde (`git tag vX.Y.Z <sha> && git push origin vX.Y.Z`); la promocion a `staging` y `production` sigue despues por PR y no mueve el tag.
3. El workflow `release.yml` corre el check completo con ese tag y publica la release de GitHub con `colportores.json` (el estilo, con `https://REEMPLAZAR/estilo` y `pmtiles://REEMPLAZAR` para que cada destino ponga los suyos), `lib-mapa-recursos-vX.Y.Z.tar.gz` (estilo, glyphs, sprites y avisos de licencia) y las notas del CHANGELOG.
4. Cada front sube el tag en su propio PR (skill `mapa-tokens`).

## Licencias y atribucion

Los mapas se dibujan con datos de © OpenStreetMap contributors (ODbL). Los avisos de terceros (ODbL, OFL, MIT, BSD-3) estan en [NOTICE.md](./NOTICE.md).

## Licencia

Uso propio — todos los derechos reservados. Ver [LICENSE](./LICENSE).
