import { useState } from 'react';

function FormularioReportarExistente({ isOpen, onClose, producto, onSubmit }) {
  const [formData, setFormData] = useState({
    prioridad: 'alta',
    notas: ''
  });

  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setGuardando(true);
    try {
      await onSubmit({
        productoId: producto.id,
        prioridad: formData.prioridad,
        notas: formData.notas
      });

      // Limpiar formulario
      setFormData({
        prioridad: 'alta',
        notas: ''
      });
      onClose();
    } catch (error) {
      console.error('Error al reportar faltante:', error);
    } finally {
      setGuardando(false);
    }
  };

  if (!isOpen || !producto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">⚠️</span>
              <h2 className="text-2xl font-bold text-white">Reportar Faltante</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-red-100 mt-2 text-lg">Producto existente sin stock</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información del producto */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-3">
              Producto a reportar:
            </h3>

            <div className="flex gap-4">
              {/* Imagen */}
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-600 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                {producto.imagen ? (
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">📦</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
                  {producto.descripcion || producto.nombre}
                </p>
                <p className="text-base text-gray-600 dark:text-gray-400 mb-1">
                  Marca: {producto.marca || 'Sin marca'}
                </p>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  Precio: Bs {producto.precio_venta_unidad?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-lg font-bold text-gray-700 dark:text-gray-300 mb-3">
              Prioridad <span className="text-red-500">*</span>
            </label>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-3">
              ALTA: Urgente, cliente esperando | MEDIA: Necesario pronto | BAJA: Reponer stock normal
            </p>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, prioridad: 'alta' }))}
                className={`py-3 rounded-lg text-lg font-bold transition-all ${
                  formData.prioridad === 'alta'
                    ? 'bg-red-500 text-white shadow-lg scale-105'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                ALTA
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, prioridad: 'media' }))}
                className={`py-3 rounded-lg text-lg font-bold transition-all ${
                  formData.prioridad === 'media'
                    ? 'bg-yellow-500 text-white shadow-lg scale-105'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                MEDIA
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, prioridad: 'baja' }))}
                className={`py-3 rounded-lg text-lg font-bold transition-all ${
                  formData.prioridad === 'baja'
                    ? 'bg-green-500 text-white shadow-lg scale-105'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                BAJA
              </button>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-lg font-bold text-gray-700 dark:text-gray-300 mb-3">
              Notas (Opcional)
            </label>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-2">
              Información adicional sobre el faltante
            </p>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
              placeholder="Ej: Cliente necesita 5 unidades urgente, pedido especial para evento..."
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 dark:text-white resize-none"
              rows="4"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="flex-1 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-lg font-semibold disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all text-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {guardando ? 'Reportando...' : 'Reportar Faltante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormularioReportarExistente;
