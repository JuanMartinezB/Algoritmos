import React from 'react';
import { formatearTiempoMs } from './formatoTiempo';

/**
 * TablaPares.jsx
 * Componente que muestra la lista de comparaciones entre pares de artículos ordenados
 * de mayor a menor según el valor de coseno devuelto por el Backend.
 * Muestra 4 decimales en las métricas (coseno, distancia, similitud euclidiana)
 * y permite abrir el paso a paso detallado al hacer clic en cualquier fila.
 */
export default function TablaPares({
  pares = [],
  articulosMap = {},
  onSeleccionarPar
}) {
  if (!pares || pares.length === 0) {
    return null;
  }

  // Ordenar de mayor a menor coseno tal como se solicita
  const paresOrdenados = [...pares].sort((a, b) => b.coseno - a.coseno);

  return (
    <div className="tabla-pares-card">
      <div className="tabla-pares-header">
        <div>
          <h3 className="section-ft-title">Pares Comparados ({pares.length})</h3>
          <p className="section-ft-subtitle">
            Ordenados de mayor a menor similitud coseno. Haz clic en una fila para ver el cálculo detallado paso a paso.
          </p>
        </div>
      </div>

      <div className="table-responsive-wrapper">
        <table className="tabla-pares-custom">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>#</th>
              <th>Artículo A</th>
              <th>Artículo B</th>
              <th className="th-num" title="Coseno entre vectores (0 a 1). Mayor = más parecidos">
                Coseno
              </th>
              <th className="th-num" title="Distancia Euclidiana (menor = más parecidos)">
                Distancia
              </th>
              <th className="th-num" title="Similitud Euclidiana: 1 / (1 + distancia)">
                Sim. Euclidiana
              </th>
              <th className="th-num" title="Tiempo de cálculo del par">
                Tiempo (ms)
              </th>
              <th style={{ width: '90px', textAlign: 'center' }}>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {paresOrdenados.map((par, index) => {
              const artA = articulosMap[par.idA] || { titulo: `Artículo #${par.idA}`, autoresCorto: '' };
              const artB = articulosMap[par.idB] || { titulo: `Artículo #${par.idB}`, autoresCorto: '' };

              return (
                <tr
                  key={`${par.idA}-${par.idB}`}
                  className="fila-par-interactiva"
                  onClick={() => onSeleccionarPar && onSeleccionarPar(par.idA, par.idB)}
                  title="Haz clic para ver el detalle matemático de este par"
                >
                  <td className="td-index">{index + 1}</td>
                  <td className="td-articulo">
                    <div className="par-art-info">
                      <span className="badge-id-mini">#{par.idA}</span>
                      <span className="par-art-title" title={artA.titulo}>
                        {artA.titulo}
                      </span>
                    </div>
                  </td>
                  <td className="td-articulo">
                    <div className="par-art-info">
                      <span className="badge-id-mini">#{par.idB}</span>
                      <span className="par-art-title" title={artB.titulo}>
                        {artB.titulo}
                      </span>
                    </div>
                  </td>
                  <td className="td-metric highlight-metric">
                    <span className="metric-pill cosine">
                      {Number(par.coseno).toFixed(4)}
                    </span>
                  </td>
                  <td className="td-metric">
                    <span className="metric-num">
                      {Number(par.distancia).toFixed(4)}
                    </span>
                  </td>
                  <td className="td-metric">
                    <span className="metric-pill euclidean">
                      {Number(par.similitudEuclidiana).toFixed(4)}
                    </span>
                  </td>
                  <td className="td-metric">
                    <span className="metric-num tiempo-par">
                      {par.tiempoMs !== undefined && par.tiempoMs !== null
                        ? formatearTiempoMs(par.tiempoMs)
                        : '-'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className="btn-ver-detalle-mini"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSeleccionarPar) {
                          onSeleccionarPar(par.idA, par.idB);
                        }
                      }}
                      title="Ver paso a paso"
                    >
                      Paso a paso →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
