import React, { useState } from 'react';
import ModalDispositivo from './ModalDispositivo';

/**
 * Sidebar.jsx
 * Barra lateral de navegación con estilo minimalista y paleta verde institucional.
 * Pestañas disponibles:
 * 1. Información (Corpus y preprocesamiento)
 * 2. Búsqueda de Patrones (KMP, Boyer-Moore, Rabin-Karp)
 * 3. IA: FastText (Similitud semántica de embeddings)
 * 4. IA: GloVe (Similitud semántica 50d + IDF)
 * 5. Agrupamiento (Dendrogramas)
 *
 * En la parte inferior incluye el botón para consultar las Características del Dispositivo.
 */
export default function Sidebar({ totalArticulos = 20, pestanaActiva = 'informacion', onCambiarPestana }) {
  const [modalDispositivoAbierto, setModalDispositivoAbierto] = useState(false);

  return (
    <>
      <aside className="sidebar">
        {/* Encabezado Superior */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <span>B</span>
            </div>
            <div className="sidebar-brand-text">
              <h3>Bibliometría</h3>
              <p>Análisis 2026-2</p>
            </div>
          </div>
        </div>

        {/* Sección del Menú */}
        <div className="sidebar-menu-section">
          <span className="sidebar-section-title">ALGORITMOS & CORPUS</span>

          <nav className="sidebar-nav">
            {/* Pestaña Principal: Información */}
            <div
              className={`sidebar-nav-item ${pestanaActiva === 'informacion' ? 'active' : ''}`}
              onClick={() => onCambiarPestana && onCambiarPestana('informacion')}
              role="button"
              tabIndex={0}
              title="Ver corpus bibliométrico completo y preprocesamiento"
            >
              <div className="nav-item-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div className="nav-item-text">
                <span className="nav-item-title">Información</span>
                <span className="nav-item-subtitle">Corpus de artículos</span>
              </div>
              <span className="nav-item-badge">{totalArticulos}</span>
            </div>

            {/* Pestaña: Búsqueda de Patrones */}
            <div
              className={`sidebar-nav-item ${pestanaActiva === 'busqueda' ? 'active' : ''}`}
              onClick={() => onCambiarPestana && onCambiarPestana('busqueda')}
              role="button"
              tabIndex={0}
              title="Búsqueda exacta de patrones: KMP, Boyer-Moore, Rabin-Karp"
            >
              <div className="nav-item-icon busqueda-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              </div>
              <div className="nav-item-text">
                <span className="nav-item-title">Búsqueda de Patrones</span>
                <span className="nav-item-subtitle">KMP, BM & Rabin-Karp</span>
              </div>
              <span className="nav-item-badge kmp-badge">3 Algos</span>
            </div>

            {/* Pestaña: IA: FastText */}
            <div
              className={`sidebar-nav-item ${pestanaActiva === 'fasttext' ? 'active' : ''}`}
              onClick={() => onCambiarPestana && onCambiarPestana('fasttext')}
              role="button"
              tabIndex={0}
              title="Comparación semántica con FastText (300 dimensiones)"
            >
              <div className="nav-item-icon ft-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </div>
              <div className="nav-item-text">
                <span className="nav-item-title">IA: FastText</span>
                <span className="nav-item-subtitle">Similitud semántica</span>
              </div>
              <span className="nav-item-badge ft-badge">IA</span>
            </div>

            {/* Pestaña: IA: GloVe */}
            <div
              className={`sidebar-nav-item ${pestanaActiva === 'glove' ? 'active' : ''}`}
              onClick={() => onCambiarPestana && onCambiarPestana('glove')}
              role="button"
              tabIndex={0}
              title="Comparación semántica con GloVe (50 dimensiones, ponderado con IDF)"
            >
              <div className="nav-item-icon ft-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1.51 1V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </div>
              <div className="nav-item-text">
                <span className="nav-item-title">IA: GloVe</span>
                <span className="nav-item-subtitle">Similitud semántica</span>
              </div>
              <span className="nav-item-badge ft-badge">IA</span>
            </div>

            {/* Pestaña: Agrupamiento */}
            <div
              className={`sidebar-nav-item ${pestanaActiva === 'agrupamiento' ? 'active' : ''}`}
              onClick={() => onCambiarPestana && onCambiarPestana('agrupamiento')}
              role="button"
              tabIndex={0}
              title="Agrupamiento jerárquico (Single, Complete, Average) y dendrogramas"
            >
              <div className="nav-item-icon ft-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </div>
              <div className="nav-item-text">
                <span className="nav-item-title">Agrupamiento</span>
                <span className="nav-item-subtitle">Dendrogramas</span>
              </div>
              <span className="nav-item-badge ft-badge">R2</span>
            </div>
          </nav>
        </div>

        {/* Sección del botón Características del Dispositivo */}
        <div className="sidebar-dispositivo-seccion">
          <button
            type="button"
            className="btn-sidebar-dispositivo"
            onClick={() => setModalDispositivoAbierto(true)}
            title="Ver características del hardware, memoria y Java"
          >
            <div className="disp-btn-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <span>Características del Dispositivo</span>
          </button>
        </div>

        {/* Pie de la Barra Lateral */}
        <div className="sidebar-footer">
          <p className="sidebar-footer-title">Universidad del Quindío</p>
          <p className="sidebar-footer-subtitle">Ingeniería de Sistemas</p>
        </div>
      </aside>

      {/* Modal de Características del Dispositivo */}
      <ModalDispositivo
        abierto={modalDispositivoAbierto}
        onCerrar={() => setModalDispositivoAbierto(false)}
      />
    </>
  );
}
