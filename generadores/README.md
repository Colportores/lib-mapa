# generadores/

Scripts Node que generan, a partir de `tokens/tokens.json` y de los fragmentos de `estilo/capas/`, los archivos de cada front (lib-mapa#4):

- `dart/lib/tokens.g.dart`: constantes `const` de Dart puro (`dart.mjs`). Colores como enteros ARGB, números como `double`, un valor sin decidir como `ValorPendiente<T>`.
- `ts/src/tokens.g.ts` y `ts/src/capas.g.ts`: objetos `as const` (`ts.mjs`).

```sh
npm run generar-tokens     # escribe los tres
npm run comprobar-tokens   # falla si alguno no está al día (lo corre el CI)
```

Los `.g.` se commitean (los fronts los usan por tag git sin correr nada) y **no se editan a mano**: `pruebas/tokens.test.mjs` los regenera y compara, y prueba la paridad TS == JSON; `dart/tool/paridad.dart`, la de Dart == JSON.

## Release

`release.mjs` (`npm run armar-release [-- --tag vX.Y.Z]`) arma en `dist/release/` los archivos de la release (lib-mapa#5): `colportores.json`, `lib-mapa-recursos-vX.Y.Z.tar.gz` (estilo, glyphs, sprites y avisos de licencia) y `NOTAS.md` (la sección del `CHANGELOG.md`). Falla si el tag no es la versión del `package.json` y de `dart/pubspec.yaml`, o si falta la sección del CHANGELOG. El CI lo corre en cada PR sin publicar; `.github/workflows/release.yml`, con el tag, y publica.
