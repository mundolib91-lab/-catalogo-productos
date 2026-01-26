/**
 * Configuración de la app Mundo Lib
 *
 * Esta configuración define:
 * - Tienda: identificador único para filtrar datos
 * - Branding: colores, nombre, logo
 */

export const APP_CONFIG = {
  // Identificador de tienda (usado en queries)
  tienda: 'mundo_lib',

  // Nombre de la tienda
  nombre: 'Mundo Lib',
  nombre_corto: 'ML',

  // Colores (Tailwind)
  color_principal: '#f59e0b',    // Amarillo (amber-500)
  color_secundario: '#fbbf24',   // Amarillo claro (amber-400)
  color_oscuro: '#d97706',       // Amarillo oscuro (amber-600)

  // Icono/Emoji
  icono: '🟡',

  // Logo (ruta relativa a public/)
  logo: '/logo-mundolib.png',

  // Configuración de stock
  campo_stock: 'stock_mundo_lib',  // Campo en BD para esta tienda
};

export default APP_CONFIG;
