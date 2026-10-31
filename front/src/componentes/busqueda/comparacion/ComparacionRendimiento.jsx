import React, { useState } from 'react';
import { compararAlgoritmos } from '../../../api/busquedaApi';
import FormularioComparacion from './FormularioComparacion';
import InsigniaVerificacion from './InsigniaVerificacion';
import TablaResultadosEscalas from './TablaResultadosEscalas';
import GraficaLineasBusqueda from './GraficaLineasBusqueda';
import GraficaBarrasPreprocesamiento from './GraficaBarrasPreprocesamiento';
import BloqueComplejidadTeorica from './BloqueComplejidadTeorica';
import HistorialComparaciones from './HistorialComparaciones';

/**
 * ComparacionRendimiento.jsx
 * Vista de Comparación de Rendimiento entre los tres algoritmos (KMP, Boyer-Moore y Rabin-Karp).
 * Consume GET /api/busqueda/comparar y presenta métricas, gráficas SVG y análisis de complejidad.
 */
export default function ComparacionRendimiento() {
  const [patron, setPatron] = useState('algorithm');
  const [repeticiones, setRepeticiones] = useState(1000);
  const [calentamiento, setCalentamiento] = useState(200);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState([]);

  // Ejecuta la comparación consumiendo la API de backend
  const handleComparar = async (patronTexto, reps, cal) => {
    setCargando(true);
    setError(null);

    try {
      const data = await compararAlgoritmos(patronTexto, reps, cal);
      setResultado(data);

      // Actualizar historial en memoria de sesión
      // Extraer datos de la escala más grande (última de la lista)
      const escalas = data.escalas || [];
      if (escalas.length > 0) {
        const escalaMax = escalas[escalas.length - 1];
        const algos = escalaMax.algoritmos || [];

        const kmpMed = algos.find((a) => a.algoritmo === 'KMP');
        const bmMed = algos.find((a) => a.algoritmo === 'Boyer-Moore');
        const rkMed = algos.find((a) => a.algoritmo === 'Rabin-Karp');

        const nuevoItem = {
          patron: data.patron,
          m: data.patron.length,
          repeticiones: data.repeticiones,
          calentamiento: data.calentamiento,
          n: escalaMax.caracteres,
          articulos: escalaMax.articulos,
          kmpNs: kmpMed ? kmpMed.busquedaMedianaNs : 0,
          bmNs: bmMed ? bmMed.busquedaMedianaNs : 0,
          rkNs: rkMed ? rkMed.busquedaMedianaNs : 0,
          timestamp: Date.now()
        };

        setHistorial((prev) => {
          // Si ya existe con el mismo patrón y mismos parámetros, se reemplaza en lugar de duplicarse
          const filtrado = prev.filter(
            (item) => !(
              item.patron.toLowerCase() === nuevoItem.patron.toLowerCase() &&
              item.repeticiones === nuevoItem.repeticiones &&
              item.calentamiento === nuevoItem.calentamiento
            )
          );
          return [nuevoItem, ...filtrado];
        });
      }
    } catch (err) {
      setError(err.message || 'Error al ejecutar la comparación de algoritmos.');
      setResultado(null);
    } finally {
      setCargando(false);
    }
  };

  const handleSeleccionarDeHistorial = (item) => {
    setPatron(item.patron);
    setRepeticiones(item.repeticiones);
    setCalentamiento(item.calentamiento);
    handleComparar(item.patron, item.repeticiones, item.calentamiento);
  };

  return (
    <div className="busqueda-comparacion-contenedor">
      {/* 1. Formulario de parámetros */}
      <FormularioComparacion
        patron={patron}
        onCambiarPatron={setPatron}
        repeticiones={repeticiones}
        onCambiarRepeticiones={setRepeticiones}
        calentamiento={calentamiento}
        onCambiarCalentamiento={setCalentamiento}
        onComparar={handleComparar}
        cargando={cargando}
      />

      {/* Banner de carga */}
      {cargando && (
        <div className="busqueda-loading-banner comparacion-loading-banner">
          <div className="busqueda-loading-spinner"></div>
          <div className="busqueda-loading-texto">
            <h4>Ejecutando los tres algoritmos, esto puede tardar unos segundos…</h4>
            <p>
              Midiendo KMP, Boyer-Moore y Rabin-Karp con {repeticiones.toLocaleString()} repeticiones en múltiples escalas del corpus tras {calentamiento} ejecuciones de calentamiento JVM.
            </p>
          </div>
        </div>
      )}

      {/* Banner de error */}
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
            <h4 className="error-banner-titulo">Error en la Comparación</h4>
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

      {/* Salidas en orden estricto */}
      {!cargando && resultado && (
        <div className="comparacion-resultados-bloque">
          {/* 1. Verificación de corrección */}
          <InsigniaVerificacion escalas={resultado.escalas} />

          {/* 2. Tabla de resultados por escala (con botón Copiar para documento) */}
          <TablaResultadosEscalas
            patron={resultado.patron}
            repeticiones={resultado.repeticiones}
            calentamiento={resultado.calentamiento}
            escalas={resultado.escalas}
          />

          {/* 3. Gráfica de líneas Tiempo de búsqueda vs. tamaño del texto */}
          <GraficaLineasBusqueda escalas={resultado.escalas} />

          {/* 4. Gráfica de barras agrupadas Preprocesamiento vs. búsqueda para escala de 20 artículos */}
          <GraficaBarrasPreprocesamiento escalas={resultado.escalas} />

          {/* 5. Bloque Complejidad teórica estático */}
          <BloqueComplejidadTeorica />

          {/* 6. Historial de comparaciones para analizar el efecto de m */}
          <HistorialComparaciones
            historial={historial}
            onLimpiarHistorial={() => setHistorial([])}
            onSeleccionarComparacion={handleSeleccionarDeHistorial}
          />
        </div>
      )}

      {/* Si aún no se ha ejecutado ninguna comparación, mostramos el marco teórico como bienvenida */}
      {!cargando && !error && !resultado && (
        <div className="comparacion-bienvenida-bloque">
          <BloqueComplejidadTeorica />
        </div>
      )}
    </div>
  );
}
