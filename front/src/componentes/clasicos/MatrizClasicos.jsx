import React, { useState, useMemo } from 'react';

/**
 * MatrizClasicos.jsx
 * Matriz de similitud NxN para los algoritmos clásicos.
 * Permite alternar entre las 4 métricas: Levenshtein, Needleman-Wunsch, Jaccard, Coseno TF-IDF.
 */
export default function MatrizClasicos({
  pares = [],
  articulosSeleccionados = [],
  articulosMap = {},
  onSeleccionarPar
}) {
  const [metrica, setMetrica] = useState('cosenoTfIdf');

  const etiquetas = {
    levenshtein: 'Levenshtein',
    needlemanWunsch: 'Needleman-Wunsch',
    jaccard: 'Jaccard',
    cosenoTfIdf: 'Coseno TF-IDF'
  };

  const mapaPares = useMemo(() => {
    const map = new Map();
    pares.forEach((p) => {
      map.set(`${p.idA}-${p.idB}`, p);
      map.set(`${p.idB}-${p.idA}`, p);
    });
    return map;
  }, [pares]);

  const ids = useMemo(() => [...articulosSeleccionados].sort((a, b) => a - b), [articulosSeleccionados]);

  const obtenerEstiloCelda = (valor, esDiagonal) => {
    if (esDiagonal) {
      return { backgroundColor: '#e2e8f0', color: '#475569', fontWeight: '700' };
    }
    if (valor === null || valor === undefined) {
      return { backgroundColor: '#f8fafc', color: '#94a3b8' };
    }
    const n = Math.max(0, Math.min(1, valor));
    const alpha = 0.15 + n * 0.75;
    const textoColor = n > 0.65 ? '#ffffff' : '#064e3b';
    return {
      backgroundColor: `rgba(22, 163, 74, ${alpha})`,
      color: textoColor,
      fontWeight: n > 0.6 ? '700' : '600'
    };
  };

  if (ids.length < 2) return null;

  return (
    <div className="matriz-similitud-card">
      <div className="matriz-similitud-header">
        <div>
          <h3 className="section-ft-title">Matriz de Similitud ({ids.length}×{ids.length})</h3>
          <p className="section-ft-subtitle">
            Mapa de calor con los 4 algoritmos clásicos. Selecciona la métrica a visualizar.
          </p>
        </div>

        <div className="matriz-tabs-metricas">
          {Object.entries(etiquetas).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`tab-metrica ${metrica === key ? 'active' : ''}`}
              onClick={() => setMetrica(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="matriz-scroll-container">
        <table className="matriz-tabla">
          <thead>
            <tr>
              <th className="matriz-th-corner">ID</th>
              {ids.map((idCol) => {
                const art = articulosMap[idCol];
                return (
                  <th key={idCol} className="matriz-th-col" title={art ? art.titulo : `Artículo #${idCol}`}>
                    <span className="matriz-col-id">#{idCol}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {ids.map((idFila) => (
              <tr key={idFila}>
                <th className="matriz-th-row" title={articulosMap[idFila]?.titulo || `#${idFila}`}>
                  <span className="matriz-row-id">#{idFila}</span>
                </th>
                {ids.map((idCol) => {
                  const esDiagonal = idFila === idCol;
                  let valor = esDiagonal ? 1.0 : null;
                  if (!esDiagonal) {
                    const par = mapaPares.get(`${idFila}-${idCol}`);
                    if (par && par[metrica] !== undefined) {
                      valor = par[metrica];
                    }
                  }
                  const estilo = obtenerEstiloCelda(valor, esDiagonal);

                  return (
                    <td
                      key={`${idFila}-${idCol}`}
                      className={`matriz-td-celda ${esDiagonal ? 'diagonal' : 'interactive'}`}
                      style={estilo}
                      onClick={() => {
                        if (!esDiagonal && onSeleccionarPar) onSeleccionarPar(idFila, idCol);
                      }}
                      title={esDiagonal
                        ? `Mismo artículo (#${idFila})`
                        : `#${idFila} vs #${idCol} | ${etiquetas[metrica]}: ${valor !== null ? Number(valor).toFixed(4) : 'N/A'}`
                      }
                    >
                      {valor !== null ? Number(valor).toFixed(4) : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="matriz-footer-leyenda">
        <span className="leyenda-item">
          <span className="leyenda-color-box" style={{ background: '#e2e8f0' }} />
          <span>Diagonal (1.0000)</span>
        </span>
        <span className="leyenda-item">
          <span className="leyenda-color-box" style={{ background: 'rgba(22, 163, 74, 0.25)' }} />
          <span>Menor similitud</span>
        </span>
        <span className="leyenda-item">
          <span className="leyenda-color-box" style={{ background: 'rgba(22, 163, 74, 0.85)' }} />
          <span>Mayor similitud</span>
        </span>
      </div>
    </div>
  );
}
