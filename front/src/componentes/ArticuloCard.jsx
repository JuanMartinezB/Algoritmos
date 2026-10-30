import React from 'react';

export default function ArticuloCard({ articulo, onSelect }) {
  // Cantidad de palabras a mostrar
  const palabrasTexto = articulo.totalPalabrasOriginales 
    ? `${articulo.totalPalabrasOriginales} palabras`
    : `${articulo.cantidadPalabras || 0} palabras`;

  const autorMostrar = articulo.autoresCorto || articulo.autores || 'Autor desconocido';

  // Resumen a mostrar (original preferido para coincidir con la captura)
  const resumenMostrar = articulo.resumenOriginal || articulo.resumenProcesado || 'Sin resumen disponible.';

  return (
    <article
      className="articulo-card"
      onClick={() => {
        if (onSelect) onSelect(articulo);
      }}
      title="Clic para ver detalles completos del artículo"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onSelect) {
          onSelect(articulo);
        }
      }}
    >
      {/* Cabecera Verde de la Tarjeta */}
      <div className="card-banner">
        <span className="card-id-badge">#{articulo.id}</span>
        
        {/* Ícono de Documento Flotante */}
        <div className="card-doc-icon-wrapper">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
      </div>

      {/* Contenido de la Tarjeta */}
      <div className="card-body">
        {/* Título del Artículo */}
        <h3 className="card-title" title={articulo.titulo}>
          {articulo.titulo}
        </h3>

        {/* Autores */}
        <div className="card-authors" title={articulo.autores}>
          <svg className="authors-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="authors-name">{autorMostrar}</span>
        </div>

        {/* Resumen / Abstract */}
        <p className="card-summary" title={resumenMostrar}>
          {resumenMostrar}
        </p>

        {/* Etiqueta de Palabras */}
        <div className="card-footer">
          <span className="card-word-count-badge">
            {palabrasTexto}
          </span>
        </div>
      </div>
    </article>
  );
}
