import React, { useState } from 'react';
import TablaSilueta from '../componentes/agrupamiento/TablaSilueta';
import TarjetaDendrograma from '../componentes/agrupamiento/TarjetaDendrograma';
import Toast from '../componentes/Toast';
import { obtenerAgrupamiento } from '../api/agrupamientoApi';
import './Agrupamiento.css';

/**
 * Agrupamiento.jsx
 * Requerimiento 2: agrupamiento jerárquico de los abstracts con tres criterios de enlace
 * (Single, Complete y Average). Muestra la evaluación con silueta y un dendrograma por criterio.
 */
export default function Agrupamiento() {
  const [algoritmo, setAlgoritmo] = useState('glove');
  const [k, setK] = useState(3);
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [notificacion, setNotificacion] = useState(null);

  const ejecutar = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerAgrupamiento(algoritmo, k);
      setResultado(data);
      setNotificacion({ mensaje: 'Agrupamiento calculado correctamente.', tipo: 'success' });
    } catch (err) {
      console.error('Error en agrupamiento:', err);
      setError(err.message || 'No se pudo ejecutar el agrupamiento');
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="main-wrapper">
      <section className="similitud-hero-banner">
        <div className="similitud-header-left">
          <div className="similitud-tag">
            <span>AGRUPAMIENTO JERÁRQUICO</span>
            <span className="badge-req">Requerimiento 2</span>
          </div>
          <h1 className="similitud-main-title">Dendrogramas de Abstracts</h1>
          <p className="similitud-main-subtitle">
            Similitud (embeddings) → distancia = 1 − similitud → clustering Single, Complete y Average → silueta.
          </p>
        </div>
      </section>

      <div className="agr-controles">
        <label>
          Modelo de similitud:
          <select value={algoritmo} onChange={(e) => setAlgoritmo(e.target.value)} disabled={cargando}>
            <option value="glove">GloVe + IDF (50d)</option>
            <option value="fasttext">FastText (300d)</option>
          </select>
        </label>
        <label>
          Cortar en k grupos:
          <input
            type="number"
            min="2"
            max="19"
            value={k}
            onChange={(e) => setK(Number(e.target.value))}
            disabled={cargando}
          />
        </label>
        <button type="button" className="btn-comparar-ft" onClick={ejecutar} disabled={cargando || k < 2 || k > 19}>
          <span>{cargando ? 'Calculando...' : 'Ejecutar agrupamiento'}</span>
        </button>
      </div>

      {error && (
        <div className="alerta-error-visible">
          <div className="alerta-error-icon">⚠️</div>
          <div className="alerta-error-content">
            <h4 className="alerta-error-title">Aviso del Servidor</h4>
            <p className="alerta-error-msg">{error}</p>
          </div>
          <button type="button" className="alerta-error-close" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {cargando && algoritmo === 'fasttext' && (
        <div className="ft-banner-cargando">
          <div className="spinner-lg"></div>
          <div className="ft-cargando-texto">
            <h4>Cargando el modelo FastText</h4>
            <p>La primera petición puede tardar unos minutos mientras el backend carga el modelo.</p>
          </div>
        </div>
      )}

      {resultado && !cargando && (
        <div className="similitud-contenido-seccion">
          <TablaSilueta criterios={resultado.criterios} masCoherente={resultado.masCoherente} />
          {resultado.criterios.map((c) => (
            <TarjetaDendrograma key={c.nombre} criterio={c} etiquetas={resultado.etiquetas} k={resultado.k} />
          ))}
        </div>
      )}

      {notificacion && (
        <Toast mensaje={notificacion.mensaje} tipo={notificacion.tipo} onCerrar={() => setNotificacion(null)} />
      )}
    </main>
  );
}
