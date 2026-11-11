#!/usr/bin/env node
// Genera el estilo de MapLibre en un directorio (por defecto dist/estilo/colportores.json).
//
//   node estilo/src/cli.mjs --url-base URL [--salida DIR]
//
// `--url-base` es donde van a quedar publicados los glyphs y los sprites (MapLibre los pide con URLs
// absolutas); el publicador de backend-supabase pasa la de su bucket. `npm run generar-estilo` usa
// `https://REEMPLAZAR/estilo`, solo para validar el JSON con gl-style-validate (en el CI y en `npm run check`).
// Nada de esto lee secretos ni variables de entorno.

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { armarEstilo, leerPaleta } from './estilo.mjs';

const RAIZ = fileURLToPath(new URL('../..', import.meta.url));

const { values: opciones } = parseArgs({
  options: {
    'url-base': { type: 'string' },
    salida: { type: 'string' },
  },
});

if (!opciones['url-base']) {
  console.error('Uso: node estilo/src/cli.mjs --url-base URL [--salida DIR]');
  process.exit(2);
}

const salida = opciones.salida ?? join(RAIZ, 'dist', 'estilo');
const estilo = armarEstilo({ urlBase: opciones['url-base'], paleta: await leerPaleta() });
await mkdir(salida, { recursive: true });
await writeFile(join(salida, 'colportores.json'), `${JSON.stringify(estilo, null, 2)}\n`);
console.log(`estilo escrito en ${join(salida, 'colportores.json')}`);
