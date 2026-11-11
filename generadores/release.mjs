#!/usr/bin/env node
// Arma los archivos de una release de lib-mapa (lib-mapa#5) en dist/release/:
//
//   node generadores/release.mjs [--tag vX.Y.Z]
//
// - `colportores.json`: el estilo, el mismo de `npm run generar-estilo` (glyphs y sprites con `https://REEMPLAZAR/estilo`
//   y la fuente con `pmtiles://REEMPLAZAR`: cada destino pone los suyos, como hacen el publicador y la app).
// - `lib-mapa-recursos-vX.Y.Z.tar.gz`: el estilo, los glyphs y los sprites de assets/, con los avisos de licencia.
// - `NOTAS.md`: la sección de esa versión del CHANGELOG.md (el texto de la release).
//
// Falla si el tag no es `v` + la versión del package.json y del paquete Dart (dart/pubspec.yaml), o si el
// CHANGELOG no tiene la sección. Sin --tag usa la del package.json: así el CI la arma en cada PR sin publicar
// nada; el workflow release.yml la corre con el tag que se acaba de subir y publica la release.

import { spawnSync } from 'node:child_process';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { armarEstilo, leerPaleta } from '../estilo/src/estilo.mjs';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));

/** La URL base de los glyphs y sprites en el estilo de la release: la misma que `npm run generar-estilo`. */
export const URL_BASE_DE_LA_RELEASE = 'https://REEMPLAZAR/estilo';

/** La `version:` de un pubspec.yaml. */
export function versionDelPubspec(pubspec) {
  const m = pubspec.match(/^version:\s*([^\s#]+)/m);
  if (!m) throw new Error('dart/pubspec.yaml no tiene `version:`');
  return m[1];
}

/** El tag tiene que ser `v` + la versión, y la versión, la misma en el package.json y en el pubspec. */
export function comprobarVersiones({ tag, paquete, pubspec }) {
  if (!/^\d+\.\d+\.\d+$/.test(paquete)) throw new Error(`la versión del package.json no es X.Y.Z: ${paquete}`);
  if (pubspec !== paquete) throw new Error(`dart/pubspec.yaml dice ${pubspec} y package.json ${paquete}: tienen que ser iguales`);
  if (tag !== `v${paquete}`) throw new Error(`el tag ${tag} no es la versión del package.json (v${paquete})`);
}

/** La sección `## [X.Y.Z]` del CHANGELOG, sin el título (hasta la próxima `## ` o los links del final). */
export function notasDe(changelog, version) {
  const lineas = changelog.split('\n');
  const desde = lineas.findIndex((l) => l.startsWith(`## [${version}]`));
  if (desde === -1) throw new Error(`CHANGELOG.md no tiene la sección ## [${version}]`);
  const resto = lineas.slice(desde + 1);
  const hasta = resto.findIndex((l) => l.startsWith('## ') || /^\[[^\]]+\]:\s/.test(l));
  const notas = (hasta === -1 ? resto : resto.slice(0, hasta)).join('\n').trim();
  if (!notas) throw new Error(`la sección ## [${version}] del CHANGELOG.md está vacía`);
  return `${notas}\n`;
}

async function armar(tag) {
  const paquete = JSON.parse(await readFile(join(RAIZ, 'package.json'), 'utf8')).version;
  const pubspec = versionDelPubspec(await readFile(join(RAIZ, 'dart', 'pubspec.yaml'), 'utf8'));
  const elTag = tag ?? `v${paquete}`;
  comprobarVersiones({ tag: elTag, paquete, pubspec });
  const notas = notasDe(await readFile(join(RAIZ, 'CHANGELOG.md'), 'utf8'), paquete);

  const salida = join(RAIZ, 'dist', 'release');
  const recursos = join(salida, 'recursos');
  await rm(salida, { recursive: true, force: true });
  await mkdir(join(recursos, 'estilo'), { recursive: true });

  const estilo = `${JSON.stringify(armarEstilo({ urlBase: URL_BASE_DE_LA_RELEASE, paleta: await leerPaleta() }), null, 2)}\n`;
  await writeFile(join(salida, 'colportores.json'), estilo);
  await writeFile(join(recursos, 'estilo', 'colportores.json'), estilo);
  await cp(join(RAIZ, 'assets', 'glyphs'), join(recursos, 'glyphs'), { recursive: true });
  await cp(join(RAIZ, 'assets', 'sprites'), join(recursos, 'sprites'), { recursive: true });
  await cp(join(RAIZ, 'assets', 'NOTICE.md'), join(recursos, 'NOTICE-assets.md'));
  await cp(join(RAIZ, 'NOTICE.md'), join(recursos, 'NOTICE.md'));
  await writeFile(join(salida, 'NOTAS.md'), notas);

  const tar = `lib-mapa-recursos-${elTag}.tar.gz`;
  const r = spawnSync('tar', ['-czf', join(salida, tar), '--sort=name', '--owner=0', '--group=0', '--numeric-owner', '-C', recursos, '.'], {
    stdio: 'inherit',
  });
  if (r.status !== 0) throw new Error(`tar falló (${r.error?.message ?? r.status})`);
  await rm(recursos, { recursive: true });
  console.log(`release ${elTag} armada en dist/release/: colportores.json, ${tar}, NOTAS.md`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { values } = parseArgs({ options: { tag: { type: 'string' } } });
  armar(values.tag).catch((error) => {
    console.error(`release: ${error.message}`);
    process.exit(1);
  });
}
