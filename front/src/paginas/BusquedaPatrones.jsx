import React, { useState } from 'react';
import { buscarPatron } from '../api/busquedaApi';
import FormularioBusqueda from '../componentes/busqueda/FormularioBusqueda';
import ResumenBusqueda from '../componentes/busqueda/ResumenBusqueda';
import TarjetasTiempo from '../componentes/busqueda/TarjetasTiempo';
import TablaPrefijosKmp from '../componentes/busqueda/TablaPrefijosKmp';
import TablaCaracterMaloBm from '../componentes/busqueda/TablaCaracterMaloBm';
import TablaRollingHashRk from '../componentes/busqueda/TablaRollingHashRk';
import ListaResultadosBusqueda from '../componentes/busqueda/ListaResultadosBusqueda';
import EstadoVacio from '../componentes/busqueda/EstadoVacio';
import HistorialBusqueda from '../componentes/busqueda/HistorialBusqueda';
import ComparacionRendimiento from '../componentes/busqueda/comparacion/ComparacionRendimiento';

/**
 * BusquedaPatrones.jsx
 * Pantalla principal del Requerimiento 3 (Búsqueda de patrones de texto).
 * Contiene dos vistas sin pérdida de estado:
 * 1. Búsqueda individual con KMP, Boyer-Moore y Rabin-Karp con sus estructuras auxiliares y abstracts resaltados.
 * 2. Comparación de rendimiento empírico a través de múltiples escalas con análisis gráfico y complejidad teórica.
 */
