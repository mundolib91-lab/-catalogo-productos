import { useState } from 'react';
import SelectorImagen from './SelectorImagen';

function FormularioGrupoRepisa({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    imagen: '',
    descripcion: '',
    prioridad: 'alta'
  });

  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const handleImagenSeleccionada = (url) => {
    setFormData(prev => ({ ...prev, imagen: url }));
    setErrores(prev => ({ ...prev, imagen: '' }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.imagen || formData.imagen.trim() === '') {
      nuevosErrores.imagen = 'La foto de la repisa es obligatoria';
    }

    if (!formData.descripcion || formData.descripcion.trim() === '') {
      nuevosErrores.descripcion = 'La descripción es obligatoria';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setGuardando(true);
    try {
      await onSubmit({
        tipo: 'grupo',
        ...formData
      });

      // Limpiar formulario
      setFormData({
        imagen: '',
        descripcion: '',
        prioridad: 'alta'
      });
      setErrores({});
      onClose();
    } catch (error) {
      console.error('Error al reportar faltante:', error);
      setErrores({ general: 'Error al reportar. Intenta de nuevo.' });
    } finally {
      setGuardando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🏪</span>
              <h2 className="text-2xl font-bold text-white">Grupo / Repisa</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-red-100 mt-2 text-lg">Varios productos faltantes</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error general */}
          {errores.general && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <p className="text-red-700 dark:text-red-300 text-lg">{errores.general}</p>
            </div>
          )}

          {/* Foto de la repisa */}
          <div>
            <label className="block text-lg font-bold text-gray-700 dark:text-gray-300 mb-3">
              Foto de la Repisa <span className="text-red-500">*</span>
            </label>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-3">
              Fotografía del estante o repisa vacía
            </p>
            <SelectorImagen
              imagenActual={formData.imagen}
              onImagenSeleccionada={handleImagenSeleccionada}
            />
            {errores.imagen && (
              <p className="text-red-600 dark:text-red-400 text-base mt-2">{errores.imagen}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-lg font-bold text-gray-700 dark:text-gray-300 mb-3">
              Descripción de la Sección <span className="text-red-500">*</span>
            </label>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-2">
              Nombre de la sección o categoría de productos
            </p>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Ej: Sección aceites naturales, Estante de labiales, etc."
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 dark:text-white resize-none"
              rows="4"
            />
            {errores.descripcion && (
              <p className="text-red-600 dark:text-red-400 text-base mt-2">{errores.descripcion}</p>
            )}
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-lg font-bold text-gray-700 dark:text-gray-300 mb-3">
              Prioridad <span className="text-red-500">*</span>
            </label>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-3">
              ALTA: Productos de alta rotación | MEDIA/BAJA: Rotación menor
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

export default FormularioGrupoRepisa;
