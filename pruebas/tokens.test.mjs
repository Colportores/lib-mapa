// Tokens del mapa (lib-mapa#4): forma de tokens/tokens.json, generados al día y paridad TS == JSON. El lado
// Dart == JSON lo prueba dart/tool/paridad.dart (en el CI y en Docker con una imagen de Dart).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { archivosGenerados } from '../generadores/cli.mjs';
import { esPendiente, leerTokens } from '../generadores/tokens.mjs';
import { constanteTs } from '../generadores/ts.mjs';
import { textoDart } from '../generadores/dart.mjs';
import { AJUSTES } from '../estilo/src/ajustes.mjs';
import { ATRIBUCION, NOMBRE_DE_LA_FUENTE, armarEstilo, leerPaleta } from '../estilo/src/estilo.mjs';
import * as capas from '../estilo/capas/capas.mjs';

const tokens = leerTokens();
const COLOR = /^#[0-9A-F]{6}$/;

/** Los valores de color de cualquier profundidad, con su ruta. */
function colores(valor, ruta = '') {
  if (typeof valor === 'string') return valor.startsWith('#') ? [[ruta, valor]] : [];
  if (Array.isArray(valor)) return valor.flatMap((v, i) => colores(v, `${ruta}[${i}]`));
  if (valor && typeof valor === 'object') return Object.entries(valor).flatMap(([k, v]) => colores(v, `${ruta}.${k}`));
  return [];
}

