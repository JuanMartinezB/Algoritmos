import React, { useState } from 'react';

/**
 * FormularioBusqueda.jsx
 * Componente de entrada para la búsqueda de patrones.
 * Incluye selector de algoritmo preparado para KMP, Boyer-Moore y Rabin-Karp,
 * campo de texto para el patrón y botón de búsqueda.
 */
export default function FormularioBusqueda({
  algoritmo = 'kmp',
  onCambiarAlgoritmo,
  patron = '',
  onCambiarPatron,
  onBuscar,
  cargando = false
}) {
  const [errorLocal, setErrorLocal] = useState('');

  // Algoritmos soportados
  const ALGORITMOS = [
    { id: 'kmp', nombre: 'Knuth-Morris-Pratt (KMP)', disponible: true, badge: 'Disponible' },
    { id: 'boyer-moore', nombre: 'Boyer-Moore', disponible: true, badge: 'Disponible' },
    { id: 'rabin-karp', nombre: 'Rabin-Karp', disponible: true, badge: 'Disponible' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!patron || !patron.trim()) {
      setErrorLocal('Por favor ingresa un patrón o texto a buscar.');
      return;
    }
    setErrorLocal('');
    if (onBuscar) {
      onBuscar(patron.trim(), algoritmo);
    }
  };

  const handleInputChange = (e) => {
    onCambiarPatron(e.target.value);
    if (errorLocal) {
      setErrorLocal('');
    }
  };

  return (
    <div className="busqueda-formulario-card">
      <div className="busqueda-formulario-header">
        <div className="busqueda-algoritmos-tabs" role="tablist" aria-label="Seleccionar algoritmo">
          {ALGORITMOS.map((algo) => (
            <button
              key={algo.id}
              type="button"
              role="tab"
              aria-selected={algoritmo === algo.id}
              disabled={!algo.disponible || cargando}
              className={`busqueda-algo-tab ${algoritmo === algo.id ? 'active' : ''} ${!algo.disponible ? 'disabled' : ''}`}
              onClick={() => algo.disponible && onCambiarAlgoritmo && onCambiarAlgoritmo(algo.id)}
            >
              <span className="tab-nombre">{algo.nombre}</span>
              <span className={`tab-badge ${algo.disponible ? 'badge-activo' : 'badge-proximo'}`}>
                {algo.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="busqueda-form">
        <div className="busqueda-input-wrapper">
          <div className="busqueda-input-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            type="text"
            className="busqueda-input"
            placeholder="Escribe el patrón a buscar en el corpus (ej: algorithm, learning, model, ai)..."
            value={patron}
            onChange={handleInputChange}
            disabled={cargando}
            autoFocus
          />
          {patron && !cargando && (
            <button
              type="button"
              className="busqueda-input-clear"
              onClick={() => {
                onCambiarPatron('');
                setErrorLocal('');
              }}
              title="Borrar texto"
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            className="busqueda-submit-btn"
            disabled={cargando || !patron.trim()}
          >
            {cargando ? (
              <>
                <span className="busqueda-spinner"></span>
                <span>Buscando...</span>
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span>Buscar</span>
              </>
            )}
          </button>
        </div>

        {errorLocal && (
          <div className="busqueda-aviso-validacion">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{errorLocal}</span>
          </div>
        )}
      </form>
    </div>
  );
}
