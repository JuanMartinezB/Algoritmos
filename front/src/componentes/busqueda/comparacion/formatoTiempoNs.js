/**
 * formatoTiempoNs.js
 * Utilidad pura para formatear tiempos expresados en nanosegundos (ns).
 * Convierte de manera inteligente a ns, µs o ms según la magnitud.
 *
 * @param {number} ns Valor en nanosegundos
 * @returns {{ valor: string, unidad: string, texto: string }}
 */
export function formatearTiempoNs(ns) {
  if (typeof ns !== 'number' || isNaN(ns) || ns < 0) {
    return { valor: '0', unidad: 'ns', texto: '0 ns' };
  }

  if (ns < 1000) {
    return {
      valor: ns.toString(),
      unidad: 'ns',
      texto: `${ns} ns`
    };
  }

  if (ns < 1_000_000) {
    const micro = (ns / 1000).toFixed(2);
    return {
      valor: micro,
      unidad: 'µs',
      texto: `${micro} µs`
    };
  }

  const mili = (ns / 1_000_000).toFixed(4);
  return {
    valor: mili,
    unidad: 'ms',
    texto: `${mili} ms`
  };
}
