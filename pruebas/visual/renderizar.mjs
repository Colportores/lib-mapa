// Dibuja el estilo con MapLibre Native (@maplibre/maplibre-gl-native) sin pantalla, para las capturas de
// referencia (lib-mapa#5). Corre adentro de la imagen de dockerfile.dev, con `xvfb-run -a` (Mesa, OpenGL por
// software): nunca pide nada a la red. Las teselas salen de la muestra PMTiles y los glyphs y sprites, de assets/.

import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { PMTiles } from 'pmtiles';
import { PNG } from 'pngjs';
import { armarEstilo, leerPaleta, NOMBRE_DE_LA_FUENTE } from '../../estilo/src/estilo.mjs';
import { FUENTES, fuenteDeCasas, todosLosFragmentos } from '../../estilo/capas/capas.mjs';
import { ALTO, ANCHO, CENTRO, casasDePrueba, zonasDePrueba } from './vistas.mjs';

const require = createRequire(import.meta.url);
const ASSETS = fileURLToPath(new URL('../../assets/', import.meta.url));

/** La muestra chica de Montevideo (datos ODbL, ver pruebas/fixtures/NOTICE.md). */
export const MUESTRA = fileURLToPath(new URL('../fixtures/montevideo-z15-muestra.pmtiles', import.meta.url));

/** Un host que no existe: todo lo que MapLibre pide pasa por `pedir()` y se resuelve con archivos locales. */
const HOST = 'https://lib-mapa.prueba';
const URL_BASE = `${HOST}/estilo`;
const TESELAS = `${HOST}/teselas/{z}/{x}/{y}.mvt`;

/** Lee el PMTiles entero en memoria (pesa ~200 kB) y lo ofrece como `Source` de la librería pmtiles. */
class FuenteEnMemoria {
  constructor(ruta) {
    this.ruta = ruta;
    const b = readFileSync(ruta);
    this.datos = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
  }
  getKey() {
    return this.ruta;
  }
  async getBytes(offset, length) {
    return { data: this.datos.slice(offset, offset + length) };
  }
}

/** El estilo de la librería apuntado a la muestra, con los fragmentos de capa encima si `capas`. */
export async function estiloParaCapturas({ capas = false, muestra = MUESTRA } = {}) {
  const archivo = new PMTiles(new FuenteEnMemoria(muestra));
  const cabecera = await archivo.getHeader();
  const estilo = armarEstilo({ urlBase: URL_BASE, paleta: await leerPaleta() });
  const original = estilo.sources[NOMBRE_DE_LA_FUENTE];
  estilo.sources[NOMBRE_DE_LA_FUENTE] = {
    type: 'vector',
    attribution: original.attribution,
    tiles: [TESELAS],
    minzoom: cabecera.minZoom,
    maxzoom: cabecera.maxZoom,
  };
  if (capas) {
    const { zonas, rotulos } = zonasDePrueba();
    estilo.sources[FUENTES.zonas] = { type: 'geojson', data: zonas };
    estilo.sources[FUENTES.zonasRotulos] = { type: 'geojson', data: rotulos };
    estilo.sources[FUENTES.casas] = { ...fuenteDeCasas(), data: casasDePrueba() };
    const f = todosLosFragmentos();
    estilo.layers.push(...f.zonas, ...f.casasDeLejos, ...f.grupos);
  }
  return { estilo, archivo };
}

/** Responde un pedido de MapLibre Native: teselas de la muestra, glyphs y sprites de assets/. */
async function responder(url, archivo, faltantes) {
  const { pathname } = new URL(url);
  const tesela = pathname.match(/^\/teselas\/(\d+)\/(\d+)\/(\d+)\.mvt$/);
  if (tesela) {
    const [z, x, y] = tesela.slice(1).map(Number);
    const r = await archivo.getZxy(z, x, y);
    return r ? Buffer.from(r.data) : null; // fuera de la muestra: tesela vacía
  }
  const recurso = decodeURIComponent(pathname).match(/^\/estilo\/((?:glyphs|sprites)\/.+)$/);
  if (!recurso) throw new Error(`pedido inesperado: ${url}`);
  try {
    return await readFile(ASSETS + recurso[1]);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    faltantes.add(recurso[1]); // p. ej. un rango de glyphs que no se trae (assets/NOTICE.md): se dibuja sin él
    return null;
  }
}

/**
 * Dibuja una vista y devuelve el PNG y los recursos que se pidieron y no están en assets/.
 * @param {{zoom: number, capas?: boolean}} vista
 * `modificar(estilo)` cambia el estilo antes de dibujarlo: para probar a mano qué ve la comparación (ver la skill
 * capturas-mapa); las capturas de referencia no lo usan.
 * @returns {Promise<{png: Buffer, faltantes: string[]}>}
 */
export async function renderizar(vista, { centro = CENTRO, ancho = ANCHO, alto = ALTO, modificar } = {}) {
  const mbgl = require('@maplibre/maplibre-gl-native');
  const { estilo, archivo } = await estiloParaCapturas({ capas: vista.capas });
  modificar?.(estilo);
  const faltantes = new Set();
  const mapa = new mbgl.Map({
    ratio: 1,
    mode: 'static',
    request(pedido, listo) {
      responder(pedido.url, archivo, faltantes).then(
        (datos) => (datos ? listo(null, { data: datos }) : listo()),
        (error) => listo(error),
      );
    },
  });
  try {
    mapa.load(estilo);
    const rgba = await new Promise((resolver, rechazar) => {
      mapa.render({ zoom: vista.zoom, center: centro, width: ancho, height: alto }, (error, buffer) =>
        error ? rechazar(error) : resolver(buffer),
      );
    });
    const png = new PNG({ width: ancho, height: alto });
    Buffer.from(rgba).copy(png.data);
    return { png: PNG.sync.write(png), faltantes: [...faltantes].sort() };
  } finally {
    mapa.release();
  }
}
