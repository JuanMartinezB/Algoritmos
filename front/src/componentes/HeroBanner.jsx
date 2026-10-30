import React from 'react';
import logoUq from '../assets/Logo UQ.jpg';

export default function HeroBanner({ onEjecutarPreprocesamiento, procesando = false }) {
  const estudiantes = [
    'Juan David Bedoya Sánchez',
    'John Angel Cardona Camacho',
    'Juan Steban Martínez Bermúdez'
  ];

  return (
    <section className="hero-banner">
      <div className="hero-content">
        {/* Columna Izquierda: Nombres y Título */}
        <div className="hero-info">
          <h1 className="hero-title">
            <span>Proyecto Final</span>
            <span>Análisis de Algoritmos</span>
          </h1>

          <ul className="hero-students-list">
            {estudiantes.map((estudiante, index) => (
              <li key={index} className="hero-student-item">
                <span className="student-bullet" />
                <span className="student-name">{estudiante}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna Central: Logo de la Universidad */}
        <div className="hero-logo-container">
          <div className="logo-card">
            <img
              src={logoUq}
              alt="Universidad del Quindío"
              className="logo-uq-img"
            />
          </div>
        </div>

        {/* Columna Derecha: Botón de Ejecutar Preprocesamiento */}
        <div className="hero-action-container">
          <button
            type="button"
            className={`btn-preprocesar ${procesando ? 'is-loading' : ''}`}
            onClick={onEjecutarPreprocesamiento}
            disabled={procesando}
            title="Llama al endpoint /api/articulos/procesar del backend para leer los PDFs y extraer los abstracts"
          >
            {procesando ? (
              <>
                <span className="spinner-icon" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                <span>Ejecutar Preprocesamiento</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
