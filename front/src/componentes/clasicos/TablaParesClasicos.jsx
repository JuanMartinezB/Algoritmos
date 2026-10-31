import React from 'react';

/**
 * TablaParesClasicos.jsx
 * Muestra la tabla de resultados de los 4 algoritmos clásicos para cada par de artículos.
 * Ordenada de mayor a menor según el promedio de las 4 similitudes.
 */
export default function TablaParesClasicos({
  pares = [],
  articulosMap = {},
  algoritmo = 'todos',
  onSeleccionarPar
}) {
  if (!pares || pares.length === 0) return null;

  const modo = algoritmo || 'todos';

  // Calcular valor relevante para ordenar
  const paresConMetrica = pares.map(p => {
    let valorOrden = 0;
    if (modo === 'todos') {
      const vals = [p.levenshtein, p.needlemanWunsch, p.jaccard, p.cosenoTfIdf].filter(v => v !== null && v !== undefined);
      valorOrden = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    } else if (modo === 'levenshtein') {
      valorOrden = p.levenshtein ?? 0;
    } else if (modo === 'needleman') {
      valorOrden = p.needlemanWunsch ?? 0;
    } else if (modo === 'jaccard') {
      valorOrden = p.jaccard ?? 0;
    } else if (modo === 'tfidf') {
      valorOrden = p.cosenoTfIdf ?? 0;
    }

    return {
      ...p,
      promedio: (p.levenshtein != null && p.needlemanWunsch != null && p.jaccard != null && p.cosenoTfIdf != null)
        ? (p.levenshtein + p.needlemanWunsch + p.jaccard + p.cosenoTfIdf) / 4
        : valorOrden,
      valorOrden
    };
  });

  const paresOrdenados = [...paresConMetrica].sort((a, b) => b.valorOrden - a.valorOrden);

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

  const getTiempoPar = (par) => {
    if (modo === 'levenshtein') return par.tiempoLevenshteinMs;
    if (modo === 'needleman') return par.tiempoNeedlemanMs;
    if (modo === 'jaccard') return par.tiempoJaccardMs;
    if (modo === 'tfidf') return par.tiempoTfIdfMs;
    return par.tiempoTotalMs ?? par.tiempoMs;
  };

  return (
    <div className="tabla-pares-card">
      <div className="tabla-pares-header">
        <div>
          <h3 className="section-ft-title">
            Pares Comparados ({pares.length})
            {modo !== 'todos' && <span className="badge-algoritmo-activo" style={{ marginLeft: '10px', fontSize: '0.8rem', background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '12px' }}>Modo individual: {modo.toUpperCase()}</span>}
          </h3>
          <p className="section-ft-subtitle">
            {modo === 'todos'
              ? 'Resultados de los 4 algoritmos clásicos. Ordenados por promedio de similitud. Haz clic en una fila para ver el paso a paso.'
              : `Resultados ejecutados con ${modo.toUpperCase()}. Ordenados de mayor a menor similitud con su tiempo individual de cómputo.`}
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
              {(modo === 'todos' || modo === 'levenshtein') && (
                <th className="th-num" title="Distancia de Levenshtein normalizada (0 a 1)">
                  Levenshtein {modo === 'todos' ? '' : '(Similitud)'}
                </th>
              )}
              {(modo === 'todos' || modo === 'needleman') && (
                <th className="th-num" title="Needleman-Wunsch normalizado (0 a 1)">
                  Needleman-Wunsch {modo === 'todos' ? '' : '(Similitud)'}
                </th>
              )}
              {(modo === 'todos' || modo === 'jaccard') && (
                <th className="th-num" title="Coeficiente de Jaccard (0 a 1)">
                  Jaccard {modo === 'todos' ? '' : '(Similitud)'}
                </th>
              )}
              {(modo === 'todos' || modo === 'tfidf') && (
                <th className="th-num" title="Coseno TF-IDF (0 a 1)">
                  Coseno TF-IDF {modo === 'todos' ? '' : '(Similitud)'}
                </th>
              )}
              {modo === 'todos' && (
                <th className="th-num" title="Promedio de las 4 métricas">Promedio</th>
              )}
              <th className="th-num" title="Tiempo de cómputo para este par">
                {modo === 'todos' ? 'Tiempo Total' : 'Tiempo de Ejecución'}
              </th>
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
                  title="Haz clic para ver el detalle paso a paso"
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

                  {(modo === 'todos' || modo === 'levenshtein') && (
                    <td className="td-metric" style={colorFondo(par.levenshtein)}>
                      <span>{formatVal(par.levenshtein)}</span>
                    </td>
                  )}

                  {(modo === 'todos' || modo === 'needleman') && (
                    <td className="td-metric" style={colorFondo(par.needlemanWunsch)}>
                      <span>{formatVal(par.needlemanWunsch)}</span>
                    </td>
                  )}

                  {(modo === 'todos' || modo === 'jaccard') && (
                    <td className="td-metric" style={colorFondo(par.jaccard)}>
                      <span>{formatVal(par.jaccard)}</span>
                    </td>
                  )}

                  {(modo === 'todos' || modo === 'tfidf') && (
                    <td className="td-metric" style={colorFondo(par.cosenoTfIdf)}>
                      <span>{formatVal(par.cosenoTfIdf)}</span>
                    </td>
                  )}

                  {modo === 'todos' && (
                    <td className="td-metric highlight-metric">
                      <span className="metric-pill cosine">{formatVal(par.promedio)}</span>
                    </td>
                  )}

                  <td className="td-metric">
                    <span className="metric-num tiempo-par">{formatTiempo(getTiempoPar(par))}</span>
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
