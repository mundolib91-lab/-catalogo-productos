import { useState } from 'react';
import { subirImagen } from '../utils/imageUpload';

function SelectorImagen({ imagenActual, onImagenCambiada, productId = null }) {
  const [subiendo, setSubiendo] = useState(false);
  const [previsualizacion, setPrevisualizacion] = useState(imagenActual || '');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Previsualizar imagen localmente
    const reader = new FileReader();
    reader.onloadend = () => {
      setPrevisualizacion(reader.result);
    };
    reader.readAsDataURL(file);

    // Subir a Supabase
    setSubiendo(true);
    try {
      const urlPublica = await subirImagen(file, productId);
      onImagenCambiada(urlPublica);
      alert('✅ Imagen subida correctamente');
    } catch (error) {
      alert('❌ Error al subir imagen: ' + error.message);
      setPrevisualizacion(imagenActual || '');
    } finally {
      setSubiendo(false);
    }
  };

  const handleEliminar = () => {
    setPrevisualizacion('');
    onImagenCambiada('');
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-bold mb-2">Foto del Producto</label>

      {/* Previsualización */}
      <div className="w-full h-48 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
        {subiendo ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-sm text-gray-600">Subiendo imagen...</p>
          </div>
        ) : previsualizacion ? (
          <img
            src={previsualizacion}
            alt="Preview"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-center text-gray-400">
            <span className="text-5xl">📷</span>
            <p className="text-sm mt-2">Sin imagen</p>
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="grid grid-cols-2 gap-2">
        <label
          className={`${
            subiendo ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600'
          } text-white py-2 px-4 rounded-lg font-bold text-center cursor-pointer transition-colors`}
        >
          {subiendo ? '⏳ Subiendo...' : '📷 Seleccionar Imagen'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={subiendo}
            className="hidden"
          />
        </label>

        {previsualizacion && (
          <button
            type="button"
            onClick={handleEliminar}
            disabled={subiendo}
            className="bg-red-100 text-red-600 py-2 px-4 rounded-lg font-bold hover:bg-red-200 disabled:bg-gray-200"
          >
            🗑️ Quitar
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Formatos: JPG, PNG, WebP • Máx: 5MB
      </p>
    </div>
  );
}

export default SelectorImagen;
