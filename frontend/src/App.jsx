import { useState, useEffect } from 'react';
import Registro from './pages/Registro';
import Atencion from './pages/Atencion';
import CentralFaltantes from './pages/CentralFaltantes';
import GestionDatos from './pages/GestionDatos';
import MenuHamburguesa from './components/MenuHamburguesa';

function App() {
  const [vistaActual, setVistaActual] = useState('registro');
  const [esPantallaPequena, setEsPantallaPequena] = useState(window.innerWidth < 1024);

  useEffect(() => {
    // Detectar parámetro ?view en la URL (para PWA individual)
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'atencion' || view === 'registro' || view === 'faltantes' || view === 'gestion') {
      setVistaActual(view);
    }

    // Detectar cambio de tamaño de pantalla
    const handleResize = () => {
      setEsPantallaPequena(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Si es pantalla pequeña (celular/tablet), mostrar vista con menú hamburguesa
  if (esPantallaPequena) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        {vistaActual === 'atencion' ? (
          <Atencion menuHamburguesa={<MenuHamburguesa vistaActual={vistaActual} onCambiarVista={setVistaActual} />} />
        ) : vistaActual === 'faltantes' ? (
          <CentralFaltantes menuHamburguesa={<MenuHamburguesa vistaActual={vistaActual} onCambiarVista={setVistaActual} />} />
        ) : vistaActual === 'gestion' ? (
          <GestionDatos menuHamburguesa={<MenuHamburguesa vistaActual={vistaActual} onCambiarVista={setVistaActual} />} />
        ) : (
          <Registro menuHamburguesa={<MenuHamburguesa vistaActual={vistaActual} onCambiarVista={setVistaActual} />} />
        )}
      </div>
    );
  }

  // Si es pantalla grande (PC), mostrar menú lateral con navegación
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Menú lateral */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg flex-shrink-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            Mundo Lib
          </h2>

          <nav className="space-y-2">
            <button
              onClick={() => setVistaActual('registro')}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-colors ${
                vistaActual === 'registro'
                  ? 'bg-amber-500 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              📝 Registro de Productos
            </button>

            <button
              onClick={() => setVistaActual('atencion')}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-colors ${
                vistaActual === 'atencion'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              👥 Atención al Cliente
            </button>

            <button
              onClick={() => setVistaActual('faltantes')}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-colors ${
                vistaActual === 'faltantes'
                  ? 'bg-red-500 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              🔴 Central Faltantes
            </button>

            <button
              onClick={() => setVistaActual('gestion')}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-colors ${
                vistaActual === 'gestion'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              ⚙️ Gestión de Datos
            </button>

            <button
              className="w-full text-left px-4 py-3 rounded-lg font-semibold text-gray-400 dark:text-gray-600 cursor-not-allowed"
              disabled
            >
              📦 Inventario
              <span className="text-xs block mt-1">(Próximamente)</span>
            </button>

            <button
              className="w-full text-left px-4 py-3 rounded-lg font-semibold text-gray-400 dark:text-gray-600 cursor-not-allowed"
              disabled
            >
              🛒 Compras
              <span className="text-xs block mt-1">(Próximamente)</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-auto">
        {vistaActual === 'atencion' ? (
          <Atencion />
        ) : vistaActual === 'faltantes' ? (
          <CentralFaltantes />
        ) : vistaActual === 'gestion' ? (
          <GestionDatos />
        ) : (
          <Registro />
        )}
      </div>
    </div>
  );
}

export default App;