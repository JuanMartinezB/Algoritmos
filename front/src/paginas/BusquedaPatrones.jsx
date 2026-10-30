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

/**
 * BusquedaPatrones.jsx
 * Página principal para la Búsqueda Exacta de Patrones en los abstracts del corpus.
 * Consume exclusivamente la API de Spring Boot (/api/busqueda/{algoritmo}).
 * Soporta KMP, Boyer-Moore y Rabin-Karp.
 */
export default function BusquedaPatrones({ totalArticulos = 20 }) {
  const [algoritmo, setAlgoritmo] = useState('kmp');
  const [patron, setPatron] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [busquedaEjecutada, setBusquedaEjecutada] = useState(false);

  // Ejecuta la búsqueda consumiendo el servicio de backend
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
    } catch (err) {
      setError(err.message || 'Ocurrió un error inesperado al procesar la búsqueda.');
      setResultado(null);
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="content-area busqueda-patrones-main">
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

      {/* Banner de Error (Servidor caído, 400, red) */}
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

          {/* 3. Tabla Auxiliar específica según el algoritmo */}
          {resultado.algoritmo === 'KMP' && resultado.tablaPrefijos && (
            <TablaPrefijosKmp
              patron={resultado.patron}
              tablaPrefijos={resultado.tablaPrefijos}
            />
          )}

          {resultado.algoritmo === 'Boyer-Moore' && resultado.tablaPrefijos && (
            <TablaCaracterMaloBm
              patron={resultado.patron}
              tablaCaracterMalo={resultado.tablaPrefijos}
            />
          )}

          {resultado.algoritmo === 'Rabin-Karp' && (
            <TablaRollingHashRk
              patron={resultado.patron}
              tablaPrefijos={resultado.tablaPrefijos}
            />
          )}

          {/* 4. Lista de resultados o Estado Vacío si totalOcurrencias === 0 */}
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
    </main>
  );
}
