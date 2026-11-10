#!/usr/bin/env node
// Genera los tokens y los fragmentos de capa para cada front (lib-mapa#4):
//
//   node generadores/cli.mjs              # escribe dart/lib/tokens.g.dart, ts/src/tokens.g.ts y ts/src/capas.g.ts
//   node generadores/cli.mjs --comprobar  # falla si alguno no está al día con tokens/tokens.json (lo usa el CI)
//
// Los .g. se commitean (los fronts los usan por tag git, sin correr nada) y nunca se editan a mano.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import * as capas from '../estilo/capas/capas.mjs';
import { generarTokensDart } from './dart.mjs';
import { leerTokens } from './tokens.mjs';
import { generarCapasTs, generarTokensTs } from './ts.mjs';

/** Cada archivo generado y su contenido esperado. */
export function archivosGenerados(tokens = leerTokens()) {
  return [
    ['dart/lib/tokens.g.dart', generarTokensDart(tokens)],
    ['ts/src/tokens.g.ts', generarTokensTs(tokens)],
    ['ts/src/capas.g.ts', generarCapasTs(capas)],
  ].map(([ruta, contenido]) => ({ ruta, absoluta: fileURLToPath(new URL(`../${ruta}`, import.meta.url)), contenido }));
}

function leer(ruta) {
  try {
    return readFileSync(ruta, 'utf8');
  } catch {
    return null;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({ options: { comprobar: { type: 'boolean', default: false } } });
  const archivos = archivosGenerados();
  if (values.comprobar) {
    const viejos = archivos.filter((a) => leer(a.absoluta) !== a.contenido).map((a) => a.ruta);
    if (viejos.length > 0) {
      console.error(`generar-tokens: no están al día con tokens/tokens.json: ${viejos.join(', ')}. Corré \`npm run generar-tokens\`.`);
      process.exit(1);
    }
    console.log(`generar-tokens: ${archivos.length} archivos al día.`);
  } else {
    for (const a of archivos) {
      writeFileSync(a.absoluta, a.contenido);
      console.log(`escrito ${a.ruta}`);
    }
  }
}
