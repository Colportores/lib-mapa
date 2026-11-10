# ts/

Fuentes TypeScript del paquete npm `@colportores/lib-mapa` para el panel de coordinadores (lib-mapa#4). Se instala desde GitHub con el tag de la release (`"@colportores/lib-mapa": "github:Colportores/lib-mapa#vX.Y.Z"`); nada se publica en npm.

npm instala el repo entero desde git (no un subdirectorio), así que el paquete es el `package.json` de la raíz, que exporta estas fuentes:

| Import | Qué trae |
|---|---|
| `@colportores/lib-mapa` | todo lo de abajo (`src/index.ts`) |
| `@colportores/lib-mapa/tokens` | `TOKENS` y `ESTADOS_DE_CASA`, `PALETA_ZONAS`, `ZONA_SIN_COLOR`, `ZOOM`, `ATRIBUCION`… (`src/tokens.g.ts`, `as const`) |
| `@colportores/lib-mapa/capas` | `FUENTES`, `CAPAS`, `FUENTE_DE_CASAS` y `FRAGMENTOS` (`src/capas.g.ts`) |
| `@colportores/lib-mapa/tokens.json` | el JSON de los tokens |
| `@colportores/lib-mapa/estilo` | `armarEstilo` y compañía (JS, para el publicador de backend-supabase) |

Son fuentes `.ts`: el front las compila con su bundler (en Next, `transpilePackages: ["@colportores/lib-mapa"]`) y con `moduleResolution: "bundler"`. Los fragmentos son `readonly`: para pasarlos a MapLibre se convierten a `LayerSpecification`.

`tsconfig.json` es solo para `npm run typecheck` (no emite nada). Los `.g.ts` se generan: no se editan a mano.
