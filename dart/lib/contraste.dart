// Contraste de los bordes del mapa (P1 de la revisión de lib-mapa#4, WCAG 1.4.11). Este archivo no se genera: la
// misma regla está en TS (ts/src/contraste.ts) y los dos se prueban contra pruebas/contraste/casos.json
// (tool/contraste.dart).

import 'dart:math' as math;

import 'tokens.g.dart';

/// El contraste de los bordes sobre el mapa. Colores en ARGB (`0xFF13407A`), como los tokens.
///
/// El borde de una zona se dibuja con el color que eligió el coordinador y, si no llega a
/// [TokensMapa.contrasteBordes] (3:1) sobre los fondos del mapa (la tierra y los parques), con el
/// mismo tono oscurecido hasta que llegue. Es la regla de `ColoresZona.borde` del móvil: cada paso
/// acerca el color un 8 % al negro y redondea cada canal a 8 bits.
abstract final class ContrasteMapa {
  /// Cuánto se acerca al negro en cada paso, y cuántos pasos como máximo.
  static const double _paso = 0.08;
  static const int _pasos = 40;

  static double _lineal(int canal) {
    final s = canal / 255;
    return s <= 0.03928 ? s / 12.92 : math.pow((s + 0.055) / 1.055, 2.4).toDouble();
  }

  /// Luminancia relativa de WCAG 2 (el mismo umbral 0,03928 que Flutter).
  static double _luminancia(int color) =>
      0.2126 * _lineal((color >> 16) & 0xFF) +
      0.7152 * _lineal((color >> 8) & 0xFF) +
      0.0722 * _lineal(color & 0xFF);

  /// El contraste WCAG entre dos colores (de 1 a 21). El alfa no cuenta.
  static double entre(int a, int b) {
    final x = _luminancia(a);
    final y = _luminancia(b);
    return (math.max(x, y) + 0.05) / (math.min(x, y) + 0.05);
  }

  /// El menor contraste de [color] contra los fondos del mapa
  /// ([TokensMapa.contrasteFondosDelMapa]).
  static double sobreElMapa(int color) =>
      TokensMapa.contrasteFondosDelMapa.map((fondo) => entre(color, fondo)).reduce(math.min);

  /// El color con el que se dibuja el borde de una zona de [color]: el mismo si ya llega a
  /// [TokensMapa.contrasteBordes] sobre los fondos del mapa; si no, oscurecido hasta que llegue.
  /// Devuelve un color opaco (`0xFF……`). Una zona sin color la resuelve la app antes (token
  /// [TokensMapa.zonaSinColor]).
  static int bordeDeZona(int color) {
    var r = (color >> 16) & 0xFF;
    var g = (color >> 8) & 0xFF;
    var b = color & 0xFF;
    int argb() => 0xFF000000 | (r << 16) | (g << 8) | b;
    for (var i = 0; i < _pasos && sobreElMapa(argb()) < TokensMapa.contrasteBordes; i++) {
      r = (r * (1 - _paso)).round();
      g = (g * (1 - _paso)).round();
      b = (b * (1 - _paso)).round();
    }
    return argb();
  }
}
