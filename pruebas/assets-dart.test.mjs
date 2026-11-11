// El estilo, las letras y los íconos dentro del paquete Dart (P1 de lib-mapa#5, ADR-019): la copia de
// dart/assets/mapa/ está al día con estilo/ y assets/, y cada carpeta está declarada en `flutter: assets:` para
// que la app la lea como `packages/colportores_mapa/assets/mapa/…`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assetsDart, carpetasDeclarables, desfases } from '../generadores/assets-dart.mjs';
import { VERSION_DE_LA_LIBRERIA } from '../estilo/src/estilo.mjs';

const esperados = await assetsDart();
const pubspec = readFileSync(new URL('../dart/pubspec.yaml', import.meta.url), 'utf8');

/** Las entradas de `flutter: assets:` del pubspec. */
function assetsDelPubspec(texto) {
  const bloque = texto.match(/^flutter:\n {2}assets:\n((?: {4}- .+\n)+)/m);
  assert.ok(bloque, 'dart/pubspec.yaml no tiene `flutter: assets:`');
  return bloque[1].trim().split('\n').map((l) => l.replace(/^\s*-\s*/, '').trim());
}

test('dado dart/assets/mapa/, cuando se compara con lo que genera generar-assets-dart, entonces está al día (nadie lo editó a mano)', async () => {
  assert.deepEqual(await desfases(esperados), [], 'corré `npm run generar-assets-dart`');
});

test('dada la copia para la app, cuando se lista, entonces trae el estilo, las tres letras, los sprites a 1x y 2x y los avisos de licencia', () => {
  const rutas = [...esperados.keys()];
  for (const ruta of [
    'estilo/colportores.json',
    'glyphs/NotoSans-Regular/0-255.pbf',
    'glyphs/NotoSans-Medium/0-255.pbf',
    'glyphs/NotoSans-Italic/0-255.pbf',
    'glyphs/OFL.txt',
    'sprites/grayscale.json',
    'sprites/grayscale.png',
    'sprites/grayscale@2x.json',
    'sprites/grayscale@2x.png',
    'NOTICE.md',
    'NOTICE-assets.md',
  ]) {
    assert.ok(rutas.includes(ruta), `falta ${ruta}`);
  }
  assert.ok(!rutas.some((r) => r.endsWith('.pmtiles')), 'nunca PMTiles en el paquete');
  assert.match(esperados.get('NOTICE.md').toString('utf8'), /ODbL/);
});

test('dado el estilo de la copia, cuando se lee, entonces es el de esta versión, con las rutas para reemplazar y las letras que trae la copia', () => {
  const estilo = JSON.parse(esperados.get('estilo/colportores.json').toString('utf8'));
  assert.equal(estilo.metadata['colportores:estilo'], VERSION_DE_LA_LIBRERIA);
  assert.match(estilo.glyphs, /^https:\/\/REEMPLAZAR\/estilo\/glyphs\/\{fontstack\}\/\{range\}\.pbf$/);
  assert.match(estilo.sprite, /^https:\/\/REEMPLAZAR\/estilo\/sprites\//);
  assert.equal(Object.values(estilo.sources)[0].url, 'pmtiles://REEMPLAZAR');
  // `text-font` puede ser una expresión (`case`): se juntan los nombres de letra de cualquier profundidad.
  const fuentes = new Set(estilo.layers.flatMap((c) => [c.layout?.['text-font'] ?? []].flat(Infinity)).filter((f) => /^NotoSans-/.test(f)));
  assert.ok(fuentes.size >= 2);
  for (const fuente of fuentes) {
    assert.ok(esperados.has(`glyphs/${fuente}/0-255.pbf`), `el estilo usa ${fuente} y la copia no la trae`);
  }
});

test('dado el pubspec del paquete Dart, cuando se mira `flutter: assets:`, entonces declara cada carpeta de la copia, ni más ni menos', () => {
  assert.deepEqual(assetsDelPubspec(pubspec).sort(), carpetasDeclarables(esperados.keys()));
  assert.doesNotMatch(pubspec, /sdk:\s*flutter/, 'el paquete sigue siendo Dart puro');
});
