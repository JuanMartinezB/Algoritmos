import React from 'react';

/**
 * BloqueComplejidadTeorica.jsx
 * Tabla estática con las complejidades asintóticas teóricas de KMP, Boyer-Moore y Rabin-Karp.
 */
export default function BloqueComplejidadTeorica() {
  const FILAS = [
    {
      algoritmo: 'Knuth-Morris-Pratt (KMP)',
      preprocesamiento: 'O(m)',
      mejorCaso: 'O(n)',
      peorCaso: 'O(n)',
      explicacion: 'Construye la función de prefijo π; nunca retrocede en el texto.'
    },
    {
      algoritmo: 'Boyer-Moore (carácter malo)',
      preprocesamiento: 'O(m + σ)',
      mejorCaso: 'O(n/m)',
      peorCaso: 'O(n · m)',
      explicacion: 'Compara de derecha a izquierda; salta hasta m posiciones por discrepancia.'
    },
    {
      algoritmo: 'Rabin-Karp',
      preprocesamiento: 'O(m)',
      mejorCaso: 'O(n + m)',
      peorCaso: 'O(n · m)',
      explicacion: 'Rolling hash modular; el peor caso ocurre si abundan las colisiones de hash.'
    }
  ];

  return (
    <div className="busqueda-tabla-prefijos-card complejidad-card">
      <div className="tabla-prefijos-header">
        <div>
          <div className="bm-header-badge">Marco Teórico Asintótico</div>
          <h3 className="tabla-prefijos-titulo">
            Complejidad Teórica de los Algoritmos
          </h3>
          <p className="tabla-prefijos-descripcion">
            Comparación formal de los límites de orden de crecimiento en tiempo de ejecución.
          </p>
        </div>
      </div>

      <div className="tabla-escalas-scroll-wrapper">
        <table className="tabla-escalas-completa tabla-complejidad">
          <thead>
            <tr>
              <th scope="col">Algoritmo</th>
              <th scope="col">Preprocesamiento</th>
              <th scope="col">Búsqueda (Mejor Caso)</th>
              <th scope="col">Búsqueda (Peor Caso)</th>
              <th scope="col">Mecanismo Principal</th>
            </tr>
          </thead>
          <tbody>
            {FILAS.map((fila, idx) => (
              <tr key={`complejidad-${idx}`}>
                <td className="celda-algoritmo">
                  <strong>{fila.algoritmo}</strong>
                </td>
                <td className="celda-teorica">
                  <code>{fila.preprocesamiento}</code>
                </td>
                <td className="celda-teorica celda-mejor-caso">
                  <code>{fila.mejorCaso}</code>
                </td>
                <td className="celda-teorica celda-peor-caso">
                  <code>{fila.peorCaso}</code>
                </td>
                <td className="celda-explicacion">
                  <span>{fila.explicacion}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="tabla-prefijos-footer-nota">
        <span className="nota-pill">Nomenclatura</span>
        <span className="nota-texto">
          n = longitud del texto, m = longitud del patrón, σ = tamaño del alfabeto (256).
        </span>
      </div>
    </div>
  );
}
