# lib-mapa

Libreria compartida del mapa de Colportores: estilo MapLibre (v8), glifos, sprites y tokens de zonas/estados de casa, consumida por el panel de coordinadores (npm) y la app movil (pub, dependencia git con tag).

- Todo se desarrolla en Docker: `docker compose -f compose.dev.yml run --rm app npm test`. Nada de secretos ni claves de servicio aqui: el publicador de tiles y el bucket viven en `backend-supabase`.
- Ramas: `feature/* -> develop -> staging -> production` (default `production`), siempre por PR. Squash a `develop`.
- No se guardan PMTiles completos (solo una muestra chica de prueba con su NOTICE). Los datos son ODbL.
- Documentacion de arquitectura: `docs-organizacion` (ADR de la libreria del mapa, ADR-011 de mapas offline).
- Estructura prevista: `estilo/` (estilo + paleta + capas), `assets/` (glyphs, sprites), `tokens/` (tokens.json + generadores Dart/TS), `pruebas/` (tests, fixtures, capturas).
