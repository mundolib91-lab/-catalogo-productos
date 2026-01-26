import { useEffect } from 'react';

function MenuReportarFaltantes({ isOpen, onClose, onSelectTipo }) {
  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay oscuro */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Menú desde abajo */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
        <div className="bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl max-w-2xl mx-auto">
          {/* Línea indicadora arriba */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>

          {/* Contenido del menú */}
          <div className="px-6 pb-8">
            <h2 className="text-xl font-bold text-center mb-6 text-gray-800 dark:text-white">
              Reportar Faltante
            </h2>

            {/* Opción 1: Producto Nuevo */}
            <button
              onClick={() => onSelectTipo('nuevo')}
              className="w-full mb-4 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl hover:shadow-lg transition-all active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">✨</div>
                <div className="text-left flex-1">
                  <div className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
                    Producto Nuevo
                  </div>
                  <div className="text-base text-yellow-700 dark:text-yellow-300">
                    No existe en el sistema
                  </div>
                </div>
              </div>
            </button>

            {/* Opción 2: Grupo/Repisa */}
            <button
              onClick={() => onSelectTipo('grupo')}
              className="w-full mb-4 p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-2 border-red-500 dark:border-red-600 rounded-xl hover:shadow-lg transition-all active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">🏪</div>
                <div className="text-left flex-1">
                  <div className="text-lg font-bold text-red-900 dark:text-red-100">
                    Grupo / Repisa
                  </div>
                  <div className="text-base text-red-700 dark:text-red-300">
                    Varios productos faltantes
                  </div>
                </div>
              </div>
            </button>

            {/* Botón Cancelar */}
            <button
              onClick={onClose}
              className="w-full p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-lg font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {/* Animación para el menú */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

export default MenuReportarFaltantes;
