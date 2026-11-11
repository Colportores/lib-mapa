// Contraste de los bordes del mapa (P1 de la revisión de lib-mapa#4, WCAG 1.4.11). Este archivo no se genera: la
// misma regla está en Dart (dart/lib/contraste.dart) y los dos se prueban contra pruebas/contraste/casos.json.
//
// El borde de una zona se dibuja con el color que eligió el coordinador y, si no llega a `CONTRASTE.bordes` (3:1)
// sobre los fondos del mapa (la tierra y los parques), con el mismo tono oscurecido hasta que llegue. La paleta y
// el color de la zona sin color no cambian: solo el borde que se dibuja. Es la regla de `ColoresZona.borde` del
// móvil (zonas_mapa.dart): cada paso acerca el color un 8 % al negro y redondea cada canal a 8 bits.
import { CONTRASTE } from "./tokens.g";

const HEX = /^#([0-9A-Fa-f]{6})$/;

/** Cuánto se acerca al negro en cada paso, y cuántos pasos como máximo (los mismos que el móvil). */
const PASO = 0.08;
const PASOS = 40;

function canales(color: string): [number, number, number] {
  const m = HEX.exec(color);
  if (!m) throw new Error(`no es un color #RRGGBB: ${color}`);
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function hex([r, g, b]: readonly number[]): string {
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

/** Luminancia relativa de WCAG 2 (el mismo umbral 0,03928 que Flutter). */
function luminancia(color: string): number {
  const lineal = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = canales(color);
  return 0.2126 * lineal(r) + 0.7152 * lineal(g) + 0.0722 * lineal(b);
}

/** El contraste WCAG entre dos colores `#RRGGBB` (de 1 a 21). */
export function contraste(a: string, b: string): number {
  const [x, y] = [luminancia(a), luminancia(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** El menor contraste de `color` contra los fondos del mapa (`CONTRASTE.fondosDelMapa`). */
export function contrasteSobreElMapa(color: string): number {
  return Math.min(...CONTRASTE.fondosDelMapa.map((fondo) => contraste(color, fondo)));
}

/**
 * El color con el que se dibuja el borde de una zona de `color` (`#RRGGBB`): el mismo si ya llega a
 * `CONTRASTE.bordes` sobre los fondos del mapa; si no, oscurecido hasta que llegue. Devuelve `#RRGGBB` en
 * mayúsculas. Una zona sin color la resuelve el front antes (token `zonaSinColor`).
 */
export function bordeDeZona(color: string): string {
  let c = canales(color);
  for (let i = 0; i < PASOS && contrasteSobreElMapa(hex(c)) < CONTRASTE.bordes; i++) {
    c = c.map((v) => Math.round(v * (1 - PASO))) as [number, number, number];
  }
  return hex(c);
}
