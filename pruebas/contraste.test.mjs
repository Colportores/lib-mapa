// Contraste de los bordes (P1 de la revisión de lib-mapa#4): `bordeDeZona` de ts/src/contraste.ts contra los casos
// de pruebas/contraste/casos.json (el lado Dart los corre dart/tool/contraste.dart), y la paleta de zonas y la zona
// sin color contra `contraste.bordes` sobre los dos fondos del mapa.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { leerTokens } from '../generadores/tokens.mjs';
import { registrarTsSinExtension } from './ayudas/ts-sin-extension.mjs';

registrarTsSinExtension();
const { bordeDeZona, contraste, contrasteSobreElMapa } = await import('../ts/src/contraste.ts');
const indice = await import('../ts/src/index.ts');

const tokens = leerTokens();
const { casos } = JSON.parse(readFileSync(new URL('./contraste/casos.json', import.meta.url), 'utf8'));
const minimo = tokens.contraste.bordes;

test('dados los casos de contraste/casos.json, cuando se calcula el borde, entonces da el esperado y llega a 3:1', () => {
  assert.ok(casos.length >= 10);
  for (const c of casos) {
    const borde = bordeDeZona(c.color);
    assert.equal(borde, c.borde, c.nombre);
    assert.ok(contrasteSobreElMapa(borde) >= minimo, `${c.nombre}: ${contrasteSobreElMapa(borde).toFixed(2)}:1`);
  }
});

test('dada la paleta de zonas y la zona sin color, cuando se dibuja su borde, entonces tiene al menos 3:1 sobre la tierra y los parques', () => {
  const colores = [...tokens.paletaZonas, tokens.zonaSinColor.panel, tokens.zonaSinColor.movil];
  for (const color of colores) {
    const borde = bordeDeZona(color);
    for (const fondo of tokens.contraste.fondosDelMapa) {
      assert.ok(contraste(borde, fondo) >= minimo, `${color} -> ${borde} sobre ${fondo}: ${contraste(borde, fondo).toFixed(2)}:1`);
    }
    if (contrasteSobreElMapa(color) >= minimo) assert.equal(borde, color, `${color} ya llegaba: no se toca`);
  }
});

test('dado un color que ya llega a 3:1, cuando se calcula el borde, entonces queda igual; y si no llega, es el más claro que llega', () => {
  for (let r = 0; r <= 255; r += 51) {
    for (let g = 0; g <= 255; g += 51) {
      for (let b = 0; b <= 255; b += 51) {
        const color = `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
        const borde = bordeDeZona(color);
        assert.ok(contrasteSobreElMapa(borde) >= minimo, `${color} -> ${borde}`);
        if (contrasteSobreElMapa(color) >= minimo) assert.equal(borde, color);
      }
    }
  }
});

test('dado el contraste WCAG, cuando se mide blanco y negro, entonces es 21:1 y no depende del orden', () => {
  assert.equal(contraste('#FFFFFF', '#000000'), 21);
  assert.equal(contraste('#13407A', '#F6F5F0'), contraste('#F6F5F0', '#13407A'));
  assert.equal(contraste('#13407A', '#13407A'), 1);
});

test('dado un color que no es #RRGGBB, cuando se pide el borde, entonces falla en vez de dibujar cualquier cosa', () => {
  for (const malo of ['13407A', '#1340', 'rgb(0,0,0)', '', '#GGGGGG']) assert.throws(() => bordeDeZona(malo), /#RRGGBB/, malo);
});

test('dado el punto de entrada del paquete npm, cuando se importa, entonces exporta el contraste junto con los tokens y las capas', () => {
  assert.equal(indice.bordeDeZona, bordeDeZona);
  assert.equal(typeof indice.contrasteSobreElMapa, 'function');
  assert.ok(indice.TOKENS && indice.FRAGMENTOS);
});
