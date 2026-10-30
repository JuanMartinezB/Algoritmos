import React from 'react';

/**
 * Convierte nanosegundos a una unidad legible (ns, µs o ms) según su magnitud.
 * @param {number} ns Valor en nanosegundos
 * @returns {{ valor: string, unidad: string }}
 */
function formatearTiempo(ns) {
  if (typeof ns !== 'number' || isNaN(ns) || ns < 0) {
    return { valor: '0', unidad: 'ns' };
  }
  if (ns < 1000) {
    return { valor: ns.toString(), unidad: 'ns' };
  }
  if (ns < 1_000_000) {
    return { valor: (ns / 1000).toFixed(2), unidad: 'µs' };
  }
  return { valor: (ns / 1_000_000).toFixed(3), unidad: 'ms' };
}

/**
 * TarjetasTiempo.jsx
 * Muestra el tiempo de preprocesamiento y el tiempo de búsqueda por separado.
 * Esta separación es crucial para comparar la complejidad del preprocesamiento
 * frente a la búsqueda sobre los textos de los artículos.
 */
export default function TarjetasTiempo({
  algoritmo = 'KMP',
  tiempoPreprocesamientoNs = 0,
  tiempoBusquedaNs = 0
}) {
  const tiempoPre = formatearTiempo(tiempoPreprocesamientoNs);
  const tiempoBus = formatearTiempo(tiempoBusquedaNs);
  const tiempoTotalNs = (tiempoPreprocesamientoNs || 0) + (tiempoBusquedaNs || 0);
  const tiempoTotal = formatearTiempo(tiempoTotalNs);

  const esBm = (algoritmo || '').toLowerCase().includes('boyer');

  return (
    <div className="busqueda-tiempos-contenedor">
      {/* Tarjeta 1: Preprocesamiento */}
      <div
        className="busqueda-tiempo-card preprocesamiento-card"
        title={`${(tiempoPreprocesamientoNs || 0).toLocaleString()} nanosegundos (ns)`}
      >
        <div className="tiempo-card-header">
          <div className="tiempo-card-icon pre-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5"></polyline>
              <line x1="12" y1="19" x2="20" y2="19"></line>
            </svg>
          </div>
          <div className="tiempo-card-titulos">
            <h4 className="tiempo-card-nombre">Preprocesamiento</h4>
            <span className="tiempo-card-subtitulo">
              {esBm ? 'Tabla de carácter malo O(σ + m)' : 'Tabla auxiliar de prefijos O(m)'}
            </span>
          </div>
        </div>

        <div className="tiempo-card-body">
          <div className="tiempo-metrica">
            <span className="tiempo-valor">{tiempoPre.valor}</span>
            <span className="tiempo-unidad">{tiempoPre.unidad}</span>
          </div>
          <div className="tiempo-ns-tooltip-pill">
            <span>{(tiempoPreprocesamientoNs || 0).toLocaleString()} ns</span>
          </div>
        </div>

        <div className="tiempo-card-footer">
          <small>
            {esBm
              ? 'Mapeo de la última posición de los 256 caracteres del alfabeto en el patrón.'
              : 'Cálculo de saltos previo a la búsqueda (se ejecuta una sola vez para el patrón).'}
          </small>
        </div>
      </div>

      {/* Tarjeta 2: Búsqueda */}
      <div
        className="busqueda-tiempo-card busqueda-card"
        title={`${(tiempoBusquedaNs || 0).toLocaleString()} nanosegundos (ns)`}
      >
        <div className="tiempo-card-header">
          <div className="tiempo-card-icon bus-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="tiempo-card-titulos">
            <h4 className="tiempo-card-nombre">Búsqueda en Textos</h4>
            <span className="tiempo-card-subtitulo">
              {esBm ? 'Comparaciones de der. a izq. O(n/m)' : 'Escaneo de los 20 resúmenes O(n)'}
            </span>
          </div>
        </div>

        <div className="tiempo-card-body">
          <div className="tiempo-metrica">
            <span className="tiempo-valor">{tiempoBus.valor}</span>
            <span className="tiempo-unidad">{tiempoBus.unidad}</span>
          </div>
          <div className="tiempo-ns-tooltip-pill">
            <span>{(tiempoBusquedaNs || 0).toLocaleString()} ns</span>
          </div>
        </div>

        <div className="tiempo-card-footer">
          <small>
            {esBm
              ? 'Avanza rápidamente mediante saltos cuando ocurre un carácter discrepante.'
              : 'Recorrido eficiente aprovechando la tabla de prefijos sin retrocesos en el texto.'}
          </small>
        </div>
      </div>

      {/* Tarjeta 3: Total consolidado */}
      <div
        className="busqueda-tiempo-card total-card"
        title={`Tiempo total acumulado: ${tiempoTotalNs.toLocaleString()} ns`}
      >
        <div className="tiempo-card-header">
          <div className="tiempo-card-icon total-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div className="tiempo-card-titulos">
            <h4 className="tiempo-card-nombre">Tiempo Total</h4>
            <span className="tiempo-card-subtitulo">{algoritmo} en Backend</span>
          </div>
        </div>

        <div className="tiempo-card-body">
          <div className="tiempo-metrica">
            <span className="tiempo-valor">{tiempoTotal.valor}</span>
            <span className="tiempo-unidad">{tiempoTotal.unidad}</span>
          </div>
          <div className="tiempo-ns-tooltip-pill">
            <span>{tiempoTotalNs.toLocaleString()} ns</span>
          </div>
        </div>

        <div className="tiempo-card-footer">
          <small>Tiempo total de ejecución del algoritmo en el servidor Spring Boot.</small>
        </div>
      </div>
    </div>
  );
}
