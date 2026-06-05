const API_URL = import.meta.env.VITE_API_URL || 'https://catalogo-productos-backend.onrender.com/api';

export const subirImagen = async (file) => {
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('La imagen no debe superar 10MB');
  }

  const formData = new FormData();
  formData.append('imagen', file);

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
