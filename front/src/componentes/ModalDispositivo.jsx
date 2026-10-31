import React, { useEffect, useState } from 'react';
import { obtenerCaracteristicasDispositivo } from '../api/api';

/**
 * ModalDispositivo.jsx
 * Ventana modal simple y minimalista que muestra las características del hardware
 * y del entorno donde corre el backend.
 */
export default function ModalDispositivo({ abierto, onCerrar }) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!abierto) return;

    let activo = true;
    async function cargar() {
      setCargando(true);
      setError(null);
      try {
        const info = await obtenerCaracteristicasDispositivo();
        if (activo) {
          setDatos(info);
        }
      } catch (err) {
        if (activo) {
          setError(err.message || 'No se pudo conectar con el backend para obtener las características.');
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, [abierto]);

  // Manejo de la tecla Escape para cerrar
  useEffect(() => {
    if (!abierto) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCerrar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  // Formatear memoria en GB si está disponible
  const ramGb = datos && datos.memoriaTotalMb ? (datos.memoriaTotalMb / 1024).toFixed(1) : null;

  return (
    <div className="modal-backdrop" onClick={onCerrar} role="dialog" aria-modal="true">
      <div className="modal-dispositivo-card" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera del modal */}
        <div className="modal-dispositivo-header">
          <div className="dispositivo-header-info">
            <div className="dispositivo-icon-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <div>
              <h3 className="dispositivo-titulo">Características del Dispositivo</h3>
              <p className="dispositivo-subtitulo">Entorno de ejecución del Backend</p>
            </div>
          </div>
          <button
            type="button"
            className="btn-cerrar-modal-disp"
            onClick={onCerrar}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="modal-dispositivo-body">
          {cargando && (
            <div className="disp-loading">
              <span className="busqueda-spinner"></span>
              <p>Consultando hardware del equipo...</p>
            </div>
          )}

          {error && !cargando && (
            <div className="disp-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {!cargando && !error && datos && (
            <div className="disp-items-lista">
              {/* 1. Procesador */}
              <div className="disp-item">
                <div className="disp-item-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                    <rect x="9" y="9" width="6" height="6"></rect>
                    <line x1="9" y1="1" x2="9" y2="4"></line>
                    <line x1="15" y1="1" x2="15" y2="4"></line>
                    <line x1="9" y1="20" x2="9" y2="23"></line>
                    <line x1="15" y1="20" x2="15" y2="23"></line>
                    <line x1="20" y1="9" x2="23" y2="9"></line>
                    <line x1="20" y1="14" x2="23" y2="14"></line>
                    <line x1="1" y1="9" x2="4" y2="9"></line>
                    <line x1="1" y1="14" x2="4" y2="14"></line>
                  </svg>
                </div>
                <div className="disp-item-content">
                  <span className="disp-item-label">Procesador</span>
                  <span className="disp-item-valor">{datos.procesador || 'No disponible'}</span>
                </div>
              </div>

              {/* 2. Núcleos lógicos */}
              <div className="disp-item">
                <div className="disp-item-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="6" x2="12" y2="12"></line>
                    <line x1="12" y1="12" x2="16" y2="14"></line>
                  </svg>
                </div>
                <div className="disp-item-content">
                  <span className="disp-item-label">Núcleos Lógicos (CPU)</span>
                  <span className="disp-item-valor">
                    <strong>{datos.nucleos}</strong> núcleos disponibles para la JVM
                  </span>
                </div>
              </div>

              {/* 3. Memoria RAM Total */}
              <div className="disp-item">
                <div className="disp-item-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 19v-3"></path>
                    <path d="M10 19v-3"></path>
                    <path d="M14 19v-3"></path>
                    <path d="M18 19v-3"></path>
                    <rect x="2" y="5" width="20" height="11" rx="2"></rect>
                  </svg>
                </div>
                <div className="disp-item-content">
                  <span className="disp-item-label">Memoria RAM Total</span>
                  <span className="disp-item-valor">
                    <strong>{datos.memoriaTotalMb ? datos.memoriaTotalMb.toLocaleString() : 0} MB</strong>
                    {ramGb && <span className="disp-badge-gb"> (~{ramGb} GB)</span>}
                  </span>
                </div>
              </div>

              {/* 4. Sistema Operativo */}
              <div className="disp-item">
                <div className="disp-item-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="2" y1="10" x2="22" y2="10"></line>
                  </svg>
                </div>
                <div className="disp-item-content">
                  <span className="disp-item-label">Sistema Operativo</span>
                  <span className="disp-item-valor">{datos.sistemaOperativo || 'No disponible'}</span>
                </div>
              </div>

              {/* 5. Versión de Java */}
              <div className="disp-item">
                <div className="disp-item-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                    <line x1="6" y1="1" x2="6" y2="4"></line>
                    <line x1="10" y1="1" x2="10" y2="4"></line>
                    <line x1="14" y1="1" x2="14" y2="4"></line>
                  </svg>
                </div>
                <div className="disp-item-content">
                  <span className="disp-item-label">Versión de Java / JVM</span>
                  <span className="disp-item-valor">{datos.versionJava || 'No disponible'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie del modal */}
        <div className="modal-dispositivo-footer">
          <button type="button" className="btn-entendido-disp" onClick={onCerrar}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
