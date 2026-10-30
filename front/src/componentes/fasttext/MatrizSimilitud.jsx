import React, { useState, useMemo } from 'react';

/**
 * MatrizSimilitud.jsx
 * Componente que construye y muestra la matriz de similitud (NxN) con los artículos seleccionados
 * en filas y columnas a partir de la lista de pares que entregó el Backend.
 * Permite alternar la métrica a visualizar:
 *  - Coseno (diagonal = 1.0000)
 *  - Similitud Euclidiana (diagonal = 1.0000)
 *  - Distancia Euclidiana (diagonal = 0.0000)
 * Incluye un mapa de calor dinámico generado enteramente con estilos CSS.
 * Al hacer clic en cualquier celda no diagonal, abre el paso a paso de ese par.
 */
export default function MatrizSimilitud({
  pares = [],
  articulosSeleccionados = [],
  articulosMap = {},
  onSeleccionarPar
}) {
  const [metrica, setMetrica] = useState('coseno'); // 'coseno' | 'similitudEuclidiana' | 'distancia'

  // Crear mapa rápido de pares: clave `${minId}-${maxId}` -> par
  const mapaPares = useMemo(() => {
    const map = new Map();
    pares.forEach((p) => {
      const k1 = `${p.idA}-${p.idB}`;
      const k2 = `${p.idB}-${p.idA}`;
      map.set(k1, p);
      map.set(k2, p);
    });
    return map;
  }, [pares]);

  // Lista ordenada de IDs para la matriz
  const ids = useMemo(() => {
    return [...articulosSeleccionados].sort((a, b) => a - b);
  }, [articulosSeleccionados]);

  // Determinar rango de valores de la métrica activa para calibrar el mapa de calor
  const { minVal, maxVal } = useMemo(() => {
    if (pares.length === 0) return { minVal: 0, maxVal: 1 };
    let min = Infinity;
    let max = -Infinity;
    pares.forEach((p) => {
      const val = p[metrica];
      if (val !== undefined && val !== null) {
        if (val < min) min = val;
        if (val > max) max = val;
      }
    });
    if (metrica === 'coseno' || metrica === 'similitudEuclidiana') {
      // Para similitudes incluimos el 1.0 de la diagonal
      max = Math.max(max, 1.0);
    }
    if (metrica === 'distancia') {
      // Para distancia la diagonal es 0.0
      min = Math.min(min, 0.0);
    }
    return { minVal: min, maxVal: max };
  }, [pares, metrica]);

  // Función de estilo del mapa de calor
  const obtenerEstiloCelda = (valor, esDiagonal) => {
    if (esDiagonal) {
      return {
        backgroundColor: '#e2e8f0',
        color: '#475569',
        fontWeight: '700'
      };
    }

    if (valor === undefined || valor === null) {
      return { backgroundColor: '#f8fafc', color: '#94a3b8' };
    }

    if (metrica === 'coseno' || metrica === 'similitudEuclidiana') {
      // Mayor valor = verde más intenso
      const rango = maxVal - minVal || 1;
      const normalizado = Math.max(0, Math.min(1, (valor - minVal) / rango));
      // Gradiente verde menta a verde profundo
      const alpha = 0.15 + normalizado * 0.75;
      const textoColor = normalizado > 0.65 ? '#ffffff' : '#064e3b';
      return {
        backgroundColor: `rgba(22, 163, 74, ${alpha})`,
        color: textoColor,
        fontWeight: normalizado > 0.6 ? '700' : '600'
      };
    } else {
      // Distancia euclidiana: menor valor = más parecidos (verde), mayor distancia = tono más neutro/rojizo suave
      const rango = maxVal - minVal || 1;
      const normalizado = Math.max(0, Math.min(1, (valor - minVal) / rango)); // 0 = menor dist (mas similar)
      const cercania = 1 - normalizado;
      const alpha = 0.15 + cercania * 0.75;
      const textoColor = cercania > 0.65 ? '#ffffff' : '#064e3b';
      return {
        backgroundColor: `rgba(22, 163, 74, ${alpha})`,
        color: textoColor,
        fontWeight: cercania > 0.6 ? '700' : '600'
      };
    }
  };

  if (ids.length < 2) {
    return null;
  }

  return (
    <div className="matriz-similitud-card">
      <div className="matriz-similitud-header">
        <div>
          <h3 className="section-ft-title">Matriz de Similitud ({ids.length}×{ids.length})</h3>
          <p className="section-ft-subtitle">
            Celdas coloreadas según el mapa de calor (verde más oscuro = mayor similitud). Haz clic en una celda para ver el paso a paso.
          </p>
        </div>

        {/* Controles para alternar la métrica visualizada */}
        <div className="matriz-tabs-metricas">
          <button
            type="button"
            className={`tab-metrica ${metrica === 'coseno' ? 'active' : ''}`}
            onClick={() => setMetrica('coseno')}
          >
            Coseno
          </button>
          <button
            type="button"
            className={`tab-metrica ${metrica === 'similitudEuclidiana' ? 'active' : ''}`}
            onClick={() => setMetrica('similitudEuclidiana')}
          >
            Sim. Euclidiana
          </button>
          <button
            type="button"
            className={`tab-metrica ${metrica === 'distancia' ? 'active' : ''}`}
            onClick={() => setMetrica('distancia')}
          >
            Distancia Euclidiana
          </button>
        </div>
      </div>

      {/* Contenedor scrolleable con la matriz */}
      <div className="matriz-scroll-container">
        <table className="matriz-tabla">
          <thead>
            <tr>
              <th className="matriz-th-corner">ID</th>
              {ids.map((idCol) => {
                const artCol = articulosMap[idCol];
                return (
                  <th key={idCol} className="matriz-th-col" title={artCol ? artCol.titulo : `Artículo #${idCol}`}>
                    <span className="matriz-col-id">#{idCol}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {ids.map((idFila) => {
              const artFila = articulosMap[idFila];
              return (
                <tr key={idFila}>
                  <th className="matriz-th-row" title={artFila ? artFila.titulo : `Artículo #${idFila}`}>
                    <span className="matriz-row-id">#{idFila}</span>
                  </th>
                  {ids.map((idCol) => {
                    const esDiagonal = idFila === idCol;
                    let valor = null;
                    if (esDiagonal) {
                      valor = metrica === 'distancia' ? 0.0 : 1.0;
                    } else {
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
                          if (!esDiagonal && onSeleccionarPar) {
                            onSeleccionarPar(idFila, idCol);
                          }
                        }}
                        title={
                          esDiagonal
                            ? `Mismo artículo (#${idFila})`
                            : `Artículo #${idFila} vs #${idCol}\n${metrica}: ${valor !== null ? Number(valor).toFixed(4) : 'N/A'}\n(Clic para ver paso a paso)`
                        }
                      >
                        {valor !== null ? Number(valor).toFixed(4) : '-'}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="matriz-footer-leyenda">
        <span className="leyenda-item">
          <span className="leyenda-color-box" style={{ background: '#e2e8f0' }} />
          <span>Diagonal ({metrica === 'distancia' ? '0.0000' : '1.0000'})</span>
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
