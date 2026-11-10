# dart/

Paquete Dart `colportores_mapa` para la app móvil (lib-mapa#4). La app lo usa como dependencia git de pub con el tag de la release:

```yaml
colportores_mapa:
  git:
    url: https://github.com/Colportores/lib-mapa.git
    ref: vX.Y.Z
    path: dart
```

Trae los tokens generados (`lib/tokens.g.dart`); el estilo, las letras y los íconos viajan con la app (ADR-011, ADR-019). El código de pantalla (widgets) se queda en la app.
