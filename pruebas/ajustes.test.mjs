import assert from 'node:assert/strict';
import { test } from 'node:test';
import { layers } from '@protomaps/basemaps';
import { AJUSTES, aplicarAjustes } from '../estilo/src/ajustes.mjs';
import { NOMBRE_DE_LA_FUENTE, armarEstilo, flavorColportores, leerPaleta } from '../estilo/src/estilo.mjs';

const paleta = await leerPaleta();
const estilo = armarEstilo({ urlBase: 'https://proyecto.supabase.co/estilo', paleta, version: '5.7.2' });
const capa = (id) => estilo.layers.find((l) => l.id === id);
const sinAjustes = layers(NOMBRE_DE_LA_FUENTE, flavorColportores(paleta), { lang: paleta.idioma });

/** Contraste WCAG entre dos colores #RRGGBB. */
function contraste(a, b) {
  const luz = (hex) => {
    const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const lineal = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * lineal(r) + 0.7152 * lineal(g) + 0.0722 * lineal(bl);
  };
  const [claro, oscuro] = [luz(a), luz(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (oscuro + 0.05);
}

test('números de puerta de OSM: desde z16 de MapLibre (el zoom de calle), letra 11 y halo 1,5 (P4)', () => {
  const numeros = capa('address_label');
  assert.equal(numeros.type, 'symbol');
  assert.equal(numeros.minzoom, 16);
  assert.equal(numeros.layout['text-size'], 11);
  assert.equal(numeros.paint['text-halo-width'], 1.5);
  assert.deepEqual(numeros.layout['text-field'], ['get', 'addr_housenumber'], 'el número sale de la tesela tal cual');
  assert.deepEqual(numeros.filter, ['==', 'kind', 'address']);
});

test('números de puerta de OSM: el color de los rótulos que se leen, AA (4,5:1) sobre su halo', () => {
  const { paint } = capa('address_label');
  assert.equal(paint['text-color'], '#5B6B82');
  assert.equal(paint['text-halo-color'], '#F6F5F0');
  assert.ok(contraste(paint['text-color'], paint['text-halo-color']) >= 4.5);
});

test('las listas de números («1528,1530,1532») no se recortan: text-max-width explícito, sin text-field recortado', () => {
  const { layout } = capa('address_label');
  assert.equal(typeof layout['text-max-width'], 'number');
  assert.ok(layout['text-max-width'] >= 10, 'al menos el ancho de MapLibre: una lista de tres números entra en una línea');
  assert.equal(layout['text-overflow'], undefined);
  assert.doesNotMatch(JSON.stringify(layout['text-field']), /slice|length/, 'el número no se corta');
});

test('nuestras capas ganan: el número de OSM no se dibuja encima de otro símbolo', () => {
  const { layout } = capa('address_label');
  for (const propiedad of ['text-allow-overlap', 'text-ignore-placement', 'icon-allow-overlap', 'icon-ignore-placement']) {
    assert.ok(!layout[propiedad], `${propiedad} haría que el número de OSM tape a los cuadrados de la casa`);
  }
});

test('los ajustes solo tocan lo que nombran: el resto del estilo es el de basemaps con la paleta', () => {
  const ajustadas = new Set(Object.keys(AJUSTES));
  const esperadas = sinAjustes.filter((l) => !(paleta.sin_capas ?? []).includes(l.id));
  assert.deepEqual(estilo.layers.map((l) => l.id), esperadas.map((l) => l.id), 'mismas capas, mismo orden');
  for (const original of esperadas) {
    if (!ajustadas.has(original.id)) assert.deepEqual(capa(original.id), original, `${original.id} cambió`);
  }
  const original = sinAjustes.find((l) => l.id === 'address_label');
  const { minzoom, layout, paint, ...resto } = capa('address_label');
  const { minzoom: _m, layout: layoutOriginal, paint: paintOriginal, ...restoOriginal } = original;
  assert.deepEqual(resto, restoOriginal);
  assert.deepEqual(layout, { ...layoutOriginal, ...AJUSTES.address_label.layout });
  assert.deepEqual(paint, { ...paintOriginal, ...AJUSTES.address_label.paint });
});

test('aplicarAjustes no modifica las capas que recibe', () => {
  const copia = structuredClone(sinAjustes);
  aplicarAjustes(copia);
  assert.deepEqual(copia, sinAjustes);
});

test('si basemaps deja de traer una capa ajustada, armar el estilo falla en vez de perder el ajuste', () => {
  const sinNumeros = sinAjustes.filter((l) => l.id !== 'address_label');
  assert.throws(() => aplicarAjustes(sinNumeros), /address_label/);
  assert.deepEqual(aplicarAjustes(sinNumeros, {}), sinNumeros);
});

test('un ajuste sin layout ni paint solo cambia el zoom, y no deja layout ni paint vacíos', () => {
  const [ajustada] = aplicarAjustes([{ id: 'x', type: 'background' }], { x: { minzoom: 3 } });
  assert.deepEqual(ajustada, { id: 'x', type: 'background', minzoom: 3 });
});
