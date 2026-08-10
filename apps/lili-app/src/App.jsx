import { useState, useEffect } from 'react';
import Registro from './pages/Registro';
import Atencion from './pages/Atencion';
import CentralFaltantes from './pages/CentralFaltantes';
import GestionDatos from './pages/GestionDatos';
import Inventario from './pages/Inventario';
import MenuHamburguesa from './components/MenuHamburguesa';
import APP_CONFIG from './config';

const VISTAS_VALIDAS = ['atencion', 'registro', 'faltantes', 'gestion', 'inventario'];
const VISTA_GUARDADA_KEY = `${APP_CONFIG.tienda}_ultima_vista`;

function App() {
  const [vistaActual, setVistaActualState] = useState(() => {
    // Recordar el último módulo visitado (sobrevive a refresh y actualización de la PWA)
    const guardada = localStorage.getItem(VISTA_GUARDADA_KEY);
    return VISTAS_VALIDAS.includes(guardada) ? guardada : 'registro';
  });
  const [esPantallaPequena, setEsPantallaPequena] = useState(window.innerWidth < 1024);

  const setVistaActual = (vista) => {
    setVistaActualState(vista);
    localStorage.setItem(VISTA_GUARDADA_KEY, vista);
  };

  useEffect(() => {
    // Detectar parámetro ?view en la URL (para PWA individual) — tiene prioridad sobre lo guardado
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (VISTAS_VALIDAS.includes(view)) {
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
        ) : vistaActual === 'inventario' ? (
          <Inventario menuHamburguesa={<MenuHamburguesa vistaActual={vistaActual} onCambiarVista={setVistaActual} />} />
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
            {APP_CONFIG.icono} {APP_CONFIG.nombre}
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
              onClick={() => setVistaActual('inventario')}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-colors ${
                vistaActual === 'inventario'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              📦 Inventario
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
        ) : vistaActual === 'inventario' ? (
          <Inventario />
        ) : (
          <Registro />
        )}
      </div>
    </div>
  );
}

export default App;