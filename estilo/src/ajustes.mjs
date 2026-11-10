// Ajustes propios sobre las capas de @protomaps/basemaps: lo que la paleta no alcanza a decir (desde qué
// zoom se ve una capa, el tamaño de la letra, el halo). Cada ajuste pisa solo las propiedades que nombra;
// el resto de la capa sigue como la arma basemaps.
//
// Si una versión nueva de basemaps cambia el id de una capa ajustada, armar el estilo falla (no se pierde
// el ajuste en silencio).

/**
 * Números de puerta de OSM (lib-mapa#3, ADR-019; decisión del orquestador del 05/11, P4): se ven desde el
 * zoom de calle del móvil, z16 de MapLibre (el z17 del prototipo, que usa teselas de 256 px), con letra 11
 * y halo 1,5. El color sale de la paleta (`address_label`, #5B6B82 sobre #F6F5F0: AA, decisión del 06/10).
 *
 * Las teselas traen `addr_housenumber` solo en z15: de z16 en adelante MapLibre agranda la tesela de z15.
 *
 * Las listas («1528,1530,1532») no se recortan: MapLibre no corta un rótulo, lo muestra entero o lo
 * esconde si choca; `text-max-width` queda explícito (en ems, el valor de MapLibre) y solo parte la lista
 * donde hay espacios (en una coma sola no hay corte de línea).
 *
 * Frente a nuestras capas: el número de OSM no se dibuja encima de nada (sin `text-allow-overlap` ni
 * `text-ignore-placement`) y las capas de la app y del panel van por encima del estilo, así que donde
 * choca con un cuadrado numerado de la casa (vista 39, M·02) gana el cuadrado. Para que el número se
 * esconda, la capa del cuadrado tiene que ocupar su lugar (`icon-ignore-placement: false`).
 */
export const AJUSTES = Object.freeze({
  address_label: Object.freeze({
    minzoom: 16,
    layout: Object.freeze({ 'text-size': 11, 'text-max-width': 10 }),
    paint: Object.freeze({ 'text-halo-width': 1.5 }),
  }),
});

/**
 * Aplica los ajustes a las capas de basemaps. No modifica las capas recibidas: devuelve capas nuevas.
 *
 * @param {object[]} capas  Las capas de `layers()` de @protomaps/basemaps.
 * @param {Record<string, {minzoom?: number, maxzoom?: number, layout?: object, paint?: object}>} [ajustes]
 */
export function aplicarAjustes(capas, ajustes = AJUSTES) {
  const faltan = Object.keys(ajustes).filter((id) => !capas.some((capa) => capa.id === id));
  if (faltan.length > 0) {
    throw new Error(`Los ajustes nombran capas que basemaps no trae: ${faltan.join(', ')}`);
  }
  return capas.map((capa) => {
    const ajuste = ajustes[capa.id];
    if (!ajuste) return capa;
    const { layout, paint, ...resto } = ajuste;
    return {
      ...capa,
      ...resto,
      ...(layout && { layout: { ...capa.layout, ...layout } }),
      ...(paint && { paint: { ...capa.paint, ...paint } }),
    };
  });
}
