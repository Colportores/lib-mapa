// Casos de prueba del catálogo de mapas (lib-mapa#4): pruebas/catalogo/casos.json, para que el panel y la app
// los corran con su propia lógica. Acá se corren contra un traslado fiel de cada una (develop del 10/11):
// - panel: src/features/equipo/zonas/mapa-base/catalogo.ts (leerCatalogo + paqueteDeCiudad);
// - app: lib/features/tiles/data/models/catalogo_tiles_model.dart (desdeJson) + PaqueteTiles.cubre (ciudad).
// Si un caso da distinto en uno de los dos, el caso no es de los que ya coinciden: no va en casos.json.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const leer = (ruta) => JSON.parse(readFileSync(new URL(`./catalogo/${ruta}`, import.meta.url), 'utf8'));
const casos = leer('casos.json');
const catalogo = leer(casos.catalogo);

const esObjeto = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);

// --- Panel (catalogo.ts) ---
function resolverPanel(ruta, urlCatalogo) {
  if (typeof ruta !== 'string' || ruta === '') return null;
  try {
    const base = new URL(urlCatalogo);
    const url = new URL(ruta, base);
    const carpeta = base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1);
    return url.origin === base.origin && url.pathname.startsWith(carpeta) ? url.href : null;
  } catch {
    return null;
  }
}

function comoElPanel(json, urlCatalogo, ambitoId) {
  if (!esObjeto(json) || !Array.isArray(json.paquetes) || !esObjeto(json.estilo)) throw new Error('catálogo inválido');
  if (resolverPanel(json.estilo.url, urlCatalogo) === null) throw new Error('sin estilo');
  const paquetes = [];
  for (const crudo of json.paquetes) {
    if (!esObjeto(crudo) || crudo.nivel !== 'ciudad' || typeof crudo.ambito_id !== 'string' || !Array.isArray(crudo.partes)) continue;
    const partes = crudo.partes.map((p) => (esObjeto(p) ? resolverPanel(p.archivo, urlCatalogo) : null));
    if (partes.length === 0 || partes.some((p) => p === null)) continue;
    paquetes.push({ ambitoId: crudo.ambito_id, nombre: typeof crudo.nombre === 'string' ? crudo.nombre : '', partes });
  }
  const p = paquetes.find((x) => x.ambitoId === ambitoId);
  return p ? { nombre: p.nombre, partes: p.partes } : null;
}

// --- App (catalogo_tiles_model.dart) ---
const ID_VALIDO = /^[A-Za-z0-9_-]{1,80}$/;
const SHA256_VALIDO = /^[0-9a-fA-F]{64}$/;
const NIVELES = ['ciudad', 'departamento', 'uruguay'];

function resolverApp(base, archivo) {
  const tieneEsquema = /^[A-Za-z][A-Za-z0-9+.-]*:/.test(archivo);
  if (
    archivo === '' ||
    tieneEsquema ||
    archivo.startsWith('//') ||
    archivo.includes('?') ||
    archivo.includes('#') ||
    archivo.startsWith('/') ||
    archivo.split('/').some((s) => s === '..' || s === '.')
  ) {
    throw new Error(`ruta de parte inválida: ${archivo}`);
  }
  return new URL(archivo, base).href;
}

function paqueteApp(json, base) {
  if (typeof json.id !== 'string' || !ID_VALIDO.test(json.id)) throw new Error('id inválido');
  if (!NIVELES.includes(json.nivel)) throw new Error('nivel desconocido');
  const ambitoId = typeof json.ambito_id === 'string' && json.ambito_id.trim() !== '' ? json.ambito_id.trim() : null;
  if (json.nivel !== 'uruguay' && ambitoId === null) throw new Error('falta ambito_id');
  if (typeof json.version !== 'string' || json.version.trim() === '') throw new Error('sin version');
  if (!Array.isArray(json.partes) || json.partes.length === 0) throw new Error('sin partes');
  const partes = json.partes.map((p) => {
    const parte = esObjeto(p) ? p : {};
    if (typeof parte.archivo !== 'string') throw new Error('parte sin archivo');
    if (!Number.isInteger(parte.tamano_bytes) || parte.tamano_bytes <= 0) throw new Error('tamaño inválido');
    if (typeof parte.sha256 !== 'string' || !SHA256_VALIDO.test(parte.sha256)) throw new Error('sha256 inválido');
    return resolverApp(base, parte.archivo);
  });
  const nombre = typeof json.nombre === 'string' && json.nombre.trim() !== '' ? json.nombre.trim() : null;
  return { id: json.id, nivel: json.nivel, ambitoId: json.nivel === 'uruguay' ? null : ambitoId, nombre, partes };
}

function comoLaApp(json, urlCatalogo, ambitoId) {
  if (!esObjeto(json)) throw new Error('el catálogo no es un objeto');
  if (json.version !== 1) throw new Error('versión del catálogo no soportada');
  if (!Array.isArray(json.paquetes)) throw new Error('el catálogo no trae paquetes');
  const paquetes = [];
  const vistos = new Set();
  for (const item of json.paquetes) {
    try {
      if (!esObjeto(item)) throw new Error('no es un objeto');
      const p = paqueteApp(item, urlCatalogo);
      if (vistos.has(p.id)) throw new Error('id repetido');
      vistos.add(p.id);
      paquetes.push(p);
    } catch {
      // descartado, sin tirar el resto
    }
  }
  const p = paquetes.find((x) => x.nivel === 'ciudad' && x.ambitoId === ambitoId);
  return p ? { nombre: p.nombre, partes: p.partes } : null;
}

test('dados los casos del catálogo, cuando se leen, entonces cada uno tiene nombre, ambitoId y salida esperada', () => {
  assert.equal(casos.version, 1);
  assert.ok(casos.casos.length >= 8);
  const nombres = casos.casos.map((c) => c.nombre);
  assert.equal(new Set(nombres).size, nombres.length, 'dos casos con el mismo nombre');
  for (const c of casos.casos) {
    assert.equal(typeof c.ambitoId, 'string', c.nombre);
    assert.ok('esperado' in c, c.nombre);
    if (c.esperado !== null) for (const parte of c.esperado.partes) assert.match(parte, /^https:\/\/.+\.pmtiles$/);
  }
  assert.ok(casos.casos.some((c) => c.esperado === null) && casos.casos.some((c) => c.esperado !== null));
});

for (const [front, elegir] of [
  ['el panel', comoElPanel],
  ['la app', comoLaApp],
]) {
  for (const caso of casos.casos) {
    test(`dado el catálogo de ejemplo, cuando ${front} busca la ciudad, entonces ${caso.nombre}`, () => {
      assert.deepEqual(elegir(catalogo, casos.urlDelCatalogo, caso.ambitoId), caso.esperado);
    });
  }
}

test('dado el catálogo de ejemplo, cuando se lee, entonces cumple el contrato de backend (versión 1, estilo y rutas relativas en las ciudades buenas)', () => {
  assert.equal(catalogo.version, 1);
  assert.equal(catalogo.estilo.url, 'estilo/colportores.json');
  assert.equal(catalogo.fuente.atribucion, '© OpenStreetMap contributors');
  for (const p of catalogo.paquetes) assert.equal(p.nivel, 'ciudad', 'los paquetes de zona nunca van en el catálogo');
});
