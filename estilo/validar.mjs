// Valida los estilos MapLibre generados con `gl-style-validate` (@maplibre/maplibre-gl-style-spec).
//
//   node estilo/validar.mjs                 # valida los *.json de dist/estilo/ (si todavia no hay, avisa y sale bien)
//   node estilo/validar.mjs <archivo|carpeta>...
//
// Sin argumentos no falla si falta dist/estilo/: el estilo se genera desde lib-mapa#2. Con argumentos, una ruta
// que no existe o que no tiene ningun JSON es un error (para que una ruta mal escrita no pase en silencio).
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RUTA_POR_DEFECTO = 'dist/estilo';
const validador = fileURLToPath(new URL('../node_modules/.bin/gl-style-validate', import.meta.url));

function jsonDe(ruta) {
  if (statSync(ruta).isDirectory()) {
    return readdirSync(ruta)
      .filter((nombre) => nombre.endsWith('.json'))
      .sort()
      .map((nombre) => join(ruta, nombre));
  }
  return [ruta];
}

const argumentos = process.argv.slice(2);
const porDefecto = argumentos.length === 0;
const rutas = (porDefecto ? [RUTA_POR_DEFECTO] : argumentos).map((r) => resolve(r));

const faltantes = rutas.filter((r) => !existsSync(r));
if (faltantes.length > 0 && !porDefecto) {
  console.error(`validar-estilo: no existe: ${faltantes.join(', ')}`);
  process.exit(1);
}

const archivos = rutas.filter((r) => existsSync(r)).flatMap(jsonDe);
if (archivos.length === 0) {
  if (porDefecto) {
    console.log(`validar-estilo: todavia no hay estilo generado en ${RUTA_POR_DEFECTO}/ (llega en lib-mapa#2); nada que validar.`);
    process.exit(0);
  }
  console.error(`validar-estilo: no hay archivos JSON en ${rutas.join(', ')}`);
  process.exit(1);
}

const resultado = spawnSync(validador, archivos, { stdio: 'inherit' });
if (resultado.error) {
  console.error(`validar-estilo: no se pudo correr gl-style-validate (${resultado.error.message}); falta npm ci?`);
  process.exit(1);
}
if (resultado.status === 0) {
  console.log(`validar-estilo: ${archivos.length} estilo(s) valido(s).`);
}
process.exit(resultado.status ?? 1);
