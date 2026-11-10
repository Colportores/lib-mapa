// El estilo de MapLibre de Colportores: UNO solo, compartido por la app (front-colportores-mobile#286)
// y el panel de coordinadores (ADR-011, ADR-019). Las capas salen de @protomaps/basemaps (el esquema de
// los tiles de Protomaps), pintadas con la paleta del canvas (estilo/paleta.json) y con los ajustes propios
// de estilo/src/ajustes.mjs (desde qué zoom, tamaño y halo de algunas capas).
//
// Es determinista: la misma paleta, la misma URL base y la misma versión de la librería dan el mismo
// archivo, byte por byte, así que republicarlo sin cambios no cambia nada.
//
// Procedencia: viene de backend-supabase `tiles/src/estilo.mjs` (lib-mapa#2); la historia anterior queda
// en ese repo (`git log --follow tiles/src/estilo.mjs`).

import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { layers, namedFlavor } from '@protomaps/basemaps';
import { leerTokens } from '../../generadores/tokens.mjs';
import { aplicarAjustes } from './ajustes.mjs';

export const NOMBRE_DE_LA_FUENTE = 'protomaps';

/**
 * El estilo no sabe de qué archivo PMTiles sale el mapa: cada ciudad y cada zona tiene el suyo.
 * El cliente reemplaza `sources.protomaps.url` por `pmtiles://<archivo del paquete>` (un archivo
 * local en la app, la URL pública del paquete en el panel) antes de dárselo a MapLibre.
 */
export const URL_A_REEMPLAZAR = 'pmtiles://REEMPLAZAR';

/** La atribución de la fuente de tiles: el token `atribucion.html` (lib-mapa#4), el mismo que usan los fronts. */
export const ATRIBUCION = leerTokens().atribucion.html;

const PAQUETE = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));

/** La versión de lib-mapa (package.json; el tag `vX.Y.Z` de la release): va en `metadata["colportores:estilo"]`. */
export const VERSION_DE_LA_LIBRERIA = PAQUETE.version;

/** La versión fijada de @protomaps/basemaps, la que arma las capas: va en `metadata["colportores:basemaps"]`. */
export const VERSION_DE_BASEMAPS = PAQUETE.dependencies['@protomaps/basemaps'];

/** Dónde está la paleta del estilo dentro de la librería. */
export const RUTA_DE_LA_PALETA = new URL('../paleta.json', import.meta.url);

export async function leerPaleta(ruta = RUTA_DE_LA_PALETA) {
  return JSON.parse(await readFile(ruta, 'utf8'));
}

/** La paleta de Colportores sobre `light` de Protomaps: lo que la paleta no dice, lo hereda. */
export function flavorColportores(paleta) {
  const base = namedFlavor('light');
  return {
    ...base,
    ...paleta.flavor,
    landcover: { ...base.landcover, ...paleta.landcover },
  };
}

/**
 * @param {object} opciones
 * @param {string} opciones.urlBase  Dónde quedan los archivos del estilo, sin barra al final (en el publicador
 *   de backend-supabase: `<SUPABASE_URL>/storage/v1/object/public/mapas/estilo`). MapLibre pide glyphs y
 *   sprites con URLs absolutas, por eso el estilo se genera para cada destino.
 * @param {object} opciones.paleta   Contenido de estilo/paleta.json.
 * @param {string} [opciones.version]  Versión de @protomaps/basemaps con la que se generó (queda en metadata);
 *   por defecto, la fijada en el package.json de la librería.
 */
export function armarEstilo({ urlBase, paleta, version = VERSION_DE_BASEMAPS }) {
  if (!/^https?:\/\//.test(urlBase)) throw new Error(`urlBase tiene que ser absoluta: ${urlBase}`);
  const base = urlBase.replace(/\/+$/, '');
  return {
    version: 8,
    name: 'Colportores',
    metadata: {
      'colportores:estilo': VERSION_DE_LA_LIBRERIA,
      'colportores:paleta': paleta.version,
      'colportores:basemaps': version,
    },
    sources: {
      [NOMBRE_DE_LA_FUENTE]: {
        type: 'vector',
        attribution: ATRIBUCION,
        url: URL_A_REEMPLAZAR,
      },
    },
    layers: aplicarAjustes(layers(NOMBRE_DE_LA_FUENTE, flavorColportores(paleta), { lang: paleta.idioma })).filter(
      (capa) => !(paleta.sin_capas ?? []).includes(capa.id),
    ),
    glyphs: `${base}/glyphs/{fontstack}/{range}.pbf`,
    sprite: `${base}/sprites/grayscale`,
  };
}
