import React, { useState } from 'react';

/**
 * CoberturaModelo.jsx
 * Componente que muestra la cobertura del modelo FastText para cada artículo del corpus.
 * Consume GET /api/similitud/fasttext/cobertura y combina con los artículos disponibles.
 *
 * Muestra:
 *  - Total de palabras del artículo.
 *  - Cuántas palabras no se encontraron en FastText.
 *  - Porcentaje de cobertura: 1 - (noEncontradas / totalPalabras)
 *  - Resalta en rojo aquellos artículos cuya cobertura sea menor al 90%.
 *  - Lista desplegable de palabras faltantes por artículo.
 */
export default function CoberturaModelo({
  articulos = [],
  coberturaMap = {},
  cargando = false,
  onRecargar,
  modelo = 'GloVe'
}) {
  const [abiertos, setAbiertos] = useState({});

  const toggleDesplegable = (id) => {
    setAbiertos((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="cobertura-card">
      <div className="cobertura-header">
        <div>
          <h3 className="section-ft-title">Cobertura del Vocabulario {modelo}</h3>
          <p className="section-ft-subtitle">
            Porcentaje de palabras de cada abstract reconocidas en el espacio vectorial. Los artículos con cobertura &lt; 90% se resaltan en rojo.
          </p>
        </div>

        {onRecargar && (
          <button
            type="button"
            className="btn-secundario"
            onClick={onRecargar}
            disabled={cargando}
            title="Actualizar datos de cobertura desde el Backend"
          >
            Actualizar cobertura
          </button>
        )}
      </div>

      {cargando ? (
        <div className="loading-state-box">
          <div className="spinner-lg"></div>
          <p>Calculando cobertura en el modelo {modelo}...</p>
        </div>
      ) : articulos.length === 0 ? (
        <div className="selector-vacio">No hay artículos cargados para evaluar la cobertura.</div>
      ) : (
        <div className="table-responsive-wrapper">
          <table className="tabla-pares-custom">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Artículo</th>
                <th className="th-num" style={{ width: '130px' }}>Total palabras</th>
                <th className="th-num" style={{ width: '130px' }}>No encontradas</th>
                <th className="th-num" style={{ width: '130px' }}>Cobertura</th>
                <th style={{ width: '140px', textAlign: 'center' }}>Palabras faltantes</th>
              </tr>
            </thead>
            <tbody>
              {articulos.map((art) => {
                const totalPalabras = art.palabras ? art.palabras.length : (art.cantidadPalabras || 0);
                const faltantes = coberturaMap[art.id] || [];
                const cantFaltantes = faltantes.length;

                // Fórmula: Cobertura = 1 - (noEncontradas / totalPalabras)
                let pctCobertura = 100;
                if (totalPalabras > 0) {
                  const cob = Math.max(0, 1.0 - (cantFaltantes / totalPalabras));
                  pctCobertura = cob * 100;
                }

                const esMenor90 = pctCobertura < 90;
                const estaAbierto = !!abiertos[art.id];

                return (
                  <React.Fragment key={art.id}>
                    <tr className={`fila-cobertura ${esMenor90 ? 'cobertura-baja' : ''}`}>
                      <td className="td-index">
                        <span className={`badge-id-mini ${esMenor90 ? 'badge-danger' : ''}`}>
                          #{art.id}
                        </span>
                      </td>
                      <td className="td-articulo">
                        <div className="par-art-info">
                          <span className="par-art-title" title={art.titulo}>
                            {art.titulo}
                          </span>
                        </div>
                      </td>
                      <td className="td-metric">
                        <span className="metric-num">{totalPalabras}</span>
                      </td>
                      <td className="td-metric">
                        <span className={`metric-num ${cantFaltantes > 0 ? (esMenor90 ? 'txt-danger font-bold' : 'txt-warning') : 'txt-success'}`}>
                          {cantFaltantes}
                        </span>
                      </td>
                      <td className="td-metric">
                        <span className={`metric-pill ${esMenor90 ? 'danger-pill' : 'success-pill'}`}>
                          {pctCobertura.toFixed(2)}%
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {cantFaltantes > 0 ? (
                          <button
                            type="button"
                            className="btn-ver-faltantes"
                            onClick={() => toggleDesplegable(art.id)}
                            title="Ver lista de palabras no encontradas"
                          >
                            {estaAbierto ? 'Ocultar ▲' : `Ver (${cantFaltantes}) ▼`}
                          </button>
                        ) : (
                          <span className="tag-todas-ok">100% OK</span>
                        )}
                      </td>
                    </tr>

                    {/* Fila desplegable con la lista de palabras faltantes */}
                    {estaAbierto && cantFaltantes > 0 && (
                      <tr className="fila-detalle-desplegable">
                        <td colSpan={6}>
                          <div className="box-desplegable-faltantes">
                            <span className="titulo-desplegable">
                              Palabras del abstract no encontradas en {modelo} ({cantFaltantes}):
                            </span>
                            <div className="tokens-cloud">
                              {faltantes.map((palabra, idx) => (
                                <span key={idx} className="token-pill missing">{palabra}</span>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
