import { useEffect } from 'react';

function MenuRegistro({ isOpen, onClose, onSelectTipo }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={onClose}
      />

      {/* Menú deslizante desde abajo */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
        <div className="bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl max-w-2xl mx-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white text-center">
              Tipo de Registro
            </h3>
            <p className="text-lg text-gray-500 dark:text-gray-400 text-center mt-2">
              Selecciona cómo registrar los productos
            </p>
          </div>

          {/* Opciones */}
          <div className="p-4 space-y-3">
            {/* Producto Individual */}
            <button
              onClick={() => onSelectTipo('individual')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-5 rounded-2xl shadow-lg transition-all active:scale-95 text-left"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">📦</span>
                <div className="flex-1">
                  <div className="text-xl font-bold">Producto Individual</div>
                  <div className="text-base opacity-90 mt-1">
                    Registrar un producto a la vez
                  </div>
                </div>
              </div>
            </button>

            {/* Por Proveedor */}
            <button
              onClick={() => onSelectTipo('proveedor')}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-5 rounded-2xl shadow-lg transition-all active:scale-95 text-left"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">🏢</span>
                <div className="flex-1">
                  <div className="text-xl font-bold">Por Proveedor</div>
                  <div className="text-base opacity-90 mt-1">
                    Registrar varios productos del mismo proveedor
                  </div>
                </div>
              </div>
            </button>

            {/* Por Marca */}
            <button
              onClick={() => onSelectTipo('marca')}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white p-5 rounded-2xl shadow-lg transition-all active:scale-95 text-left"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">🏷️</span>
                <div className="flex-1">
                  <div className="text-xl font-bold">Por Marca</div>
                  <div className="text-base opacity-90 mt-1">
                    Registrar varios productos de la misma marca
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Botón Cancelar */}
          <div className="p-4 pt-2">
            <button
              onClick={onClose}
              className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-4 rounded-xl font-semibold text-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default MenuRegistro;
