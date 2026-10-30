import React from 'react';

/**
 * HistorialBusqueda.jsx
 * Guarda y visualiza las búsquedas recientes de la sesión activa,
 * permitiendo repetir una búsqueda previa con un solo clic.
 */
export default function HistorialBusqueda({
  historial = [],
  onSeleccionarHistorial,
  onLimpiarHistorial
}) {
  if (!Array.isArray(historial) || historial.length === 0) {
    return null;
  }

  return (
    <div className="busqueda-historial-card">
      <div className="busqueda-historial-header">
        <div className="historial-header-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 14 14"></polyline>
          </svg>
          <h4>Búsquedas Recientes</h4>
          <span className="historial-contador">({historial.length})</span>
        </div>
        <button
          type="button"
          className="btn-limpiar-historial"
          onClick={onLimpiarHistorial}
          title="Borrar historial de búsquedas"
        >
          Limpiar
        </button>
      </div>

      <div className="busqueda-historial-chips">
        {historial.map((item, index) => (
          <button
            key={`hist-${item.patron}-${index}`}
            type="button"
            className="historial-chip-btn"
            onClick={() => onSeleccionarHistorial && onSeleccionarHistorial(item.patron, item.algoritmo)}
            title={`Buscar de nuevo "${item.patron}" con ${item.algoritmo} (${item.totalOcurrencias} coincidencias)`}
          >
            <span className="chip-algo-mini">{item.algoritmo}</span>
            <span className="chip-patron-texto">«{item.patron}»</span>
            <span className="chip-ocurrencias-mini">{item.totalOcurrencias}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
