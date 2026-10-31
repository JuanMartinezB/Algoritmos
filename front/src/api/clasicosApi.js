/**
 * Servicio de llamadas a la API de similitud con Algoritmos Clásicos.
 * Base URL: http://localhost:8080/api/similitud/clasicos
 *
 * Algoritmos implementados:
 *  1. Levenshtein (Programación Dinámica)
 *  2. Needleman-Wunsch (Programación Dinámica)
 *  3. Jaccard (Teoría de Conjuntos)
 *  4. Coseno TF-IDF (Espacio Vectorial)
 */
const BASE_URL = 'http://localhost:8080/api/similitud/clasicos';

async function procesarRespuesta(response) {
  if (!response.ok) {
    let mensajeError = `Error HTTP ${response.status}: ${response.statusText}`;
    try {
      const cuerpo = await response.json();
      if (cuerpo && cuerpo.error) {
        mensajeError = cuerpo.error;
      }
    } catch {
      // Si la respuesta no es JSON, se conserva el mensaje genérico
    }
    throw new Error(mensajeError);
  }
  return await response.json();
}

/**
 * POST /comparar
 * Envía una lista de IDs y devuelve la similitud con los 4 algoritmos para cada par.
 */
export async function compararClasicos(ids) {
  const response = await fetch(`${BASE_URL}/comparar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ ids })
  });
  return await procesarRespuesta(response);
}

/**
 * GET /detalle?idA=1&idB=2&maxCaracteres=30
 * Devuelve el detalle paso a paso de los 4 algoritmos para un par de artículos.
 */
export async function obtenerDetalleClasicos(idA, idB, maxCaracteres = 30) {
  const url = `${BASE_URL}/detalle?idA=${encodeURIComponent(idA)}&idB=${encodeURIComponent(idB)}&maxCaracteres=${maxCaracteres}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });
  return await procesarRespuesta(response);
}

/**
 * GET /algoritmos
 * Devuelve la lista de nombres de los 4 algoritmos.
 */
export async function obtenerAlgoritmosClasicos() {
  const response = await fetch(`${BASE_URL}/algoritmos`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });
  return await procesarRespuesta(response);
}
