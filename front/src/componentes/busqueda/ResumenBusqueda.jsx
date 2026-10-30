import React from 'react';

/**
 * ResumenBusqueda.jsx
 * Muestra el resumen consolidado de los resultados de búsqueda:
 * Algoritmo utilizado, patrón buscado, total de ocurrencias y artículos con coincidencias sobre el total del corpus.
 */
export default function ResumenBusqueda({
  algoritmo = 'KMP',
  patron = '',
  totalOcurrencias = 0,
  articulosConCoincidencias = 0,
  totalArticulosCorpus = 20
}) {
  return (
    <div className="busqueda-resumen-card">
      <div className="busqueda-resumen-main">
        <div className="busqueda-resumen-badge-algo">
          <span className="resumen-tag-label">Algoritmo</span>
          <span className="resumen-tag-valor">{algoritmo}</span>
        </div>
        <div className="busqueda-resumen-patron">
          <span className="resumen-patron-label">Patrón buscado:</span>
          <span className="resumen-patron-texto">«{patron}»</span>
        </div>
      </div>

      <div className="busqueda-resumen-stats">
        <div className="busqueda-stat-pill">
          <div className="stat-pill-icon stat-icon-ocurrencias">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="stat-pill-text">
            <span className="stat-pill-valor">{totalOcurrencias.toLocaleString()}</span>
            <span className="stat-pill-label">{totalOcurrencias === 1 ? 'coincidencia' : 'coincidencias totales'}</span>
          </div>
        </div>

        <div className="busqueda-stat-pill">
          <div className="stat-pill-icon stat-icon-articulos">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
          <div className="stat-pill-text">
            <span className="stat-pill-valor">{articulosConCoincidencias} de {totalArticulosCorpus}</span>
            <span className="stat-pill-label">artículos del corpus</span>
          </div>
        </div>
      </div>
    </div>
  );
}
