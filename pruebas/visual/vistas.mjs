// Las capturas de referencia del estilo (lib-mapa#5): qué se dibuja, dónde y a qué zoom.
//
// Todas salen de la muestra chica de Montevideo (pruebas/fixtures/montevideo-z15-muestra.pmtiles: cuatro
// teselas z15 de Pocitos, datos ODbL). El zoom es el de MapLibre (teselas de 512 px): el z16 es el zoom de
// calle del móvil, desde donde se ven los números de puerta de OSM (lib-mapa#3, token `zoom.numerosDePuerta`).
// Las `-capas` suman encima los fragmentos de capa (estilo/capas/capas.mjs) con una zona y diez casas de
// prueba: a z16 se agrupan y a z18 se ven sueltas, sobre los números de OSM.

import { readFileSync } from 'node:fs';
import { sinComentarios } from '../../generadores/tokens.mjs';

const TOKENS = sinComentarios(JSON.parse(readFileSync(new URL('../../tokens/tokens.json', import.meta.url), 'utf8')));

/** Pocitos, Montevideo: el mismo lugar de las capturas manuales de lib-mapa#3. */
export const CENTRO = Object.freeze([-56.1505, -34.9105]);

/** Tamaño de cada captura, en px (densidad 1). */
export const ANCHO = 600;
export const ALTO = 600;

/** Las capturas: `nombre` es el archivo de pruebas/visual/referencia/<nombre>.png. */
export const VISTAS = Object.freeze([
  { nombre: 'z16', zoom: 16, capas: false },
  { nombre: 'z17', zoom: 17, capas: false },
  { nombre: 'z18', zoom: 18, capas: false },
  { nombre: 'z16-capas', zoom: 16, capas: true },
  { nombre: 'z18-capas', zoom: 18, capas: true },
]);

const [LON, LAT] = CENTRO;

/** Una zona elegida alrededor del centro, con el primer color de la paleta de zonas, y su rótulo. */
export function zonasDePrueba(tokens = TOKENS) {
  const anillo = [
    [LON - 0.0022, LAT - 0.0016],
    [LON + 0.0022, LAT - 0.0016],
    [LON + 0.0022, LAT + 0.0016],
    [LON - 0.0022, LAT + 0.0016],
    [LON - 0.0022, LAT - 0.0016],
  ];
  return {
    zonas: {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', properties: { color: tokens.paletaZonas[0], elegida: true }, geometry: { type: 'Polygon', coordinates: [anillo] } },
      ],
    },
    rotulos: {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', properties: { rotulo: 'Zona de prueba' }, geometry: { type: 'Point', coordinates: [LON, LAT + 0.0011] } },
      ],
    },
  };
}

/**
 * Diez casas de prueba, una por estado y dos «Sin visita», en una fila de unos 14 m entre una y otra (a z18,
 * ~57 px): a z16 caen en el radio de agrupado (token `grupos.radio`) y se ven como grupos.
 */
export function casasDePrueba(tokens = TOKENS) {
  const estados = [...tokens.estadosDeCasa.map((e) => e.clave), 'SIN_VISITA', 'SIN_VISITA'];
  return {
    type: 'FeatureCollection',
    features: estados.map((estado, i) => ({
      type: 'Feature',
      properties: { estado },
      geometry: { type: 'Point', coordinates: [LON - 0.00068 + (i % 5) * 0.00017, LAT + (i < 5 ? 0.0003 : -0.0003)] },
    })),
  };
}
