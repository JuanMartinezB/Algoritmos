import React from 'react';

/**
 * ErrorBoundary.jsx
 * Evita que cualquier error en un componente secundario (como un modal o detalle)
 * provoque una pantalla en blanco en toda la aplicación.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '24px',
          margin: '20px auto',
          maxWidth: '600px',
          background: '#fef2f2',
          border: '1px solid #f87171',
          borderRadius: '12px',
          color: '#991b1b',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>⚠️ Ocurrió un error al mostrar el detalle</h3>
          <p style={{ fontSize: '0.9rem', color: '#7f1d1d', marginBottom: '16px' }}>
            {this.state.error?.message || 'Error inesperado al renderizar los datos.'}
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onReset) this.props.onReset();
            }}
            style={{
              padding: '8px 18px',
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Cerrar / Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
