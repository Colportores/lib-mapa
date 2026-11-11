---
name: mapa-tokens
description: Sumar o cambiar un token del mapa de lib-mapa (estados de casa, paleta de zonas, zona sin color, contraste, zooms, grupos, atribución): editar tokens/tokens.json, regenerar los .g. de Dart y TypeScript, mantener la paridad Dart == TS == JSON, versionar y subir el tag en la app, el panel y el publicador. Usala antes de tocar tokens/, generadores/, dart/ o ts/.
---

# Tokens del mapa

`tokens/tokens.json` es la **única fuente** (lib-mapa#4, ADR-019). Los `.g.` se generan y se commitean (los fronts los usan por tag sin correr nada); **nunca** se editan a mano.

| Salida | Para quién | Cómo |
|---|---|---|
| `dart/lib/tokens.g.dart` | app móvil (paquete `colportores_mapa`) | Dart puro, `const`; colores como enteros ARGB, números `double`, un valor sin decidir como `ValorPendiente<T>` |
| `ts/src/tokens.g.ts` | panel y publicador (`@colportores/lib-mapa/tokens`) | `as const` |
| `ts/src/capas.g.ts` | panel (`@colportores/lib-mapa/capas`) | los fragmentos de `estilo/capas/capas.mjs`, con los colores de los tokens |

## Sumar o cambiar un token

1. Editá `tokens/tokens.json`. Convenciones: camelCase; colores `#RRGGBB` en mayúsculas; zooms en escala **MapLibre**; las claves que empiezan con `$` son comentarios (no se generan): explicá de dónde sale el valor.
2. Si los dos fronts todavía no coinciden, el valor va como `{ "pendiente": "<dónde se decide>", "panel": …, "movil": … }`. **No elijas uno vos**: la decisión es de Cristian (o del orquestador, si es §2). Hoy: `zonaSinColor` (`zoom.maximo` = 19 y la franja clara #4D76B1 se decidieron el 10/11).
3. Regenerá (en Docker): `docker compose -f compose.dev.yml run --rm -T app npm run generar-tokens`.
4. Token nuevo: sumalo en `dart/tool/paridad.dart` (la paridad falla hasta que el JSON que arma desde las constantes coincide con `tokens.json`). Cuando un pendiente se decide: reemplazá el objeto por el valor, regenerá y cambiá `_color`/`_numero` en `paridad.dart`.
5. Verificá:
   - `npm run check` (incluye `pruebas/tokens.test.mjs`: forma, contraste AA, `.g.` al día, paridad TS == JSON).
   - Paridad Dart == JSON y casos del contraste (en el CI es el job `dart`, con `dart:3.12`):
     ```sh
     docker run --rm -v "$PWD/tokens:/w/tokens:ro" -v "$PWD/pruebas:/w/pruebas:ro" -v "$PWD/dart:/w/dart" -w /w/dart dart:3.12 \
       sh -c "dart pub get && dart analyze --fatal-infos && dart run tool/paridad.dart && dart run tool/contraste.dart"
     ```
     Después borrá `dart/.dart_tool` y `dart/pubspec.lock` (no se commitean).
   - Si el token cambia el aspecto del estilo o de los fragmentos: `npm run capturas` y, si es a propósito, `npm run capturas:regenerar` (skill `capturas-mapa`).

## Contraste

`pruebas/tokens.test.mjs` mide AA (4,5:1 rótulos, 3:1 bordes) contra `contraste.fondosDelMapa`. Si un color nuevo no llega, **no lo oscurezcas por tu cuenta**: es una decisión de color (Cristian).

El borde de una zona es otra cosa: no cambia el color, se dibuja con `bordeDeZona` (TS `ts/src/contraste.ts`, Dart `ContrasteMapa` en `dart/lib/contraste.dart`), que lo oscurece hasta 3:1 sobre los dos fondos (P1 de la revisión de lib-mapa#4, la regla de `ColoresZona.borde` del móvil). Las dos versiones se prueban contra `pruebas/contraste/casos.json`: si cambiás la regla, cambiá las dos y los casos.

## Versión y release

- Semver (ADR-019, `CHANGELOG.md`): un token con otro valor o un token nuevo es **minor**; quitar o renombrar un token o un export, o cambiar un id de fuente o de capa que usan los fronts, es **major**; un arreglo sin cambio de aspecto, **patch**.
- Subí la versión en `package.json` **y** en `dart/pubspec.yaml` (iguales; `pruebas/release.test.mjs` lo comprueba), sumá la sección en `CHANGELOG.md` y, después del merge, el tag `vX.Y.Z` (ver «Release» en el README): el workflow `release.yml` publica la release.

## Subir el tag en los fronts

Cada front lo sube en su propio PR (nunca desde este repo):

- **App** (`front-colportores-mobile`, `pubspec.yaml`): `colportores_mapa: { git: { url: https://github.com/Colportores/lib-mapa.git, ref: vX.Y.Z, path: dart } }`, después `flutter pub get` en su Docker.
- **Panel** (`front-coordinadores-web`) y **publicador** (`backend-supabase`, `package.json`): `"@colportores/lib-mapa": "github:Colportores/lib-mapa#vX.Y.Z"`, después `npm install` en su Docker (actualiza el lock). El panel compila las fuentes `.ts` con `transpilePackages`.
- Hasta que los tres suban, pueden verse distintos (ADR-019): avisá en el PR qué fronts tienen que subir.
