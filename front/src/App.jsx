import React, { useState } from 'react';
import Sidebar from './componentes/Sidebar';
import Informacion from './paginas/Informacion';
import Similitud from './paginas/Similitud';
import SimilitudGlove from './paginas/SimilitudGlove';
import './App.css';

/**
 * App.jsx
 * Componente raíz del Frontend.
 * Controla la pestaña activa del menú lateral ('informacion', 'fasttext' o 'glove')
 * y el contador total de artículos del corpus.
 */
function App() {
  const [totalArticulos, setTotalArticulos] = useState(0);
  const [pestanaActiva, setPestanaActiva] = useState('informacion'); // 'informacion' | 'fasttext' | 'glove'

  return (
    <div className="layout-root">
      {/* Barra Lateral Izquierda */}
      <Sidebar
        totalArticulos={totalArticulos}
        pestanaActiva={pestanaActiva}
        onCambiarPestana={setPestanaActiva}
      />

      {/* Vistas según la pestaña activa */}
      {pestanaActiva === 'informacion' && (
        <Informacion onArticulosChange={setTotalArticulos} />
      )}

      {pestanaActiva === 'fasttext' && (
        <Similitud onArticulosChange={setTotalArticulos} />
      )}

      {pestanaActiva === 'glove' && (
        <SimilitudGlove onArticulosChange={setTotalArticulos} />
      )}
    </div>
  );
}

export default App;
