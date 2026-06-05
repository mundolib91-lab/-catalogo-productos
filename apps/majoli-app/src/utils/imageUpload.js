import imageCompression from 'browser-image-compression';

const API_URL = import.meta.env.VITE_API_URL || 'https://catalogo-productos-backend.onrender.com/api';

export const subirImagen = async (file) => {
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen');
  }

  // Comprimir antes de subir (fotos de celular pasan de 4MB a ~150KB)
  const comprimida = await imageCompression(file, {
    maxSizeMB: 0.3,          // máximo 300KB
    maxWidthOrHeight: 1200,  // máximo 1200px en cualquier lado
    useWebWorker: true,
  });

  const formData = new FormData();
  formData.append('imagen', comprimida, file.name);

  const response = await fetch(`${API_URL}/upload/imagen`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al subir imagen');
  }

  const data = await response.json();
  return data.url;
};

export const eliminarImagen = async (imageUrl) => {
  console.log('Eliminar imagen:', imageUrl);
};
