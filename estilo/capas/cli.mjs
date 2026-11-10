#!/usr/bin/env node
// Escribe dist/capas/fragmentos-de-prueba.json: un estilo mínimo con todos los fragmentos de capa, para que
// `npm run validar-estilo` (gl-style-validate) los valide igual que al estilo (lib-mapa#4). No se publica.
//
//   node estilo/capas/cli.mjs [--salida DIR]

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { estiloDePrueba } from './capas.mjs';

const RAIZ = fileURLToPath(new URL('../..', import.meta.url));
const { values } = parseArgs({ options: { salida: { type: 'string' } } });

const salida = values.salida ?? join(RAIZ, 'dist', 'capas');
await mkdir(salida, { recursive: true });
await writeFile(join(salida, 'fragmentos-de-prueba.json'), `${JSON.stringify(estiloDePrueba(), null, 2)}\n`);
console.log(`fragmentos escritos en ${join(salida, 'fragmentos-de-prueba.json')}`);
