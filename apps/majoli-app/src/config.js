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
  color_principal: '#10B981',    // Verde (emerald-500)
  color_secundario: '#34D399',   // Verde claro (emerald-400)
  color_oscuro: '#059669',       // Verde oscuro (emerald-600)

  // Icono/Emoji
  icono: '🟢',

  // Logo (ruta relativa a public/)
  logo: '/logo-majoli.png',

  // Configuración de stock
  campo_stock: 'stock_majoli',  // Campo en BD para esta tienda
};

export default APP_CONFIG;
