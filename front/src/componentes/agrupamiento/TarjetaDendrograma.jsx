import React from 'react';

/**
 * TarjetaDendrograma.jsx
 * Muestra el dendrograma (SVG generado por el backend) de un criterio de enlace,
 * su silueta con k grupos y la lista de abstracts de cada grupo.
 */
export default function TarjetaDendrograma({ criterio, etiquetas = [], k }) {
  // Agrupar los abstracts por número de grupo
  const grupos = {};
  criterio.grupos.forEach((g, i) => {
    if (!grupos[g]) grupos[g] = [];
    grupos[g].push(etiquetas[i]);
  });

  return (
    <div className="agr-card">
      <h3 className="section-ft-title">{criterio.nombre}</h3>
      <p className="section-ft-subtitle">
        Silueta con k = {k}: <strong>{criterio.siluetaEnK.toFixed(4)}</strong> · mejor k = {criterio.mejorK} (
        {criterio.siluetaMejorK.toFixed(4)})
      </p>
      {/* El SVG lo genera el backend (Dendrograma.java); solo se muestra */}
      <div className="agr-svg" dangerouslySetInnerHTML={{ __html: criterio.svg }} />
      <div className="agr-grupos">
        {Object.entries(grupos).map(([g, miembros]) => (
          <div key={g} className="agr-grupo">
            <strong>Grupo {Number(g) + 1}</strong> ({miembros.length}): {miembros.join(' · ')}
          </div>
        ))}
      </div>
    </div>
  );
}
