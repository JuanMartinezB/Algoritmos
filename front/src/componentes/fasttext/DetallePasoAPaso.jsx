import React, { useState, useEffect } from 'react';
import { obtenerDetalleFastText } from '../../api/fasttextApi';
import { formatearTiempoMs } from './formatoTiempo';

/**
 * DetallePasoAPaso.jsx
 * Componente modal o panel didáctico que muestra el cálculo matemático paso a paso
 * entre dos abstracts mediante FastText consumiendo GET /api/similitud/fasttext/detalle?idA=...&idB=...
 *
 * Secciones:
 * a. Títulos de ambos artículos y explicación de FastText (300 dimensiones, promedio de palabras, comparación).
 * b. Palabras no encontradas por cada abstract (indicando si se encontraron todas).
 * c. Primeras 10 dimensiones de vectorA y vectorB (aviso: 10 de 300).
 * d. Cálculo del coseno con la fórmula y valores reales sustituidos (valor sin recortar).
 * e. Cálculo de la distancia euclidiana y conversión a similitud 1 / (1 + d).
 * f. Tiempo de ejecución del cálculo del par (tiempoMs).
 * g. Botón para copiar todos los números como texto para el informe técnico.
 */
export default function DetallePasoAPaso({
  idA,
  idB,
  articuloA,
  articuloB,
  onCerrar
}) {
  const [detalle, setDetalle] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargarDetalle() {
      if (!idA || !idB) return;
      setCargando(true);
      setError(null);
      try {
        const data = await obtenerDetalleFastText(idA, idB);
        if (activo) {
          setDetalle(data);
        }
      } catch (err) {
        if (activo) {
          console.error('Error al obtener detalle FastText:', err);
          setError(err.message || 'Error al obtener el detalle matemático');
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarDetalle();

    return () => {
      activo = false;
    };
  }, [idA, idB]);

  // Manejar Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCerrar]);

  // Construir texto plano para copiar al portapapeles (útil para informes técnicos)
  const generarTextoParaCopiar = () => {
    if (!detalle) return '';
    const tituloA = articuloA ? articuloA.titulo : `Artículo #${idA}`;
    const tituloB = articuloB ? articuloB.titulo : `Artículo #${idB}`;

    const vecA10 = (detalle.vectorA || []).slice(0, 10).map((v) => v.toFixed(6)).join(', ');
    const vecB10 = (detalle.vectorB || []).slice(0, 10).map((v) => v.toFixed(6)).join(', ');

    const tiempoTexto = detalle.tiempoMs !== undefined && detalle.tiempoMs !== null
      ? formatearTiempoMs(detalle.tiempoMs)
      : 'No disponible';

    return `=== DETALLE MATEMÁTICO FASTTEXT ===
Par: Artículo #${idA} vs Artículo #${idB}
Artículo A (#${idA}): ${tituloA}
Artículo B (#${idB}): ${tituloB}

1. Palabras no encontradas en modelo FastText:
- Artículo A: ${detalle.noEncontradasA?.length ? detalle.noEncontradasA.join(', ') : 'Ninguna (todas encontradas)'}
- Artículo B: ${detalle.noEncontradasB?.length ? detalle.noEncontradasB.join(', ') : 'Ninguna (todas encontradas)'}

2. Vectores de Abstract (promedio 300 dimensiones - primeras 10 dims):
- vectorA[0..9]: [${vecA10}]
- vectorB[0..9]: [${vecB10}]

3. Cálculo Similitud Coseno:
- Producto punto (A · B): ${detalle.productoPunto}
- Norma ||A||: ${detalle.normaA}
- Norma ||B||: ${detalle.normaB}
- Fórmula: cos = (A · B) / (||A|| * ||B||)
- Sustitución: cos = ${detalle.productoPunto} / (${detalle.normaA} * ${detalle.normaB})
- Coseno sin recortar: ${detalle.coseno}
- Coseno recortado [0, 1]: ${Math.max(0, detalle.coseno)}

4. Cálculo Distancia y Similitud Euclidiana:
- Suma de diferencias cuadradas sum((Ai - Bi)^2): ${detalle.sumaDiferenciasCuadradas}
- Distancia Euclidiana d = sqrt(${detalle.sumaDiferenciasCuadradas}) = ${detalle.distancia}
- Similitud Euclidiana = 1 / (1 + d) = 1 / (1 + ${detalle.distancia}) = ${detalle.similitudEuclidiana}

5. Tiempo de ejecución del cálculo:
- Tiempo de ejecución del cálculo: ${tiempoTexto}
====================================`;
  };

  const handleCopiarTexto = async () => {
    try {
      const texto = generarTextoParaCopiar();
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onCerrar} role="dialog" aria-modal="true">
      <div className="modal-container modal-detalle-ft" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera del modal */}
        <div className="modal-header">
          <div>
            <div className="modal-tag">Paso a paso matemático · FastText</div>
            <h3 className="modal-title">
              Comparación: Artículo #{idA} vs Artículo #{idB}
            </h3>
          </div>
          <button type="button" className="btn-close-modal" onClick={onCerrar} aria-label="Cerrar modal">
            ✕
          </button>
        </div>

        {/* Contenido didáctico */}
        <div className="modal-body-scrollable">
          {cargando ? (
            <div className="modal-cargando-box">
              <div className="spinner-md"></div>
              <p>Consultando detalle del par al backend...</p>
            </div>
          ) : error ? (
            <div className="modal-error-box">
              <p>⚠️ {error}</p>
            </div>
          ) : detalle ? (
            <>
              {/* Sección a: Títulos y Explicación breve */}
              <div className="ft-detalle-seccion">
                <h4 className="section-title">
                  <span className="section-dot" /> Artículos en Comparación
                </h4>
                <div className="articulos-comparados-grid">
                  <div className="art-comparado-card">
                    <span className="art-badge-id">Artículo #{idA}</span>
                    <h5 className="art-title-cmp">{articuloA ? articuloA.titulo : `Artículo #${idA}`}</h5>
                    <p className="art-authors-cmp">{articuloA ? articuloA.autoresCorto || articuloA.autores : ''}</p>
                  </div>
                  <div className="art-comparado-card">
                    <span className="art-badge-id">Artículo #{idB}</span>
                    <h5 className="art-title-cmp">{articuloB ? articuloB.titulo : `Artículo #${idB}`}</h5>
                    <p className="art-authors-cmp">{articuloB ? articuloB.autoresCorto || articuloB.autores : ''}</p>
                  </div>
                </div>

                <div className="ft-explicacion-box">
                  <strong>¿Cómo funciona FastText aquí?</strong>
                  <p>
                    1. Cada palabra del abstract se transforma en un vector semántico de <strong>300 dimensiones</strong> entrenado sobre Wikipedia + News.
                    <br />
                    2. Se calcula el <strong>vector promedio</strong> sumando todos los vectores de las palabras conocidas del abstract y dividiendo entre la cantidad de palabras.
                    <br />
                    3. Se comparan ambos vectores de 300 dimensiones mediante la <strong>similitud coseno</strong> y la <strong>distancia euclidiana</strong>.
                  </p>
                </div>
              </div>

              {/* Sección b: Palabras no encontradas */}
              <div className="ft-detalle-seccion">
                <h4 className="section-title">
                  <span className="section-dot" /> Palabras no encontradas en el vocabulario de FastText
                </h4>
                <div className="palabras-no-encontradas-grid">
                  <div className="pne-card">
                    <div className="pne-header">
                      <span>Artículo #{idA}</span>
                      <span className="pne-count">
                        {detalle.noEncontradasA?.length || 0} no encontradas
                      </span>
                    </div>
                    {detalle.noEncontradasA && detalle.noEncontradasA.length > 0 ? (
                      <div className="pne-chips-wrap">
                        {detalle.noEncontradasA.map((p, idx) => (
                          <span key={idx} className="pne-chip">{p}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="pne-ok">✓ Se encontraron todas las palabras del abstract en FastText.</p>
                    )}
                  </div>

                  <div className="pne-card">
                    <div className="pne-header">
                      <span>Artículo #{idB}</span>
                      <span className="pne-count">
                        {detalle.noEncontradasB?.length || 0} no encontradas
                      </span>
                    </div>
                    {detalle.noEncontradasB && detalle.noEncontradasB.length > 0 ? (
                      <div className="pne-chips-wrap">
                        {detalle.noEncontradasB.map((p, idx) => (
                          <span key={idx} className="pne-chip">{p}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="pne-ok">✓ Se encontraron todas las palabras del abstract en FastText.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sección c: Primeras 10 dimensiones */}
              <div className="ft-detalle-seccion">
                <h4 className="section-title">
                  <span className="section-dot" /> Representación Vectorial de los Abstracts
                </h4>
                <p className="section-note">
                  Se muestran las primeras 10 de las 300 dimensiones calculadas para cada vector promedio:
                </p>

                <div className="table-responsive-wrapper">
                  <table className="tabla-vectores-10">
                    <thead>
                      <tr>
                        <th>Dimensión</th>
                        {Array.from({ length: 10 }, (_, i) => (
                          <th key={i}>d_{i + 1}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="row-vector-label">Vector A (#{idA})</td>
                        {(detalle.vectorA || []).slice(0, 10).map((v, i) => (
                          <td key={i} className="cell-num">{Number(v).toFixed(4)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="row-vector-label">Vector B (#{idB})</td>
                        {(detalle.vectorB || []).slice(0, 10).map((v, i) => (
                          <td key={i} className="cell-num">{Number(v).toFixed(4)}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sección d: Cálculo de Similitud Coseno */}
              <div className="ft-detalle-seccion">
                <h4 className="section-title">
                  <span className="section-dot" /> Cálculo de Similitud Coseno
                </h4>
                <div className="ft-calculo-box">
                  <div className="formula-line">
                    <span className="formula-label">Fórmula:</span>
                    <code className="formula-code">cos(θ) = (A · B) / ( ‖A‖ × ‖B‖ )</code>
                  </div>

                  <div className="formula-valores-grid">
                    <div className="formula-val-card">
                      <span className="fval-nombre">Producto Punto (A · B)</span>
                      <span className="fval-numero">{Number(detalle.productoPunto).toFixed(6)}</span>
                    </div>
                    <div className="formula-val-card">
                      <span className="fval-nombre">Norma de A (‖A‖)</span>
                      <span className="fval-numero">{Number(detalle.normaA).toFixed(6)}</span>
                    </div>
                    <div className="formula-val-card">
                      <span className="fval-nombre">Norma de B (‖B‖)</span>
                      <span className="fval-numero">{Number(detalle.normaB).toFixed(6)}</span>
                    </div>
                  </div>

                  <div className="formula-line sustitucion" style={{ marginTop: '12px' }}>
                    <span className="formula-label">Sustitución:</span>
                    <div className="formula-sustitucion-box">
                      cos(θ) = {Number(detalle.productoPunto).toFixed(6)} / ({Number(detalle.normaA).toFixed(6)} × {Number(detalle.normaB).toFixed(6)})
                      {' = '}
                      <strong className="res-highlight">{Number(detalle.coseno).toFixed(6)}</strong>
                    </div>
                  </div>

                  <div className="formula-nota-aclaratoria">
                    ℹ️ <strong>Coseno sin recortar:</strong> {Number(detalle.coseno).toFixed(6)}.
                    {' '}(En la tabla general y matriz, los cosenos negativos se acotan a 0.0000; aquí se aprecia el valor real calculado directamente por el backend).
                  </div>
                </div>
              </div>

              {/* Sección e: Cálculo de Distancia y Similitud Euclidiana */}
              <div className="ft-detalle-seccion">
                <h4 className="section-title">
                  <span className="section-dot" /> Cálculo de Distancia y Similitud Euclidiana
                </h4>
                <div className="ft-calculo-box">
                  <div className="formula-line">
                    <span className="formula-label">Fórmula de Distancia Euclidiana:</span>
                    <code className="formula-code">
                      d = √( ∑ (Aᵢ - Bᵢ)² ) = √(sumaDiferenciasCuadradas)
                    </code>
                  </div>

                  <div className="formula-valores-grid">
                    <div className="formula-val-card">
                      <span className="fval-nombre">Suma de diferencias cuadradas</span>
                      <span className="fval-numero">{Number(detalle.sumaDiferenciasCuadradas).toFixed(6)}</span>
                    </div>
                    <div className="formula-val-card">
                      <span className="fval-nombre">Distancia Euclidiana (d)</span>
                      <span className="fval-numero res-highlight">{Number(detalle.distancia).toFixed(6)}</span>
                    </div>
                  </div>

                  <div className="formula-line sustitucion" style={{ marginTop: '12px' }}>
                    <span className="formula-label">Conversión a Similitud Euclidiana (0 a 1):</span>
                    <div className="formula-sustitucion-box">
                      similitud = 1 / (1 + d) = 1 / (1 + {Number(detalle.distancia).toFixed(6)})
                      {' = '}
                      <strong className="res-highlight">{Number(detalle.similitudEuclidiana).toFixed(6)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección f: Tiempo de ejecución del cálculo de este par */}
              {detalle.tiempoMs !== undefined && detalle.tiempoMs !== null && (
                <div className="ft-detalle-seccion ft-seccion-tiempo">
                  <div className="ft-tiempo-calculo-box">
                    <div className="ft-tiempo-calculo-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </div>
                    <div className="ft-tiempo-calculo-texto">
                      <span className="ft-tiempo-calculo-label">
                        Tiempo de ejecución del cálculo: <strong>{formatearTiempoMs(detalle.tiempoMs)}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Pie del modal con botón de copiar y cerrar */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn-copiar-datos"
            onClick={handleCopiarTexto}
            disabled={!detalle}
            title="Copia todas las fórmulas y números en formato texto para usar en el informe técnico"
          >
            {copiado ? '✓ ¡Datos copiados al portapapeles!' : '📋 Copiar todos estos números como texto'}
          </button>

          <button type="button" className="btn-modal-close" onClick={onCerrar}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
