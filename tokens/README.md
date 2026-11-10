# tokens/

`tokens.json` es la **única fuente** de los tokens del mapa (lib-mapa#4, ADR-019):

| Token | Qué es |
|---|---|
| `estadosDeCasa` | Los ocho estados (clave del backend, id de la app, nombre, forma, relleno, contorno, color del glifo y del número, glifo, franjas), en el orden de la leyenda |
| `edificioSinEstado` | El edificio al que no se le registró nada (vista 39, móvil) |
| `paletaZonas` | Los colores que ofrece el panel al crear una zona |
| `zonaSinColor` | El color de una zona guardada sin color |
| `contraste` | Mínimos WCAG (3:1 bordes, 4,5:1 rótulos) y los fondos del mapa contra los que se miden |
| `zoom` | País, calle, máximo, minzoom de los números de puerta y zoom de corte, en escala MapLibre |
| `grupos` | Cómo se agrupan las casas de lejos (radio, zoom máximo, colores) |
| `atribucion` | «© OpenStreetMap contributors», la corta del móvil y la HTML de la fuente del estilo |

Los valores salen de lo que ya dibujan el panel y el móvil, sin cambiar su aspecto. Si los dos fronts todavía no coinciden, el token va como `{ "pendiente": "<dónde se decide>", "panel": …, "movil": … }` y cada front usa el suyo hasta la decisión (hoy: `zonaSinColor`, `zoom.maximo` y la franja clara de «Entrega y pago»). Las claves que empiezan con `$` son comentarios.

Para sumar o cambiar un token:

1. Editar `tokens.json`.
2. `npm run generar-tokens` (en Docker): reescribe `dart/lib/tokens.g.dart`, `ts/src/tokens.g.ts` y `ts/src/capas.g.ts`.
3. Si es un token nuevo, sumarlo en `dart/tool/paridad.dart` (la paridad falla hasta que coincidan).
4. `npm run check` y la paridad Dart (ver `dart/README.md`); en el CI corren las dos.
