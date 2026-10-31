import React, { useState, useEffect, useMemo, useCallback } from 'react';
import SelectorArticulosClasicos from '../componentes/clasicos/SelectorArticulosClasicos';
import TablaParesClasicos from '../componentes/clasicos/TablaParesClasicos';
import MatrizClasicos from '../componentes/clasicos/MatrizClasicos';
import DetallePasoAPasoClasicos from '../componentes/clasicos/DetallePasoAPasoClasicos';
import Toast from '../componentes/Toast';
import { obtenerArticulos } from '../api/api';
import { compararClasicos } from '../api/clasicosApi';

/**
 * SimilitudClasicos.jsx
 * Página principal del Requerimiento 1 — Algoritmos Clásicos (John).
 *
 * 4 algoritmos implementados:
 *  1. Levenshtein (Prog. Dinámica)
 *  2. Needleman-Wunsch (Prog. Dinámica)
 *  3. Jaccard (Teoría de Conjuntos)
 *  4. Coseno TF-IDF (Espacio Vectorial)
 */
export default function SimilitudClasicos({ onArticulosChange }) {
  const [articulos, setArticulos] = useState([]);
  const [cargandoArticulos, setCargandoArticulos] = useState(true);
  const [seleccionados, setSeleccionados] = useState([]);
  const [pares, setPares] = useState([]);
  const [tiempoTotalMs, setTiempoTotalMs] = useState(null);
  const [comparando, setComparando] = useState(false);
  const [parDetalle, setParDetalle] = useState(null);
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

  // Cargar artículos al montar
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
          console.error('Error al cargar artículos:', err);
          setErrorVisible('No se pudo conectar con el backend (http://localhost:8080). Inicia el servidor Spring Boot.');
        }
      } finally {
        if (activo) setCargandoArticulos(false);
      }
    }
    cargar();
    return () => { activo = false; };
  }, [onArticulosChange]);

  const articulosMap = useMemo(() => {
    const map = {};
    articulos.forEach((art) => { map[art.id] = art; });
    return map;
  }, [articulos]);

  const toggleSeleccion = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };
  const seleccionarTodos = () => setSeleccionados(articulos.map((art) => art.id));
  const limpiarSeleccion = () => setSeleccionados([]);

  const handleComparar = async () => {
    if (seleccionados.length < 2) {
      mostrarToast('Selecciona al menos dos artículos para comparar', 'error');
      return;
    }

    setComparando(true);
    setErrorVisible(null);
    mostrarToast('Calculando similitud con los 4 algoritmos clásicos…', 'info', 0);

    try {
      const respuesta = await compararClasicos(seleccionados);
      const listaPares = respuesta?.pares || [];
      setPares(listaPares);
      setTiempoTotalMs(respuesta?.tiempoTotalMs ?? null);
      mostrarToast(`¡Comparación completada! Se evaluaron ${listaPares.length} pares con 4 algoritmos.`, 'success', 5000);
    } catch (err) {
      console.error('Error en comparación clásica:', err);
      setErrorVisible(err.message || 'Error al ejecutar la comparación');
      mostrarToast(`Error: ${err.message}`, 'error', 7000);
    } finally {
      setComparando(false);
    }
  };

  return (
    <main className="main-wrapper">
      {/* Encabezado */}
      <section className="similitud-hero-banner">
        <div className="similitud-header-left">
          <div className="similitud-tag">
            <span>ALGORITMOS CLÁSICOS</span>
            <span className="badge-req">Requerimiento 1</span>
          </div>
          <h1 className="similitud-main-title">Similitud de Abstracts — Algoritmos Clásicos</h1>
          <p className="similitud-main-subtitle">
            Comparación de artículos académicos mediante 4 algoritmos clásicos: Levenshtein, Needleman-Wunsch, Jaccard y Coseno TF-IDF.
          </p>
        </div>

        <div className="similitud-algoritmo-selector-box">
          <label className="selector-algoritmo-label">Algoritmos incluidos:</label>
          <div className="selector-algoritmo-pills">
            <span className="pill-algoritmo active"><span className="pill-dot" /> Levenshtein</span>
            <span className="pill-algoritmo active"><span className="pill-dot" /> Needleman-Wunsch</span>
            <span className="pill-algoritmo active"><span className="pill-dot" /> Jaccard</span>
            <span className="pill-algoritmo active"><span className="pill-dot" /> Coseno TF-IDF</span>
          </div>
        </div>
      </section>

      {/* Alerta de error */}
      {errorVisible && (
        <div className="alerta-error-visible">
          <div className="alerta-error-icon">⚠️</div>
          <div className="alerta-error-content">
            <h4 className="alerta-error-title">Aviso del Servidor</h4>
            <p className="alerta-error-msg">{errorVisible}</p>
          </div>
          <button type="button" className="alerta-error-close" onClick={() => setErrorVisible(null)}>✕</button>
        </div>
      )}

      {/* Banner de carga */}
      {comparando && (
        <div className="ft-banner-cargando">
          <div className="spinner-lg"></div>
          <div className="ft-cargando-texto">
            <h4>Calculando con los 4 algoritmos clásicos</h4>
            <p>
              Se están ejecutando <strong>Levenshtein</strong>, <strong>Needleman-Wunsch</strong>, <strong>Jaccard</strong> y <strong>Coseno TF-IDF</strong> para todos los pares seleccionados.
            </p>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="similitud-contenido-seccion">
        <SelectorArticulosClasicos
          articulos={articulos}
          seleccionados={seleccionados}
          onToggleSeleccion={toggleSeleccion}
          onSeleccionarTodos={seleccionarTodos}
          onLimpiarSeleccion={limpiarSeleccion}
          onComparar={handleComparar}
          cargando={cargandoArticulos || comparando}
        />

        {pares.length > 0 && !comparando && (
          <div className="similitud-resultados-container">
            {/* Resumen de tiempos */}
            {tiempoTotalMs !== null && (
              <div className="ft-resumen-tiempos-banner">
                <div className="ft-resumen-tiempo-principal">
                  <div className="ft-tiempo-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div className="ft-tiempo-info">
                    <span className="ft-tiempo-label">
                      Tiempo total de los 4 algoritmos: <strong>{Number(tiempoTotalMs).toFixed(2)} ms</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Matriz de similitud */}
            <MatrizClasicos
              pares={pares}
              articulosSeleccionados={seleccionados}
              articulosMap={articulosMap}
              onSeleccionarPar={(idA, idB) => setParDetalle({ idA, idB })}
            />

            {/* Tabla de pares */}
            <TablaParesClasicos
              pares={pares}
              articulosMap={articulosMap}
              onSeleccionarPar={(idA, idB) => setParDetalle({ idA, idB })}
            />
          </div>
        )}
      </div>

      {/* Modal de detalle paso a paso */}
      {parDetalle && (
        <DetallePasoAPasoClasicos
          idA={parDetalle.idA}
          idB={parDetalle.idB}
          articuloA={articulosMap[parDetalle.idA]}
          articuloB={articulosMap[parDetalle.idB]}
          onCerrar={() => setParDetalle(null)}
        />
      )}

      {/* Toast */}
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
