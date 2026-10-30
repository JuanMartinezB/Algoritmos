/**
 * Servicio de llamadas a la API de similitud con GloVe.
 * Base URL: http://localhost:8080/api/similitud/glove
 */
const BASE_GLOVE_URL = 'http://localhost:8080/api/similitud/glove';

/**
 * Helper para procesar respuestas y extraer mensajes de error normalizados
 * en formato {"error": "mensaje"}.
 */
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
 * 1) POST /comparar
 * Envía una lista de IDs de artículos (mínimo 2) para comparar todos sus pares con GloVe.
 *
 * @param {Array<number>} ids Lista de IDs seleccionados (ej: [1, 2, 3])
 * @returns {Promise<Array<{idA: number, idB: number, coseno: number, distancia: number, similitudEuclidiana: number}>>}
 */
export async function compararGloVe(ids) {
  const response = await fetch(`${BASE_GLOVE_URL}/comparar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ ids })
  });
  return await procesarRespuesta(response);
}

/**
 * 2) GET /detalle?idA=1&idB=2
 * Obtiene el detalle matemático paso a paso entre dos artículos.
 *
 * @param {number} idA ID del primer artículo
 * @param {number} idB ID del segundo artículo
 * @returns {Promise<Object>} Detalle con vectores, normas, producto punto, fórmulas, etc.
 */
export async function obtenerDetalleGloVe(idA, idB) {
  const url = `${BASE_GLOVE_URL}/detalle?idA=${encodeURIComponent(idA)}&idB=${encodeURIComponent(idB)}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });
  return await procesarRespuesta(response);
}

/**
 * 3) GET /cobertura
 * Devuelve un mapa con las palabras que GloVe no conoce por cada ID de artículo.
 *
 * @returns {Promise<Object.<string, Array<string>>>} Ejemplo: {"1": ["xyz"], "2": []}
 */
export async function obtenerCoberturaGloVe() {
  const response = await fetch(`${BASE_GLOVE_URL}/cobertura`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });
  return await procesarRespuesta(response);
}
