// GENERADO por `npm run generar-tokens` desde tokens/tokens.json (lib-mapa#4). No se edita a mano.

/** Todos los tokens del mapa, tal cual tokens/tokens.json (sin los comentarios `$…`). */
export const TOKENS = {
  "version": 1,
  "estadosDeCasa": [
    {
      "clave": "SIN_VISITA",
      "id": "sinVisita",
      "nombre": "Sin visita",
      "forma": "circulo",
      "relleno": "#FFFFFF",
      "borde": "#6B7688",
      "tinta": "#6B7688",
      "tintaNumero": "#2A3A52",
      "glifo": "",
      "franjas": null
    },
    {
      "clave": "SIN_CONTESTAR",
      "id": "noContesto",
      "nombre": "No contestó",
      "forma": "circulo",
      "relleno": "#6B7688",
      "borde": null,
      "tinta": "#FFFFFF",
      "tintaNumero": "#FFFFFF",
      "glifo": "–",
      "franjas": null
    },
    {
      "clave": "ENTREVISTA_PROGRAMADA",
      "id": "entrevistaAgendada",
      "nombre": "Entrevista agendada",
      "forma": "circulo",
      "relleno": "#E0B43C",
      "borde": null,
      "tinta": "#0E1A2B",
      "tintaNumero": "#0E1A2B",
      "glifo": "◷",
      "franjas": null
    },
    {
      "clave": "ENTREVISTA_SIN_VENTA",
      "id": "entrevistaHecha",
      "nombre": "Entrevista hecha",
      "forma": "circulo",
      "relleno": "#1F6E3A",
      "borde": null,
      "tinta": "#FFFFFF",
      "tintaNumero": "#FFFFFF",
      "glifo": "✓",
      "franjas": null
    },
    {
      "clave": "RECHAZO",
      "id": "rechazo",
      "nombre": "Rechazó",
      "forma": "circulo",
      "relleno": "#A8312A",
      "borde": null,
      "tinta": "#FFFFFF",
      "tintaNumero": "#FFFFFF",
      "glifo": "✕",
      "franjas": null
    },
    {
      "clave": "COBRANZA_PENDIENTE",
      "id": "cobranzaPendiente",
      "nombre": "Cobranza pendiente",
      "forma": "cuadrado",
      "relleno": "#13407A",
      "borde": null,
      "tinta": "#FFFFFF",
      "tintaNumero": "#FFFFFF",
      "glifo": "$",
      "franjas": null
    },
    {
      "clave": "ENTREGA_Y_COBRANZA_PENDIENTE",
      "id": "entregaYPago",
      "nombre": "Entrega y pago",
      "forma": "cuadrado",
      "relleno": "#13407A",
      "borde": null,
      "tinta": "#FFFFFF",
      "tintaNumero": "#FFFFFF",
      "glifo": "⇢",
      "franjas": {
        "angulo": 135,
        "anchoOscura": 4,
        "anchoClara": 3,
        "clara": "#4D76B1"
      }
    },
    {
      "clave": "VENTA_COMPLETA",
      "id": "ventaCompleta",
      "nombre": "Venta completa",
      "forma": "cuadrado",
      "relleno": "#1F6E3A",
      "borde": null,
      "tinta": "#FFFFFF",
      "tintaNumero": "#FFFFFF",
      "glifo": "★",
      "franjas": null
    }
  ],
  "edificioSinEstado": {
    "id": "edificio",
    "nombre": "Edificio",
    "forma": "cuadrado",
    "relleno": "#FFFFFF",
    "borde": "#2A3A52",
    "tinta": "#2A3A52",
    "tintaNumero": "#2A3A52",
    "glifo": null
  },
  "paletaZonas": [
    "#13407A",
    "#1F6E3A",
    "#A98330",
    "#5B6B82",
    "#A8312A",
    "#3B5C8C"
  ],
  "zonaSinColor": "#8A94A6",
  "contraste": {
    "bordes": 3,
    "rotulos": 4.5,
    "fondosDelMapa": [
      "#F6F5F0",
      "#DDE8D3"
    ]
  },
  "zoom": {
    "pais": 5.5,
    "calle": 16,
    "maximo": 19,
    "numerosDePuerta": 16,
    "corteDeTiles": 15
  },
  "grupos": {
    "radio": 44,
    "zoomMaximo": 17,
    "color": "#0E1A2B",
    "borde": "#FFFFFF"
  },
  "atribucion": {
    "texto": "© OpenStreetMap contributors",
    "corto": "© OpenStreetMap",
    "html": "<a href=\"https://github.com/protomaps/basemaps\">Protomaps</a> © <a href=\"https://openstreetmap.org/copyright\">OpenStreetMap</a>"
  }
} as const;

export type Tokens = typeof TOKENS;

/** Un valor en el que el panel y el móvil todavía no coinciden: cada front usa el suyo hasta la decisión. */
export interface ValorPendiente<T> {
  readonly pendiente: string;
  readonly panel: T;
  readonly movil: T;
}

/** Cómo se ve un estado de casa (color, forma y glifo). */
export type EstadoDeCasaVisual = (typeof TOKENS.estadosDeCasa)[number];

/** El valor del estado en el backend (`SIN_VISITA`, `RECHAZO`…). */
export type ClaveDeEstado = EstadoDeCasaVisual["clave"];

export const ESTADOS_DE_CASA = TOKENS.estadosDeCasa;
export const EDIFICIO_SIN_ESTADO = TOKENS.edificioSinEstado;
export const PALETA_ZONAS = TOKENS.paletaZonas;
export const ZONA_SIN_COLOR = TOKENS.zonaSinColor;
export const CONTRASTE = TOKENS.contraste;
export const ZOOM = TOKENS.zoom;
export const GRUPOS = TOKENS.grupos;
export const ATRIBUCION = TOKENS.atribucion;
