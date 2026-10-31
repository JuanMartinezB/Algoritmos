import React from 'react';

/**
 * TablaParesClasicos.jsx
 * Muestra la tabla de resultados de los 4 algoritmos clásicos para cada par de artículos.
 * Ordenada de mayor a menor según el promedio de las 4 similitudes.
 */
export default function TablaParesClasicos({
  pares = [],
  articulosMap = {},
  onSeleccionarPar
}) {
  if (!pares || pares.length === 0) return null;

  // Calcular promedio para ordenar
  const paresConPromedio = pares.map(p => ({
    ...p,
    promedio: (p.levenshtein + p.needlemanWunsch + p.jaccard + p.cosenoTfIdf) / 4
  }));

  const paresOrdenados = [...paresConPromedio].sort((a, b) => b.promedio - a.promedio);

  const formatVal = (v) => v !== undefined && v !== null ? Number(v).toFixed(4) : '-';
  const formatTiempo = (v) => v !== undefined && v !== null ? Number(v).toFixed(2) + ' ms' : '-';

  // Color de fondo según valor de similitud (0 a 1)
  const colorFondo = (val) => {
    if (val === undefined || val === null) return {};
    const n = Math.max(0, Math.min(1, val));
    const alpha = 0.1 + n * 0.6;
    return {
      backgroundColor: `rgba(22, 163, 74, ${alpha})`,
      color: n > 0.55 ? '#fff' : '#064e3b',
      fontWeight: n > 0.5 ? '700' : '600'
    };
  };

  return (
    <div className="tabla-pares-card">
      <div className="tabla-pares-header">
        <div>
          <h3 className="section-ft-title">Pares Comparados ({pares.length})</h3>
          <p className="section-ft-subtitle">
            Resultados de los 4 algoritmos clásicos. Ordenados por promedio de similitud. Haz clic en una fila para ver el paso a paso.
          </p>
        </div>
      </div>

      <div className="table-responsive-wrapper">
        <table className="tabla-pares-custom">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>#</th>
              <th>Artículo A</th>
              <th>Artículo B</th>
              <th className="th-num" title="Distancia de Levenshtein normalizada (0 a 1)">Levenshtein</th>
              <th className="th-num" title="Needleman-Wunsch normalizado (0 a 1)">Needleman-Wunsch</th>
              <th className="th-num" title="Coeficiente de Jaccard (0 a 1)">Jaccard</th>
              <th className="th-num" title="Coseno TF-IDF (0 a 1)">Coseno TF-IDF</th>
              <th className="th-num" title="Promedio de las 4 métricas">Promedio</th>
              <th className="th-num" title="Tiempo de cálculo">Tiempo</th>
              <th style={{ width: '90px', textAlign: 'center' }}>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {paresOrdenados.map((par, index) => {
              const artA = articulosMap[par.idA] || { titulo: `Artículo #${par.idA}` };
              const artB = articulosMap[par.idB] || { titulo: `Artículo #${par.idB}` };

              return (
                <tr
                  key={`${par.idA}-${par.idB}`}
                  className="fila-par-interactiva"
                  onClick={() => onSeleccionarPar && onSeleccionarPar(par.idA, par.idB)}
                  title="Haz clic para ver el detalle paso a paso de los 4 algoritmos"
                >
                  <td className="td-index">{index + 1}</td>
                  <td className="td-articulo">
                    <div className="par-art-info">
                      <span className="badge-id-mini">#{par.idA}</span>
                      <span className="par-art-title" title={artA.titulo}>{artA.titulo}</span>
                    </div>
                  </td>
                  <td className="td-articulo">
                    <div className="par-art-info">
                      <span className="badge-id-mini">#{par.idB}</span>
                      <span className="par-art-title" title={artB.titulo}>{artB.titulo}</span>
                    </div>
                  </td>
                  <td className="td-metric" style={colorFondo(par.levenshtein)}>
                    <span>{formatVal(par.levenshtein)}</span>
                  </td>
                  <td className="td-metric" style={colorFondo(par.needlemanWunsch)}>
                    <span>{formatVal(par.needlemanWunsch)}</span>
                  </td>
                  <td className="td-metric" style={colorFondo(par.jaccard)}>
                    <span>{formatVal(par.jaccard)}</span>
                  </td>
                  <td className="td-metric" style={colorFondo(par.cosenoTfIdf)}>
                    <span>{formatVal(par.cosenoTfIdf)}</span>
                  </td>
                  <td className="td-metric highlight-metric">
                    <span className="metric-pill cosine">{formatVal(par.promedio)}</span>
                  </td>
                  <td className="td-metric">
                    <span className="metric-num tiempo-par">{formatTiempo(par.tiempoMs)}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className="btn-ver-detalle-mini"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSeleccionarPar) onSeleccionarPar(par.idA, par.idB);
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
