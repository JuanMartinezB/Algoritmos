import React from 'react';

/**
 * TablaSilueta.jsx
 * Muestra el coeficiente de silueta de cada criterio de enlace para k = 2..10 grupos.
 * Resalta el mejor valor de cada columna y el mejor valor de cada fila.
 */
export default function TablaSilueta({ criterios = [], masCoherente }) {
  if (criterios.length === 0) return null;
  const ks = Object.keys(criterios[0].silueta).map(Number);

  return (
    <div className="agr-card">
      <h3 className="section-ft-title">Evaluación interna: coeficiente de silueta</h3>
      <p className="section-ft-subtitle">
        Entre −1 y 1; más alto = grupos más coherentes (cada abstract está más cerca de su grupo que de los demás).
      </p>
      <div className="agr-tabla-scroll">
        <table className="agr-tabla">
          <thead>
            <tr>
              <th>Criterio</th>
              {ks.map((k) => <th key={k}>k={k}</th>)}
              <th>Mejor k</th>
              <th>Silueta máx.</th>
              <th>Promedio</th>
            </tr>
          </thead>
          <tbody>
            {criterios.map((c) => (
              <tr key={c.nombre} className={c.nombre === masCoherente ? 'agr-fila-ganadora' : ''}>
                <td><strong>{c.nombre}</strong></td>
                {ks.map((k) => (
                  <td key={k} className={k === c.mejorK ? 'agr-celda-mejor' : ''}>
                    {c.silueta[k].toFixed(4)}
                  </td>
                ))}
                <td>{c.mejorK}</td>
                <td>{c.siluetaMejorK.toFixed(4)}</td>
                <td>{c.siluetaPromedio.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="agr-conclusion">
        Más coherente: <strong>{masCoherente}</strong> (mayor silueta máxima; si empatan, mayor promedio sobre todos los k).
      </p>
    </div>
  );
}
