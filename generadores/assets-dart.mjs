#!/usr/bin/env node
// Copia generada del estilo, las letras y los íconos dentro del paquete Dart (P1 de lib-mapa#5, ADR-019): la app
// toma `assets/mapa` del paquete `colportores_mapa` (`packages/colportores_mapa/assets/mapa/…`), y pub con git
// baja solo la carpeta `dart/`. Se commitea, como los `.g.`, y nunca se edita a mano:
//
//   node generadores/assets-dart.mjs              # reescribe dart/assets/mapa/ (y borra lo que sobra)
//   node generadores/assets-dart.mjs --comprobar  # falla si dart/assets/mapa/ no está al día (lo usa el CI)
//
// Qué lleva (el mismo armado que la release, `generadores/release.mjs`):
// - `estilo/colportores.json`: el estilo con `https://REEMPLAZAR/estilo` y `pmtiles://REEMPLAZAR` (la app pone
//   sus rutas de glyphs, sprites y PMTiles, como hace hoy).
// - `glyphs/` y `sprites/`: los de `assets/`, tal cual.
// - `NOTICE.md` (el de la raíz) y `NOTICE-assets.md` (el de `assets/`): los avisos de licencia.
//
// Cada carpeta con archivos tiene que estar en `flutter: assets:` de dart/pubspec.yaml (Flutter no entra en las
// subcarpetas); `pruebas/assets-dart.test.mjs` lo comprueba.

import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { armarEstilo, leerPaleta } from '../estilo/src/estilo.mjs';
import { URL_BASE_DE_LA_RELEASE } from './release.mjs';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));

/** Dónde queda la copia, relativa a la raíz del repo. */
export const CARPETA_DE_ASSETS_DART = 'dart/assets/mapa';

/** Los archivos de una carpeta, con la ruta relativa en `/`, a cualquier profundidad (vacío si no existe). */
export async function listar(carpeta, prefijo = '') {
  let entradas;
  try {
    entradas = await readdir(carpeta, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  const archivos = [];
  for (const e of entradas.sort((a, b) => a.name.localeCompare(b.name))) {
    const relativa = prefijo ? posix.join(prefijo, e.name) : e.name;
    if (e.isDirectory()) archivos.push(...(await listar(join(carpeta, e.name), relativa)));
    else archivos.push(relativa);
  }
  return archivos;
}

/** Lo que tiene que haber en dart/assets/mapa/: ruta relativa -> contenido (Buffer). */
export async function assetsDart() {
  const archivos = new Map();
  const estilo = armarEstilo({ urlBase: URL_BASE_DE_LA_RELEASE, paleta: await leerPaleta() });
  archivos.set('estilo/colportores.json', Buffer.from(`${JSON.stringify(estilo, null, 2)}\n`));
  for (const carpeta of ['glyphs', 'sprites']) {
    for (const relativa of await listar(join(RAIZ, 'assets', carpeta))) {
      archivos.set(`${carpeta}/${relativa}`, await readFile(join(RAIZ, 'assets', carpeta, relativa)));
    }
  }
  archivos.set('NOTICE.md', await readFile(join(RAIZ, 'NOTICE.md')));
  archivos.set('NOTICE-assets.md', await readFile(join(RAIZ, 'assets', 'NOTICE.md')));
  return archivos;
}

/** Las diferencias entre lo esperado y lo que hay en `carpeta`: faltan, sobran o cambiaron. */
export async function desfases(esperados, carpeta = join(RAIZ, CARPETA_DE_ASSETS_DART)) {
  const hay = new Set(await listar(carpeta));
  const lista = [];
  for (const [ruta, contenido] of esperados) {
    if (!hay.has(ruta)) lista.push(`falta ${ruta}`);
    else if (!contenido.equals(await readFile(join(carpeta, ruta)))) lista.push(`cambió ${ruta}`);
  }
  for (const ruta of hay) if (!esperados.has(ruta)) lista.push(`sobra ${ruta}`);
  return lista;
}

/** Las carpetas (relativas a dart/) que Flutter tiene que declarar en `flutter: assets:`, terminadas en `/`. */
export function carpetasDeclarables(rutas) {
  return [...new Set([...rutas].map((r) => `${posix.join('assets/mapa', posix.dirname(r))}/`))].sort();
}

async function escribir(esperados) {
  const carpeta = join(RAIZ, CARPETA_DE_ASSETS_DART);
  await rm(carpeta, { recursive: true, force: true });
  for (const [ruta, contenido] of esperados) {
    await mkdir(dirname(join(carpeta, ruta)), { recursive: true });
    await writeFile(join(carpeta, ruta), contenido);
  }
  console.log(`assets-dart: ${esperados.size} archivos escritos en ${CARPETA_DE_ASSETS_DART}/`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { values } = parseArgs({ options: { comprobar: { type: 'boolean', default: false } } });
  const esperados = await assetsDart();
  if (values.comprobar) {
    const lista = await desfases(esperados);
    if (lista.length > 0) {
      console.error(`assets-dart: ${CARPETA_DE_ASSETS_DART}/ no está al día (${lista.join(', ')}). Corré \`npm run generar-assets-dart\`.`);
      process.exit(1);
    }
    console.log(`assets-dart: ${esperados.size} archivos al día en ${CARPETA_DE_ASSETS_DART}/.`);
  } else {
    await escribir(esperados);
  }
}
