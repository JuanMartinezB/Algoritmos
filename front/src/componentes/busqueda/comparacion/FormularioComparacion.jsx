import React, { useState } from 'react';

/**
 * FormularioComparacion.jsx
 * Formulario de parámetros para la comparación empírica de rendimiento entre KMP, Boyer-Moore y Rabin-Karp.
 */
export default function FormularioComparacion({
  patron = '',
  onCambiarPatron,
  repeticiones = 1000,
  onCambiarRepeticiones,
  calentamiento = 200,
  onCambiarCalentamiento,
  onComparar,
  cargando = false
}) {
  const [errorValidacion, setErrorValidacion] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const patronLimpio = (patron || '').trim();
    if (!patronLimpio) {
      setErrorValidacion('Por favor ingresa un patrón o texto para comparar.');
      return;
    }

    const reps = Number(repeticiones);
    if (isNaN(reps) || reps < 1 || reps > 10000) {
      setErrorValidacion('El número de repeticiones debe ser un número entero entre 1 y 10.000.');
      return;
    }

    const cal = Number(calentamiento);
    if (isNaN(cal) || cal < 0 || cal > 2000) {
      setErrorValidacion('Las ejecuciones de calentamiento deben estar entre 0 y 2.000.');
      return;
    }

    setErrorValidacion('');
    if (onComparar) {
      onComparar(patronLimpio, reps, cal);
    }
  };

  return (
    <div className="busqueda-formulario-card comparacion-formulario-card">
      <form onSubmit={handleSubmit} className="comparacion-form">
        <div className="comparacion-grid-inputs">
          {/* Campo Patrón */}
          <div className="comparacion-campo-grupo campo-patron">
            <label htmlFor="comp-patron" className="comparacion-label">
              Patrón a buscar
            </label>
            <div className="busqueda-input-wrapper">
              <div className="busqueda-input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <input
                id="comp-patron"
                type="text"
                className="busqueda-input"
                placeholder="Ej: algorithm, ai, educational assessment..."
                value={patron}
                onChange={(e) => {
                  onCambiarPatron(e.target.value);
                  if (errorValidacion) setErrorValidacion('');
                }}
                disabled={cargando}
              />
            </div>
          </div>

          {/* Campo Repeticiones */}
          <div className="comparacion-campo-grupo">
            <label htmlFor="comp-reps" className="comparacion-label">
              Repeticiones (1 - 10.000)
            </label>
            <input
              id="comp-reps"
              type="number"
              min={1}
              max={10000}
              className="comparacion-num-input"
              value={repeticiones}
              onChange={(e) => {
                onCambiarRepeticiones(e.target.value);
                if (errorValidacion) setErrorValidacion('');
              }}
              disabled={cargando}
            />
          </div>

          {/* Campo Calentamiento */}
          <div className="comparacion-campo-grupo">
            <label htmlFor="comp-cal" className="comparacion-label">
              Calentamiento (0 - 2.000)
            </label>
            <input
              id="comp-cal"
              type="number"
              min={0}
              max={2000}
              className="comparacion-num-input"
              value={calentamiento}
              onChange={(e) => {
                onCambiarCalentamiento(e.target.value);
                if (errorValidacion) setErrorValidacion('');
              }}
              disabled={cargando}
            />
          </div>

          {/* Botón de acción */}
          <div className="comparacion-campo-grupo campo-boton">
            <label className="comparacion-label">&nbsp;</label>
            <button
              type="submit"
              className="busqueda-submit-btn comparacion-btn-submit"
              disabled={cargando}
            >
              {cargando ? (
                <>
                  <span className="spinner-mini"></span>
                  <span>Comparando...</span>
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                  <span>Comparar Algoritmos</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mensaje de validación del cliente */}
        {errorValidacion && (
          <div className="comparacion-alerta-local">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{errorValidacion}</span>
          </div>
        )}

        {/* Texto de ayuda metodológica */}
        <p className="comparacion-ayuda-texto">
          Se descartan las primeras ejecuciones de calentamiento (la JVM es más lenta al inicio) y se reporta la mediana de las repeticiones restantes, que es más robusta que el promedio frente a picos del recolector de basura.
        </p>
      </form>
    </div>
  );
}
