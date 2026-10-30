import React, { useState } from 'react';

/**
 * TablaCaracterMaloBm.jsx
 * Muestra la tabla auxiliar de la Heurística del Carácter Malo (Bad Character Rule)
 * del algoritmo Boyer-Moore.
 *
 * Contiene:
 * - Tabla con los caracteres únicos del patrón y su última posición registrada.
 * - Fila con el valor de la tabla y el desplazamiento generado cuando hay discrepancia en el último carácter.
 * - Mini probador interactivo para consultar cualquier carácter del alfabeto ASCII (256).
 * - Botón para copiar la tabla como texto para el documento técnico.
 */
export default function TablaCaracterMaloBm({
  patron = '',
  tablaCaracterMalo = []
}) {
  const [copiado, setCopiado] = useState(false);
  const [caracterPrueba, setCaracterPrueba] = useState('');

  if (!patron || !Array.isArray(tablaCaracterMalo) || tablaCaracterMalo.length === 0) {
    return null;
  }

  const patronMin = patron.toLowerCase();
  const m = patronMin.length;

  // Extraer caracteres únicos del patrón preservando orden de primera aparición
  const caracteresUnicos = [];
  const vistos = new Set();
  for (let i = 0; i < patronMin.length; i++) {
    const c = patronMin[i];
    if (!vistos.has(c)) {
      vistos.add(c);
      caracteresUnicos.push(c);
    }
  }

  const copiarComoTexto = () => {
    let texto = 'TABLA DEL CARÁCTER MALO - BOYER-MOORE (Bad Character Rule)\n';
    texto += `Patrón: "${patron}" (en minúsculas: "${patronMin}", longitud m = ${m})\n`;
    texto += 'Tamaño del alfabeto: 256 (ASCII extendido)\n\n';

    const filaChar = ['Carácter (c)       ', ...caracteresUnicos.map((c) => (c === ' ' ? '␣' : c).padStart(5))].join(' | ');
    const filaAscii = ['Código ASCII       ', ...caracteresUnicos.map((c) => String(c.charCodeAt(0)).padStart(5))].join(' | ');
    const filaPos = ['Última Posición    ', ...caracteresUnicos.map((c) => {
      const ascii = c.charCodeAt(0) % 256;
      return String(tablaCaracterMalo[ascii]).padStart(5);
    })].join(' | ');

    const separador = '-'.repeat(filaChar.length);
    texto += `${filaChar}\n${separador}\n${filaAscii}\n${separador}\n${filaPos}\n\n`;
    texto += 'Nota: Para cualquier otro carácter no presente en el patrón, valor = -1 (salto máximo j - (-1) = j + 1).\n';

    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  };

  // Cálculo del probador interactivo
  const charConsulta = caracterPrueba ? caracterPrueba[0].toLowerCase() : null;
  const asciiConsulta = charConsulta ? charConsulta.charCodeAt(0) % 256 : null;
  const valorConsulta = asciiConsulta !== null ? tablaCaracterMalo[asciiConsulta] : null;

  return (
    <div className="busqueda-tabla-prefijos-card bm-card">
      <div className="tabla-prefijos-header">
        <div>
          <div className="bm-header-badge">Heurística Boyer-Moore</div>
          <h3 className="tabla-prefijos-titulo">
            Tabla del Carácter Malo (Bad Character Heuristic)
          </h3>
          <p className="tabla-prefijos-descripcion">
            Registra el índice de la <strong>última aparición</strong> de cada carácter en el patrón.
            Al comparar de derecha a izquierda, si el texto tiene un carácter erróneo <code>c</code>,
            el algoritmo salta <code>max(1, j - tabla[c])</code> alineando el patrón o sobrepasándolo.
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

      {/* Tabla con caracteres del patrón */}
      <div className="tabla-prefijos-scroll-wrapper">
        <table className="tabla-prefijos-horizontal">
          <tbody>
            {/* Fila 1: Carácter */}
            <tr className="fila-caracteres">
              <th className="encabezado-fila">
                <span className="fila-label">Carácter</span>
                <span className="fila-sublabel">Presente en patrón</span>
              </th>
              {caracteresUnicos.map((char, idx) => (
                <td key={`bm-char-${idx}`} className="celda-char">
                  <code>{char === ' ' ? '␣' : char}</code>
                </td>
              ))}
              <td className="celda-char celda-otro-caracter">
                <code>Cualquier otro</code>
              </td>
            </tr>

            {/* Fila 2: Código ASCII */}
            <tr className="fila-indices">
              <th className="encabezado-fila">
                <span className="fila-label">Código ASCII</span>
                <span className="fila-sublabel">Índice tabla (0..255)</span>
              </th>
              {caracteresUnicos.map((char, idx) => (
                <td key={`bm-ascii-${idx}`} className="celda-indice">
                  {char.charCodeAt(0)}
                </td>
              ))}
              <td className="celda-indice celda-otro-caracter">
                restantes
              </td>
            </tr>

            {/* Fila 3: Última posición registrada en la tabla */}
            <tr className="fila-valores">
              <th className="encabezado-fila">
                <span className="fila-label">Última Posición</span>
                <span className="fila-sublabel">tabla[c]</span>
              </th>
              {caracteresUnicos.map((char, idx) => {
                const ascii = char.charCodeAt(0) % 256;
                const valor = tablaCaracterMalo[ascii];
                return (
                  <td
                    key={`bm-val-${idx}`}
                    className="celda-valor valor-positivo"
                    title={`Última posición del carácter '${char}' en el patrón es el índice ${valor}`}
                  >
                    <strong>{valor}</strong>
                  </td>
                );
              })}
              <td
                className="celda-valor celda-valor-negativo"
                title="Para cualquier carácter ajeno al patrón, el valor es -1, permitiendo desplazar el patrón completamente."
              >
                <strong>-1</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Probador interactivo de caracteres del alfabeto */}
      <div className="bm-probador-card">
        <div className="probador-info">
          <span className="probador-titulo">Probador de Heurística:</span>
          <span className="probador-subtitulo">
            Escribe cualquier carácter para comprobar su valor en la tabla de 256 posiciones:
          </span>
        </div>
        <div className="probador-input-box">
          <input
            type="text"
            maxLength={1}
            value={caracterPrueba}
            onChange={(e) => setCaracterPrueba(e.target.value)}
            placeholder="Letra (ej: x)"
            className="probador-input"
          />
          {charConsulta && valorConsulta !== null && (
            <div className="probador-resultado">
              <span className="probador-chip">
                Carácter: <code>'{charConsulta}'</code> (ASCII {asciiConsulta})
              </span>
              <span className={`probador-chip ${valorConsulta >= 0 ? 'chip-encontrado' : 'chip-no-encontrado'}`}>
                tabla[{asciiConsulta}] = <strong>{valorConsulta}</strong>
                {valorConsulta >= 0
                  ? ` (última posición en patrón: ${valorConsulta})`
                  : ' (no aparece en patrón → salto completo)'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="tabla-prefijos-footer-nota">
        <span className="nota-pill">Regla: s += max(1, j - tabla[c])</span>
        <span className="nota-texto">
          Si ocurre un fallo en la posición <code>j</code> con el carácter <code>c</code>,
          el salto evita comparar caracteres intermedios que no pueden coincidir.
        </span>
      </div>
    </div>
  );
}
