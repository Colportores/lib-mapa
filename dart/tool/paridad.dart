// Paridad Dart == JSON (lib-mapa#4): arma, a partir de las constantes de `tokens.g.dart`, el mismo JSON que
// `tokens/tokens.json` (sin los comentarios `$…`) y los compara valor por valor. El lado TS == JSON lo prueba
// `pruebas/tokens.test.mjs`; juntos dan Dart == TS == JSON.
//
//   cd dart && dart pub get && dart run tool/paridad.dart
//
// Sin dependencias (corre sin red). Si se suma un token, hay que sumarlo acá también: la paridad falla hasta
// que el JSON y lo que se lee de Dart coincidan.

import 'dart:convert';
import 'dart:io';

import 'package:colportores_mapa/colportores_mapa.dart';

String _hex(int argb) =>
    '#${(argb & 0xFFFFFF).toRadixString(16).padLeft(6, '0').toUpperCase()}';

Object? _color(Object? valor) => switch (valor) {
  ValorPendiente(:final pendiente, :final panel, :final movil) => {
    'pendiente': pendiente,
    'panel': _color(panel),
    'movil': _color(movil),
  },
  int argb => _hex(argb),
  _ => throw StateError('no es un color: $valor'),
};

Object? _numero(Object? valor) => switch (valor) {
  ValorPendiente(:final pendiente, :final panel, :final movil) => {
    'pendiente': pendiente,
    'panel': panel,
    'movil': movil,
  },
  num n => n,
  _ => throw StateError('no es un número: $valor'),
};

Map<String, Object?> _marcador(MarcadorDeCasa m, {required bool esEstado}) => {
  if (esEstado) 'clave': m.clave,
  'id': m.id,
  'nombre': m.nombre,
  'forma': m.forma.name,
  'relleno': _hex(m.relleno),
  'borde': m.borde == null ? null : _hex(m.borde!),
  'tinta': _hex(m.tinta),
  'tintaNumero': _hex(m.tintaNumero),
  'glifo': m.glifo,
  if (esEstado)
    'franjas': m.franjas == null
        ? null
        : {
            'angulo': m.franjas!.angulo,
            'anchoOscura': m.franjas!.anchoOscura,
            'anchoClara': m.franjas!.anchoClara,
            'clara': _color(m.franjas!.clara),
          },
};

/// Los tokens tal como los ve la app.
Map<String, Object?> tokensDesdeDart() => {
  'version': TokensMapa.version,
  'estadosDeCasa': [for (final e in EstadosDeCasa.todos) _marcador(e, esEstado: true)],
  'edificioSinEstado': _marcador(TokensMapa.edificioSinEstado, esEstado: false),
  'paletaZonas': [for (final c in TokensMapa.paletaZonas) _hex(c)],
  'zonaSinColor': _color(TokensMapa.zonaSinColor),
  'contraste': {
    'bordes': TokensMapa.contrasteBordes,
    'rotulos': TokensMapa.contrasteRotulos,
    'fondosDelMapa': [for (final c in TokensMapa.contrasteFondosDelMapa) _hex(c)],
  },
  'zoom': {
    'pais': TokensMapa.zoomPais,
    'calle': TokensMapa.zoomCalle,
    'maximo': _numero(TokensMapa.zoomMaximo),
    'numerosDePuerta': TokensMapa.zoomNumerosDePuerta,
    'corteDeTiles': TokensMapa.zoomCorteDeTiles,
  },
  'grupos': {
    'radio': TokensMapa.gruposRadio,
    'zoomMaximo': TokensMapa.gruposZoomMaximo,
    'color': _hex(TokensMapa.gruposColor),
    'borde': _hex(TokensMapa.gruposBorde),
  },
  'atribucion': {
    'texto': TokensMapa.atribucionTexto,
    'corto': TokensMapa.atribucionCorto,
    'html': TokensMapa.atribucionHtml,
  },
};

Object? _sinComentarios(Object? valor) => switch (valor) {
  Map<String, Object?> m => {
    for (final e in m.entries)
      if (!e.key.startsWith(r'$')) e.key: _sinComentarios(e.value),
  },
  List<Object?> l => [for (final v in l) _sinComentarios(v)],
  _ => valor,
};

/// Las diferencias entre [a] (Dart) y [b] (JSON), con la ruta de cada una. Los números se comparan por valor
/// (`16.0` en Dart es `16` en el JSON).
List<String> diferencias(Object? a, Object? b, [String ruta = r'$']) {
  if (a is Map && b is Map) {
    return [
      for (final clave in {...a.keys, ...b.keys})
        if (!a.containsKey(clave))
          '$ruta.$clave: está en el JSON y no en Dart'
        else if (!b.containsKey(clave))
          '$ruta.$clave: está en Dart y no en el JSON'
        else
          ...diferencias(a[clave], b[clave], '$ruta.$clave'),
    ];
  }
  if (a is List && b is List) {
    if (a.length != b.length) return ['$ruta: ${a.length} en Dart, ${b.length} en el JSON'];
    return [for (var i = 0; i < a.length; i++) ...diferencias(a[i], b[i], '$ruta[$i]')];
  }
  if (a is num && b is num) return a == b ? const [] : ['$ruta: $a en Dart, $b en el JSON'];
  return a == b ? const [] : ['$ruta: ${jsonEncode(a)} en Dart, ${jsonEncode(b)} en el JSON'];
}

void main() {
  final ruta = Platform.script.resolve('../../tokens/tokens.json');
  final json = _sinComentarios(jsonDecode(File.fromUri(ruta).readAsStringSync()));
  final distintas = diferencias(tokensDesdeDart(), json);
  if (distintas.isEmpty) {
    stdout.writeln('paridad Dart == JSON: ok (${EstadosDeCasa.todos.length} estados de casa)');
    return;
  }
  stderr.writeln('paridad Dart == JSON: ${distintas.length} diferencia(s). Corré `npm run generar-tokens`.');
  distintas.forEach(stderr.writeln);
  exitCode = 1;
}