function luminancia(hex) {
  const canal = (i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(1) + 0.7152 * canal(3) + 0.0722 * canal(5);
}

function contraste(a, b) {
  const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

test('dados los tokens, cuando se leen, entonces todo color es #RRGGBB en mayúsculas', () => {
  const todos = colores(tokens);
  assert.ok(todos.length > 30);
  for (const [ruta, valor] of todos) assert.match(valor, COLOR, `${ruta}: ${valor}`);
});

test('dados los estados de casa, cuando se leen, entonces son los ocho del backend, en el orden de la leyenda', () => {
  assert.deepEqual(
    tokens.estadosDeCasa.map((e) => e.clave),
    ['SIN_VISITA', 'SIN_CONTESTAR', 'ENTREVISTA_PROGRAMADA', 'ENTREVISTA_SIN_VENTA', 'RECHAZO', 'COBRANZA_PENDIENTE', 'ENTREGA_Y_COBRANZA_PENDIENTE', 'VENTA_COMPLETA'],
  );
  assert.deepEqual(
    tokens.estadosDeCasa.map((e) => e.id),
    ['sinVisita', 'noContesto', 'entrevistaAgendada', 'entrevistaHecha', 'rechazo', 'cobranzaPendiente', 'entregaYPago', 'ventaCompleta'],
  );
});

test('dados los estados de casa, cuando se mira la forma, entonces círculo es de la visita y cuadrado de la venta', () => {
  const cuadrados = tokens.estadosDeCasa.filter((e) => e.forma === 'cuadrado').map((e) => e.clave);
  assert.deepEqual(cuadrados, ['COBRANZA_PENDIENTE', 'ENTREGA_Y_COBRANZA_PENDIENTE', 'VENTA_COMPLETA']);
  for (const e of tokens.estadosDeCasa) assert.ok(['circulo', 'cuadrado'].includes(e.forma), e.clave);
});

test('dados los estados de casa, cuando se mira cada uno, entonces el color nunca va solo: lleva glifo o contorno', () => {
  for (const e of tokens.estadosDeCasa) assert.ok(e.glifo !== '' || e.borde !== null, `${e.clave} sin glifo ni contorno`);
  const glifos = tokens.estadosDeCasa.map((e) => e.glifo);
  assert.equal(new Set(glifos).size, glifos.length, 'dos estados con el mismo glifo');
});

test('dado un estado con relleno, cuando se mide su glifo, entonces tiene al menos 3:1 (gráfico, WCAG 1.4.11)', () => {
  for (const e of tokens.estadosDeCasa.filter((x) => x.glifo !== '')) {
    assert.ok(contraste(e.tinta, e.relleno) >= tokens.contraste.bordes, `${e.clave}: ${contraste(e.tinta, e.relleno).toFixed(2)}:1`);
  }
});

test('dado el número de puerta del cuadrado, cuando se mide sobre su relleno, entonces es AA (4,5:1)', () => {
  for (const e of [...tokens.estadosDeCasa, tokens.edificioSinEstado]) {
    const r = contraste(e.tintaNumero, e.relleno);
    assert.ok(r >= tokens.contraste.rotulos, `${e.id}: ${r.toFixed(2)}:1`);
  }
});

test('dado un valor sin decidir, cuando se lee, entonces dice dónde se decide y trae el del panel y el del móvil, del mismo tipo', () => {
  const pendientes = [tokens.zonaSinColor, tokens.zoom.maximo, tokens.estadosDeCasa.find((e) => e.franjas).franjas.clara];
  for (const p of pendientes) {
    assert.ok(esPendiente(p));
    assert.match(p.pendiente, /#\d+/);
    assert.equal(typeof p.panel, typeof p.movil);
  }
  assert.deepEqual(tokens.zonaSinColor, { pendiente: tokens.zonaSinColor.pendiente, panel: '#8A94A6', movil: '#13407A' });
});

test('dados los fondos del contraste, cuando se comparan con la paleta del estilo, entonces son la tierra y los parques', async () => {
  const paleta = await leerPaleta();
  assert.deepEqual(tokens.contraste.fondosDelMapa, [paleta.flavor.earth, paleta.flavor.park_a]);
  assert.equal(paleta.flavor.background, paleta.flavor.earth);
});

test('dado el minzoom de los números, cuando se arma el estilo, entonces address_label lo toma del token', () => {
  assert.equal(AJUSTES.address_label.minzoom, tokens.zoom.numerosDePuerta);
  const estilo = armarEstilo({ urlBase: 'https://ejemplo.org/estilo', paleta: JSON.parse(readFileSync(new URL('../estilo/paleta.json', import.meta.url), 'utf8')) });
  assert.equal(estilo.layers.find((c) => c.id === 'address_label').minzoom, 16);
  assert.ok(tokens.zoom.numerosDePuerta > tokens.zoom.corteDeTiles, 'los números vienen en las teselas de corte y se ven al agrandarlas');
});

test('dada la atribución, cuando se arma el estilo, entonces la fuente lleva el token y dice OpenStreetMap', () => {
  assert.equal(ATRIBUCION, tokens.atribucion.html);
  const estilo = armarEstilo({ urlBase: 'https://ejemplo.org/estilo', paleta: JSON.parse(readFileSync(new URL('../estilo/paleta.json', import.meta.url), 'utf8')) });
  assert.equal(estilo.sources[NOMBRE_DE_LA_FUENTE].attribution, tokens.atribucion.html);
  assert.equal(tokens.atribucion.texto, '© OpenStreetMap contributors');
  for (const t of Object.values(tokens.atribucion)) assert.match(t, /OpenStreetMap/);
});

test('dados los archivos .g., cuando se regeneran, entonces son idénticos a los commiteados (nadie los editó a mano)', () => {
  for (const a of archivosGenerados()) {
    assert.ok(existsSync(a.absoluta), `falta ${a.ruta}: npm run generar-tokens`);
    assert.equal(readFileSync(a.absoluta, 'utf8'), a.contenido, `${a.ruta} no está al día: npm run generar-tokens`);
  }
});

test('dado tokens.g.ts, cuando se importa, entonces TOKENS es igual al JSON (paridad TS == JSON)', async () => {
  const ts = await import('../ts/src/tokens.g.ts');
  assert.deepEqual(ts.TOKENS, tokens);
  for (const seccion of Object.keys(tokens).filter((s) => s !== 'version')) {
    assert.deepEqual(ts[constanteTs(seccion)], tokens[seccion], constanteTs(seccion));
  }
});

test('dado capas.g.ts, cuando se importa, entonces trae los mismos fragmentos, fuentes y capas que estilo/capas', async () => {
  const ts = await import('../ts/src/capas.g.ts');
  assert.deepEqual(ts.FRAGMENTOS, capas.todosLosFragmentos());
  assert.deepEqual(ts.FUENTES, { ...capas.FUENTES });
  assert.deepEqual(ts.CAPAS, { ...capas.CAPAS });
  assert.deepEqual(ts.FUENTE_DE_CASAS, capas.fuenteDeCasas());
});

test('dado tokens.g.dart, cuando se lee, entonces cada color y texto de los tokens está como constante', () => {
  const dart = readFileSync(new URL('../dart/lib/tokens.g.dart', import.meta.url), 'utf8');
  for (const [, hex] of colores(tokens)) assert.ok(dart.includes(`0xFF${hex.slice(1)}`), hex);
  for (const e of tokens.estadosDeCasa) {
    assert.ok(dart.includes(`static const ${e.id} = MarcadorDeCasa(`), e.id);
    assert.ok(dart.includes(`nombre: ${textoDart(e.nombre)}`), e.nombre);
  }
  assert.ok(dart.includes("glifo: '\\$'"), 'el $ de «Cobranza pendiente» va escapado');
  assert.ok(dart.includes('static const ValorPendiente<int> zonaSinColor = ValorPendiente('));
  assert.ok(dart.includes('static const double zoomCalle = 16.0;'));
});

test('dado el package.json, cuando se miran los exports, entonces cada destino existe (se instala por git con github:Colportores/lib-mapa#vX.Y.Z)', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  for (const [entrada, destino] of Object.entries(pkg.exports)) {
    if (destino.includes('*')) continue;
    assert.ok(existsSync(new URL(`../${destino}`, import.meta.url)), `${entrada} -> ${destino}`);
  }
  const pubspec = readFileSync(new URL('../dart/pubspec.yaml', import.meta.url), 'utf8');
  assert.match(pubspec, /^name: colportores_mapa$/m);
  assert.match(pubspec, /^publish_to: none$/m);
});
