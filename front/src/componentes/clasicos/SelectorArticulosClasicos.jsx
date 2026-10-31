import React from 'react';

/**
 * SelectorArticulosClasicos.jsx
 * Selector de artículos reutilizable para la página de algoritmos clásicos.
 * Similar al SelectorArticulos de FastText pero con textos adaptados.
 */
export default function SelectorArticulosClasicos({
  articulos = [],
  seleccionados = [],
  onToggleSeleccion,
  onSeleccionarTodos,
  onLimpiarSeleccion,
  onComparar,
  cargando = false
}) {
  const total = articulos.length;
  const cantSeleccionados = seleccionados.length;
  const todosSeleccionados = total > 0 && cantSeleccionados === total;
  const puedeComparar = cantSeleccionados >= 2;

  return (
    <div className="selector-articulos-card">
      <div className="selector-articulos-header">
        <div>
          <h3 className="selector-title">1. Selección de Artículos</h3>
          <p className="selector-subtitle">
            Selecciona al menos 2 artículos para calcular la similitud de sus abstracts con los 4 algoritmos clásicos.
          </p>
        </div>

        <div className="selector-actions">
          <button
            type="button"
            className="btn-secundario"
            onClick={todosSeleccionados ? onLimpiarSeleccion : onSeleccionarTodos}
            disabled={cargando || total === 0}
          >
            {todosSeleccionados ? 'Deseleccionar todos' : 'Seleccionar todos'}
          </button>
          <button
            type="button"
            className="btn-secundario"
            onClick={onLimpiarSeleccion}
            disabled={cargando || cantSeleccionados === 0}
          >
            Limpiar ({cantSeleccionados})
          </button>
          <button
            type="button"
            className="btn-comparar-ft"
            onClick={onComparar}
            disabled={cargando || !puedeComparar}
            title={!puedeComparar ? 'Selecciona al menos 2 artículos' : 'Comparar con 4 algoritmos clásicos'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
            <span>Comparar con Clásicos</span>
            <span className="badge-count">({cantSeleccionados})</span>
          </button>
        </div>
      </div>

      <div className="selector-lista-container">
        {articulos.length === 0 ? (
          <div className="selector-vacio">No hay artículos disponibles. Verifica que el backend esté activo.</div>
        ) : (
          <div className="selector-articulos-grid">
            {articulos.map((art) => {
              const estaSeleccionado = seleccionados.includes(art.id);
              const autorCorto = art.autoresCorto || art.autores || 'Autor desconocido';
              return (
                <label
                  key={art.id}
                  className={`selector-item-card ${estaSeleccionado ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="selector-checkbox"
                    checked={estaSeleccionado}
                    onChange={() => onToggleSeleccion(art.id)}
                    disabled={cargando}
                  />
                  <div className="selector-item-content">
                    <div className="selector-item-top">
                      <span className="selector-id-badge">#{art.id}</span>
                      <span className="selector-item-palabras">
                        {art.cantidadPalabras || art.totalPalabrasOriginales || 0} palabras
                      </span>
                    </div>
                    <div className="selector-item-title" title={art.titulo}>
                      {art.titulo}
                    </div>
                    <div className="selector-item-author" title={autorCorto}>
                      👥 {autorCorto}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
