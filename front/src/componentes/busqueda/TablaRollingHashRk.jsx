import React, { useState } from 'react';

/**
 * TablaRollingHashRk.jsx
 * Muestra el análisis didáctico de la función de Rolling Hash (Huella Digital Polinomial)
 * del algoritmo Rabin-Karp con aritmética modular (Base = 256, Primo = 101).
 */
export default function TablaRollingHashRk({
  patron = '',
  estructuraAuxiliar = null,
  tablaPrefijos = null
}) {
  const [copiado, setCopiado] = useState(false);

  if (!patron) {
    return null;
  }

  const patronMin = patron.toLowerCase();
  const m = patronMin.length;

  // Valores de la estructura auxiliar enviada por el backend en /api/busqueda/rabin-karp
  const BASE = (estructuraAuxiliar && typeof estructuraAuxiliar.base === 'number')
    ? estructuraAuxiliar.base
    : 256;

  const MOD = (estructuraAuxiliar && typeof estructuraAuxiliar.modulo === 'number')
    ? estructuraAuxiliar.modulo
    : 101;

  const hashFinalBackend = (estructuraAuxiliar && typeof estructuraAuxiliar.hashPatron === 'number')
    ? estructuraAuxiliar.hashPatron
    : (Array.isArray(tablaPrefijos) && tablaPrefijos.length > 0 ? tablaPrefijos[0] : null);

  const potenciaBackend = (estructuraAuxiliar && typeof estructuraAuxiliar.potencia === 'number')
    ? estructuraAuxiliar.potencia
    : null;

  // Cálculo paso a paso de la evolución del hash carácter a carácter
  const pasos = [];
  let hAcumulado = 0;
  for (let i = 0; i < m; i++) {
    const char = patronMin[i];
    const ascii = char.charCodeAt(0);
    hAcumulado = (hAcumulado * BASE + ascii) % MOD;
    pasos.push({
      indice: i,
      char,
      ascii,
      hashParcial: hAcumulado
    });
  }

  // Peso del primer carácter: BASE^(m-1) % MOD (calculado o recibido del backend)
  let pesoPotencia = 1;
  for (let i = 0; i < m - 1; i++) {
    pesoPotencia = (pesoPotencia * BASE) % MOD;
  }
  const valorPotencia = potenciaBackend !== null ? potenciaBackend : pesoPotencia;

  const copiarComoTexto = () => {
    let texto = 'ANÁLISIS DE ROLLING HASH - RABIN-KARP\n';
    texto += `Patrón: "${patron}" (en minúsculas: "${patronMin}", longitud m = ${m})\n`;
    texto += `Parámetros: Base = ${BASE} (ASCII), Módulo primo q = ${MOD}\n`;
    texto += `Hash Final del Patrón: ${hashFinalBackend ?? hAcumulado}\n`;
    texto += `Peso primer carácter (Base^(m-1) mod q): ${valorPotencia}\n\n`;

    const filaIdx = ['Índice (i)      ', ...pasos.map((p) => String(p.indice).padStart(5))].join(' | ');
    const filaChar = ['Carácter P[i]   ', ...pasos.map((p) => (p.char === ' ' ? '␣' : p.char).padStart(5))].join(' | ');
    const filaAscii = ['Código ASCII    ', ...pasos.map((p) => String(p.ascii).padStart(5))].join(' | ');
    const filaHash = ['Hash Parcial mod', ...pasos.map((p) => String(p.hashParcial).padStart(5))].join(' | ');

    const separador = '-'.repeat(filaIdx.length);
    texto += `${filaIdx}\n${separador}\n${filaChar}\n${separador}\n${filaAscii}\n${separador}\n${filaHash}\n\n`;
    texto += 'Fórmula Rolling Hash:\n';
    texto += 'h_nuevo = ((h_anterior - T[s] * potencia) * BASE + T[s+m]) mod MOD\n';

    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  };

  return (
    <div className="busqueda-tabla-prefijos-card rk-card">
      <div className="tabla-prefijos-header">
        <div>
          <div className="rk-header-badge">Huella Digital Polinomial</div>
          <h3 className="tabla-prefijos-titulo">
            Rolling Hash Modular de Rabin-Karp
          </h3>
          <p className="tabla-prefijos-descripcion">
            Convierte el patrón en una huella digital numérica mediante aritmética modular.
            Permite deslizar una ventana sobre el texto actualizando el hash en tiempo <code>O(1)</code>.
          </p>
        </div>
        <button
          type="button"
          className="btn-copiar-tabla"
          onClick={copiarComoTexto}
          title="Copiar parámetros y deducción para el informe técnico"
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

      {/* Tarjetas de Parámetros y Hash Calculado */}
      <div className="rk-metricas-grid">
        <div className="rk-metrica-caja rk-caja-hash">
          <span className="rk-caja-label">Hash del Patrón H(P)</span>
          <span className="rk-caja-valor">{hashFinalBackend ?? hAcumulado}</span>
          <span className="rk-caja-detalle">Calculado en el backend mod {MOD}</span>
        </div>

        <div className="rk-metrica-caja">
          <span className="rk-caja-label">Base del Alfabeto (B)</span>
          <span className="rk-caja-valor">{BASE}</span>
          <span className="rk-caja-detalle">Caracteres ASCII estándar</span>
        </div>

        <div className="rk-metrica-caja">
          <span className="rk-caja-label">Módulo Primo (q)</span>
          <span className="rk-caja-valor">{MOD}</span>
          <span className="rk-caja-detalle">Aritmética modular (control de overflow)</span>
        </div>

        <div className="rk-metrica-caja">
          <span className="rk-caja-label">Peso de Extremo (B^(m-1) mod q)</span>
          <span className="rk-caja-valor">{valorPotencia}</span>
          <span className="rk-caja-detalle">Factor de resta del carácter saliente</span>
        </div>
      </div>

      {/* Evolución paso a paso del Hash del Patrón */}
      <div className="tabla-prefijos-scroll-wrapper">
        <table className="tabla-prefijos-horizontal">
          <tbody>
            {/* Fila 1: Índices */}
            <tr className="fila-indices">
              <th className="encabezado-fila">
                <span className="fila-label">Índice</span>
                <span className="fila-sublabel">i (0..m-1)</span>
              </th>
              {pasos.map((p) => (
                <td key={`rk-idx-${p.indice}`} className="celda-indice">
                  {p.indice}
                </td>
              ))}
            </tr>

            {/* Fila 2: Carácter del patrón */}
            <tr className="fila-caracteres">
              <th className="encabezado-fila">
                <span className="fila-label">Carácter</span>
                <span className="fila-sublabel">P[i]</span>
              </th>
              {pasos.map((p) => (
                <td key={`rk-char-${p.indice}`} className="celda-char">
                  <code>{p.char === ' ' ? '␣' : p.char}</code>
                </td>
              ))}
            </tr>

            {/* Fila 3: Código ASCII */}
            <tr className="fila-indices">
              <th className="encabezado-fila">
                <span className="fila-label">Código ASCII</span>
                <span className="fila-sublabel">Valor numérico</span>
              </th>
              {pasos.map((p) => (
                <td key={`rk-ascii-${p.indice}`} className="celda-indice">
                  {p.ascii}
                </td>
              ))}
            </tr>

            {/* Fila 4: Hash parcial acumulado */}
            <tr className="fila-valores">
              <th className="encabezado-fila">
                <span className="fila-label">Hash Parcial</span>
                <span className="fila-sublabel">(h·256 + c) % 101</span>
              </th>
              {pasos.map((p, idx) => {
                const esUltimo = idx === pasos.length - 1;
                return (
                  <td
                    key={`rk-hash-${p.indice}`}
                    className={`celda-valor ${esUltimo ? 'valor-positivo rk-hash-final-celda' : 'valor-cero'}`}
                    title={`Paso ${idx + 1}: hash parcial = ${p.hashParcial}`}
                  >
                    <strong>{p.hashParcial}</strong>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="tabla-prefijos-footer-nota">
        <span className="nota-pill">Ventana Deslizante O(1)</span>
        <span className="nota-texto">
          Al deslizar la ventana en el texto, el hash se actualiza restando el carácter saliente y sumando el entrante.
          Si coincide con <strong>{hashFinalBackend ?? hAcumulado}</strong>, se verifica carácter a carácter para descartar colisiones.
        </span>
      </div>
    </div>
  );
}
