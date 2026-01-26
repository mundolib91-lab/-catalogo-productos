import { useEffect } from 'react';

function Toast({ mensaje, tipo = 'success', onClose, duracion = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duracion);

    return () => clearTimeout(timer);
  }, [duracion, onClose]);

  const estilos = {
    success: 'bg-green-500 border-green-600',
    error: 'bg-red-500 border-red-600',
    info: 'bg-blue-500 border-blue-600',
    warning: 'bg-yellow-500 border-yellow-600'
  };

  const iconos = {
    success: '✓',
    error: '✕',
    info: 'i',
    warning: '⚠'
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-slide-in-right">
      <div className={`${estilos[tipo]} text-white px-6 py-4 rounded-xl shadow-2xl border-2 flex items-center gap-3 min-w-[300px] max-w-md`}>
        <div className="text-2xl font-bold bg-white bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center">
          {iconos[tipo]}
        </div>
        <p className="text-lg font-semibold flex-1">{mensaje}</p>
        <button
          onClick={onClose}
          className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default Toast;
