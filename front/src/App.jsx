import React, { useState } from 'react';
import Sidebar from './componentes/Sidebar';
import Informacion from './paginas/Informacion';
import Similitud from './paginas/Similitud';
import SimilitudClasicos from './paginas/SimilitudClasicos';
import BusquedaPatrones from './paginas/BusquedaPatrones';
import SimilitudGlove from './paginas/SimilitudGlove';
import Agrupamiento from './paginas/Agrupamiento';
import ErrorBoundary from './componentes/ErrorBoundary';
import './App.css';

/**
 * App.jsx
 * Componente raíz del Frontend.
 * Controla la pestaña activa del menú lateral ('informacion', 'fasttext', 'glove' o 'agrupamiento')
 * y el contador total de artículos del corpus.
 */
function App() {
  const [totalArticulos, setTotalArticulos] = useState(0);
  const [pestanaActiva, setPestanaActiva] = useState('informacion'); // 'informacion' | 'fasttext' | 'glove' | 'agrupamiento'

  return (
    <div className="layout-root">
      {/* Barra Lateral Izquierda */}
      <Sidebar
        totalArticulos={totalArticulos}
        pestanaActiva={pestanaActiva}
        onCambiarPestana={setPestanaActiva}
      />

      {/* Vistas según la pestaña activa */}
      <ErrorBoundary>
        {pestanaActiva === 'informacion' && (
          <Informacion onArticulosChange={setTotalArticulos} />
        )}

        {pestanaActiva === 'busqueda' && (
          <BusquedaPatrones totalArticulos={totalArticulos || 20} />
        )}

        {pestanaActiva === 'fasttext' && (
          <Similitud onArticulosChange={setTotalArticulos} />
        )}

        {pestanaActiva === 'glove' && (
          <SimilitudGlove onArticulosChange={setTotalArticulos} />
        )}

        {pestanaActiva === 'clasicos' && (
          <SimilitudClasicos onArticulosChange={setTotalArticulos} />
        )}

        {pestanaActiva === 'agrupamiento' && <Agrupamiento />}
      </ErrorBoundary>
    </div>
  );
}

export default App;
