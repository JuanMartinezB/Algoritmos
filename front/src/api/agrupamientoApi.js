/**
 * Servicio de llamadas a la API de agrupamiento jerárquico (Requerimiento 2).
 * Base URL: http://localhost:8080/api/agrupamiento
 */
import BASE_HOST from './config';

const BASE_AGRUPAMIENTO_URL = `${BASE_HOST}/api/agrupamiento`;

/**
 * GET /resultado?algoritmo=glove&k=3
 * Ejecuta los tres enlaces (single, complete, average) sobre los 20 abstracts.
 *
 * @param {string} algoritmo Modelo de similitud: 'glove' (rápido) o 'fasttext' (la primera vez tarda)
 * @param {number} k Número de grupos en que se corta el dendrograma
 * @returns {Promise<Object>} { algoritmo, k, etiquetas, distancias, criterios[], masCoherente }
 */
export async function obtenerAgrupamiento(algoritmo, k) {
  const url = `${BASE_AGRUPAMIENTO_URL}/resultado?algoritmo=${encodeURIComponent(algoritmo)}&k=${encodeURIComponent(k)}`;
  const response = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
  if (!response.ok) {
    let mensaje = `Error HTTP ${response.status}: ${response.statusText}`;
    try {
      const cuerpo = await response.json();
      if (cuerpo && (cuerpo.error || cuerpo.message)) mensaje = cuerpo.error || cuerpo.message;
    } catch {
      // la respuesta no era JSON: se deja el mensaje genérico
    }
    throw new Error(mensaje);
  }
  return await response.json();
}
