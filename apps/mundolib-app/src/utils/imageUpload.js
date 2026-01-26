// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'ddkuwch5y';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'productos-mundolib';

/**
 * Sube una imagen a Cloudinary
 * @param {File} file - Archivo de imagen
 * @param {string} productId - ID del producto (opcional, no usado pero mantenido para compatibilidad)
 * @returns {Promise<string>} - URL pública de la imagen
 */
export const subirImagen = async (file, productId = null) => {
  try {
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen');
    }

    // Validar tamaño (máximo 10MB para Cloudinary)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      throw new Error('La imagen no debe superar 10MB');
    }

    // Preparar FormData para Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'productos');

    // Subir a Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error al subir imagen');
    }

    const data = await response.json();

    // Cloudinary devuelve la URL en data.secure_url
    return data.secure_url;
  } catch (error) {
    console.error('Error al subir imagen:', error);
    throw error;
  }
};

/**
 * Elimina una imagen de Cloudinary
 * @param {string} imageUrl - URL de la imagen
 * @returns {Promise<void>}
 */
export const eliminarImagen = async (imageUrl) => {
  try {
    // Para eliminar de Cloudinary necesitarías el public_id y hacer una llamada autenticada desde el backend
    // Por ahora dejamos esto vacío ya que las imágenes en Cloudinary no ocupan mucho espacio
    console.log('Eliminar imagen de Cloudinary requiere backend. URL:', imageUrl);
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
  }
};
