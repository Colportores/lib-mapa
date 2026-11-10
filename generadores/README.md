# generadores/

Scripts Node que generan, a partir de `tokens/tokens.json` y de los fragmentos de `estilo/capas/`, los archivos de cada front (lib-mapa#4):

- `dart/lib/tokens.g.dart`: constantes `const` de Dart puro (`dart.mjs`). Colores como enteros ARGB, números como `double`, un valor sin decidir como `ValorPendiente<T>`.
- `ts/src/tokens.g.ts` y `ts/src/capas.g.ts`: objetos `as const` (`ts.mjs`).

```sh
npm run generar-tokens     # escribe los tres
npm run comprobar-tokens   # falla si alguno no está al día (lo corre el CI)
```

Los `.g.` se commitean (los fronts los usan por tag git sin correr nada) y **no se editan a mano**: `pruebas/tokens.test.mjs` los regenera y compara, y prueba la paridad TS == JSON; `dart/tool/paridad.dart`, la de Dart == JSON.
