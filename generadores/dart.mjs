// Genera dart/lib/tokens.g.dart (lib-mapa#4): los tokens como constantes `const` de Dart puro (sin Flutter),
// para la app móvil. Los colores van como enteros ARGB (`0xFF13407A`, lo que recibe `Color(…)`), los números
// como `double` (salvo `version`) y un valor todavía sin decidir como `ValorPendiente<T>`.

import { CABECERA, esPendiente } from './tokens.mjs';

const COLOR = /^#[0-9A-F]{6}$/;

const esColor = (valor) => typeof valor === 'string' && COLOR.test(valor);

export function textoDart(texto) {
  return `'${texto.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\$/g, '\\$')}'`;
}

function colorDart(hex) {
  return `0xFF${hex.slice(1)}`;
}

function numeroDart(n) {
  return Number.isInteger(n) ? `${n}.0` : String(n);
}

/** El tipo Dart de un valor simple (o de una lista de valores simples). */
function tipoDart(valor) {
  if (esPendiente(valor)) return `ValorPendiente<${tipoDart(valor.panel)}>`;
  if (esColor(valor)) return 'int';
  if (typeof valor === 'string') return 'String';
  if (typeof valor === 'number') return 'double';
  if (typeof valor === 'boolean') return 'bool';
  if (Array.isArray(valor)) return `List<${tipoDart(valor[0])}>`;
  throw new Error(`token sin tipo Dart: ${JSON.stringify(valor)}`);
}

function valorDart(valor) {
  if (valor === null) return 'null';
  if (esPendiente(valor)) {
    return `ValorPendiente(pendiente: ${textoDart(valor.pendiente)}, panel: ${valorDart(valor.panel)}, movil: ${valorDart(valor.movil)})`;
  }
  if (esColor(valor)) return colorDart(valor);
  if (typeof valor === 'string') return textoDart(valor);
  if (typeof valor === 'number') return numeroDart(valor);
  if (typeof valor === 'boolean') return String(valor);
  if (Array.isArray(valor)) return `[${valor.map(valorDart).join(', ')}]`;
  throw new Error(`token sin valor Dart: ${JSON.stringify(valor)}`);
}

const mayuscula = (s) => s[0].toUpperCase() + s.slice(1);

function franjasDart(f) {
  if (f === null) return 'null';
  return `FranjasDeMarcador(angulo: ${numeroDart(f.angulo)}, anchoOscura: ${numeroDart(f.anchoOscura)}, anchoClara: ${numeroDart(f.anchoClara)}, clara: ${valorDart(f.clara)})`;
}

function marcadorDart(m) {
  return [
    'MarcadorDeCasa(',
    `    clave: ${m.clave === undefined ? 'null' : textoDart(m.clave)},`,
    `    id: ${textoDart(m.id)},`,
    `    nombre: ${textoDart(m.nombre)},`,
    `    forma: FormaDeMarcador.${m.forma},`,
    `    relleno: ${colorDart(m.relleno)},`,
    `    borde: ${m.borde === null ? 'null' : colorDart(m.borde)},`,
    `    tinta: ${colorDart(m.tinta)},`,
    `    tintaNumero: ${colorDart(m.tintaNumero)},`,
    `    glifo: ${m.glifo === null ? 'null' : textoDart(m.glifo)},`,
    `    franjas: ${franjasDart(m.franjas ?? null)},`,
    '  )',
  ].join('\n');
}

/** Lo que va en `TokensMapa`: cada sección objeto se aplana como `<sección><Campo>` (`zoomCalle`). */
function constantesPlanas(tokens) {
  const lineas = [];
  for (const [seccion, valor] of Object.entries(tokens)) {
    if (['version', 'estadosDeCasa', 'edificioSinEstado'].includes(seccion)) continue;
    if (valor !== null && typeof valor === 'object' && !Array.isArray(valor) && !esPendiente(valor)) {
      for (const [campo, v] of Object.entries(valor)) {
        lineas.push(`  static const ${tipoDart(v)} ${seccion}${mayuscula(campo)} = ${valorDart(v)};`);
      }
    } else {
      lineas.push(`  static const ${tipoDart(valor)} ${seccion} = ${valorDart(valor)};`);
    }
  }
  return lineas.join('\n');
}

const tipoFranjaClara = (tokens) => {
  const conFranjas = tokens.estadosDeCasa.find((e) => e.franjas);
  return conFranjas ? tipoDart(conFranjas.franjas.clara) : 'int';
};

export function generarTokensDart(tokens) {
  return `// ${CABECERA}
// ignore_for_file: lines_longer_than_80_chars

/// Un valor en el que el panel y el móvil todavía no coinciden: cada front usa el suyo ([movil] en la app)
/// hasta que la decisión de [pendiente] lo vuelva un valor único.
final class ValorPendiente<T> {
  const ValorPendiente({required this.pendiente, required this.panel, required this.movil});

  /// Dónde se decide.
  final String pendiente;
  final T panel;
  final T movil;
}

/// Círculo: estados de la visita. Cuadrado: estados de la venta (y el edificio).
enum FormaDeMarcador { circulo, cuadrado }

/// Las franjas a [angulo] grados de «Entrega y pago»: [anchoOscura] del relleno y [anchoClara] de [clara].
final class FranjasDeMarcador {
  const FranjasDeMarcador({
    required this.angulo,
    required this.anchoOscura,
    required this.anchoClara,
    required this.clara,
  });

  final double angulo;
  final double anchoOscura;
  final double anchoClara;
  final ${tipoFranjaClara(tokens)} clara;
}

/// Cómo se ve una casa en el mapa: su estado (o el edificio sin estado). Colores en ARGB (\`Color(relleno)\`).
final class MarcadorDeCasa {
  const MarcadorDeCasa({
    required this.clave,
    required this.id,
    required this.nombre,
    required this.forma,
    required this.relleno,
    required this.borde,
    required this.tinta,
    required this.tintaNumero,
    required this.glifo,
    required this.franjas,
  });

  /// El valor del estado en el backend (\`SIN_VISITA\`…); \`null\` en el edificio sin estado.
  final String? clave;

  /// El nombre del estado en la app (\`sinVisita\`…).
  final String id;
  final String nombre;
  final FormaDeMarcador forma;
  final int relleno;

  /// El contorno de los neutros; \`null\` = sin contorno.
  final int? borde;

  /// El color del glifo.
  final int tinta;

  /// El color del número de puerta del cuadrado M·02.
  final int tintaNumero;

  /// \`''\` = sin glifo; \`null\` = símbolo propio que dibuja la app (el edificio).
  final String? glifo;
  final FranjasDeMarcador? franjas;
}

/// Los estados de las casas, en el orden de la leyenda del canvas.
abstract final class EstadosDeCasa {
${tokens.estadosDeCasa.map((e) => `  static const ${e.id} = ${marcadorDart(e)};`).join('\n\n')}

  static const todos = <MarcadorDeCasa>[${tokens.estadosDeCasa.map((e) => e.id).join(', ')}];
}

/// Los demás tokens del mapa. Zooms en la escala de MapLibre (teselas de 512 px).
abstract final class TokensMapa {
  static const int version = ${tokens.version};

  static const edificioSinEstado = ${marcadorDart(tokens.edificioSinEstado)};

${constantesPlanas(tokens)}
}
`;
}
