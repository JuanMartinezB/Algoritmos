/**
 * dividirResumen.js
 * Función pura que divide el texto del abstract en segmentos normales y resaltados
 * basada exclusivamente en las posiciones y longitud del patrón entregadas por el backend.
 *
 * Reglas de diseño:
 * - NO realiza ninguna búsqueda ni usa includes, indexOf, match, regex ni replace.
 * - Maneja solapamientos si existen (extendiendo el bloque resaltado).
 *
 * @param {string} resumen Texto completo original del abstract
 * @param {Array<number>} posiciones Índices base 0 donde inicia cada coincidencia
 * @param {number} largo Longitud del patrón buscado
 * @returns {Array<{ texto: string, resaltado: boolean, posicionInicial: number }>}
 */
export function dividirResumen(resumen, posiciones, largo) {
  if (!resumen || !posiciones || posiciones.length === 0 || !largo || largo <= 0) {
    return [{ texto: resumen || '', resaltado: false, posicionInicial: 0 }];
  }

  // Asegurar orden ascendente de las posiciones
  const posOrdenadas = [...posiciones].sort((a, b) => a - b);
  const segmentos = [];
  let fin = 0;

  for (let i = 0; i < posOrdenadas.length; i++) {
    const p = posOrdenadas[i];
    if (p >= fin) {
      // Segmento de texto normal previo
      if (p > fin) {
        segmentos.push({
          texto: resumen.slice(fin, p),
          resaltado: false,
          posicionInicial: fin
        });
      }
      // Segmento de coincidencia resaltada
      segmentos.push({
        texto: resumen.slice(p, p + largo),
        resaltado: true,
        posicionInicial: p
      });
      fin = p + largo;
    } else {
      // Coincidencias solapadas (ej. "aa" en "aaa"): extender el último segmento resaltado
      const nuevoFin = Math.max(fin, p + largo);
      if (segmentos.length > 0) {
        const ultimo = segmentos[segmentos.length - 1];
        if (ultimo.resaltado) {
          ultimo.texto = resumen.slice(ultimo.posicionInicial, nuevoFin);
        }
      }
      fin = nuevoFin;
    }
  }

  // Agregar el resto del texto como segmento normal
  if (fin < resumen.length) {
    segmentos.push({
      texto: resumen.slice(fin),
      resaltado: false,
      posicionInicial: fin
    });
  }

  return segmentos;
}
