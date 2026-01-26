import { useState } from 'react';
import { APP_CONFIG } from '../config';

function MenuHamburguesa({ vistaActual, onCambiarVista }) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const opciones = [
    { id: 'registro', nombre: 'Registro de Productos', icono: '📝', color: 'amber' },
    { id: 'atencion', nombre: 'Atención al Cliente', icono: '👥', color: 'blue' },
    { id: 'faltantes', nombre: 'Central Faltantes', icono: '🔴', color: 'red' },
    { id: 'gestion', nombre: 'Gestión de Datos', icono: '⚙️', color: 'purple' },
    { id: 'inventario', nombre: 'Inventario', icono: '📦', color: 'green', proximamente: true },
    { id: 'compras', nombre: 'Compras', icono: '🛒', color: 'indigo', proximamente: true }
  ];

  const handleSeleccionar = (id) => {
    onCambiarVista(id);
    setMenuAbierto(false);
  };

  return (
    <>
      {/* Botón hamburguesa */}
      <button
        onClick={() => setMenuAbierto(true)}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-opacity-20 hover:bg-white transition-colors"
        aria-label="Abrir menú"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Overlay */}
      {menuAbierto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      {/* Menú deslizante */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ${
          menuAbierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header del menú */}
        <div className="bg-gradient-to-r from-amber-500 to-blue-500 text-white p-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-3xl font-bold">{APP_CONFIG.nombre}</h2>
            <button
              onClick={() => setMenuAbierto(false)}
              className="text-3xl hover:bg-white hover:bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center"
            >
              ×
            </button>
          </div>
          <p className="text-lg opacity-90">Sistema de Gestión</p>
        </div>

        {/* Opciones del menú */}
        <nav className="p-4">
          <p className="text-base text-gray-500 dark:text-gray-400 mb-3 font-semibold uppercase">
            Selecciona una vista
          </p>

          <div className="space-y-2">
            {opciones.map((opcion) => (
              <button
                key={opcion.id}
                onClick={() => !opcion.proximamente && handleSeleccionar(opcion.id)}
                disabled={opcion.proximamente}
                className={`w-full text-left px-4 py-4 rounded-xl font-semibold transition-all ${
                  vistaActual === opcion.id
                    ? `bg-${opcion.color}-500 text-white shadow-lg scale-105`
                    : opcion.proximamente
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{opcion.icono}</span>
                  <div className="flex-1">
                    <div className="font-bold">{opcion.nombre}</div>
                    {opcion.proximamente && (
                      <div className="text-base mt-1">Próximamente</div>
                    )}
                    {vistaActual === opcion.id && !opcion.proximamente && (
                      <div className="text-base mt-1 opacity-90">Vista actual</div>
                    )}
                  </div>
                  {vistaActual === opcion.id && !opcion.proximamente && (
                    <span className="text-2xl">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </nav>

        {/* Footer del menú */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-base text-gray-500 dark:text-gray-400 text-center">
            Versión 1.0.0
          </p>
        </div>
      </div>
    </>
  );
}

export default MenuHamburguesa;
