// GENERADO por `npm run generar-tokens` desde estilo/capas/capas.mjs y tokens/tokens.json (lib-mapa#4). No se edita a mano.
//
// Fragmentos de capa de MapLibre (spec v8) que se dibujan encima del estilo base. Las propiedades que tiene que
// traer cada feature están en estilo/capas/capas.mjs. Son `readonly`: para pasarlos a MapLibre, convertilos a
// `LayerSpecification` (los tipos de maplibre-gl no aceptan arreglos de solo lectura).

/** Ids de las fuentes GeoJSON que leen los fragmentos. Cambiar uno es una versión major. */
export const FUENTES = {
  "zonas": "colportores-zonas",
  "zonasRotulos": "colportores-zonas-rotulos",
  "casas": "colportores-casas"
} as const;

/** Ids de las capas. Cambiar uno es una versión major. */
export const CAPAS = {
  "zonasRelleno": "colportores:zonas-relleno",
  "zonasBorde": "colportores:zonas-borde",
  "zonasRotulo": "colportores:zonas-rotulo",
  "casasDeLejos": "colportores:casas-de-lejos",
  "grupos": "colportores:grupos"
} as const;

/** La fuente de las casas, agrupada (sin `data`: la pone el front). */
export const FUENTE_DE_CASAS = {
  "type": "geojson",
  "cluster": true,
  "clusterRadius": 44,
  "clusterMaxZoom": 17
} as const;

/** Las capas de cada fragmento, en el orden en que se apilan: zonas, casas de lejos y grupos. */
export const FRAGMENTOS = {
  "zonas": [
    {
      "id": "colportores:zonas-relleno",
      "type": "fill",
      "source": "colportores-zonas",
      "paint": {
        "fill-color": [
          "get",
          "color"
        ],
        "fill-opacity": [
          "case",
          [
            "boolean",
            [
              "get",
              "elegida"
            ],
            false
          ],
          0.4,
          0.22
        ]
      }
    },
    {
      "id": "colportores:zonas-borde",
      "type": "line",
      "source": "colportores-zonas",
      "paint": {
        "line-color": [
          "coalesce",
          [
            "get",
            "borde"
          ],
          [
            "get",
            "color"
          ]
        ],
        "line-width": [
          "case",
          [
            "boolean",
            [
              "get",
              "elegida"
            ],
            false
          ],
          3,
          2
        ]
      }
    },
    {
      "id": "colportores:zonas-rotulo",
      "type": "symbol",
      "source": "colportores-zonas-rotulos",
      "layout": {
        "text-field": [
          "get",
          "rotulo"
        ],
        "text-font": [
          "NotoSans-Medium"
        ],
        "text-size": 13,
        "text-max-width": 9
      },
      "paint": {
        "text-color": "#2A3A52",
        "text-halo-color": "#FFFFFF",
        "text-halo-width": 1.5
      }
    }
  ],
  "casasDeLejos": [
    {
      "id": "colportores:casas-de-lejos",
      "type": "circle",
      "source": "colportores-casas",
      "filter": [
        "!",
        [
          "has",
          "point_count"
        ]
      ],
      "paint": {
        "circle-color": [
          "match",
          [
            "get",
            "estado"
          ],
          "SIN_VISITA",
          "#FFFFFF",
          "SIN_CONTESTAR",
          "#6B7688",
          "ENTREVISTA_PROGRAMADA",
          "#E0B43C",
          "ENTREVISTA_SIN_VENTA",
          "#1F6E3A",
          "RECHAZO",
          "#A8312A",
          "COBRANZA_PENDIENTE",
          "#13407A",
          "ENTREGA_Y_COBRANZA_PENDIENTE",
          "#13407A",
          "VENTA_COMPLETA",
          "#1F6E3A",
          "#6B7688"
        ],
        "circle-radius": 6,
        "circle-stroke-color": [
          "match",
          [
            "get",
            "estado"
          ],
          "SIN_VISITA",
          "#6B7688",
          "SIN_CONTESTAR",
          "#FFFFFF",
          "ENTREVISTA_PROGRAMADA",
          "#FFFFFF",
          "ENTREVISTA_SIN_VENTA",
          "#FFFFFF",
          "RECHAZO",
          "#FFFFFF",
          "COBRANZA_PENDIENTE",
          "#FFFFFF",
          "ENTREGA_Y_COBRANZA_PENDIENTE",
          "#FFFFFF",
          "VENTA_COMPLETA",
          "#FFFFFF",
          "#6B7688"
        ],
        "circle-stroke-width": 1.5
      }
    }
  ],
  "grupos": [
    {
      "id": "colportores:grupos",
      "type": "circle",
      "source": "colportores-casas",
      "filter": [
        "has",
        "point_count"
      ],
      "paint": {
        "circle-color": "#0E1A2B",
        "circle-radius": [
          "step",
          [
            "get",
            "point_count"
          ],
          16,
          10,
          18,
          50,
          22
        ],
        "circle-stroke-color": "#FFFFFF",
        "circle-stroke-width": 2
      }
    }
  ]
} as const;
