#!/usr/bin/env node
// Capturas de referencia del estilo a z16, z17 y z18 (lib-mapa#5). Corre en la imagen de dockerfile.dev:
//
//   npm run capturas                 # dibuja cada vista y la compara con pruebas/visual/referencia/ (con tolerancia)
//   npm run capturas:regenerar       # vuelve a escribir las referencias (cuando el cambio de aspecto es a propósito)
//   npm run capturas -- --solo z18   # una sola vista (también con --regenerar)
//
// Si una captura no coincide, deja en dist/capturas/ la nueva (`<vista>.png`) y los píxeles distintos en rojo
// (`<vista>.diferencias.png`) y sale con 1. Los dos scripts de npm ya corren con `xvfb-run -a`.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { comparar, MAXIMO_DISTINTOS } from './comparar.mjs';
import { renderizar } from './renderizar.mjs';
import { VISTAS } from './vistas.mjs';

const REFERENCIAS = fileURLToPath(new URL('./referencia/', import.meta.url));
const SALIDA = fileURLToPath(new URL('../../dist/capturas/', import.meta.url));

const { values } = parseArgs({ options: { regenerar: { type: 'boolean', default: false }, solo: { type: 'string' } } });
const vistas = values.solo ? VISTAS.filter((v) => v.nombre === values.solo) : VISTAS;
if (vistas.length === 0) {
  console.error(`capturas: no hay ninguna vista «${values.solo}» (hay: ${VISTAS.map((v) => v.nombre).join(', ')})`);
  process.exit(2);
}

const porciento = (p) => `${(p * 100).toFixed(3)} %`;
let fallas = 0;
await mkdir(REFERENCIAS, { recursive: true });

for (const vista of vistas) {
  const { png, faltantes } = await renderizar(vista);
  const sprites = faltantes.filter((f) => f.startsWith('sprites/'));
  if (sprites.length > 0) {
    console.error(`✗ ${vista.nombre}: faltan sprites en assets/: ${sprites.join(', ')}`);
    fallas++;
    continue;
  }
  if (faltantes.length > 0) console.log(`  ${vista.nombre}: rangos de glyphs que no están en assets/ (se dibuja sin ellos): ${faltantes.join(', ')}`);

  const referencia = join(REFERENCIAS, `${vista.nombre}.png`);
  if (values.regenerar) {
    await writeFile(referencia, png);
    console.log(`↻ ${vista.nombre}: referencia escrita (${png.length} bytes)`);
    continue;
  }
  if (!existsSync(referencia)) {
    console.error(`✗ ${vista.nombre}: no hay referencia en ${referencia}; generala con npm run capturas:regenerar`);
    fallas++;
    continue;
  }
  const r = comparar(png, await readFile(referencia));
  if (r.iguales) {
    console.log(`✓ ${vista.nombre}: ${r.distintos} píxeles distintos (${porciento(r.proporcion)}, tope ${porciento(MAXIMO_DISTINTOS)})`);
    continue;
  }
  fallas++;
  await mkdir(SALIDA, { recursive: true });
  await writeFile(join(SALIDA, `${vista.nombre}.png`), png);
  if (r.diferencias) await writeFile(join(SALIDA, `${vista.nombre}.diferencias.png`), r.diferencias);
  console.error(
    `✗ ${vista.nombre}: ${r.motivo ?? `${r.distintos} píxeles distintos (${porciento(r.proporcion)}, tope ${porciento(MAXIMO_DISTINTOS)})`}; ` +
      `la nueva y las diferencias quedaron en dist/capturas/. Si el cambio es a propósito: npm run capturas:regenerar`,
  );
}

if (fallas > 0) {
  console.error(`capturas: ${fallas} de ${vistas.length} no coinciden con la referencia`);
  process.exit(1);
}
console.log(`capturas: ${vistas.length} ${values.regenerar ? 'referencias escritas' : 'coinciden con la referencia'}`);
