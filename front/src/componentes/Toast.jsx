import React from 'react';

export default function Toast({ mensaje, tipo = 'info', onCerrar }) {
  if (!mensaje) return null;

  return (
    <div className={`toast-notification toast-${tipo}`}>
      <div className="toast-icon">
        {tipo === 'success' && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        )}
        {tipo === 'error' && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        )}
        {tipo === 'info' && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        )}
      </div>

      <div className="toast-body">
        <p className="toast-message">{mensaje}</p>
      </div>

      <button
        type="button"
        className="toast-close"
        onClick={onCerrar}
        aria-label="Cerrar notificación"
      >
        ✕
      </button>
    </div>
  );
}
