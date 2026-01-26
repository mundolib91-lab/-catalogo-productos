/**
 * Configuración de la app Majoli
 *
 * Esta configuración define:
 * - Tienda: identificador único para filtrar datos
 * - Branding: colores, nombre, logo
 */

export const APP_CONFIG = {
  // Identificador de tienda (usado en queries)
  tienda: 'majoli',

  // Nombre de la tienda
  nombre: 'Majoli',
  nombre_corto: 'MJ',

  // Colores (Tailwind)
  color_principal: '#ec4899',    // Rosa (pink-500)
  color_secundario: '#f472b6',   // Rosa claro (pink-400)
  color_oscuro: '#db2777',       // Rosa oscuro (pink-600)

  // Icono/Emoji
  icono: '🌸',

  // Logo (ruta relativa a public/)
  logo: '/logo-majoli.png',

  // Configuración de stock
  campo_stock: 'stock_majoli',  // Campo en BD para esta tienda
};

export default APP_CONFIG;
