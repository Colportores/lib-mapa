// Lectura de tokens/tokens.json para los generadores (lib-mapa#4). Las claves que empiezan con `$` son
// comentarios y no se generan.

import { readFileSync } from 'node:fs';

export const RUTA_DE_LOS_TOKENS = new URL('../tokens/tokens.json', import.meta.url);

/** El valor sin las claves de comentario (`$…`), a cualquier profundidad. */
export function sinComentarios(valor) {
  if (Array.isArray(valor)) return valor.map(sinComentarios);
  if (valor !== null && typeof valor === 'object') {
    return Object.fromEntries(
      Object.entries(valor)
        .filter(([clave]) => !clave.startsWith('$'))
        .map(([clave, v]) => [clave, sinComentarios(v)]),
    );
  }
  return valor;
}

export function leerTokens(ruta = RUTA_DE_LOS_TOKENS) {
  return sinComentarios(JSON.parse(readFileSync(ruta, 'utf8')));
}

/** ¿Es un valor todavía sin decidir (`{ pendiente, panel, movil }`)? */
export function esPendiente(valor) {
  return valor !== null && typeof valor === 'object' && !Array.isArray(valor) && 'pendiente' in valor;
}

export const CABECERA = 'GENERADO por `npm run generar-tokens` desde tokens/tokens.json (lib-mapa#4). No se edita a mano.';
