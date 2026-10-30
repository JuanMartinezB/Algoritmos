/**
 * Servicio API para interactuar exclusivamente con el backend de Spring Boot.
 */
const API_BASE_URL = 'http://localhost:8080/api/articulos';

/**
 * Obtiene la lista de artículos preprocesados consumiendo el endpoint GET del Backend.
 * Si el backend no responde, lanza un error y NO carga archivos locales.
 */
export async function obtenerArticulos() {
  const response = await fetch(API_BASE_URL, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Respuesta del backend no satisfactoria: HTTP ${response.status} (${response.statusText})`);
  }

  const data = await response.json();
  return data;
}

/**
 * Ejecuta el preprocesamiento de todos los PDFs llamando al endpoint:
 * POST http://localhost:8080/api/articulos/procesar
 */
export async function ejecutarPreprocesamiento() {
  const response = await fetch(`${API_BASE_URL}/procesar`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Error en el preprocesamiento: HTTP ${response.status} (${response.statusText})`);
  }

  const data = await response.json();
  return { exito: true, data };
}
