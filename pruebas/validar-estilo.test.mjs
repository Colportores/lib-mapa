import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const script = join(raiz, 'estilo', 'validar.mjs');
const valido = join(raiz, 'pruebas', 'fixtures', 'estilo-minimo-valido.json');
const invalido = join(raiz, 'pruebas', 'fixtures', 'estilo-invalido.json');

function validar(args, cwd = raiz) {
  return spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8' });
}

function conCarpetaTemporal(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'lib-mapa-'));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('dado un estilo v8 valido, cuando se valida, entonces gl-style-validate lo acepta', () => {
  const r = validar([valido]);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.match(r.stdout, /1 estilo\(s\) valido/);
});

test('dado un estilo con una capa de tipo inexistente, cuando se valida, entonces falla y dice cual', () => {
  const r = validar([invalido]);
  assert.equal(r.status, 1);
  assert.match(r.stdout + r.stderr, /capa-que-no-existe/);
});

test('dado un estilo valido y uno invalido juntos, cuando se validan, entonces falla', () => {
  const r = validar([valido, invalido]);
  assert.equal(r.status, 1);
});

test('dada una carpeta con estilos validos, cuando se valida la carpeta, entonces valida todos sus JSON', () => {
  conCarpetaTemporal((dir) => {
    copyFileSync(valido, join(dir, 'a.json'));
    copyFileSync(valido, join(dir, 'b.json'));
    const r = validar([dir]);
    assert.equal(r.status, 0, r.stderr + r.stdout);
    assert.match(r.stdout, /2 estilo\(s\) valido/);
  });
});

test('dado que todavia no se genero el estilo, cuando se valida sin argumentos, entonces avisa y no falla', () => {
  conCarpetaTemporal((dir) => {
    const r = validar([], dir);
    assert.equal(r.status, 0, r.stderr + r.stdout);
    assert.match(r.stdout, /todavia no hay estilo generado/);
  });
});

test('dado un estilo invalido en dist/estilo, cuando se valida sin argumentos, entonces falla', () => {
  conCarpetaTemporal((dir) => {
    mkdirSync(join(dir, 'dist', 'estilo'), { recursive: true });
    copyFileSync(invalido, join(dir, 'dist', 'estilo', 'colportores.json'));
    const r = validar([], dir);
    assert.equal(r.status, 1);
  });
});

test('dada una ruta que no existe, cuando se valida, entonces falla en vez de pasar en silencio', () => {
  const r = validar([join(raiz, 'pruebas', 'fixtures', 'no-existe.json')]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /no existe/);
});

test('dada una carpeta sin JSON, cuando se valida, entonces falla', () => {
  conCarpetaTemporal((dir) => {
    const r = validar([dir]);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /no hay archivos JSON/);
  });
});
