// Fragmentos de capa (lib-mapa#4): estilo/capas/capas.mjs, validados con la misma especificación que usa
// gl-style-validate (`npm run validar-estilo` valida además el JSON que escribe `npm run generar-capas`).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateStyleMin } from '@maplibre/maplibre-gl-style-spec';
import { leerTokens } from '../generadores/tokens.mjs';
import { CAPAS, FUENTES, estiloDePrueba, fuenteDeCasas, todosLosFragmentos } from '../estilo/capas/capas.mjs';

const tokens = leerTokens();
const fragmentos = todosLosFragmentos();
const todas = [...fragmentos.zonas, ...fragmentos.casasDeLejos, ...fragmentos.grupos];

/** Lo que devuelve un `match` de MapLibre para [clave] (o el valor por defecto). */
function evaluarMatch(expresion, clave) {
  const [, , ...resto] = expresion;
  for (let i = 0; i + 1 < resto.length; i += 2) if (resto[i] === clave) return resto[i + 1];
  return resto.at(-1);
}

test('dados los fragmentos, cuando se arman en un estilo de prueba, entonces la especificación v8 no encuentra errores', () => {
  const errores = validateStyleMin(estiloDePrueba());
  assert.deepEqual(errores.map((e) => e.message), []);
});

test('dado un fragmento roto, cuando se valida, entonces la especificación lo rechaza (la validación no es de adorno)', () => {
  const roto = estiloDePrueba();
  roto.layers.push({ id: 'roto', type: 'circle', source: FUENTES.casas, paint: { 'circle-radius': 'grande' } });
  assert.ok(validateStyleMin(roto).length > 0);
});

test('dados los fragmentos, cuando se miran los ids, entonces son los fijos, únicos y con el prefijo colportores', () => {
  const ids = todas.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual([...ids].sort(), Object.values(CAPAS).sort());
  for (const id of ids) assert.match(id, /^colportores:/);
  for (const c of todas) assert.ok(Object.values(FUENTES).includes(c.source), `${c.id} lee ${c.source}`);
  assert.deepEqual(FUENTES, { zonas: 'colportores-zonas', zonasRotulos: 'colportores-zonas-rotulos', casas: 'colportores-casas' });
});

test('dadas las casas de lejos, cuando se pinta cada estado, entonces toma el color del token (Sin visita: blanco con borde gris)', () => {
  const [casas] = fragmentos.casasDeLejos;
  const relleno = casas.paint['circle-color'];
  const borde = casas.paint['circle-stroke-color'];
  for (const e of tokens.estadosDeCasa) {
    assert.equal(evaluarMatch(relleno, e.clave), e.borde ? '#FFFFFF' : e.relleno, e.clave);
    assert.equal(evaluarMatch(borde, e.clave), e.borde ?? '#FFFFFF', e.clave);
  }
  assert.equal(evaluarMatch(relleno, 'UN_ESTADO_NUEVO'), '#6B7688', 'un estado que no se conoce se ve gris, no desaparece');
  assert.deepEqual(casas.filter, ['!', ['has', 'point_count']]);
});

test('dados los grupos, cuando se arma la fuente de las casas, entonces agrupa como las dos apps (44 px hasta z17)', () => {
  assert.deepEqual(fuenteDeCasas(), { type: 'geojson', cluster: true, clusterRadius: 44, clusterMaxZoom: 17 });
  const [grupos] = fragmentos.grupos;
  assert.deepEqual(grupos.filter, ['has', 'point_count']);
  assert.equal(grupos.paint['circle-color'], tokens.grupos.color);
  assert.equal(grupos.paint['circle-stroke-color'], tokens.grupos.borde);
});

test('dadas las zonas, cuando no traen `elegida`, entonces se dibujan como no elegidas (sin error de expresión)', () => {
  const [relleno, borde, rotulo] = fragmentos.zonas;
  assert.deepEqual(relleno.paint['fill-opacity'], ['case', ['boolean', ['get', 'elegida'], false], 0.4, 0.22]);
  assert.deepEqual(borde.paint['line-width'], ['case', ['boolean', ['get', 'elegida'], false], 3, 2]);
  assert.deepEqual(relleno.paint['fill-color'], ['get', 'color']);
  assert.equal(rotulo.type, 'symbol');
  assert.deepEqual(rotulo.layout['text-font'], ['NotoSans-Medium'], 'una fuente que está en assets/glyphs');
});

test('dado el orden de apilado, cuando se arman los fragmentos, entonces las zonas van abajo y los grupos arriba', () => {
  const ids = estiloDePrueba().layers.map((c) => c.id);
  assert.ok(ids.indexOf(CAPAS.zonasRelleno) < ids.indexOf(CAPAS.casasDeLejos));
  assert.ok(ids.indexOf(CAPAS.casasDeLejos) < ids.indexOf(CAPAS.grupos));
});
