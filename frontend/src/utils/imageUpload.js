import { createClient } from '@supabase/supabase-js';

// Debug: Verificar variables de entorno
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('Supabase Key first 20 chars:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20));

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const BUCKET_NAME = 'productos-imagenes';

/**
 * Sube una imagen a Supabase Storage
 * @param {File} file - Archivo de imagen
 * @param {string} productId - ID del producto (opcional, para organizar)
 * @returns {Promise<string>} - URL pública de la imagen
 */
export const subirImagen = async (file, productId = null) => {
  try {
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen');
    }

    // Validar tamaño (máximo 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      throw new Error('La imagen no debe superar 5MB');
    }

    // Generar nombre único
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop();
    const fileName = productId
      ? `${productId}/${timestamp}_${randomString}.${extension}`
      : `${timestamp}_${randomString}.${extension}`;

    // Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error al subir imagen:', error);
    throw error;
  }
};

/**
 * Elimina una imagen de Supabase Storage
 * @param {string} imageUrl - URL de la imagen
 * @returns {Promise<void>}
 */
export const eliminarImagen = async (imageUrl) => {
  try {
    // Extraer el path del archivo de la URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split(`${BUCKET_NAME}/`);
    if (pathParts.length < 2) return;

    const filePath = pathParts[1];

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) throw error;
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    // No lanzamos error para no bloquear otras operaciones
  }
};
