import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('dado que el repo recien se creo, cuando se lee el package.json, entonces es la libreria del mapa', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.name, '@colportores/lib-mapa');
});
