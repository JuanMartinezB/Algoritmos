import React, { useEffect } from 'react';

export default function ArticuloModal({ articulo, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!articulo) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Encabezado del Modal */}
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-id-badge">Artículo #{articulo.id}</span>
            <h2 className="modal-title">{articulo.titulo}</h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="modal-body">
          {/* Fila de Metadatos */}
          <div className="modal-meta-grid">
            <div className="meta-card">
              <span className="meta-label">Autores</span>
              <p className="meta-value">{articulo.autores || articulo.autoresCorto || 'No especificado'}</p>
            </div>
            <div className="meta-card">
              <span className="meta-label">Archivo PDF</span>
              <p className="meta-value filename">{articulo.archivo || 'N/A'}</p>
            </div>
            <div className="meta-card">
              <span className="meta-label">Palabras Originales</span>
              <p className="meta-value number-val">{articulo.totalPalabrasOriginales || 0}</p>
            </div>
            <div className="meta-card">
              <span className="meta-label">Tokens Filtrados</span>
              <p className="meta-value number-val">{articulo.cantidadPalabras || 0}</p>
            </div>
          </div>

          {/* Resumen Original */}
          <div className="modal-section">
            <h4 className="section-title">
              <span className="section-dot" />
              Resumen Original (Abstract)
            </h4>
            <div className="section-content-box">
              <p>{articulo.resumenOriginal || 'No se extrajo abstract original.'}</p>
            </div>
          </div>

          {/* Resumen Procesado (Tokens sin stopwords / normalizados) */}
          <div className="modal-section">
            <h4 className="section-title">
              <span className="section-dot" />
              Texto Preprocesado (Tokens limpios)
            </h4>
            <div className="section-content-box processed-box">
              <p>{articulo.resumenProcesado || 'No hay tokens procesados disponibles.'}</p>
            </div>
          </div>

          {/* Tokens individuales */}
          {articulo.palabras && articulo.palabras.length > 0 && (
            <div className="modal-section">
              <h4 className="section-title">
                <span className="section-dot" />
                Muestra de Tokens ({articulo.palabras.length})
              </h4>
              <div className="tokens-cloud">
                {articulo.palabras.slice(0, 50).map((palabra, idx) => (
                  <span key={idx} className="token-pill">{palabra}</span>
                ))}
                {articulo.palabras.length > 50 && (
                  <span className="token-pill more">+{articulo.palabras.length - 50} más...</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pie del Modal */}
        <div className="modal-footer">
          <button type="button" className="btn-modal-close" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
