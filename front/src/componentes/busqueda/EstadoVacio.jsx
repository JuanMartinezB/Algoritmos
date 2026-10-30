import React from 'react';

/**
 * EstadoVacio.jsx
 * Muestra un mensaje amigable y estilizado cuando no hay coincidencias
 * o sugerencias de búsqueda.
 */
export default function EstadoVacio({ patron = '', fueBuscado = false }) {
  if (!fueBuscado) {
    return (
      <div className="busqueda-estado-vacio inicial">
        <div className="estado-vacio-icono-circulo">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </div>
        <h3 className="estado-vacio-titulo">Explora patrones en el Corpus</h3>
        <p className="estado-vacio-descripcion">
          Ingresa una palabra o frase en el campo superior para ejecutar la búsqueda exacta
          utilizando el algoritmo Knuth-Morris-Pratt (KMP) sobre los 20 resúmenes científicos.
        </p>
        <div className="estado-vacio-ejemplos">
          <span className="ejemplos-etiqueta">Términos sugeridos:</span>
          <span className="ejemplo-pill">algorithm</span>
          <span className="ejemplo-pill">intelligence</span>
          <span className="ejemplo-pill">education</span>
          <span className="ejemplo-pill">learning</span>
          <span className="ejemplo-pill">model</span>
        </div>
      </div>
    );
  }

  return (
    <div className="busqueda-estado-vacio sin-resultados">
      <div className="estado-vacio-icono-circulo no-coincidencias">
        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="8" y1="8" x2="14" y2="14"></line>
          <line x1="14" y1="8" x2="8" y2="14"></line>
        </svg>
      </div>
      <h3 className="estado-vacio-titulo">
        No se encontraron coincidencias para «{patron}»
      </h3>
      <p className="estado-vacio-descripcion">
        El patrón no aparece en el abstract original de ninguno de los 20 artículos del corpus bibliométrico.
      </p>
      <div className="estado-vacio-consejos">
        <strong>Sugerencias:</strong>
        <ul>
          <li>Verifica la ortografía o intenta con palabras en inglés (el corpus está en inglés).</li>
          <li>Prueba con raíces de palabras más breves (ej: <code>teach</code>, <code>learn</code>, <code>data</code>).</li>
          <li>El algoritmo busca subcadenas exactas (insensible a mayúsculas/minúsculas).</li>
        </ul>
      </div>
    </div>
  );
}
