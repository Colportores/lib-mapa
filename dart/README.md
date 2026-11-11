# dart/

Paquete Dart `colportores_mapa` para la app móvil (lib-mapa#4). La app lo usa como dependencia git de pub con el tag de la release:

```yaml
colportores_mapa:
  git:
    url: https://github.com/Colportores/lib-mapa.git
    ref: vX.Y.Z
    path: dart
```

Trae (`import 'package:colportores_mapa/colportores_mapa.dart'`), en Dart puro, sin Flutter:

- Los tokens generados (`lib/tokens.g.dart`). Los colores van como enteros ARGB (`Color(EstadosDeCasa.rechazo.relleno)`), los zooms en escala MapLibre y un valor que el panel y el móvil todavía no comparten como `ValorPendiente` (la app usa `.movil`; hoy ninguno: `zonaSinColor` es un solo color desde la 1.1.0).
- El contraste de los bordes (`lib/contraste.dart`): `ContrasteMapa.bordeDeZona(color)` oscurece el color de una zona hasta 3:1 sobre la tierra y los parques (la regla de `ColoresZona.borde`), más `ContrasteMapa.entre` y `ContrasteMapa.sobreElMapa`.
- El estilo, las letras y los íconos (`assets/mapa/`, ADR-019): `estilo/colportores.json` (con `https://REEMPLAZAR/estilo` y `pmtiles://REEMPLAZAR`, que la app reemplaza), `glyphs/`, `sprites/` y los avisos de licencia (`NOTICE.md`, `NOTICE-assets.md`). Están declarados en `flutter: assets:` del `pubspec.yaml`, así que la app los lee como `packages/colportores_mapa/assets/mapa/…` (por ejemplo, `rootBundle.loadString('packages/colportores_mapa/assets/mapa/estilo/colportores.json')`), sin declararlos ella. Es una copia generada (`npm run generar-assets-dart`): no se edita a mano.

- `EstadosDeCasa.sinVisita` … `EstadosDeCasa.ventaCompleta` y `EstadosDeCasa.todos` (el orden de la leyenda).
- `TokensMapa`: el edificio sin estado, la paleta de zonas, la zona sin color, el contraste, los zooms, los grupos y la atribución (`zoomCalle`, `atribucionCorto`…).

El estilo, las letras y los íconos viajan con la app dentro de este paquete (ADR-011, ADR-019). El código de pantalla (widgets) se queda en la app.

## Paridad Dart == JSON y contraste

`tool/paridad.dart` arma el JSON de los tokens a partir de las constantes y lo compara con `tokens/tokens.json`; `tool/contraste.dart` corre `pruebas/contraste/casos.json` (los mismos casos que el lado TS). Corren en el CI (`dart:3.12`); en local, con cualquier imagen que tenga Dart 3.5+:

```sh
docker run --rm -v "$PWD/tokens:/w/tokens:ro" -v "$PWD/pruebas:/w/pruebas:ro" -v "$PWD/dart:/w/dart" -w /w/dart dart:3.12 \
  sh -c "dart pub get && dart analyze --fatal-infos && dart run tool/paridad.dart && dart run tool/contraste.dart"
```
