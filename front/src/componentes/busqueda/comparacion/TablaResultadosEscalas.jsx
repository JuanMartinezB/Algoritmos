import React, { useState } from 'react';
import { formatearTiempoNs } from './formatoTiempoNs';

/**
 * TablaResultadosEscalas.jsx
 * Tabla detallada por escala y algoritmo con medianas, promedios y cálculo de totales.
 * Resalta los valores óptimos por escala y permite copiar en texto tabulado para informes.
 */
export default function TablaResultadosEscalas({
  patron = '',
  repeticiones = 1000,
  calentamiento = 200,
  escalas = []
}) {
  const [copiado, setCopiado] = useState(false);

  if (!Array.isArray(escalas) || escalas.length === 0) {
    return null;
  }

  // Aplanamos las filas para la tabla, calculando por escala el mínimo de preprocesamiento y de búsqueda
  const filas = [];

  escalas.forEach((escala) => {
    const algos = escala.algoritmos || [];

    // Hallar valores mínimos en esta escala para resaltarlos en verde
    let minPreMediana = Infinity;
    let minBusMediana = Infinity;

    algos.forEach((med) => {
      if (med.preprocesamientoMedianaNs < minPreMediana) {
        minPreMediana = med.preprocesamientoMedianaNs;
      }
      if (med.busquedaMedianaNs < minBusMediana) {
        minBusMediana = med.busquedaMedianaNs;
      }
    });

    algos.forEach((med, idxAlgo) => {
      const totalMedianaNs = (med.preprocesamientoMedianaNs || 0) + (med.busquedaMedianaNs || 0);
      filas.push({
        escalaIndex: escala.articulos,
        primeroDeEscala: idxAlgo === 0,
        tamanoEscala: algos.length,
        articulos: escala.articulos,
        caracteres: escala.caracteres,
        ocurrencias: escala.ocurrencias,
        algoritmo: med.algoritmo,
        preprocesamientoMedianaNs: med.preprocesamientoMedianaNs,
        esMinPre: med.preprocesamientoMedianaNs === minPreMediana,
        busquedaMedianaNs: med.busquedaMedianaNs,
        esMinBus: med.busquedaMedianaNs === minBusMediana,
        totalMedianaNs,
        busquedaPromedioNs: med.busquedaPromedioNs
      });
    });
  });

  // Copia la tabla en formato tabulado (TSV), ideal para Excel / Word / Google Docs
  const copiarParaDocumento = () => {
    let texto = `COMPARACIÓN EMPÍRICA DE ALGORITMOS DE BÚSQUEDA EXACTA\n`;
    texto += `Patrón: "${patron}" | Repeticiones: ${repeticiones} | Calentamiento: ${calentamiento}\n\n`;
    texto += [
      'Artículos',
      'n (caracteres)',
      'Algoritmo',
      'Preprocesamiento (mediana)',
      'Búsqueda (mediana)',
      'Total (mediana pre + bus)',
      'Búsqueda (promedio)'
    ].join('\t') + '\n';

    filas.forEach((f) => {
      texto += [
        f.articulos,
        f.caracteres,
        f.algoritmo,
        formatearTiempoNs(f.preprocesamientoMedianaNs).texto,
        formatearTiempoNs(f.busquedaMedianaNs).texto,
        formatearTiempoNs(f.totalMedianaNs).texto,
        formatearTiempoNs(f.busquedaPromedioNs).texto
      ].join('\t') + '\n';
    });

    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  };

  return (
    <div className="busqueda-tabla-prefijos-card tabla-escalas-card">
      <div className="tabla-prefijos-header">
        <div>
          <div className="bm-header-badge">Resultados Empíricos</div>
          <h3 className="tabla-prefijos-titulo">
            Métricas de Rendimiento por Escala del Corpus
          </h3>
          <p className="tabla-prefijos-descripcion">
            Mediana de {repeticiones.toLocaleString()} repeticiones tras descartar {calentamiento} ejecuciones de calentamiento.
            Las celdas en verde corresponden al menor tiempo en cada escala.
          </p>
        </div>
        <button
          type="button"
          className="btn-copiar-tabla"
          onClick={copiarParaDocumento}
          title="Copiar tabla en formato tabulado para pegar en el informe"
        >
          {copiado ? (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>¡Tabla copiada!</span>
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copiar tabla para documento</span>
            </>
          )}
        </button>
      </div>

      <div className="tabla-escalas-scroll-wrapper">
        <table className="tabla-escalas-completa">
          <thead>
            <tr>
              <th scope="col">Artículos</th>
              <th scope="col">n (caracteres)</th>
              <th scope="col">Algoritmo</th>
              <th scope="col">Preprocesamiento (mediana)</th>
              <th scope="col">Búsqueda (mediana)</th>
              <th scope="col">Total (pre + búsqueda)</th>
              <th scope="col">Búsqueda (promedio)</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f, idx) => {
              const preFmt = formatearTiempoNs(f.preprocesamientoMedianaNs);
              const busFmt = formatearTiempoNs(f.busquedaMedianaNs);
              const totFmt = formatearTiempoNs(f.totalMedianaNs);
              const promFmt = formatearTiempoNs(f.busquedaPromedioNs);

              return (
                <tr
                  key={`fila-escala-${f.articulos}-${f.algoritmo}-${idx}`}
                  className={f.primeroDeEscala ? 'fila-separador-escala' : ''}
                >
                  <td className="celda-articulos">
                    <strong>{f.articulos}</strong>
                    <span className="celda-sub">{f.articulos === 1 ? 'artículo' : 'artículos'}</span>
                  </td>
                  <td className="celda-n">
                    <code>{f.caracteres.toLocaleString()}</code>
                  </td>
                  <td className="celda-algoritmo">
                    <span className={`tag-algoritmo tag-algo-${f.algoritmo.toLowerCase().replace(/[^a-z]/g, '')}`}>
                      {f.algoritmo}
                    </span>
                  </td>
                  <td
                    className={`celda-metrica ${f.esMinPre ? 'celda-minima-optima' : ''}`}
                    title={`Valor exacto: ${f.preprocesamientoMedianaNs.toLocaleString()} ns`}
                  >
                    <strong>{preFmt.valor}</strong> <span className="unidad-pequena">{preFmt.unidad}</span>
                    {f.esMinPre && <span className="badge-optimo" title="Menor tiempo de preparación en esta escala">★ óptimo</span>}
                  </td>
                  <td
                    className={`celda-metrica ${f.esMinBus ? 'celda-minima-optima' : ''}`}
                    title={`Valor exacto: ${f.busquedaMedianaNs.toLocaleString()} ns`}
                  >
                    <strong>{busFmt.valor}</strong> <span className="unidad-pequena">{busFmt.unidad}</span>
                    {f.esMinBus && <span className="badge-optimo" title="Menor tiempo de búsqueda en esta escala">★ óptimo</span>}
                  </td>
                  <td
                    className="celda-metrica celda-total"
                    title={`Suma de medianas: ${f.totalMedianaNs.toLocaleString()} ns`}
                  >
                    <span>{totFmt.valor}</span> <span className="unidad-pequena">{totFmt.unidad}</span>
                  </td>
                  <td
                    className="celda-metrica celda-promedio"
                    title={`Promedio de búsqueda: ${f.busquedaPromedioNs.toLocaleString()} ns`}
                  >
                    <span>{promFmt.valor}</span> <span className="unidad-pequena">{promFmt.unidad}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
