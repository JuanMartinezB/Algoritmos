import React, { useState, useEffect, useMemo, useCallback } from 'react';
import SelectorArticulos from '../componentes/fasttext/SelectorArticulos';
import TablaPares from '../componentes/fasttext/TablaPares';
import MatrizSimilitud from '../componentes/fasttext/MatrizSimilitud';
import DetallePasoAPaso from '../componentes/fasttext/DetallePasoAPaso';
import CoberturaModelo from '../componentes/fasttext/CoberturaModelo';
import Toast from '../componentes/Toast';
import { obtenerArticulos } from '../api/api';
import { compararFastText, obtenerCoberturaFastText } from '../api/fasttextApi';

/**
 * Similitud.jsx
 * Página principal para análisis de similitud semántica.
 * Estructurada para crecer: contiene un selector de algoritmo (por ahora "IA: FastText"),
 * lo que permitirá agregar futuros algoritmos clásicos o de IA sin reescribir la pantalla.
 *
 * Maneja:
 *  - Carga inicial de artículos del corpus.
 *  - Pestañas principales: "Comparación de Pares & Matriz" y "Cobertura del Modelo".
 *  - Selección de artículos (mínimo 2).
 *  - Llamada a POST /api/similitud/fasttext/comparar con indicador de carga prolongado
 *    ("Cargando el modelo FastText (la primera vez puede tardar unos minutos)").
 *  - Visualización de la tabla de pares y matriz de similitud.
 *  - Apertura del modal de detalle paso a paso (GET /detalle).
 *  - Consulta de cobertura del modelo (GET /cobertura).
 */
