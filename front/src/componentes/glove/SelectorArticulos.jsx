import React from 'react';

/**
 * SelectorArticulos.jsx
 * Componente que muestra la lista de artículos cargados del corpus con casillas de selección,
 * permitiendo seleccionar artículos individualmente, seleccionar todos o limpiar la selección.
 * Además contiene el botón principal "Comparar con FastText", deshabilitado si hay menos de 2 seleccionados.
 */
export default function SelectorArticulos({
  articulos = [],
  seleccionados = [],
  onToggleSeleccion,
  onSeleccionarTodos,
  onLimpiarSeleccion,
  onComparar,
  cargando = false,
  modelo = 'GloVe'
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
            Selecciona al menos 2 artículos para calcular la similitud semántica de sus abstracts mediante {modelo}.
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
            title={!puedeComparar ? 'Selecciona al menos 2 artículos' : `Comparar con ${modelo}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
            </svg>
            <span>Comparar con {modelo}</span>
            <span className="badge-count">({cantSeleccionados})</span>
          </button>
        </div>
      </div>

      {/* Lista scrolleable de artículos con checkbox */}
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
