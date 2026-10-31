/**
 * Servicio API para los algoritmos de Búsqueda de Patrones.
 * Base URL del backend: http://localhost:8080/api/busqueda
 *
 * Actualmente soporta:
 * - KMP: GET /api/busqueda/kmp?patron={texto}
 *
 * Preparado para soportar en el futuro:
 * - Boyer-Moore: GET /api/busqueda/boyer-moore?patron={texto}
 * - Rabin-Karp: GET /api/busqueda/rabin-karp?patron={texto}
 */
const BASE_BUSQUEDA_URL = 'http://localhost:8080/api/busqueda';

/**
 * Realiza la búsqueda de un patrón en el corpus usando el algoritmo especificado.
 *
 * @param {string} algoritmo Nombre del algoritmo ('kmp', 'boyer-moore', 'rabin-karp')
 * @param {string} patron Texto a buscar
 * @returns {Promise<Object>} Objeto RespuestaBusqueda con estadísticas y resultados
 */
export async function buscarPatron(algoritmo = 'kmp', patron = '') {
  const patronLimpio = patron.trim();
  if (!patronLimpio) {
    throw new Error('El patrón de búsqueda no puede estar vacío.');
  }

  const algoEndpoint = algoritmo.toLowerCase();
  const urlDirecta = `${BASE_BUSQUEDA_URL}/${algoEndpoint}?patron=${encodeURIComponent(patronLimpio)}`;
  const urlRelativa = `/api/busqueda/${algoEndpoint}?patron=${encodeURIComponent(patronLimpio)}`;

  let response;
  try {
    // Intento 1: Llamada directa a http://localhost:8080
    response = await fetch(urlDirecta, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
  } catch {
    // Intento 2: Si falla por red/CORS, probar mediante el proxy de Vite (/api)
    try {
      response = await fetch(urlRelativa, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
    } catch {
      throw new Error(
        'No se pudo conectar con el servidor backend (http://localhost:8080). ' +
        'Asegúrate de que la aplicación Spring Boot esté en ejecución.'
      );
    }
  }

  if (!response.ok) {
    let mensajeError = `Error HTTP ${response.status}: ${response.statusText}`;
    try {
      const cuerpo = await response.json();
      if (cuerpo && cuerpo.message) {
        mensajeError = cuerpo.message;
      } else if (cuerpo && cuerpo.error) {
        mensajeError = cuerpo.error;
      }
    } catch {
      // Si la respuesta no es JSON, se conserva el mensaje con código HTTP
    }
    throw new Error(mensajeError);
  }

  return await response.json();
}

/**
 * Compara el rendimiento de KMP, Boyer-Moore y Rabin-Karp a través de múltiples escalas.
 *
 * @param {string} patron Texto a buscar
 * @param {number} repeticiones Número de ejecuciones por escala (1 a 10000, defecto 1000)
 * @param {number} calentamiento Número de ejecuciones previas descartadas (0 a 2000, defecto 200)
 * @returns {Promise<Object>} Objeto RespuestaComparacion con las escalas y métricas
 */
export async function compararAlgoritmos(patron = '', repeticiones = 1000, calentamiento = 200) {
  const patronLimpio = patron.trim();
  if (!patronLimpio) {
    throw new Error('El patrón de búsqueda no puede estar vacío.');
  }

  const reps = Number(repeticiones);
  const cal = Number(calentamiento);

  if (isNaN(reps) || reps < 1 || reps > 10000) {
    throw new Error('Las repeticiones deben ser un número entero entre 1 y 10.000.');
  }
  if (isNaN(cal) || cal < 0 || cal > 2000) {
    throw new Error('El calentamiento debe ser un número entero entre 0 y 2.000.');
  }

  const queryParams = new URLSearchParams({
    patron: patronLimpio,
    repeticiones: reps.toString(),
    calentamiento: cal.toString()
  }).toString();

  const urlDirecta = `${BASE_BUSQUEDA_URL}/comparar?${queryParams}`;
  const urlRelativa = `/api/busqueda/comparar?${queryParams}`;

  let response;
  try {
    response = await fetch(urlDirecta, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
  } catch {
    try {
      response = await fetch(urlRelativa, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
    } catch {
      throw new Error(
        'No se pudo conectar con el servidor backend (http://localhost:8080). ' +
        'Asegúrate de que la aplicación Spring Boot esté en ejecución.'
      );
    }
  }

  if (!response.ok) {
    let mensajeError = `Error HTTP ${response.status}: ${response.statusText}`;
    try {
      const cuerpo = await response.json();
      if (cuerpo && cuerpo.message) {
        mensajeError = cuerpo.message;
      } else if (cuerpo && cuerpo.error) {
        mensajeError = cuerpo.error;
      }
    } catch {
      // Usar mensaje status
    }
    throw new Error(mensajeError);
  }

  return await response.json();
}
