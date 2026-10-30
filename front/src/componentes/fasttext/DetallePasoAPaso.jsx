import React, { useState, useEffect } from 'react';
import { obtenerDetalleFastText } from '../../api/fasttextApi';

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
 * f. Botón para copiar todos los números como texto para el informe técnico.
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
          <div className="modal-title-group">
            <span className="modal-id-badge">Paso a Paso • Modelo FastText (IA)</span>
            <h2 className="modal-title">Comparación Matemática entre Artículos</h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onCerrar}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="modal-body">
          {cargando ? (
            <div className="loading-state-box">
              <div className="spinner-lg"></div>
              <p>Consultando cálculo detallado al Backend (GET /detalle)...</p>
            </div>
          ) : error ? (
            <div className="empty-state-box error-backend-box">
              <div className="empty-icon">⚠️</div>
              <h3>Error al cargar el detalle</h3>
              <p>{error}</p>
            </div>
          ) : detalle ? (
            <>
              {/* Sección a: Títulos y explicación conceptual */}
              <div className="ft-detalle-seccion">
                <div className="ft-par-titulos-card">
                  <div className="ft-par-item">
                    <span className="badge-id-mini">Artículo #{idA}</span>
                    <h4 className="ft-art-titulo">{articuloA ? articuloA.titulo : `Artículo #${idA}`}</h4>
                    <p className="ft-art-autor">👤 {articuloA?.autoresCorto || articuloA?.autores || 'Autor'}</p>
                  </div>
                  <div className="ft-par-vs">VS</div>
                  <div className="ft-par-item">
                    <span className="badge-id-mini">Artículo #{idB}</span>
                    <h4 className="ft-art-titulo">{articuloB ? articuloB.titulo : `Artículo #${idB}`}</h4>
                    <p className="ft-art-autor">👤 {articuloB?.autoresCorto || articuloB?.autores || 'Autor'}</p>
                  </div>
                </div>

                <div className="ft-explicacion-box">
                  <h5 className="ft-explicacion-titulo">
                    <span className="section-dot" /> ¿Cómo funciona FastText en este análisis?
                  </h5>
                  <p>
                    1. <strong>Vectorización de palabras</strong>: Cada palabra del abstract preprocesado se convierte en un vector denso de <strong>300 dimensiones</strong> pre-entrenado en Wikipedia y noticias. Las palabras no presentes en el modelo se descartan.
                  </p>
                  <p>
                    2. <strong>Vector del abstract</strong>: Se calcula el <strong>vector promedio</strong> sumando coordenada a coordenada los vectores de las palabras encontradas y dividiendo por la cantidad de palabras reconocidas.
                  </p>
                  <p>
                    3. <strong>Comparación</strong>: Se comparan los dos vectores promedio resultantes en el espacio vectorial de 300 dimensiones mediante la <em>similitud coseno</em> y la <em>distancia euclidiana</em>.
                  </p>
                </div>
              </div>

              {/* Sección b: Palabras no encontradas */}
              <div className="ft-detalle-seccion">
                <h4 className="section-title">
                  <span className="section-dot" /> Palabras no encontradas en el vocabulario de FastText
                </h4>
                <div className="ft-palabras-no-encontradas-grid">
                  <div className="ft-box-palabras">
                    <div className="ft-box-header">
                      <span>Artículo #{idA}</span>
                      <span className="badge-cuenta-palabras">
                        {detalle.noEncontradasA?.length || 0} no encontradas
                      </span>
                    </div>
                    {detalle.noEncontradasA && detalle.noEncontradasA.length > 0 ? (
                      <div className="tokens-cloud">
                        {detalle.noEncontradasA.map((p, idx) => (
                          <span key={idx} className="token-pill missing">{p}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="txt-todas-encontradas">✅ Todas las palabras del abstract fueron encontradas en FastText.</p>
                    )}
                  </div>

                  <div className="ft-box-palabras">
                    <div className="ft-box-header">
                      <span>Artículo #{idB}</span>
                      <span className="badge-cuenta-palabras">
                        {detalle.noEncontradasB?.length || 0} no encontradas
                      </span>
                    </div>
                    {detalle.noEncontradasB && detalle.noEncontradasB.length > 0 ? (
                      <div className="tokens-cloud">
                        {detalle.noEncontradasB.map((p, idx) => (
                          <span key={idx} className="token-pill missing">{p}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="txt-todas-encontradas">✅ Todas las palabras del abstract fueron encontradas en FastText.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sección c: Primeras 10 dimensiones de vectorA y vectorB */}
              <div className="ft-detalle-seccion">
                <div className="ft-vectores-header-row">
                  <h4 className="section-title">
                    <span className="section-dot" /> Vectores promedio resultantes
                  </h4>
                  <span className="ft-aviso-dims">
                    (Se muestran las primeras 10 de las 300 dimensiones de cada vector)
                  </span>
                </div>

                <div className="ft-tabla-vectores-wrapper">
                  <table className="ft-tabla-vectores">
                    <thead>
                      <tr>
                        <th>Dimensión</th>
                        {Array.from({ length: 10 }).map((_, idx) => (
                          <th key={idx}>d{idx + 1}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="td-label-vector"><strong>Vector A</strong> (#{idA})</td>
                        {detalle.vectorA?.slice(0, 10).map((val, idx) => (
                          <td key={idx} className="td-val-vector">{Number(val).toFixed(5)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="td-label-vector"><strong>Vector B</strong> (#{idB})</td>
                        {detalle.vectorB?.slice(0, 10).map((val, idx) => (
                          <td key={idx} className="td-val-vector">{Number(val).toFixed(5)}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sección d: Cálculo de Similitud Coseno */}
              <div className="ft-detalle-seccion">
                <h4 className="section-title">
                  <span className="section-dot" /> Cálculo del Coseno del Ángulo
                </h4>
                <div className="ft-calculo-box">
                  <div className="formula-line">
                    <span className="formula-label">Fórmula general:</span>
                    <code className="formula-code">
                      cos(θ) = (A · B) / (||A|| × ||B||)
                    </code>
                  </div>

                  <div className="formula-valores-grid">
                    <div className="formula-val-card">
                      <span className="fval-nombre">Producto Punto (A · B)</span>
                      <span className="fval-numero">{Number(detalle.productoPunto).toFixed(6)}</span>
                    </div>
                    <div className="formula-val-card">
                      <span className="fval-nombre">Norma ||A||</span>
                      <span className="fval-numero">{Number(detalle.normaA).toFixed(6)}</span>
                    </div>
                    <div className="formula-val-card">
                      <span className="fval-nombre">Norma ||B||</span>
                      <span className="fval-numero">{Number(detalle.normaB).toFixed(6)}</span>
                    </div>
                  </div>

                  <div className="formula-line sustitucion">
                    <span className="formula-label">Sustitución con valores reales:</span>
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
