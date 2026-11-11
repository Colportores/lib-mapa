// Compara una captura con su referencia, con tolerancia (lib-mapa#5). Es JavaScript puro (pixelmatch + pngjs):
// lo prueba `npm test` sin MapLibre Native ni pantalla.
//
// Dos tolerancias, porque Mesa (llvmpipe) puede suavizar un borde o una letra un poco distinto según la CPU:
// - UMBRAL: cuánto puede cambiar el color de un píxel sin contarlo como distinto (0 a 1, el de pixelmatch);
// - MAXIMO_DISTINTOS: qué parte de los píxeles puede ser distinta (0,5 %: unos 1800 de 600 × 600). Un número
//   de puerta que aparece o desaparece, un color de la paleta o una capa movida pasan de largo ese margen.

import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

export const UMBRAL = 0.1;
export const MAXIMO_DISTINTOS = 0.005;

/**
 * @param {Buffer} actual    PNG recién dibujado.
 * @param {Buffer} referencia PNG de pruebas/visual/referencia/.
 * @returns {{iguales: boolean, distintos: number, proporcion: number, diferencias: Buffer | null, motivo?: string}}
 *   `diferencias` es un PNG con los píxeles distintos en rojo (null si cambió el tamaño).
 */
export function comparar(actual, referencia, { umbral = UMBRAL, maximo = MAXIMO_DISTINTOS } = {}) {
  const a = PNG.sync.read(actual);
  const r = PNG.sync.read(referencia);
  if (a.width !== r.width || a.height !== r.height) {
    return {
      iguales: false,
      distintos: Math.max(a.width * a.height, r.width * r.height),
      proporcion: 1,
      diferencias: null,
      motivo: `cambió el tamaño: ${a.width}×${a.height} contra ${r.width}×${r.height} de la referencia`,
    };
  }
  const diferencias = new PNG({ width: a.width, height: a.height });
  const distintos = pixelmatch(a.data, r.data, diferencias.data, a.width, a.height, { threshold: umbral });
  const proporcion = distintos / (a.width * a.height);
  return { iguales: proporcion <= maximo, distintos, proporcion, diferencias: PNG.sync.write(diferencias) };
}
