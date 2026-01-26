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
  color_principal: '#a855f7',    // Morado (purple-500)
  color_secundario: '#c084fc',   // Morado claro (purple-400)
  color_oscuro: '#9333ea',       // Morado oscuro (purple-600)

  // Icono/Emoji
  icono: '💜',

  // Logo (ruta relativa a public/)
  logo: '/logo-lili.png',

  // Configuración de stock
  campo_stock: 'stock_lili',  // Campo en BD para esta tienda
};

export default APP_CONFIG;
