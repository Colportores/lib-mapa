import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const leer = (ruta) => readFileSync(new URL(`../${ruta}`, import.meta.url), 'utf8');

test('dado que el repo recien se creo, cuando se lee el package.json, entonces es la libreria del mapa', () => {
  const pkg = JSON.parse(leer('package.json'));
  assert.equal(pkg.name, '@colportores/lib-mapa');
});

test('dada la estructura prevista (ADR-019), cuando se mira el repo, entonces cada carpeta existe con su README', () => {
  for (const carpeta of ['estilo', 'assets', 'tokens', 'generadores', 'dart', 'ts', 'pruebas']) {
    assert.ok(existsSync(new URL(`../${carpeta}/README.md`, import.meta.url)), `falta ${carpeta}/README.md`);
  }
});

test('dados los datos de terceros, cuando se lee NOTICE.md, entonces tiene la atribucion de OSM y las cuatro licencias', () => {
  const notice = leer('NOTICE.md');
  assert.match(notice, /© OpenStreetMap contributors/);
  for (const licencia of ['ODbL', 'OFL', 'MIT', 'BSD-3']) {
    assert.match(notice, new RegExp(licencia), `NOTICE.md no menciona ${licencia}`);
  }
});

test('dado el README, cuando se lee, entonces lleva la atribucion de OSM', () => {
  assert.match(leer('README.md'), /© OpenStreetMap contributors/);
});