export default function BusquedaPatrones({ totalArticulos = 20 }) {
  // Pestaña activa ('individual' o 'comparacion')
  const [tabPrincipal, setTabPrincipal] = useState('individual');

  // Estado de la búsqueda individual
  const [algoritmo, setAlgoritmo] = useState('kmp');
  const [patron, setPatron] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [busquedaEjecutada, setBusquedaEjecutada] = useState(false);
  const [historialIndividual, setHistorialIndividual] = useState([]);

  // Ejecuta la búsqueda consumiendo el endpoint /api/busqueda/{algoritmo}
  const handleBuscar = async (patronABuscar, algoSeleccionado = algoritmo) => {
    if (!patronABuscar || !patronABuscar.trim()) {
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const data = await buscarPatron(algoSeleccionado, patronABuscar);
      setResultado(data);
      setBusquedaEjecutada(true);

      // Registrar en el historial de búsqueda usando el algoritmo que devuelve el backend
      setHistorialIndividual((prev) => {
        const nuevoItem = {
          algoritmo: data.algoritmo,
          patron: data.patron,
          totalOcurrencias: data.totalOcurrencias
        };
        const filtrado = prev.filter(
          (h) => !(h.patron.toLowerCase() === nuevoItem.patron.toLowerCase() && h.algoritmo === nuevoItem.algoritmo)
        );
        return [nuevoItem, ...filtrado].slice(0, 8);
      });
    } catch (err) {
      setError(err.message || 'Ocurrió un error inesperado al procesar la búsqueda.');
      setResultado(null);
    } finally {
      setCargando(false);
    }
  };

  const handleSeleccionarHistorialIndividual = (patronHist, algoHist) => {
    const algoId = (algoHist || '').toLowerCase().includes('boyer')
      ? 'boyer-moore'
      : (algoHist || '').toLowerCase().includes('rabin')
        ? 'rabin-karp'
        : 'kmp';

    setAlgoritmo(algoId);
    setPatron(patronHist);
    handleBuscar(patronHist, algoId);
  };

  return (
    <main className="content-area busqueda-patrones-main">
      {/* Navegación por pestañas principales */}
      <nav className="busqueda-tabs-principales" aria-label="Modo de búsqueda de patrones">
        <button
          type="button"
          role="tab"
          aria-selected={tabPrincipal === 'individual'}
          className={`busqueda-tab-principal ${tabPrincipal === 'individual' ? 'active' : ''}`}
          onClick={() => setTabPrincipal('individual')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span>Búsqueda Individual</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={tabPrincipal === 'comparacion'}
          className={`busqueda-tab-principal ${tabPrincipal === 'comparacion' ? 'active' : ''}`}
          onClick={() => setTabPrincipal('comparacion')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          <span>Comparar Algoritmos</span>
        </button>
      </nav>

      {/* SECCIÓN 1: BÚSQUEDA INDIVIDUAL (Conservada en DOM para mantener su estado) */}
      <div style={{ display: tabPrincipal === 'individual' ? 'block' : 'none' }}>
        {/* Formulario y Selector de Algoritmo */}
        <section className="busqueda-seccion-formulario">
          <FormularioBusqueda
            algoritmo={algoritmo}
            onCambiarAlgoritmo={(nuevoAlgo) => {
              setAlgoritmo(nuevoAlgo);
              if (resultado && patron) {
                handleBuscar(patron, nuevoAlgo);
              }
            }}
            patron={patron}
            onCambiarPatron={setPatron}
            onBuscar={handleBuscar}
            cargando={cargando}
          />
        </section>

        {/* Historial de búsquedas recientes */}
        {historialIndividual.length > 0 && !cargando && (
          <HistorialBusqueda
            historial={historialIndividual}
            onSeleccionarHistorial={handleSeleccionarHistorialIndividual}
            onLimpiarHistorial={() => setHistorialIndividual([])}
          />
        )}

        {/* Banner de Estado de Carga */}
        {cargando && (
          <div className="busqueda-loading-banner">
            <div className="busqueda-loading-spinner"></div>
            <div className="busqueda-loading-texto">
              <h4>Ejecutando algoritmo en el servidor...</h4>
              <p>Construyendo la estructura auxiliar y escaneando los resúmenes del corpus bibliométrico.</p>
            </div>
          </div>
        )}

        {/* Banner de Error */}
        {error && !cargando && (
          <div className="busqueda-error-banner" role="alert">
            <div className="error-banner-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div className="error-banner-info">
              <h4 className="error-banner-titulo">Error en la Búsqueda</h4>
              <p className="error-banner-mensaje">{error}</p>
            </div>
            <button
              type="button"
              className="btn-cerrar-error"
              onClick={() => setError(null)}
              title="Cerrar aviso de error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Contenido cuando hay resultados exitosos */}
        {!cargando && !error && resultado && (
          <div className="busqueda-resultados-contenedor">
            {/* 1. Resumen de la búsqueda */}
            <ResumenBusqueda
              algoritmo={resultado.algoritmo}
              patron={resultado.patron}
              totalOcurrencias={resultado.totalOcurrencias}
              articulosConCoincidencias={resultado.resultados ? resultado.resultados.length : 0}
              totalArticulosCorpus={totalArticulos}
            />

            {/* 2. Tarjetas de Tiempo (Preprocesamiento vs Búsqueda) */}
            <TarjetasTiempo
              algoritmo={resultado.algoritmo}
              tiempoPreprocesamientoNs={resultado.tiempoPreprocesamientoNs}
              tiempoBusquedaNs={resultado.tiempoBusquedaNs}
            />

            {/* 3. Estructura Auxiliar propia y estricta de cada algoritmo */}
            {/* KMP: solo si es KMP y existe tablaPrefijos */}
            {resultado.algoritmo === 'KMP' && Array.isArray(resultado.tablaPrefijos) && (
              <TablaPrefijosKmp
                patron={resultado.patron}
                tablaPrefijos={resultado.tablaPrefijos}
              />
            )}

            {/* Boyer-Moore: solo si es Boyer-Moore y existe estructuraAuxiliar */}
            {resultado.algoritmo === 'Boyer-Moore' && resultado.estructuraAuxiliar && (
              <TablaCaracterMaloBm
                patron={resultado.patron}
                estructuraAuxiliar={resultado.estructuraAuxiliar}
              />
            )}

            {/* Rabin-Karp: solo si es Rabin-Karp y existe estructuraAuxiliar */}
            {resultado.algoritmo === 'Rabin-Karp' && resultado.estructuraAuxiliar && (
              <TablaRollingHashRk
                patron={resultado.patron}
                estructuraAuxiliar={resultado.estructuraAuxiliar}
              />
            )}

            {/* 4. Lista de resultados con abstract resaltado o Estado Vacío */}
            {resultado.totalOcurrencias > 0 && resultado.resultados && resultado.resultados.length > 0 ? (
              <ListaResultadosBusqueda
                resultados={resultado.resultados}
                largoPatron={resultado.patron ? resultado.patron.length : 0}
              />
            ) : (
              <EstadoVacio patron={resultado.patron} fueBuscado={true} />
            )}
          </div>
        )}

        {/* Estado inicial si aún no se ha buscado nada */}
        {!cargando && !error && !resultado && !busquedaEjecutada && (
          <EstadoVacio patron="" fueBuscado={false} />
        )}
      </div>

      {/* SECCIÓN 2: COMPARAR ALGORITMOS (Conservada en DOM para mantener su estado) */}
      <div style={{ display: tabPrincipal === 'comparacion' ? 'block' : 'none' }}>
        <ComparacionRendimiento />
      </div>
    </main>
  );
}
