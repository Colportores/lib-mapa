# dart/

Paquete Dart `colportores_mapa` para la app móvil (lib-mapa#4). La app lo usa como dependencia git de pub con el tag de la release:

```yaml
colportores_mapa:
  git:
    url: https://github.com/Colportores/lib-mapa.git
    ref: vX.Y.Z
    path: dart
```

Trae los tokens generados (`lib/tokens.g.dart`, `import 'package:colportores_mapa/colportores_mapa.dart'`): Dart puro, sin Flutter. Los colores van como enteros ARGB (`Color(EstadosDeCasa.rechazo.relleno)`), los zooms en escala MapLibre y un valor que el panel y el móvil todavía no comparten como `ValorPendiente` (la app usa `.movil`).

- `EstadosDeCasa.sinVisita` … `EstadosDeCasa.ventaCompleta` y `EstadosDeCasa.todos` (el orden de la leyenda).
- `TokensMapa`: el edificio sin estado, la paleta de zonas, la zona sin color, el contraste, los zooms, los grupos y la atribución (`zoomCalle`, `atribucionCorto`…).

El estilo, las letras y los íconos viajan con la app (ADR-011, ADR-019). El código de pantalla (widgets) se queda en la app.

## Paridad Dart == JSON

`tool/paridad.dart` arma el JSON de los tokens a partir de las constantes y lo compara con `tokens/tokens.json`. Corre en el CI (`dart:3.12`); en local, con cualquier imagen que tenga Dart 3.5+:

```sh
docker run --rm -v "$PWD/tokens:/w/tokens:ro" -v "$PWD/dart:/w/dart" -w /w/dart dart:3.12 \
  sh -c "dart pub get && dart analyze --fatal-infos && dart run tool/paridad.dart"
```
