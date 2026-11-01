import React, { useState, useEffect } from 'react';
import { obtenerDetalleClasicos } from '../../api/clasicosApi';
import ErrorBoundary from '../ErrorBoundary';

/**
 * DetallePasoAPasoClasicos.jsx
 * Modal didáctico que muestra el paso a paso de los 4 algoritmos clásicos.
 * Ideal para la sustentación: muestra matrices DP, conjuntos de Jaccard y vectores TF-IDF.
 */
export default function DetallePasoAPasoClasicos({
  idA,
  idB,
  articuloA,
  articuloB,
  onCerrar
}) {
  const [detalle, setDetalle] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [tabActiva, setTabActiva] = useState('levenshtein');

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);

    obtenerDetalleClasicos(idA, idB, 25)
      .then((data) => { if (activo) setDetalle(data); })
      .catch((err) => { if (activo) setError(err.message); })
      .finally(() => { if (activo) setCargando(false); });

    return () => { activo = false; };
  }, [idA, idB]);

  const tituloA = articuloA?.titulo || `Artículo #${idA}`;
  const tituloB = articuloB?.titulo || `Artículo #${idB}`;

  const tabs = [
    { key: 'levenshtein', label: '1. Levenshtein', icon: '📐' },
    { key: 'needlemanWunsch', label: '2. Needleman-Wunsch', icon: '🧬' },
    { key: 'jaccard', label: '3. Jaccard', icon: '🔗' },
    { key: 'cosenoTfIdf', label: '4. Coseno TF-IDF', icon: '📊' },
  ];

  return (
    <div className="modal-overlay-detalle" onClick={onCerrar}>
      <div className="modal-detalle-contenido modal-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-detalle-header">
          <div>
            <h2 className="modal-detalle-titulo">Detalle Paso a Paso — Algoritmos Clásicos</h2>
            <p className="modal-detalle-sub">
              <strong>#{idA}</strong> {tituloA.substring(0, 60)}… &nbsp;vs&nbsp; <strong>#{idB}</strong> {tituloB.substring(0, 60)}…
            </p>
          </div>
          <button type="button" className="modal-btn-cerrar" onClick={onCerrar}>✕</button>
        </div>

        {/* Tabs de algoritmos */}
        <div className="clasicos-detail-tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`clasicos-tab-btn ${tabActiva === t.key ? 'active' : ''}`}
              onClick={() => setTabActiva(t.key)}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="modal-detalle-body">
          {cargando && (
            <div className="detalle-cargando">
              <div className="spinner-lg"></div>
              <p>Calculando paso a paso…</p>
            </div>
          )}

          {error && (
            <div className="alerta-error-visible">
              <div className="alerta-error-icon">⚠️</div>
              <div className="alerta-error-content">
                <h4 className="alerta-error-title">Error al consultar el servidor</h4>
                <p className="alerta-error-msg">{error}</p>
              </div>
            </div>
          )}

          <ErrorBoundary>
            {detalle && !cargando && tabActiva === 'levenshtein' && (
              <SeccionLevenshtein data={detalle.levenshtein} />
            )}

            {detalle && !cargando && tabActiva === 'needlemanWunsch' && (
              <SeccionNeedlemanWunsch data={detalle.needlemanWunsch} />
            )}

            {detalle && !cargando && tabActiva === 'jaccard' && (
              <SeccionJaccard data={detalle.jaccard} />
            )}

            {detalle && !cargando && tabActiva === 'cosenoTfIdf' && (
              <SeccionCosenoTfIdf data={detalle.cosenoTfIdf} />
            )}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

/* ======================== LEVENSHTEIN ======================== */
function SeccionLevenshtein({ data }) {
  if (!data) return <p>Sin datos de Levenshtein.</p>;

  const colChars = Array.from(data.caracteresColumna || []);
  const rowChars = Array.from(data.caracteresFila || []);

  return (
    <div className="clasicos-seccion-detalle">
      <h3>📐 Distancia de Levenshtein (Programación Dinámica)</h3>
      <div className="clasicos-info-box">
        <p><strong>¿Qué hace?</strong> Cuenta el número mínimo de operaciones (insertar, eliminar, sustituir) para transformar un texto en otro.</p>
        <p><strong>Fórmula de similitud:</strong> <code>1 - (distancia / max(|A|, |B|))</code></p>
        <p><strong>Complejidad:</strong> O(N × M) en tiempo y espacio</p>
      </div>

      <div className="clasicos-resultado-box">
        <div className="clasicos-resultado-item">
          <span className="clasicos-resultado-label">Distancia total</span>
          <span className="clasicos-resultado-valor">{data.distanciaTotal ?? 0}</span>
        </div>
        <div className="clasicos-resultado-item destacado">
          <span className="clasicos-resultado-label">Similitud normalizada</span>
          <span className="clasicos-resultado-valor">{Number(data.similitudCalculada ?? 0).toFixed(6)}</span>
        </div>
      </div>

      <h4>Matriz DP (muestra de {data.textoFila?.length || 0} × {data.textoColumna?.length || 0} caracteres)</h4>
      <div className="clasicos-matriz-scroll">
        <table className="clasicos-dp-tabla">
          <thead>
            <tr>
              <th></th>
              <th>∅</th>
              {colChars.map((c, j) => (
                <th key={j} className="dp-char-header">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.matriz && data.matriz.map((fila, i) => (
              <tr key={i}>
                <th className="dp-char-header">{i === 0 ? '∅' : (rowChars[i - 1] || '')}</th>
                {fila.map((val, j) => (
                  <td key={j} className={`dp-celda ${i === 0 || j === 0 ? 'dp-base' : ''}`}>
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ======================== NEEDLEMAN-WUNSCH ======================== */
function SeccionNeedlemanWunsch({ data }) {
  if (!data) return <p>Sin datos de Needleman-Wunsch.</p>;

  const colChars = Array.from(data.caracteresColumna || []);
  const rowChars = Array.from(data.caracteresFila || []);

  return (
    <div className="clasicos-seccion-detalle">
      <h3>🧬 Needleman-Wunsch (Alineamiento Global)</h3>
      <div className="clasicos-info-box">
        <p><strong>¿Qué hace?</strong> Algoritmo de alineamiento global que asigna puntajes por coincidencia, diferencia y huecos (gaps) para encontrar el alineamiento óptimo entre dos secuencias.</p>
        <p><strong>Puntajes:</strong> Match = <code>{data.matchVal}</code>, Mismatch = <code>{data.mismatchVal}</code>, Gap = <code>{data.gapVal}</code></p>
        <p><strong>Complejidad:</strong> O(N × M) en tiempo y espacio</p>
      </div>

      <div className="clasicos-resultado-box">
        <div className="clasicos-resultado-item">
          <span className="clasicos-resultado-label">Puntaje total</span>
          <span className="clasicos-resultado-valor">{data.puntajeTotal ?? 0}</span>
        </div>
        <div className="clasicos-resultado-item destacado">
          <span className="clasicos-resultado-label">Similitud normalizada</span>
          <span className="clasicos-resultado-valor">{Number(data.similitudCalculada ?? 0).toFixed(6)}</span>
        </div>
      </div>

      <h4>Matriz DP (muestra de {data.textoFila?.length || 0} × {data.textoColumna?.length || 0} caracteres)</h4>
      <div className="clasicos-matriz-scroll">
        <table className="clasicos-dp-tabla">
          <thead>
            <tr>
              <th></th>
              <th>∅</th>
              {colChars.map((c, j) => (
                <th key={j} className="dp-char-header">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.matriz && data.matriz.map((fila, i) => (
              <tr key={i}>
                <th className="dp-char-header">{i === 0 ? '∅' : (rowChars[i - 1] || '')}</th>
                {fila.map((val, j) => (
                  <td key={j} className={`dp-celda ${i === 0 || j === 0 ? 'dp-base' : ''} ${val > 0 ? 'dp-positivo' : val < 0 ? 'dp-negativo' : ''}`}>
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ======================== JACCARD ======================== */
function SeccionJaccard({ data }) {
  if (!data) return <p>Sin datos de Jaccard.</p>;
  return (
    <div className="clasicos-seccion-detalle">
      <h3>🔗 Coeficiente de Jaccard (Teoría de Conjuntos)</h3>
      <div className="clasicos-info-box">
        <p><strong>¿Qué hace?</strong> Mide el solapamiento entre los vocabularios de dos textos: palabras comunes divididas entre el total de palabras distintas.</p>
        <p><strong>Fórmula:</strong> <code>J(A,B) = |A ∩ B| / |A ∪ B|</code></p>
        <p><strong>Complejidad:</strong> O(|A| + |B|)</p>
      </div>

      <div className="clasicos-resultado-box">
        <div className="clasicos-resultado-item">
          <span className="clasicos-resultado-label">|Conjunto A|</span>
          <span className="clasicos-resultado-valor">{data.tamConjuntoA ?? 0} palabras</span>
        </div>
        <div className="clasicos-resultado-item">
          <span className="clasicos-resultado-label">|Conjunto B|</span>
          <span className="clasicos-resultado-valor">{data.tamConjuntoB ?? 0} palabras</span>
        </div>
        <div className="clasicos-resultado-item">
          <span className="clasicos-resultado-label">|A ∩ B| (Intersección)</span>
          <span className="clasicos-resultado-valor">{data.tamInterseccion ?? 0}</span>
        </div>
        <div className="clasicos-resultado-item">
          <span className="clasicos-resultado-label">|A ∪ B| (Unión)</span>
          <span className="clasicos-resultado-valor">{data.tamUnion ?? 0}</span>
        </div>
        <div className="clasicos-resultado-item destacado">
          <span className="clasicos-resultado-label">Coeficiente de Jaccard</span>
          <span className="clasicos-resultado-valor">{Number(data.coeficiente ?? 0).toFixed(6)}</span>
        </div>
      </div>

      {/* Palabras en la intersección */}
      <h4>Palabras en común ({Array.isArray(data.interseccionPalabras) ? data.interseccionPalabras.length : 0})</h4>
      <div className="clasicos-palabras-lista">
        {Array.isArray(data.interseccionPalabras) && data.interseccionPalabras.length > 0 ? (
          data.interseccionPalabras.map((p, i) => (
            <span key={i} className="clasicos-tag interseccion">{p}</span>
          ))
        ) : (
          <p className="text-muted">No hay palabras en común.</p>
        )}
      </div>

      <div className="clasicos-conjuntos-row">
        <div className="clasicos-conjunto-col">
          <h4>Solo en A ({Array.isArray(data.soloEnA) ? data.soloEnA.length : 0})</h4>
          <div className="clasicos-palabras-lista">
            {Array.isArray(data.soloEnA) && data.soloEnA.slice(0, 40).map((p, i) => (
              <span key={i} className="clasicos-tag solo-a">{p}</span>
            ))}
            {Array.isArray(data.soloEnA) && data.soloEnA.length > 40 && <span className="clasicos-tag mas">+{data.soloEnA.length - 40} más</span>}
          </div>
        </div>
        <div className="clasicos-conjunto-col">
          <h4>Solo en B ({Array.isArray(data.soloEnB) ? data.soloEnB.length : 0})</h4>
          <div className="clasicos-palabras-lista">
            {Array.isArray(data.soloEnB) && data.soloEnB.slice(0, 40).map((p, i) => (
              <span key={i} className="clasicos-tag solo-b">{p}</span>
            ))}
            {Array.isArray(data.soloEnB) && data.soloEnB.length > 40 && <span className="clasicos-tag mas">+{data.soloEnB.length - 40} más</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================== COSENO TF-IDF ======================== */
function SeccionCosenoTfIdf({ data }) {
  if (!data) return <p>Sin datos de Coseno TF-IDF.</p>;
  return (
    <div className="clasicos-seccion-detalle">
      <h3>📊 Similitud del Coseno con TF-IDF (Espacio Vectorial)</h3>
      <div className="clasicos-info-box">
        <p><strong>¿Qué hace?</strong> Convierte cada abstract en un vector numérico usando TF-IDF (importancia de cada palabra). Luego calcula el coseno del ángulo entre ambos vectores.</p>
        <p><strong>Fórmulas:</strong></p>
        <ul>
          <li><code>TF(t,d) = frecuencia(t en d) / total_palabras(d)</code></li>
          <li><code>IDF(t) = log(N / (1 + documentos_con_t))</code></li>
          <li><code>cos(A,B) = (A·B) / (|A|×|B|)</code></li>
        </ul>
        <p><strong>Complejidad:</strong> O(|vocabulario|) por par + O(|vocabulario| × |corpus|) para IDF</p>
      </div>

      <div className="clasicos-resultado-box">
        <div className="clasicos-resultado-item">
          <span className="clasicos-resultado-label">Dimensiones del vector</span>
          <span className="clasicos-resultado-valor">{data.dimensionesVector ?? 0}</span>
        </div>
        <div className="clasicos-resultado-item">
          <span className="clasicos-resultado-label">Documentos en el corpus</span>
          <span className="clasicos-resultado-valor">{data.totalDocumentosCorpus ?? 0}</span>
        </div>
        <div className="clasicos-resultado-item">
          <span className="clasicos-resultado-label">Producto punto (A·B)</span>
          <span className="clasicos-resultado-valor">{Number(data.productoPunto ?? 0).toFixed(6)}</span>
        </div>
        <div className="clasicos-resultado-item">
          <span className="clasicos-resultado-label">|A| (norma)</span>
          <span className="clasicos-resultado-valor">{Number(data.normaA ?? 0).toFixed(6)}</span>
        </div>
        <div className="clasicos-resultado-item">
          <span className="clasicos-resultado-label">|B| (norma)</span>
          <span className="clasicos-resultado-valor">{Number(data.normaB ?? 0).toFixed(6)}</span>
        </div>
        <div className="clasicos-resultado-item destacado">
          <span className="clasicos-resultado-label">Similitud del Coseno</span>
          <span className="clasicos-resultado-valor">{Number(data.similitudCoseno ?? 0).toFixed(6)}</span>
        </div>
      </div>

      {/* Top términos comunes */}
      {Array.isArray(data.topTerminosComunes) && data.topTerminosComunes.length > 0 && (
        <>
          <h4>Top Términos Comunes (mayor peso compartido)</h4>
          <div className="table-responsive-wrapper">
            <table className="clasicos-dp-tabla tfidf-tabla">
              <thead>
                <tr>
                  <th>Término</th>
                  <th>TF en A</th>
                  <th>TF en B</th>
                  <th>IDF</th>
                  <th>Peso A</th>
                  <th>Peso B</th>
                </tr>
              </thead>
              <tbody>
                {data.topTerminosComunes.map((t, i) => (
                  <tr key={i}>
                    <td><strong>{t.termino}</strong></td>
                    <td>{Number(t.tfA ?? 0).toFixed(5)}</td>
                    <td>{Number(t.tfB ?? 0).toFixed(5)}</td>
                    <td>{Number(t.idf ?? 0).toFixed(4)}</td>
                    <td style={{ color: '#16a34a', fontWeight: 600 }}>{Number(t.pesoA ?? 0).toFixed(5)}</td>
                    <td style={{ color: '#2563eb', fontWeight: 600 }}>{Number(t.pesoB ?? 0).toFixed(5)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
