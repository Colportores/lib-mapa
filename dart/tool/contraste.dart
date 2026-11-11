// Casos del contraste de los bordes (P1 de la revisión de lib-mapa#4): `ContrasteMapa.bordeDeZona` contra
// `pruebas/contraste/casos.json`, los mismos que prueba el lado TS (`pruebas/contraste.test.mjs`). También mide la
// paleta de zonas y la zona sin color contra `TokensMapa.contrasteBordes` sobre los dos fondos del mapa.
//
//   cd dart && dart pub get && dart run tool/contraste.dart
//
// Sin dependencias (corre sin red), como tool/paridad.dart.

import 'dart:convert';
import 'dart:io';

import 'package:colportores_mapa/colportores_mapa.dart';

int _argb(String hex) => 0xFF000000 | int.parse(hex.substring(1), radix: 16);

String _hex(int argb) => '#${(argb & 0xFFFFFF).toRadixString(16).padLeft(6, '0').toUpperCase()}';

/// Lo que falla, vacío si todo da.
List<String> fallas(List<Map<String, Object?>> casos) {
  final minimo = TokensMapa.contrasteBordes;
  final fallas = <String>[];
  for (final caso in casos) {
    final borde = ContrasteMapa.bordeDeZona(_argb(caso['color']! as String));
    if (_hex(borde) != caso['borde']) {
      fallas.add('${caso['nombre']}: ${_hex(borde)} en Dart, ${caso['borde']} en el caso');
    }
    if (borde >> 24 != 0xFF) fallas.add('${caso['nombre']}: el borde no es opaco');
  }
  final colores = [
    ...TokensMapa.paletaZonas,
    TokensMapa.zonaSinColor.panel,
    TokensMapa.zonaSinColor.movil,
  ];
  for (final color in colores) {
    final borde = ContrasteMapa.bordeDeZona(color);
    for (final fondo in TokensMapa.contrasteFondosDelMapa) {
      final razon = ContrasteMapa.entre(borde, fondo);
      if (razon < minimo) {
        fallas.add('${_hex(color)} -> ${_hex(borde)} sobre ${_hex(fondo)}: ${razon.toStringAsFixed(2)}:1');
      }
    }
    if (ContrasteMapa.sobreElMapa(color) >= minimo && borde != color) {
      fallas.add('${_hex(color)} ya llegaba a $minimo:1 y se cambió a ${_hex(borde)}');
    }
  }
  if (ContrasteMapa.entre(0xFFFFFFFF, 0xFF000000) != 21) fallas.add('blanco sobre negro no da 21:1');
  return fallas;
}

void main() {
  final ruta = Platform.script.resolve('../../pruebas/contraste/casos.json');
  final json = jsonDecode(File.fromUri(ruta).readAsStringSync()) as Map<String, Object?>;
  final casos = [for (final c in json['casos']! as List<Object?>) c! as Map<String, Object?>];
  final distintas = fallas(casos);
  if (distintas.isEmpty) {
    stdout.writeln('contraste de los bordes: ok (${casos.length} casos)');
    return;
  }
  stderr.writeln('contraste de los bordes: ${distintas.length} falla(s).');
  distintas.forEach(stderr.writeln);
  exitCode = 1;
}
