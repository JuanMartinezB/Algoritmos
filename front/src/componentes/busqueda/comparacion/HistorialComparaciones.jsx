import React, { useState } from 'react';
import { formatearTiempoNs } from './formatoTiempoNs';

/**
 * HistorialComparaciones.jsx
 * Tabla acumulada de ejecuciones en sesión para observar el impacto de la longitud del patrón (m)
 * sobre el tiempo de búsqueda, en especial la ventaja de Boyer-Moore a mayor m.
 */
export default function HistorialComparaciones({
  historial = [],
  onLimpiarHistorial,
  onSeleccionarComparacion
}) {
  const [copiado, setCopiado] = useState(false);

  if (!Array.isArray(historial) || historial.length === 0) {
    return null;
  }

  const copiarHistorialTexto = () => {
    let texto = 'HISTORIAL DE COMPARACIONES - IMPACTO DE LA LONGITUD DEL PATRÓN (m)\n';
    texto += 'Efecto de m en el tiempo de búsqueda (mediana en la escala máxima de 20 artículos)\n\n';
    texto += ['Patrón', 'm (longitud)', 'n (caracteres)', 'KMP (búsqueda)', 'Boyer-Moore (búsqueda)', 'Rabin-Karp (búsqueda)'].join('\t') + '\n';

    historial.forEach((h) => {
      texto += [
        h.patron,
        h.m,
        h.n,
        formatearTiempoNs(h.kmpNs).texto,
        formatearTiempoNs(h.bmNs).texto,
        formatearTiempoNs(h.rkNs).texto
      ].join('\t') + '\n';
    });

    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  };

  return (
    <div className="busqueda-tabla-prefijos-card historial-comparacion-card">
      <div className="tabla-prefijos-header">
        <div>
          <div className="bm-header-badge">Análisis de Sensibilidad a m</div>
          <h3 className="tabla-prefijos-titulo">
            Evolución del Rendimiento según la Longitud del Patrón (m)
          </h3>
          <p className="tabla-prefijos-descripcion">
            Observa cómo al incrementar la longitud del patrón (m), Boyer-Moore aumenta el tamaño de sus saltos y reduce sensiblemente el tiempo de búsqueda.
          </p>
        </div>
        <div className="historial-acciones-header">
          <button
            type="button"
            className="btn-copiar-tabla"
            onClick={copiarHistorialTexto}
            title="Copiar historial en formato tabulado para el informe"
          >
            {copiado ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>Copiar para documento</span>
              </>
            )}
          </button>
          <button
            type="button"
            className="btn-limpiar-historial-comp"
            onClick={onLimpiarHistorial}
            title="Borrar historial de comparaciones"
          >
            Limpiar historial
          </button>
        </div>
      </div>

      <div className="tabla-escalas-scroll-wrapper">
        <table className="tabla-escalas-completa">
          <thead>
            <tr>
              <th scope="col">Patrón</th>
              <th scope="col">m (longitud)</th>
              <th scope="col">n (escala máx)</th>
              <th scope="col">KMP (mediana)</th>
              <th scope="col">Boyer-Moore (mediana)</th>
              <th scope="col">Rabin-Karp (mediana)</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((h, idx) => {
              const kmpFmt = formatearTiempoNs(h.kmpNs);
              const bmFmt = formatearTiempoNs(h.bmNs);
              const rkFmt = formatearTiempoNs(h.rkNs);

              const esBmMin = h.bmNs <= h.kmpNs && h.bmNs <= h.rkNs;

              return (
                <tr
                  key={`hist-comp-${h.patron}-${idx}`}
                  className="fila-historial-clickable"
                  onClick={() => onSeleccionarComparacion && onSeleccionarComparacion(h)}
                  title="Clic para cargar estos parámetros"
                >
                  <td className="celda-patron-historial">
                    <code>«{h.patron}»</code>
                  </td>
                  <td className="celda-m">
                    <span className="badge-longitud-m">m = {h.m}</span>
                  </td>
                  <td className="celda-n">
                    <code>{h.n.toLocaleString()}</code>
                  </td>
                  <td className="celda-metrica" title={`${h.kmpNs.toLocaleString()} ns`}>
                    <strong>{kmpFmt.valor}</strong> <span className="unidad-pequena">{kmpFmt.unidad}</span>
                  </td>
                  <td
                    className={`celda-metrica ${esBmMin ? 'celda-minima-optima' : ''}`}
                    title={`${h.bmNs.toLocaleString()} ns`}
                  >
                    <strong>{bmFmt.valor}</strong> <span className="unidad-pequena">{bmFmt.unidad}</span>
                    {esBmMin && <span className="badge-optimo">★ más veloz</span>}
                  </td>
                  <td className="celda-metrica" title={`${h.rkNs.toLocaleString()} ns`}>
                    <strong>{rkFmt.valor}</strong> <span className="unidad-pequena">{rkFmt.unidad}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="tabla-prefijos-footer-nota">
        <span className="nota-pill">Comportamiento Asintótico</span>
        <span className="nota-texto">
          A medida que <code>m</code> aumenta de patrones cortos (ej: <code>"ai"</code>, m=2) a patrones más largos (ej: <code>"educational assessment"</code>, m=22), los saltos de Boyer-Moore crecen proporcionalmente, reduciendo el número total de inspecciones de caracteres.
        </span>
      </div>
    </div>
  );
}
