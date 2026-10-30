import React, { useState } from 'react';

/**
 * TablaPrefijosKmp.jsx
 * Tabla horizontal con 3 filas:
 * 1. Índice (0..m-1)
 * 2. Carácter del patrón (en minúsculas, acorde a la comparación del backend)
 * 3. Valor de tablaPrefijos (función pi / lps)
 *
 * Incluye botón para copiar la tabla como texto plano para informes técnicos.
 */
export default function TablaPrefijosKmp({
  patron = '',
  tablaPrefijos = []
}) {
  const [copiado, setCopiado] = useState(false);

  if (!patron || !Array.isArray(tablaPrefijos) || tablaPrefijos.length === 0) {
    return null;
  }

  const longitud = Math.min(patron.length, tablaPrefijos.length);
  const caracteres = patron.slice(0, longitud).split('');

  const copiarComoTexto = () => {
    let texto = 'TABLA DE PREFIJOS KMP (Función π / LPS)\n';
    texto += `Patrón: "${patron}" (longitud m = ${longitud})\n\n`;

    const filaIndices = ['Índice (i)      ', ...Array.from({ length: longitud }, (_, i) => String(i).padStart(4))].join(' | ');
    const filaCaracteres = ['Carácter P[i]   ', ...caracteres.map((c) => (c === ' ' ? '␣' : c.toLowerCase()).padStart(4))].join(' | ');
    const filaValores = ['Valor π[i]      ', ...tablaPrefijos.slice(0, longitud).map((v) => String(v).padStart(4))].join(' | ');

    const separador = '-'.repeat(filaIndices.length);
    texto += `${filaIndices}\n${separador}\n${filaCaracteres}\n${separador}\n${filaValores}\n`;

    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  };

  return (
    <div className="busqueda-tabla-prefijos-card">
      <div className="tabla-prefijos-header">
        <div>
          <h3 className="tabla-prefijos-titulo">
            Tabla de Prefijos de KMP (Función π)
          </h3>
          <p className="tabla-prefijos-descripcion">
            Determina la longitud del prefijo propio más largo de <code>P[0..i]</code> que también es sufijo.
            Evita retroceder en el texto cuando ocurre una discrepancia durante la búsqueda.
          </p>
        </div>
        <button
          type="button"
          className="btn-copiar-tabla"
          onClick={copiarComoTexto}
          title="Copiar tabla en formato texto para el informe técnico"
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
      </div>

      <div className="tabla-prefijos-scroll-wrapper">
        <table className="tabla-prefijos-horizontal">
          <tbody>
            {/* Fila 1: Índices */}
            <tr className="fila-indices">
              <th className="encabezado-fila">
                <span className="fila-label">Índice</span>
                <span className="fila-sublabel">i (0..m-1)</span>
              </th>
              {caracteres.map((_, idx) => (
                <td key={`idx-${idx}`} className="celda-indice">
                  {idx}
                </td>
              ))}
            </tr>

            {/* Fila 2: Caracteres del patrón (en minúsculas para coincidir con la lógica del backend) */}
            <tr className="fila-caracteres">
              <th className="encabezado-fila">
                <span className="fila-label">Carácter</span>
                <span className="fila-sublabel">P[i]</span>
              </th>
              {caracteres.map((char, idx) => (
                <td key={`char-${idx}`} className="celda-char">
                  <code>{char === ' ' ? '␣' : char.toLowerCase()}</code>
                </td>
              ))}
            </tr>

            {/* Fila 3: Valor de la tabla de prefijos */}
            <tr className="fila-valores">
              <th className="encabezado-fila">
                <span className="fila-label">Prefijo</span>
                <span className="fila-sublabel">π[i]</span>
              </th>
              {tablaPrefijos.slice(0, longitud).map((val, idx) => (
                <td
                  key={`val-${idx}`}
                  className={`celda-valor ${val > 0 ? 'valor-positivo' : 'valor-cero'}`}
                  title={`En la posición ${idx} ('${caracteres[idx].toLowerCase()}'), el prefijo coincidente tiene longitud ${val}`}
                >
                  <strong>{val}</strong>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="tabla-prefijos-footer-nota">
        <span className="nota-pill">Dimensión: {longitud} caracteres</span>
        <span className="nota-texto">
          Las celdas resaltadas con valores &gt; 0 indican simetrías internas del patrón que permiten saltar comparaciones redundantes.
        </span>
      </div>
    </div>
  );
}
