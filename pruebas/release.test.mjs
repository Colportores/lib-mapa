// La release (lib-mapa#5): la versión es una sola (package.json, dart/pubspec.yaml y el estilo), el CHANGELOG
// tiene su sección y el workflow publica lo que arma generadores/release.mjs.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { VERSION_DE_LA_LIBRERIA } from '../estilo/src/estilo.mjs';
import { comprobarVersiones, notasDe, versionDelPubspec } from '../generadores/release.mjs';

const leer = (ruta) => readFileSync(new URL(`../${ruta}`, import.meta.url), 'utf8');
const paquete = JSON.parse(leer('package.json')).version;

test('dada la versión del package.json, cuando se mira el paquete Dart y el estilo, entonces es la misma', () => {
  assert.match(paquete, /^\d+\.\d+\.\d+$/);
  assert.equal(versionDelPubspec(leer('dart/pubspec.yaml')), paquete);
  assert.equal(VERSION_DE_LA_LIBRERIA, paquete);
});

test('dado el CHANGELOG, cuando se busca la versión del package.json, entonces tiene su sección con texto', () => {
  const notas = notasDe(leer('CHANGELOG.md'), paquete);
  assert.match(notas, /Agregado|Cambiado|Arreglado/);
  assert.doesNotMatch(notas, /^## /m, 'no se lleva la sección siguiente');
});

test('dado un tag que no es la versión, cuando se comprueba, entonces falla', () => {
  assert.doesNotThrow(() => comprobarVersiones({ tag: 'v1.2.3', paquete: '1.2.3', pubspec: '1.2.3' }));
  assert.throws(() => comprobarVersiones({ tag: 'v1.2.4', paquete: '1.2.3', pubspec: '1.2.3' }), /tag/);
  assert.throws(() => comprobarVersiones({ tag: '1.2.3', paquete: '1.2.3', pubspec: '1.2.3' }), /tag/);
  assert.throws(() => comprobarVersiones({ tag: 'v1.2.3', paquete: '1.2.3', pubspec: '1.2.2' }), /pubspec/);
  assert.throws(() => comprobarVersiones({ tag: 'v1.2', paquete: '1.2', pubspec: '1.2' }), /X\.Y\.Z/);
});

test('dado un CHANGELOG con varias versiones, cuando se sacan las notas de una, entonces trae solo esa', () => {
  const changelog = '# Cambios\n\n## [1.1.0] - 2026-12-01\n\n### Cambiado\n\n- algo\n\n## [1.0.0] - 2026-11-10\n\n- lo primero\n\n[1.1.0]: https://x\n[1.0.0]: https://y\n';
  assert.equal(notasDe(changelog, '1.1.0'), '### Cambiado\n\n- algo\n');
  assert.equal(notasDe(changelog, '1.0.0'), '- lo primero\n');
  assert.throws(() => notasDe(changelog, '2.0.0'), /no tiene la sección/);
  assert.throws(() => notasDe('## [3.0.0]\n\n## [2.0.0]\n- x\n', '3.0.0'), /vacía/);
});

test('dado el workflow de release, cuando se lee, entonces se dispara con un tag vX.Y.Z, corre el check y publica lo que arma el generador', () => {
  const workflow = leer('.github/workflows/release.yml');
  assert.match(workflow, /tags:\s*\['v\[0-9\]\+\.\[0-9\]\+\.\[0-9\]\+'\]/);
  assert.match(workflow, /docker build -f dockerfile\.dev/);
  assert.match(workflow, /npm run check/);
  assert.match(workflow, /generadores\/release\.mjs --tag "\$GITHUB_REF_NAME"/);
  assert.match(workflow, /dist\/release\/colportores\.json/);
  assert.match(workflow, /lib-mapa-recursos-\$GITHUB_REF_NAME\.tar\.gz/);
});
