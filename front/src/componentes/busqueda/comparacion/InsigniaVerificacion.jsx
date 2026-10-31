import React from 'react';

/**
 * InsigniaVerificacion.jsx
 * Muestra la verificación de corrección entre KMP, Boyer-Moore y Rabin-Karp.
 */
export default function InsigniaVerificacion({ escalas = [] }) {
  if (!Array.isArray(escalas) || escalas.length === 0) {
    return null;
  }

  // Verificar si hay alguna escala donde los resultados difieran
  const escalaFallida = escalas.find((esc) => esc.resultadosIguales === false);

  if (escalaFallida) {
    return (
      <div className="comparacion-verificacion-alerta alerta-roja" role="alert">
        <div className="verificacion-icono">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <div className="verificacion-contenido">
          <strong>Los algoritmos no coinciden en la escala de {escalaFallida.articulos} artículos: revisar implementación</strong>
          <span className="verificacion-sub">
            Se detectaron diferencias en las ocurrencias o posiciones encontradas entre los tres métodos de búsqueda.
          </span>
        </div>
      </div>
    );
  }

  // Si todas son iguales, tomamos las coincidencias de la escala más grande (corpus completo)
  const escalaCompleta = escalas[escalas.length - 1];
  const totalCoincidencias = escalaCompleta ? escalaCompleta.ocurrencias : 0;

  return (
    <div className="comparacion-verificacion-alerta insignia-verde" role="status">
      <div className="verificacion-icono">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <div className="verificacion-contenido">
        <strong>Los 3 algoritmos encontraron las mismas coincidencias ({totalCoincidencias})</strong>
        <span className="verificacion-sub">
          Verificación formal de exactitud: KMP, Boyer-Moore y Rabin-Karp identificaron exactamente los mismos índices en las {escalas.length} escalas de prueba.
        </span>
      </div>
    </div>
  );
}
