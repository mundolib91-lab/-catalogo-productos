import { useState, useEffect } from 'react';
import { subirImagen } from '../utils/imageUpload';
import Toast from './Toast';
import { useToast } from '../hooks/useToast';

function SelectorImagen({ imagenActual, onImagenCambiada, productId = null }) {
  const { toast, success, error: mostrarError, cerrarToast } = useToast();
  const [subiendo, setSubiendo] = useState(false);
  const [previsualizacion, setPrevisualizacion] = useState(imagenActual || '');

  // Sincronizar cuando imagenActual cambia desde fuera
  useEffect(() => {
    setPrevisualizacion(imagenActual || '');
  }, [imagenActual]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Previsualizar imagen localmente
    const reader = new FileReader();
    reader.onloadend = () => {
      setPrevisualizacion(reader.result);
    };
    reader.readAsDataURL(file);

    // Subir a Cloudinary
    setSubiendo(true);
    try {
      const urlPublica = await subirImagen(file, productId);
      onImagenCambiada(urlPublica);
      success('Imagen subida correctamente');
    } catch (error) {
      mostrarError('Error al subir imagen');
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
    <>
      {toast && (
        <Toast
          mensaje={toast.mensaje}
          tipo={toast.tipo}
          onClose={cerrarToast}
        />
      )}
      <div className="mb-4">
        <label className="block text-lg font-bold mb-2">Foto del Producto</label>

      {/* Previsualización */}
      <div className="w-full h-48 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
        {subiendo ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-lg text-gray-600">Subiendo imagen...</p>
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
            <p className="text-lg mt-2">Sin imagen</p>
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <label
          className={`${
            subiendo ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600'
          } text-white py-3 px-4 rounded-lg font-bold text-center cursor-pointer transition-colors`}
        >
          {subiendo ? '⏳ Subiendo...' : '📷 Tomar Foto'}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            disabled={subiendo}
            className="hidden"
          />
        </label>

        <label
          className={`${
            subiendo ? 'bg-gray-300' : 'bg-green-500 hover:bg-green-600'
          } text-white py-3 px-4 rounded-lg font-bold text-center cursor-pointer transition-colors`}
        >
          {subiendo ? '⏳ Subiendo...' : '🖼️ Desde Galería'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={subiendo}
            className="hidden"
          />
        </label>
      </div>

      {previsualizacion && (
        <button
          type="button"
          onClick={handleEliminar}
          disabled={subiendo}
          className="w-full bg-red-100 text-red-600 py-3 px-4 rounded-lg font-bold hover:bg-red-200 disabled:bg-gray-200"
        >
          🗑️ Quitar Imagen
        </button>
      )}

      <p className="text-base text-gray-500 mt-2">
        Formatos: JPG, PNG, WebP • Máx: 10MB
      </p>
    </div>
    </>
  );
}

export default SelectorImagen;
