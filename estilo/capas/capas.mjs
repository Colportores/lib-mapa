// Fragmentos de capa: lo que las apps dibujan ENCIMA del estilo base (zonas, casas de lejos y grupos), con
// ids de fuente y de capa fijos y los colores de tokens/tokens.json (lib-mapa#4, ADR-019).
//
// Son JSON de MapLibre (spec v8): quien los usa agrega las fuentes GeoJSON con los ids de FUENTES y las capas
// encima de las del estilo. Cambiar un id de fuente o de capa es una versión major de la librería.
//
// El aspecto es el que hoy dibuja el panel (vista 24: MapaZonasGl.tsx y CapaDeCasas.tsx), que es quien los
// consume (ADR-019); el rótulo de la zona es el del móvil (estilo_mapa.dart), el único dibujado como capa. Si
// el aspecto del panel y el del móvil se unifican, es la P4 del PR de lib-mapa#4.
//
// Lo que cada feature tiene que traer:
// - zonas (FUENTES.zonas, polígonos): `color` (#RRGGBB; una zona sin color la resuelve el front con el token
//   `zonaSinColor`) y, opcional, `elegida` (booleano: la zona elegida se ve más firme).
// - rótulos de zonas (FUENTES.zonasRotulos, puntos): `rotulo` (el nombre que va escrito).
// - casas (FUENTES.casas, puntos, agrupada con `fuenteDeCasas`): `estado` (la `clave` de `estadosDeCasa`).

import { readFileSync } from 'node:fs';
import { sinComentarios } from '../../generadores/tokens.mjs';

const TOKENS = sinComentarios(JSON.parse(readFileSync(new URL('../../tokens/tokens.json', import.meta.url), 'utf8')));

export const FUENTES = Object.freeze({
  zonas: 'colportores-zonas',
  zonasRotulos: 'colportores-zonas-rotulos',
  casas: 'colportores-casas',
});

export const CAPAS = Object.freeze({
  zonasRelleno: 'colportores:zonas-relleno',
  zonasBorde: 'colportores:zonas-borde',
  zonasRotulo: 'colportores:zonas-rotulo',
  casasDeLejos: 'colportores:casas-de-lejos',
  grupos: 'colportores:grupos',
});

const BLANCO = '#FFFFFF';
const TINTA_ROTULO = '#2A3A52';

/** La fuente GeoJSON de las casas, agrupada como en las dos apps (sin `data`: la pone el front). */
export function fuenteDeCasas(tokens = TOKENS) {
  return { type: 'geojson', cluster: true, clusterRadius: tokens.grupos.radio, clusterMaxZoom: tokens.grupos.zoomMaximo };
}

/** Zonas: relleno translúcido y borde del color de la zona (más firmes en la elegida) y el nombre encima. */
export function capasDeZonas() {
  return [
    {
      id: CAPAS.zonasRelleno,
      type: 'fill',
      source: FUENTES.zonas,
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': ['case', ['boolean', ['get', 'elegida'], false], 0.4, 0.22],
      },
    },
    {
      id: CAPAS.zonasBorde,
      type: 'line',
      source: FUENTES.zonas,
      paint: {
        'line-color': ['get', 'color'],
        'line-width': ['case', ['boolean', ['get', 'elegida'], false], 3, 2],
      },
    },
    {
      id: CAPAS.zonasRotulo,
      type: 'symbol',
      source: FUENTES.zonasRotulos,
      layout: {
        'text-field': ['get', 'rotulo'],
        'text-font': ['NotoSans-Medium'],
        'text-size': 13,
        'text-max-width': 9,
      },
      paint: {
        'text-color': TINTA_ROTULO,
        'text-halo-color': BLANCO,
        'text-halo-width': 1.5,
      },
    },
  ];
}

/** `match` sobre el estado de la casa; uno que no se conoce se ve como el gris de «Sin visita». */
function porEstado(tokens, valor) {
  const gris = tokens.estadosDeCasa.find((e) => e.clave === 'SIN_VISITA').borde;
  return ['match', ['get', 'estado'], ...tokens.estadosDeCasa.flatMap((e) => [e.clave, valor(e)]), gris];
}

/**
 * Casas de lejos (con las casas agrupadas): las que quedan sueltas van como puntos del color de su estado, sin
 * glifo (ya no cabe). «Sin visita» es el punto blanco con borde gris.
 */
export function capasDeCasasDeLejos(tokens = TOKENS) {
  return [
    {
      id: CAPAS.casasDeLejos,
      type: 'circle',
      source: FUENTES.casas,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': porEstado(tokens, (e) => (e.borde ? BLANCO : e.relleno)),
        'circle-radius': 6,
        'circle-stroke-color': porEstado(tokens, (e) => e.borde ?? BLANCO),
        'circle-stroke-width': 1.5,
      },
    },
  ];
}

/** Grupos: el círculo oscuro con borde blanco, más grande cuantas más casas tiene (10 y 50). */
export function capasDeGrupos(tokens = TOKENS) {
  return [
    {
      id: CAPAS.grupos,
      type: 'circle',
      source: FUENTES.casas,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': tokens.grupos.color,
        'circle-radius': ['step', ['get', 'point_count'], 16, 10, 18, 50, 22],
        'circle-stroke-color': tokens.grupos.borde,
        'circle-stroke-width': 2,
      },
    },
  ];
}

/** Todos los fragmentos, en el orden en que se apilan: zonas abajo, después las casas y los grupos. */
export function todosLosFragmentos(tokens = TOKENS) {
  return {
    zonas: capasDeZonas(),
    casasDeLejos: capasDeCasasDeLejos(tokens),
    grupos: capasDeGrupos(tokens),
  };
}

/**
 * Un estilo mínimo con todas las fuentes y los fragmentos, para pasarlo por gl-style-validate (los fragmentos
 * sueltos no son un estilo). No se publica.
 */
export function estiloDePrueba(tokens = TOKENS) {
  const vacio = { type: 'FeatureCollection', features: [] };
  const f = todosLosFragmentos(tokens);
  return {
    version: 8,
    name: 'Colportores: fragmentos de capa (prueba)',
    glyphs: 'https://REEMPLAZAR/estilo/glyphs/{fontstack}/{range}.pbf',
    sources: {
      [FUENTES.zonas]: { type: 'geojson', data: vacio },
      [FUENTES.zonasRotulos]: { type: 'geojson', data: vacio },
      [FUENTES.casas]: { ...fuenteDeCasas(tokens), data: vacio },
    },
    layers: [{ id: 'fondo', type: 'background', paint: { 'background-color': '#F6F5F0' } }, ...f.zonas, ...f.casasDeLejos, ...f.grupos],
  };
}
