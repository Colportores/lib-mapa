// Lo que las capturas de pruebas/visual/ necesitan y se puede probar sin MapLibre Native ni pantalla (lib-mapa#5):
// la comparación con tolerancia, la muestra de Montevideo y su aviso, las vistas y sus referencias y el estilo
// que se dibuja. Las capturas en sí corren con `npm run capturas` (en el check y en el CI).

import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { test } from 'node:test';
import { validateStyleMin } from '@maplibre/maplibre-gl-style-spec';
import { PNG } from 'pngjs';
import { CAPAS, FUENTES } from '../estilo/capas/capas.mjs';
import { NOMBRE_DE_LA_FUENTE } from '../estilo/src/estilo.mjs';
import { sinComentarios } from '../generadores/tokens.mjs';
import { comparar, MAXIMO_DISTINTOS } from './visual/comparar.mjs';
import { estiloParaCapturas, MUESTRA } from './visual/renderizar.mjs';
import { ALTO, ANCHO, CENTRO, casasDePrueba, VISTAS } from './visual/vistas.mjs';

const TOKENS = sinComentarios(JSON.parse(readFileSync(new URL('../tokens/tokens.json', import.meta.url), 'utf8')));

/** Un PNG de ancho × alto de un color, con los primeros `pintados` píxeles de otro. */
function png(ancho, alto, pintados = 0) {
  const imagen = new PNG({ width: ancho, height: alto });
  for (let i = 0; i < ancho * alto; i++) {
    const [r, g, b] = i < pintados ? [200, 30, 30] : [246, 245, 240];
    imagen.data.set([r, g, b, 255], i * 4);
  }
  return PNG.sync.write(imagen);
}

test('dadas dos capturas iguales, cuando se comparan, entonces coinciden sin píxeles distintos', () => {
  const r = comparar(png(100, 100), png(100, 100));
  assert.equal(r.iguales, true);
  assert.equal(r.distintos, 0);
});

test('dada una captura con menos píxeles distintos que la tolerancia, cuando se compara, entonces coincide', () => {
  const pocos = Math.floor(100 * 100 * MAXIMO_DISTINTOS); // justo en el tope
  const r = comparar(png(100, 100, pocos), png(100, 100));
  assert.equal(r.distintos, pocos);
  assert.equal(r.iguales, true);
});

test('dada una captura con más píxeles distintos que la tolerancia, cuando se compara, entonces no coincide y marca las diferencias', () => {
  const r = comparar(png(100, 100, 100), png(100, 100));
  assert.equal(r.iguales, false);
  assert.equal(r.distintos, 100);
  assert.ok(PNG.sync.read(r.diferencias).width === 100);
});

test('dada una captura de otro tamaño, cuando se compara, entonces no coincide y dice por qué', () => {
  const r = comparar(png(100, 100), png(100, 90));
  assert.equal(r.iguales, false);
  assert.match(r.motivo, /tamaño/);
});

test('dada la muestra de Montevideo, cuando se mira, entonces es chica, solo z15 y tiene su aviso ODbL', async () => {
  assert.ok(statSync(MUESTRA).size < 1024 * 1024, 'la muestra tiene que ser chica (nunca un PMTiles completo)');
  const { archivo } = await estiloParaCapturas();
  const cabecera = await archivo.getHeader();
  assert.equal(cabecera.minZoom, TOKENS.zoom.corteDeTiles);
  assert.equal(cabecera.maxZoom, TOKENS.zoom.corteDeTiles);
  const [lon, lat] = CENTRO;
  assert.ok(cabecera.minLon <= lon && lon <= cabecera.maxLon && cabecera.minLat <= lat && lat <= cabecera.maxLat, 'el centro de las capturas está en la muestra');
  const aviso = readFileSync(new URL('./fixtures/NOTICE.md', import.meta.url), 'utf8');
  assert.match(aviso, /© OpenStreetMap contributors/);
  assert.match(aviso, /ODbL/);
});

test('dada la muestra, cuando se pide la tesela z15 del centro, entonces trae números de puerta de OSM', async () => {
  const { archivo } = await estiloParaCapturas();
  const [lon, lat] = CENTRO;
  const n = 2 ** 15;
  const x = Math.floor(((lon + 180) / 360) * n);
  const y = Math.floor(((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * n);
  const tesela = await archivo.getZxy(15, x, y);
  assert.ok(tesela, 'la tesela del centro está en la muestra');
  assert.ok(Buffer.from(tesela.data).includes('addr_housenumber'), 'la tesela z15 trae addr_housenumber');
});

test('dadas las vistas, cuando se miran, entonces cubren z16, z17 y z18 y cada una tiene su referencia del tamaño de la captura', () => {
  const zooms = new Set(VISTAS.map((v) => v.zoom));
  for (const z of [16, 17, 18]) assert.ok(zooms.has(z), `falta una captura a z${z}`);
  assert.equal(new Set(VISTAS.map((v) => v.nombre)).size, VISTAS.length, 'nombres repetidos');
  for (const vista of VISTAS) {
    const ruta = new URL(`./visual/referencia/${vista.nombre}.png`, import.meta.url);
    assert.ok(existsSync(ruta), `falta pruebas/visual/referencia/${vista.nombre}.png (npm run capturas:regenerar)`);
    const ref = PNG.sync.read(readFileSync(ruta));
    assert.deepEqual([ref.width, ref.height], [ANCHO, ALTO]);
  }
});

test('dado el estilo de las capturas, cuando se arma, entonces es el de la librería apuntado a la muestra y es válido', async () => {
  const { estilo } = await estiloParaCapturas();
  assert.deepEqual(validateStyleMin(estilo), []);
  const fuente = estilo.sources[NOMBRE_DE_LA_FUENTE];
  assert.equal(fuente.maxzoom, TOKENS.zoom.corteDeTiles);
  assert.match(fuente.tiles[0], /\{z\}\/\{x\}\/\{y\}/);
  assert.ok(estilo.layers.some((c) => c.id === 'address_label'), 'dibuja los números de puerta de OSM');
  assert.ok(!estilo.layers.some((c) => c.id.startsWith('colportores:')), 'sin capas propias');
});

test('dado el estilo de las capturas con capas, cuando se arma, entonces suma los fragmentos encima con una zona y una casa por estado', async () => {
  const { estilo } = await estiloParaCapturas({ capas: true });
  assert.deepEqual(validateStyleMin(estilo), []);
  for (const fuente of Object.values(FUENTES)) assert.ok(estilo.sources[fuente], `falta la fuente ${fuente}`);
  const ids = estilo.layers.map((c) => c.id);
  for (const capa of Object.values(CAPAS)) assert.ok(ids.indexOf(capa) > ids.indexOf('address_label'), `${capa} va encima de los números de OSM`);
  const estados = new Set(casasDePrueba().features.map((f) => f.properties.estado));
  assert.deepEqual([...estados].sort(), TOKENS.estadosDeCasa.map((e) => e.clave).sort());
});