export default function Similitud({ onArticulosChange }) {
  // Algoritmo activo (extensible para otros como Word2Vec, TF-IDF, etc.)
  const [algoritmoActivo, setAlgoritmoActivo] = useState('fasttext');

  // Subpestaña dentro de FastText: 'comparacion' | 'cobertura'
  const [vistaActiva, setVistaActiva] = useState('comparacion');

  // Datos base
  const [articulos, setArticulos] = useState([]);
  const [cargandoArticulos, setCargandoArticulos] = useState(true);

  // Selección de artículos para comparar
  const [seleccionados, setSeleccionados] = useState([]);

  // Resultados de la comparación
  const [pares, setPares] = useState([]);
  const [comparando, setComparando] = useState(false);

  // Par seleccionado para el modal de detalle
  const [parDetalle, setParDetalle] = useState(null); // { idA, idB }

  // Datos de cobertura
  const [coberturaMap, setCoberturaMap] = useState({});
  const [cargandoCobertura, setCargandoCobertura] = useState(false);

  // Notificaciones y errores visibles
  const [notificacion, setNotificacion] = useState(null);
  const [errorVisible, setErrorVisible] = useState(null);

  const mostrarToast = useCallback((mensaje, tipo = 'info', duracion = 5000) => {
    setNotificacion({ mensaje, tipo });
    if (duracion > 0) {
      setTimeout(() => {
        setNotificacion((prev) => (prev?.mensaje === mensaje ? null : prev));
      }, duracion);
    }
  }, []);

  // Cargar lista de artículos al montar
  useEffect(() => {
    let activo = true;

    async function cargar() {
      setCargandoArticulos(true);
      try {
        const data = await obtenerArticulos();
        const lista = Array.isArray(data) ? data : [];
        if (activo) {
          setArticulos(lista);
          if (onArticulosChange) onArticulosChange(lista.length);
        }
      } catch (err) {
        if (activo) {
          console.error('Error al cargar artículos para similitud:', err);
          setErrorVisible('No se pudo conectar con el backend (http://localhost:8080). Inicia el servidor Spring Boot.');
        }
      } finally {
        if (activo) setCargandoArticulos(false);
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, [onArticulosChange]);

  // Mapa de artículos por ID para búsquedas rápidas
  const articulosMap = useMemo(() => {
    const map = {};
    articulos.forEach((art) => {
      map[art.id] = art;
    });
    return map;
  }, [articulos]);

  // Manejadores de selección
  const toggleSeleccion = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const seleccionarTodos = () => {
    setSeleccionados(articulos.map((art) => art.id));
  };

  const limpiarSeleccion = () => {
    setSeleccionados([]);
  };

  // Comparar con FastText (POST /comparar)
  const handleComparar = async () => {
    if (seleccionados.length < 2) {
      mostrarToast('Selecciona al menos dos artículos para comparar', 'error');
      return;
    }

    setComparando(true);
    setErrorVisible(null);
    mostrarToast('Iniciando comparación con FastText... La primera vez puede tardar unos minutos mientras el backend carga el modelo.', 'info', 0);

    try {
      const resultadoPares = await compararFastText(seleccionados);
      setPares(resultadoPares || []);
      mostrarToast(`¡Comparación completada con éxito! Se evaluaron ${resultadoPares.length} pares.`, 'success', 5000);
    } catch (err) {
      console.error('Error en comparación FastText:', err);
      setErrorVisible(err.message || 'Error al ejecutar la comparación con FastText');
      mostrarToast(`Error: ${err.message}`, 'error', 7000);
    } finally {
      setComparando(false);
    }
  };

  // Cargar cobertura cuando se activa la pestaña de cobertura
  const cargarCobertura = useCallback(async () => {
    setCargandoCobertura(true);
    setErrorVisible(null);
    mostrarToast('Consultando cobertura en FastText... La primera vez puede tardar unos minutos.', 'info', 0);
    try {
      const data = await obtenerCoberturaFastText();
      setCoberturaMap(data || {});
      mostrarToast('Cobertura del modelo cargada correctamente.', 'success', 4000);
    } catch (err) {
      console.error('Error al cargar cobertura:', err);
      setErrorVisible(err.message || 'Error al consultar la cobertura del modelo');
      mostrarToast(`Error: ${err.message}`, 'error', 7000);
    } finally {
      setCargandoCobertura(false);
    }
  }, [mostrarToast]);

  const cambiarVista = (vista) => {
    setVistaActiva(vista);
    setErrorVisible(null);
    if (vista === 'cobertura' && Object.keys(coberturaMap).length === 0) {
      cargarCobertura();
    }
  };

  return (
    <main className="main-wrapper">
      {/* Encabezado Principal de Similitud */}
      <section className="similitud-hero-banner">
        <div className="similitud-header-left">
          <div className="similitud-tag">
            <span>MODELOS DE INTELIGENCIA ARTIFICIAL</span>
            <span className="badge-req">Requerimiento 1</span>
          </div>
          <h1 className="similitud-main-title">Similitud Semántica de Abstracts</h1>
          <p className="similitud-main-subtitle">
            Cálculo de relaciones semánticas entre investigaciones mediante modelos de embeddings vectoriales.
          </p>
        </div>

        {/* Selector de Algoritmo preparado para crecer */}
        <div className="similitud-algoritmo-selector-box">
          <label className="selector-algoritmo-label">Algoritmo de Similitud:</label>
          <div className="selector-algoritmo-pills">
            <button
              type="button"
              className={`pill-algoritmo ${algoritmoActivo === 'fasttext' ? 'active' : ''}`}
              onClick={() => setAlgoritmoActivo('fasttext')}
            >
              <span className="pill-dot" />
              <span>FastText (300d)</span>
            </button>
            <button
              type="button"
              className="pill-algoritmo disabled"
              disabled
              title="Disponible próximamente en futuras entregas"
            >
              <span>+ Próximos algoritmos</span>
            </button>
          </div>
        </div>
      </section>

      {/* Subnavegación de la pantalla: Comparación vs Cobertura */}
      <div className="similitud-subnav-row">
        <div className="subnav-tabs">
          <button
            type="button"
            className={`subnav-tab-btn ${vistaActiva === 'comparacion' ? 'active' : ''}`}
            onClick={() => cambiarVista('comparacion')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
            <span>Comparación de Pares & Matriz</span>
          </button>
          <button
            type="button"
            className={`subnav-tab-btn ${vistaActiva === 'cobertura' ? 'active' : ''}`}
            onClick={() => cambiarVista('cobertura')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>Cobertura del Vocabulario</span>
          </button>
        </div>
      </div>

      {/* Alerta de Error Visible si el backend reporta problemas */}
      {errorVisible && (
        <div className="alerta-error-visible">
          <div className="alerta-error-icon">⚠️</div>
          <div className="alerta-error-content">
            <h4 className="alerta-error-title">Aviso del Servidor</h4>
            <p className="alerta-error-msg">{errorVisible}</p>
          </div>
          <button
            type="button"
            className="alerta-error-close"
            onClick={() => setErrorVisible(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Banner de carga prolongada para FastText */}
      {comparando && (
        <div className="ft-banner-cargando">
          <div className="spinner-lg"></div>
          <div className="ft-cargando-texto">
            <h4>Cargando el modelo FastText</h4>
            <p>
              La <strong>primera petición</strong> puede tardar unos minutos mientras el backend procesa el archivo de vectores pre-entrenados y genera el filtro del corpus. Las siguientes comparaciones serán casi instantáneas.
            </p>
          </div>
        </div>
      )}

      {/* Vista 1: Comparación de Artículos y Matriz */}
      {vistaActiva === 'comparacion' && (
        <div className="similitud-contenido-seccion">
          {/* Selector de artículos */}
          <SelectorArticulos
            articulos={articulos}
            seleccionados={seleccionados}
            onToggleSeleccion={toggleSeleccion}
            onSeleccionarTodos={seleccionarTodos}
            onLimpiarSeleccion={limpiarSeleccion}
            onComparar={handleComparar}
            cargando={cargandoArticulos || comparando}
          />

          {/* Resultados de la comparación */}
          {pares.length > 0 && !comparando && (
            <div className="similitud-resultados-container">
              {/* Matriz de similitud con mapa de calor */}
              <MatrizSimilitud
                pares={pares}
                articulosSeleccionados={seleccionados}
                articulosMap={articulosMap}
                onSeleccionarPar={(idA, idB) => setParDetalle({ idA, idB })}
              />

              {/* Tabla de pares ordenada de mayor a menor coseno */}
              <TablaPares
                pares={pares}
                articulosMap={articulosMap}
                onSeleccionarPar={(idA, idB) => setParDetalle({ idA, idB })}
              />
            </div>
          )}
        </div>
      )}

      {/* Vista 2: Cobertura del Vocabulario */}
      {vistaActiva === 'cobertura' && (
        <div className="similitud-contenido-seccion">
          <CoberturaModelo
            articulos={articulos}
            coberturaMap={coberturaMap}
            cargando={cargandoCobertura}
            onRecargar={cargarCobertura}
          />
        </div>
      )}

      {/* Modal didáctico de Paso a Paso */}
      {parDetalle && (
        <DetallePasoAPaso
          idA={parDetalle.idA}
          idB={parDetalle.idB}
          articuloA={articulosMap[parDetalle.idA]}
          articuloB={articulosMap[parDetalle.idB]}
          onCerrar={() => setParDetalle(null)}
        />
      )}

      {/* Toast Flotante */}
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
