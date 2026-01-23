import { createClient } from '@supabase/supabase-js';

// Credenciales con fallback
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://zpvtovhomaykvcowbtda.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwdnRvdmhvbWF5a3Zjb3didGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MzA2NjEsImV4cCI6MjA4NDUwNjY2MX0.QA8GbR7ppXYb-AwSka7WT7YoYkwzpCXeo3jhqMdjpT4';

// Debug
console.log('Supabase URL:', SUPABASE_URL);
console.log('Supabase Key exists:', !!SUPABASE_KEY);
console.log('Supabase Key first 30 chars:', SUPABASE_KEY?.substring(0, 30));

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BUCKET_NAME = 'productos-imagenes';

/**
 * Sube una imagen a Supabase Storage
 * @param {File} file - Archivo de imagen
 * @param {string} productId - ID del producto (opcional, para organizar)
 * @returns {Promise<string>} - URL pública de la imagen
 */
export const subirImagen = async (file, productId = null) => {
  try {
    // Debug: Verificar variables de entorno al subir
    console.log('=== DEBUG SUPABASE ===');
    console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
    console.log('Key preview:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 30) + '...');
    console.log('======================');

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
