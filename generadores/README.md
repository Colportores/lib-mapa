# generadores/

Scripts Node que generan, a partir de `tokens/tokens.json`, los tokens para cada front (lib-mapa#4):

- `dart/lib/tokens.g.dart` (constantes `const`).
- `ts/src/tokens.g.ts` (`as const`).

Los archivos `.g.` no se editan a mano: se regeneran y el test de paridad (Dart == TS == JSON) corre en Docker y en el CI.
