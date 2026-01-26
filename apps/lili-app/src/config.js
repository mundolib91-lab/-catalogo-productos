/**
 * Configuración de la app Lili Cosméticos
 *
 * Esta configuración define:
 * - Tienda: identificador único para filtrar datos
 * - Branding: colores, nombre, logo
 */

export const APP_CONFIG = {
  // Identificador de tienda (usado en queries)
  tienda: 'lili',

  // Nombre de la tienda
  nombre: 'Lili Cosméticos',
  nombre_corto: 'LC',

  // Colores (Tailwind)
  color_principal: '#EC4899',    // Rosa (pink-500)
  color_secundario: '#F472B6',   // Rosa claro (pink-400)
  color_oscuro: '#DB2777',       // Rosa oscuro (pink-600)

  // Icono/Emoji
  icono: '🌸',

  // Logo (ruta relativa a public/)
  logo: '/logo-lili.png',

  // Configuración de stock
  campo_stock: 'stock_lili',  // Campo en BD para esta tienda
};

export default APP_CONFIG;
