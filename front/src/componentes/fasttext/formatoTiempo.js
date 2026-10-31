/**
 * formatoTiempo.js
 * Formateador de tiempos en milisegundos para las respuestas de FastText.
 *
 * Reglas de formato requeridas:
 * - Milisegundos con 4 decimales si es menor a 1000 ms (ej: "0.0286 ms").
 * - Si es mayor o igual a 1000 ms, se muestra en segundos con 2 decimales (ej: "1.25 s").
 * - No redondea a cero valores pequeños menores a 1 ms.
 *
 * @param {number|null|undefined} ms Tiempo en milisegundos devuelto por el backend
 * @returns {string} Cadena formateada con su unidad respectiva
 */
export function formatearTiempoMs(ms) {
  if (ms === null || ms === undefined || isNaN(ms)) {
    return '0.0000 ms';
  }
  const valor = Number(ms);
  if (valor >= 1000) {
    return `${(valor / 1000).toFixed(2)} s`;
  }
  return `${valor.toFixed(4)} ms`;
}
