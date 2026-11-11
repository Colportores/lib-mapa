// GENERADO por `npm run generar-tokens` desde tokens/tokens.json (lib-mapa#4). No se edita a mano.
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
  final int clara;
}

/// Cómo se ve una casa en el mapa: su estado (o el edificio sin estado). Colores en ARGB (`Color(relleno)`).
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

  /// El valor del estado en el backend (`SIN_VISITA`…); `null` en el edificio sin estado.
  final String? clave;

  /// El nombre del estado en la app (`sinVisita`…).
  final String id;
  final String nombre;
  final FormaDeMarcador forma;
  final int relleno;

  /// El contorno de los neutros; `null` = sin contorno.
  final int? borde;

  /// El color del glifo.
  final int tinta;

  /// El color del número de puerta del cuadrado M·02.
  final int tintaNumero;

  /// `''` = sin glifo; `null` = símbolo propio que dibuja la app (el edificio).
  final String? glifo;
  final FranjasDeMarcador? franjas;
}

/// Los estados de las casas, en el orden de la leyenda del canvas.
abstract final class EstadosDeCasa {
  static const sinVisita = MarcadorDeCasa(
    clave: 'SIN_VISITA',
    id: 'sinVisita',
    nombre: 'Sin visita',
    forma: FormaDeMarcador.circulo,
    relleno: 0xFFFFFFFF,
    borde: 0xFF6B7688,
    tinta: 0xFF6B7688,
    tintaNumero: 0xFF2A3A52,
    glifo: '',
    franjas: null,
  );

  static const noContesto = MarcadorDeCasa(
    clave: 'SIN_CONTESTAR',
    id: 'noContesto',
    nombre: 'No contestó',
    forma: FormaDeMarcador.circulo,
    relleno: 0xFF6B7688,
    borde: null,
    tinta: 0xFFFFFFFF,
    tintaNumero: 0xFFFFFFFF,
    glifo: '–',
    franjas: null,
  );

  static const entrevistaAgendada = MarcadorDeCasa(
    clave: 'ENTREVISTA_PROGRAMADA',
    id: 'entrevistaAgendada',
    nombre: 'Entrevista agendada',
    forma: FormaDeMarcador.circulo,
    relleno: 0xFFE0B43C,
    borde: null,
    tinta: 0xFF0E1A2B,
    tintaNumero: 0xFF0E1A2B,
    glifo: '◷',
    franjas: null,
  );

  static const entrevistaHecha = MarcadorDeCasa(
    clave: 'ENTREVISTA_SIN_VENTA',
    id: 'entrevistaHecha',
    nombre: 'Entrevista hecha',
    forma: FormaDeMarcador.circulo,
    relleno: 0xFF1F6E3A,
    borde: null,
    tinta: 0xFFFFFFFF,
    tintaNumero: 0xFFFFFFFF,
    glifo: '✓',
    franjas: null,
  );

  static const rechazo = MarcadorDeCasa(
    clave: 'RECHAZO',
    id: 'rechazo',
    nombre: 'Rechazó',
    forma: FormaDeMarcador.circulo,
    relleno: 0xFFA8312A,
    borde: null,
    tinta: 0xFFFFFFFF,
    tintaNumero: 0xFFFFFFFF,
    glifo: '✕',
    franjas: null,
  );

  static const cobranzaPendiente = MarcadorDeCasa(
    clave: 'COBRANZA_PENDIENTE',
    id: 'cobranzaPendiente',
    nombre: 'Cobranza pendiente',
    forma: FormaDeMarcador.cuadrado,
    relleno: 0xFF13407A,
    borde: null,
    tinta: 0xFFFFFFFF,
    tintaNumero: 0xFFFFFFFF,
    glifo: '\$',
    franjas: null,
  );

  static const entregaYPago = MarcadorDeCasa(
    clave: 'ENTREGA_Y_COBRANZA_PENDIENTE',
    id: 'entregaYPago',
    nombre: 'Entrega y pago',
    forma: FormaDeMarcador.cuadrado,
    relleno: 0xFF13407A,
    borde: null,
    tinta: 0xFFFFFFFF,
    tintaNumero: 0xFFFFFFFF,
    glifo: '⇢',
    franjas: FranjasDeMarcador(angulo: 135.0, anchoOscura: 4.0, anchoClara: 3.0, clara: 0xFF4D76B1),
  );

  static const ventaCompleta = MarcadorDeCasa(
    clave: 'VENTA_COMPLETA',
    id: 'ventaCompleta',
    nombre: 'Venta completa',
    forma: FormaDeMarcador.cuadrado,
    relleno: 0xFF1F6E3A,
    borde: null,
    tinta: 0xFFFFFFFF,
    tintaNumero: 0xFFFFFFFF,
    glifo: '★',
    franjas: null,
  );

  static const todos = <MarcadorDeCasa>[sinVisita, noContesto, entrevistaAgendada, entrevistaHecha, rechazo, cobranzaPendiente, entregaYPago, ventaCompleta];
}

/// Los demás tokens del mapa. Zooms en la escala de MapLibre (teselas de 512 px).
abstract final class TokensMapa {
  static const int version = 1;

  static const edificioSinEstado = MarcadorDeCasa(
    clave: null,
    id: 'edificio',
    nombre: 'Edificio',
    forma: FormaDeMarcador.cuadrado,
    relleno: 0xFFFFFFFF,
    borde: 0xFF2A3A52,
    tinta: 0xFF2A3A52,
    tintaNumero: 0xFF2A3A52,
    glifo: null,
    franjas: null,
  );

  static const List<int> paletaZonas = [0xFF13407A, 0xFF1F6E3A, 0xFFA98330, 0xFF5B6B82, 0xFFA8312A, 0xFF3B5C8C];
  static const int zonaSinColor = 0xFF8A94A6;
  static const double contrasteBordes = 3.0;
  static const double contrasteRotulos = 4.5;
  static const List<int> contrasteFondosDelMapa = [0xFFF6F5F0, 0xFFDDE8D3];
  static const double zoomPais = 5.5;
  static const double zoomCalle = 16.0;
  static const double zoomMaximo = 19.0;
  static const double zoomNumerosDePuerta = 16.0;
  static const double zoomCorteDeTiles = 15.0;
  static const double gruposRadio = 44.0;
  static const double gruposZoomMaximo = 17.0;
  static const int gruposColor = 0xFF0E1A2B;
  static const int gruposBorde = 0xFFFFFFFF;
  static const String atribucionTexto = '© OpenStreetMap contributors';
  static const String atribucionCorto = '© OpenStreetMap';
  static const String atribucionHtml = '<a href="https://github.com/protomaps/basemaps">Protomaps</a> © <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>';
}
