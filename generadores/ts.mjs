// Genera ts/src/tokens.g.ts y ts/src/capas.g.ts (lib-mapa#4): los tokens y los fragmentos de capa como
// objetos `as const`, para el panel y el publicador de backend-supabase.

import { CABECERA } from './tokens.mjs';

/** `zonaSinColor` -> `ZONA_SIN_COLOR`. */
export function constanteTs(nombre) {
  return nombre.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();
}

function literal(valor) {
  return JSON.stringify(valor, null, 2);
}

export function generarTokensTs(tokens) {
  const secciones = Object.keys(tokens).filter((clave) => clave !== 'version');
  return `// ${CABECERA}

/** Todos los tokens del mapa, tal cual tokens/tokens.json (sin los comentarios \`$…\`). */
export const TOKENS = ${literal(tokens)} as const;

export type Tokens = typeof TOKENS;

/** Un valor en el que el panel y el móvil todavía no coinciden: cada front usa el suyo hasta la decisión. */
export interface ValorPendiente<T> {
  readonly pendiente: string;
  readonly panel: T;
  readonly movil: T;
}

/** Cómo se ve un estado de casa (color, forma y glifo). */
export type EstadoDeCasaVisual = (typeof TOKENS.estadosDeCasa)[number];

/** El valor del estado en el backend (\`SIN_VISITA\`, \`RECHAZO\`…). */
export type ClaveDeEstado = EstadoDeCasaVisual["clave"];

${secciones.map((s) => `export const ${constanteTs(s)} = TOKENS.${s};`).join('\n')}
`;
}

export function generarCapasTs({ FUENTES, CAPAS, fuenteDeCasas, todosLosFragmentos }) {
  return `// ${CABECERA.replace('tokens/tokens.json', 'estilo/capas/capas.mjs y tokens/tokens.json')}
//
// Fragmentos de capa de MapLibre (spec v8) que se dibujan encima del estilo base. Las propiedades que tiene que
// traer cada feature están en estilo/capas/capas.mjs. Son \`readonly\`: para pasarlos a MapLibre, convertilos a
// \`LayerSpecification\` (los tipos de maplibre-gl no aceptan arreglos de solo lectura).

/** Ids de las fuentes GeoJSON que leen los fragmentos. Cambiar uno es una versión major. */
export const FUENTES = ${literal(FUENTES)} as const;

/** Ids de las capas. Cambiar uno es una versión major. */
export const CAPAS = ${literal(CAPAS)} as const;

/** La fuente de las casas, agrupada (sin \`data\`: la pone el front). */
export const FUENTE_DE_CASAS = ${literal(fuenteDeCasas())} as const;

/** Las capas de cada fragmento, en el orden en que se apilan: zonas, casas de lejos y grupos. */
export const FRAGMENTOS = ${literal(todosLosFragmentos())} as const;
`;
}
