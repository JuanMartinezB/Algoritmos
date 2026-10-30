import React, { useState } from 'react';
import { dividirResumen } from './dividirResumen';

/**
 * Tarjeta individual para un artículo con coincidencias.
 */
function TarjetaResultadoArticulo({ item, largoPatron }) {
  const [expandidoChips, setExpandidoChips] = useState(false);
  const [mostrarAbstract, setMostrarAbstract] = useState(false);
  const [posicionEnfocada, setPosicionEnfocada] = useState(null);

  const LIMITE_CHIPS = 18;
  const posiciones = Array.isArray(item.posiciones) ? item.posiciones : [];
  const hayMasChips = posiciones.length > LIMITE_CHIPS;
  const chipsVisibles = expandidoChips || !hayMasChips ? posiciones : posiciones.slice(0, LIMITE_CHIPS);

  // Divide el resumen utilizando la función pura
  const segmentos = item.resumen ? dividirResumen(item.resumen, posiciones, largoPatron) : [];

  // Manejador al hacer clic en un chip de posición
  const handleChipClick = (pos) => {
    setMostrarAbstract(true);
    setPosicionEnfocada(pos);

    // Scroll suave hasta la coincidencia en el abstract
    setTimeout(() => {
      const elementoMark = document.getElementById(`mark-${item.id}-${pos}`);
      if (elementoMark) {
        elementoMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
  };

  return (
    <article className="articulo-resultado-card">
      <div className="articulo-resultado-top">
        <div className="articulo-resultado-header-left">
          <span className="articulo-id-badge">#{item.id}</span>
          <h4 className="articulo-resultado-titulo">{item.titulo}</h4>
        </div>
        <div className="articulo-resultado-badge-ocurrencias">
          <span className="badge-ocurrencias-numero">{item.ocurrencias}</span>
          <span className="badge-ocurrencias-texto">
            {item.ocurrencias === 1 ? 'coincidencia' : 'coincidencias'}
          </span>
        </div>
      </div>

      <div className="articulo-resultado-autores">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <span>{item.autores || 'Autores no disponibles'}</span>
      </div>

      {/* Sección de Posiciones con botón desplegable */}
      <div className="articulo-resultado-posiciones-seccion">
        <div className="posiciones-header">
          <button
            type="button"
            className="btn-toggle-abstract"
            onClick={() => setMostrarAbstract(!mostrarAbstract)}
            aria-expanded={mostrarAbstract}
            aria-controls={`abstract-${item.id}`}
          >
            <span className={`chevron-indicator ${mostrarAbstract ? 'rotado' : ''}`}>▼</span>
            <span className="posiciones-label">Posiciones en el abstract original (índices base 0)</span>
            <span className="badge-toggle-texto">
              {mostrarAbstract ? 'Ocultar abstract' : 'Ver abstract'}
            </span>
          </button>
          <span className="posiciones-contador">{posiciones.length} ubicaciones encontradas</span>
        </div>

        {/* Chips de posiciones */}
        <div className="posiciones-chips-grid">
          {chipsVisibles.map((pos, idx) => (
            <button
              key={`pos-${item.id}-${pos}-${idx}`}
              type="button"
              className={`posicion-chip-btn ${posicionEnfocada === pos ? 'chip-activo' : ''}`}
              onClick={() => handleChipClick(pos)}
              title={`Ver coincidencia en índice ${pos} dentro del abstract`}
            >
              índice {pos}
            </button>
          ))}

          {hayMasChips && (
            <button
              type="button"
              className="btn-expandir-posiciones"
              onClick={() => setExpandidoChips(!expandidoChips)}
            >
              {expandidoChips ? '▲ Ver menos' : `▼ Ver ${posiciones.length - LIMITE_CHIPS} más`}
            </button>
          )}
        </div>

        {/* Visor del Abstract con coincidencias resaltadas */}
        {mostrarAbstract && (
          <div id={`abstract-${item.id}`} className="abstract-resaltado-contenedor">
            <div className="abstract-resaltado-header">
              <span className="abstract-resaltado-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                {item.ocurrencias} {item.ocurrencias === 1 ? 'coincidencia resaltada' : 'coincidencias resaltadas'}
              </span>
              <span className="abstract-nota-capitalizacion">
                Texto en capitalización original
              </span>
            </div>

            <div className="abstract-texto-cuerpo">
              {segmentos.map((seg, sIdx) => {
                if (seg.resaltado) {
                  const esEnfocado = posicionEnfocada === seg.posicionInicial;
                  return (
                    <mark
                      key={`mark-${item.id}-${seg.posicionInicial}-${sIdx}`}
                      id={`mark-${item.id}-${seg.posicionInicial}`}
                      className={`mark-coincidencia ${esEnfocado ? 'mark-enfocado' : ''}`}
                      title={`Coincidencia en posición ${seg.posicionInicial}`}
                    >
                      {seg.texto}
                    </mark>
                  );
                }
                return <span key={`txt-${item.id}-${seg.posicionInicial}-${sIdx}`}>{seg.texto}</span>;
              })}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * ListaResultadosBusqueda.jsx
 * Renderiza la lista de artículos que arrojaron coincidencias,
 * ordenados estrictamente por número de ocurrencias de mayor a menor.
 */
export default function ListaResultadosBusqueda({ resultados = [], largoPatron = 0 }) {
  if (!Array.isArray(resultados) || resultados.length === 0) {
    return null;
  }

  // Ordenar por número de ocurrencias de mayor a menor
  const resultadosOrdenados = [...resultados].sort((a, b) => b.ocurrencias - a.ocurrencias);

  return (
    <div className="busqueda-resultados-seccion">
      <div className="busqueda-resultados-titulo-wrapper">
        <div className="resultados-seccion-info">
          <h3 className="busqueda-resultados-titulo">Artículos con Coincidencias</h3>
          <p className="busqueda-resultados-subtitulo">
            Ordenados de mayor a menor número de ocurrencias en el abstract original.
          </p>
        </div>
        <span className="resultados-contador-badge">
          {resultadosOrdenados.length} {resultadosOrdenados.length === 1 ? 'artículo' : 'artículos'}
        </span>
      </div>

      <div className="busqueda-articulos-lista">
        {resultadosOrdenados.map((item) => (
          <TarjetaResultadoArticulo
            key={item.id}
            item={item}
            largoPatron={largoPatron}
          />
        ))}
      </div>
    </div>
  );
}
