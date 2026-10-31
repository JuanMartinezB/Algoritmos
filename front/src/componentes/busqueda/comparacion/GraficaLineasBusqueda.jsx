import React, { useState } from 'react';
import { formatearTiempoNs } from './formatoTiempoNs';

/**
 * GraficaLineasBusqueda.jsx
 * Gráfica de líneas SVG: Tiempo de búsqueda (mediana) vs. tamaño del texto (n caracteres).
 * Distingue los algoritmos por color y forma geométrica del marcador (círculo, cuadrado, triángulo).
 * Incluye interruptor de escala logarítmica en el eje Y y tooltips interactivos.
 */
export default function GraficaLineasBusqueda({ escalas = [] }) {
  const [escalaLog, setEscalaLog] = useState(true);
  const [puntoHover, setPuntoHover] = useState(null);

  if (!Array.isArray(escalas) || escalas.length === 0) {
    return null;
  }

  // Dimensiones del lienzo SVG
  const width = 680;
  const height = 340;
  const paddingLeft = 70;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 50;

  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  // Extraer puntos por algoritmo
  // Algoritmos identificados
  const ALGORITMOS_INFO = {
    'KMP': { color: '#0d9488', forma: 'circulo', etiqueta: 'KMP' },
    'Boyer-Moore': { color: '#d97706', forma: 'cuadrado', etiqueta: 'Boyer-Moore' },
    'Rabin-Karp': { color: '#7c3aed', forma: 'triangulo', etiqueta: 'Rabin-Karp' }
  };

  const nombresAlgos = ['KMP', 'Boyer-Moore', 'Rabin-Karp'];

  // Puntos del eje X basados en n (caracteres)
  const valoresN = escalas.map((e) => e.caracteres);
  const minN = Math.min(...valoresN);
  const maxN = Math.max(...valoresN);

  // Recopilar todos los valores de Y (tiempo de búsqueda mediana en ns)
  let todosY = [];
  escalas.forEach((esc) => {
    (esc.algoritmos || []).forEach((m) => {
      todosY.push(m.busquedaMedianaNs);
    });
  });

  if (todosY.length === 0) todosY = [1];
  const minYRaw = Math.max(1, Math.min(...todosY));
  const maxYRaw = Math.max(...todosY);

  // Escalas matemáticas
  const yMin = escalaLog ? Math.max(1, minYRaw * 0.8) : 0;
  const yMax = escalaLog ? maxYRaw * 1.3 : maxYRaw * 1.15;

  const logMin = Math.log10(Math.max(1, yMin));
  const logMax = Math.log10(Math.max(10, yMax));

  // Función de proyección X (distribución equiespaciada por escala para mayor legibilidad)
  const getX = (idxEscala) => {
    if (escalas.length <= 1) return paddingLeft + plotWidth / 2;
    return paddingLeft + (idxEscala / (escalas.length - 1)) * plotWidth;
  };

  // Función de proyección Y
  const getY = (valorNs) => {
    const val = Math.max(1, valorNs);
    if (escalaLog) {
      const logVal = Math.log10(val);
      const ratio = (logVal - logMin) / (logMax - logMin || 1);
      return paddingTop + plotHeight - Math.max(0, Math.min(1, ratio)) * plotHeight;
    } else {
      const ratio = (val - yMin) / (yMax - yMin || 1);
      return paddingTop + plotHeight - Math.max(0, Math.min(1, ratio)) * plotHeight;
    }
  };

  // Guías del eje Y (ticks)
  const ticksY = [];
  if (escalaLog) {
    const decadaMin = Math.floor(logMin);
    const decadaMax = Math.ceil(logMax);
    for (let d = decadaMin; d <= decadaMax; d++) {
      const val = Math.pow(10, d);
      if (val >= yMin * 0.7 && val <= yMax * 1.3) {
        ticksY.push(val);
      }
    }
    if (ticksY.length < 3) {
      ticksY.push(minYRaw, maxYRaw);
    }
  } else {
    const pasos = 5;
    for (let i = 0; i <= pasos; i++) {
      ticksY.push(yMin + (i / pasos) * (yMax - yMin));
    }
  }

  // Construcción de trayectorias (paths) para cada algoritmo
  const series = nombresAlgos.map((nombre) => {
    const puntos = [];
    escalas.forEach((esc, idxEscala) => {
      const med = (esc.algoritmos || []).find((a) => a.algoritmo === nombre);
      if (med) {
        const x = getX(idxEscala);
        const y = getY(med.busquedaMedianaNs);
        puntos.push({
          x,
          y,
          algoritmo: nombre,
          n: esc.caracteres,
          articulos: esc.articulos,
          ns: med.busquedaMedianaNs,
          promedioNs: med.busquedaPromedioNs
        });
      }
    });

    const dPath = puntos.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');

    return {
      nombre,
      info: ALGORITMOS_INFO[nombre] || { color: '#059669', forma: 'circulo' },
      puntos,
      dPath
    };
  });

  return (
    <div className="busqueda-tabla-prefijos-card grafica-card">
      <div className="grafica-header">
        <div>
          <div className="bm-header-badge">Escalamiento O(n) vs O(n/m)</div>
          <h3 className="tabla-prefijos-titulo">
            Tiempo de Búsqueda vs. Tamaño del Texto (n caracteres)
          </h3>
          <p className="tabla-prefijos-descripcion">
            Comparación de la mediana del tiempo de búsqueda a medida que el corpus crece de {minN.toLocaleString()} a {maxN.toLocaleString()} caracteres.
          </p>
        </div>

        {/* Switch Logarítmico */}
        <div className="grafica-switch-box">
          <label className="switch-label" htmlFor="switch-log-lineas">
            <input
              id="switch-log-lineas"
              type="checkbox"
              checked={escalaLog}
              onChange={(e) => setEscalaLog(e.target.checked)}
            />
            <span className="switch-custom"></span>
            <span className="switch-texto">Escala logarítmica en Y</span>
          </label>
        </div>
      </div>

      {/* Leyenda interactiva con forma y color */}
      <div className="grafica-leyenda">
        {series.map((s) => (
          <div key={`leyenda-${s.nombre}`} className="leyenda-item">
            <svg width="20" height="20" className="leyenda-simbolo">
              <line x1="2" y1="10" x2="18" y2="10" stroke={s.info.color} strokeWidth="2.5" />
              {s.info.forma === 'circulo' && (
                <circle cx="10" cy="10" r="4.5" fill={s.info.color} stroke="#ffffff" strokeWidth="1.5" />
              )}
              {s.info.forma === 'cuadrado' && (
                <rect x="6" y="6" width="8" height="8" fill={s.info.color} stroke="#ffffff" strokeWidth="1.5" />
              )}
              {s.info.forma === 'triangulo' && (
                <polygon points="10,5 15,14 5,14" fill={s.info.color} stroke="#ffffff" strokeWidth="1.5" />
              )}
            </svg>
            <span className="leyenda-nombre">{s.nombre}</span>
            <span className="leyenda-forma-tag">({s.info.forma})</span>
          </div>
        ))}
      </div>

      {/* Contenedor SVG Responsivo */}
      <div className="grafica-svg-wrapper">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="grafica-svg"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Gráfica de líneas de tiempo de búsqueda frente al tamaño del texto"
        >
          {/* Rejilla horizontal de fondo (Grid Y) */}
          {ticksY.map((val, idx) => {
            const y = getY(val);
            const fmt = formatearTiempoNs(val);
            return (
              <g key={`grid-y-${idx}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="svg-axis-label"
                  fontSize="11"
                  fill="#64748b"
                >
                  {fmt.valor} {fmt.unidad}
                </text>
              </g>
            );
          })}

          {/* Ejes principales */}
          <line
            x1={paddingLeft}
            y1={paddingTop + plotHeight}
            x2={width - paddingRight}
            y2={paddingTop + plotHeight}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={paddingTop + plotHeight}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />

          {/* Marcas y etiquetas del Eje X */}
          {escalas.map((esc, idx) => {
            const x = getX(idx);
            const y = paddingTop + plotHeight;
            return (
              <g key={`axis-x-${idx}`}>
                <line x1={x} y1={y} x2={x} y2={y + 6} stroke="#64748b" strokeWidth="1.5" />
                <text
                  x={x}
                  y={y + 20}
                  textAnchor="middle"
                  className="svg-axis-label"
                  fontSize="11"
                  fontWeight="600"
                  fill="#334155"
                >
                  n = {esc.caracteres.toLocaleString()}
                </text>
                <text
                  x={x}
                  y={y + 34}
                  textAnchor="middle"
                  className="svg-axis-sublabel"
                  fontSize="10"
                  fill="#64748b"
                >
                  ({esc.articulos} {esc.articulos === 1 ? 'art.' : 'arts.'})
                </text>
              </g>
            );
          })}

          {/* Líneas de cada algoritmo */}
          {series.map((s) => (
            <path
              key={`path-${s.nombre}`}
              d={s.dPath}
              fill="none"
              stroke={s.info.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Puntos y marcadores geométricos de cada serie */}
          {series.map((s) =>
            s.puntos.map((p, idx) => {
              const esActivo = puntoHover && puntoHover.algoritmo === s.nombre && puntoHover.n === p.n;
              return (
                <g
                  key={`marcador-${s.nombre}-${idx}`}
                  className="grafica-marcador-grupo"
                  onMouseEnter={() => setPuntoHover(p)}
                  onMouseLeave={() => setPuntoHover(null)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${s.nombre}: ${p.ns} ns para ${p.n} caracteres`}
                >
                  {/* Área invisible amplia para facilitar hover */}
                  <circle cx={p.x} cy={p.y} r="14" fill="transparent" cursor="pointer" />

                  {s.info.forma === 'circulo' && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={esActivo ? 6.5 : 4.5}
                      fill={s.info.color}
                      stroke="#ffffff"
                      strokeWidth={esActivo ? 2.5 : 1.5}
                    />
                  )}
                  {s.info.forma === 'cuadrado' && (
                    <rect
                      x={p.x - (esActivo ? 6 : 4)}
                      y={p.y - (esActivo ? 6 : 4)}
                      width={esActivo ? 12 : 8}
                      height={esActivo ? 12 : 8}
                      fill={s.info.color}
                      stroke="#ffffff"
                      strokeWidth={esActivo ? 2.5 : 1.5}
                    />
                  )}
                  {s.info.forma === 'triangulo' && (
                    <polygon
                      points={`${p.x},${p.y - (esActivo ? 7 : 5)} ${p.x + (esActivo ? 6 : 4.5)},${p.y + (esActivo ? 6 : 4.5)} ${p.x - (esActivo ? 6 : 4.5)},${p.y + (esActivo ? 6 : 4.5)}`}
                      fill={s.info.color}
                      stroke="#ffffff"
                      strokeWidth={esActivo ? 2.5 : 1.5}
                    />
                  )}
                </g>
              );
            })
          )}

          {/* Tooltip sobre el punto activo */}
          {puntoHover && (
            <g transform={`translate(${Math.min(width - 150, Math.max(paddingLeft + 10, puntoHover.x - 65))}, ${Math.max(10, puntoHover.y - 65)})`}>
              <rect
                x="0"
                y="0"
                width="135"
                height="54"
                rx="6"
                fill="#0f172a"
                opacity="0.95"
              />
              <text x="10" y="18" fill="#f8fafc" fontSize="11" fontWeight="bold">
                {puntoHover.algoritmo} ({puntoHover.articulos} arts)
              </text>
              <text x="10" y="33" fill="#38bdf8" fontSize="11">
                Mediana: {formatearTiempoNs(puntoHover.ns).texto}
              </text>
              <text x="10" y="46" fill="#94a3b8" fontSize="9">
                n = {puntoHover.n.toLocaleString()} chars ({puntoHover.ns.toLocaleString()} ns)
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="grafica-pie-nota">
        <span className="nota-pill">Interpretación</span>
        <span className="nota-texto">
          KMP escala linealmente de manera predecible O(n); Boyer-Moore se beneficia de saltos más amplios con caracteres infrecuentes O(n/m); Rabin-Karp mantiene un tiempo O(n) con aritmética modular.
        </span>
      </div>
    </div>
  );
}
