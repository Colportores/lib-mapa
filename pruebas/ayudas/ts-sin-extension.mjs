// Hook de resolución para los tests (lib-mapa#4): las fuentes de ts/src/ se importan entre sí sin extensión
// (`./tokens.g`, como las resuelve el bundler del panel), y Node no las encuentra. Acá se les suma `.ts`, solo a
// las relativas que salen de un `.ts`. Se registra con `registrarTsSinExtension()` antes del `import()`.
import { register } from 'node:module';

export async function resolve(especificador, contexto, siguiente) {
  const relativo = especificador.startsWith('./') || especificador.startsWith('../');
  if (relativo && contexto.parentURL?.endsWith('.ts') && !/\.[cm]?[jt]s$/.test(especificador)) {
    return siguiente(`${especificador}.ts`, contexto);
  }
  return siguiente(especificador, contexto);
}

let registrado = false;

export function registrarTsSinExtension() {
  if (registrado) return;
  register(import.meta.url);
  registrado = true;
}
