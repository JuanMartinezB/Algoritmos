import React, { useState, useEffect, useMemo, useCallback } from 'react';
import HeroBanner from '../componentes/HeroBanner';
import ArticuloCard from '../componentes/ArticuloCard';
import ArticuloModal from '../componentes/ArticuloModal';
import Toast from '../componentes/Toast';
import { obtenerArticulos, ejecutarPreprocesamiento } from '../api/api';

export default function Informacion({ onArticulosChange }) {
  const [articulos, setArticulos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [errorConexion, setErrorConexion] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [articuloSeleccionado, setArticuloSeleccionado] = useState(null);
  const [notificacion, setNotificacion] = useState(null);

  // Mostrar mensaje emergente temporal
  const mostrarToast = useCallback((mensaje, tipo = 'info', duracion = 5000) => {
    setNotificacion({ mensaje, tipo });
    if (duracion > 0) {
      setTimeout(() => {
        setNotificacion((prev) => (prev?.mensaje === mensaje ? null : prev));
      }, duracion);
    }
  }, []);

  // Función para consultar artículos al backend (para recargas manuales o tras preprocesar)
  const cargarArticulosBackend = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargando(true);
    try {
      const data = await obtenerArticulos();
      const lista = Array.isArray(data) ? data : [];
      setArticulos(lista);
      setErrorConexion(false);
      if (onArticulosChange) onArticulosChange(lista.length);
      if (!silencioso) {
        mostrarToast(`Se cargaron ${lista.length} artículos exitosamente desde el Backend.`, 'success', 3500);
      }
    } catch (err) {
      console.error('Error al conectar con el backend:', err);
      setArticulos([]);
      setErrorConexion(true);
      if (onArticulosChange) onArticulosChange(0);
      if (!silencioso) {
        mostrarToast('No se pudo conectar con el backend (http://localhost:8080). Los artículos no se cargaron.', 'error', 6000);
      }
    } finally {
      if (!silencioso) setCargando(false);
    }
  }, [mostrarToast, onArticulosChange]);

  // Cargar artículos al montar el componente
  useEffect(() => {
    let activo = true;

    async function inicializar() {
      try {
        const data = await obtenerArticulos();
        if (!activo) return;
        const lista = Array.isArray(data) ? data : [];
        setArticulos(lista);
        setErrorConexion(false);
        if (onArticulosChange) onArticulosChange(lista.length);
        mostrarToast(`Se cargaron ${lista.length} artículos exitosamente desde el Backend.`, 'success', 3500);
      } catch (err) {
        if (!activo) return;
        console.error('Error al conectar con el backend:', err);
        setArticulos([]);
        setErrorConexion(true);
        if (onArticulosChange) onArticulosChange(0);
        mostrarToast('No se pudo conectar con el backend (http://localhost:8080). Los artículos no se cargaron.', 'error', 6000);
      } finally {
        if (activo) setCargando(false);
      }
    }

    inicializar();

    return () => {
      activo = false;
    };
  }, [mostrarToast, onArticulosChange]);

  // Manejar llamada al endpoint POST /api/articulos/procesar
  const handleEjecutarPreprocesamiento = async () => {
    setProcesando(true);
    mostrarToast('Ejecutando preprocesamiento en el backend (/api/articulos/procesar)...', 'info', 0);
    try {
      const resultado = await ejecutarPreprocesamiento();
      if (resultado.exito && Array.isArray(resultado.data)) {
        setArticulos(resultado.data);
        setErrorConexion(false);
        if (onArticulosChange) onArticulosChange(resultado.data.length);
        mostrarToast(`¡Preprocesamiento completado con éxito! Se procesaron ${resultado.data.length} artículos.`, 'success', 6000);
      } else {
        await cargarArticulosBackend(true);
        mostrarToast('¡Preprocesamiento finalizado en el servidor!', 'success', 5000);
      }
    } catch (error) {
      console.error('Error en preprocesamiento:', error);
      mostrarToast(
        `Error al ejecutar preprocesamiento: Asegúrate de que el Backend Spring Boot esté corriendo en el puerto 8080. Detalle: ${error.message}`,
        'error',
        8000
      );
    } finally {
      setProcesando(false);
    }
  };

  // Filtrado de artículos según la búsqueda
  const articulosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return articulos;
    const query = busqueda.toLowerCase().trim();
    return articulos.filter((art) => {
      const titulo = (art.titulo || '').toLowerCase();
      const autores = (art.autores || '').toLowerCase();
      const autoresCorto = (art.autoresCorto || '').toLowerCase();
      const archivo = (art.archivo || '').toLowerCase();
      return (
        titulo.includes(query) ||
        autores.includes(query) ||
        autoresCorto.includes(query) ||
        archivo.includes(query)
      );
    });
  }, [articulos, busqueda]);

  return (
    <main className="main-wrapper">
      {/* Banner Superior con Seguimiento, Logo UQ y Botón Preprocesamiento */}
      <HeroBanner
        onEjecutarPreprocesamiento={handleEjecutarPreprocesamiento}
        procesando={procesando}
      />

      {/* Sección de Artículos del Corpus Bibliométrico */}
      <section className="corpus-section">
        <header className="corpus-header">
          <h2 className="corpus-title">Artículos del Corpus Bibliométrico</h2>
          <p className="corpus-subtitle">
            Investigaciones sobre Inteligencia Artificial en Educación (AIED) consultadas desde el Backend
          </p>
        </header>

        {/* Barra de Búsqueda y Contador */}
        <div className="search-bar-row">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por título, autor o archivo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              disabled={articulos.length === 0}
            />
            {busqueda && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setBusqueda('')}
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          <div className="search-count-label">
            Mostrando <strong>{articulosFiltrados.length}</strong> de <strong>{articulos.length}</strong> artículos del backend
          </div>
        </div>

        {/* Estado de Carga, Error de Conexión o Cuadrícula */}
        {cargando ? (
          <div className="loading-state-box">
            <div className="spinner-lg"></div>
            <p>Consultando artículos al Backend...</p>
          </div>
        ) : errorConexion ? (
          <div className="empty-state-box error-backend-box">
            <div className="empty-icon">⚠️</div>
            <h3>Sin conexión con el Backend</h3>
            <p>
              El backend no respondió en <code>http://localhost:8080/api/articulos</code>.
              Inicia el servidor Spring Boot para consultar los artículos.
            </p>
            <button
              type="button"
              className="btn-reset-search"
              onClick={() => cargarArticulosBackend(false)}
            >
              Reintentar conexión
            </button>
          </div>
        ) : articulosFiltrados.length === 0 && articulos.length > 0 ? (
          <div className="empty-state-box">
            <div className="empty-icon">🔍</div>
            <h3>No se encontraron artículos</h3>
            <p>No hay resultados que coincidan con &quot;<strong>{busqueda}</strong>&quot;.</p>
            <button
              type="button"
              className="btn-reset-search"
              onClick={() => setBusqueda('')}
            >
              Limpiar búsqueda
            </button>
          </div>
        ) : articulos.length === 0 ? (
          <div className="empty-state-box">
            <div className="empty-icon">📄</div>
            <h3>No hay artículos procesados en el Backend</h3>
            <p>Usa el botón &quot;Ejecutar Preprocesamiento&quot; para procesar los PDFs.</p>
          </div>
        ) : (
          /* Cuadrícula de Tarjetas de Artículos */
          <div className="articles-grid">
            {articulosFiltrados.map((articulo) => (
              <ArticuloCard
                key={articulo.id || articulo.archivo}
                articulo={articulo}
                onSelect={setArticuloSeleccionado}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modal de Detalle de Artículo */}
      {articuloSeleccionado && (
        <ArticuloModal
          articulo={articuloSeleccionado}
          onClose={() => setArticuloSeleccionado(null)}
        />
      )}

      {/* Notificación Toast Flotante */}
      {notificacion && (
        <Toast
          mensaje={notificacion.mensaje}
          tipo={notificacion.tipo}
          onCerrar={() => setNotificacion(null)}
        />
      )}
    </main>
  );
}
