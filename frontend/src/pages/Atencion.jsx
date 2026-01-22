import { useState, useEffect } from 'react';
import { getProductosPorEstado, reportarFaltante as reportarFaltanteAPI } from '../utils/api';
import { useTheme } from '../hooks/useTheme';
import DetalleProducto from '../components/DetalleProducto';
import UsosProducto from '../components/UsosProducto';

function Atencion({ menuHamburguesa }) {
  const { theme, toggleTheme } = useTheme();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // Filtros
  const [filtroMarca, setFiltroMarca] = useState(false);
  const [filtroProveedor, setFiltroProveedor] = useState(false);
  const [soloFaltantes, setSoloFaltantes] = useState(false);

  // Modales
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [productoUsos, setProductoUsos] = useState(null);

  useEffect(() => {
    cargarProductos();
  }, [busqueda, soloFaltantes]);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const response = await getProductosPorEstado('existente', {
        search: busqueda
      });

      let productosData = response.data || [];

      // Filtrar productos que tengan los datos mínimos necesarios para vender
      productosData = productosData.filter(p => {
        const tieneImagen = p.imagen && p.imagen.trim() !== '';
        const tienePrecioVenta = p.precio_venta_unidad != null && p.precio_venta_unidad > 0;
        const tienePrecioCompra = p.precio_compra_unidad != null && p.precio_compra_unidad > 0;
        const tieneDescripcion = p.descripcion && p.descripcion.trim() !== '';

        return tieneImagen && tienePrecioVenta && tienePrecioCompra && tieneDescripcion;
      });

      // Filtrar solo faltantes si está activado
      if (soloFaltantes) {
        productosData = productosData.filter(p => p.faltante_reportado === true);
      }

      setProductos(productosData);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const reportarFaltante = async (productoId) => {
    try {
      await reportarFaltanteAPI(productoId);
      alert('✅ Faltante reportado correctamente');
      cargarProductos();
    } catch (error) {
      alert('❌ Error al reportar faltante: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-blue-500 dark:bg-blue-700 text-white p-4 shadow-lg relative">
        {/* Menú hamburguesa (solo en móvil) */}
        {menuHamburguesa}

        <h1 className="text-lg md:text-xl font-bold text-center">
          Atención al Cliente
        </h1>

        {/* Botón de tema */}
        <button
          onClick={toggleTheme}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-blue-600 dark:hover:bg-blue-800 transition-colors"
          aria-label="Cambiar tema"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>

      {/* Buscador */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <input
          type="text"
          placeholder="🔍 Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full px-6 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Filtros */}
      <div className="max-w-6xl mx-auto px-4 mt-4">
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-sm text-gray-600 dark:text-gray-400">Filtros:</span>

          <button
            onClick={() => setFiltroMarca(!filtroMarca)}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              filtroMarca
                ? 'bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            Por Marca
          </button>

          <button
            onClick={() => setFiltroProveedor(!filtroProveedor)}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              filtroProveedor
                ? 'bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            Por Proveedor
          </button>

          <button
            onClick={() => setSoloFaltantes(!soloFaltantes)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              soloFaltantes
                ? 'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            Solo Faltantes
          </button>
        </div>
      </div>

      {/* Lista de Productos */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando productos...</p>
          </div>
        ) : productos.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
            <p className="text-2xl">📦</p>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              {soloFaltantes ? 'No hay productos faltantes' : 'No hay productos disponibles'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productos.map((producto) => (
              <ProductoCard
                key={producto.id}
                producto={producto}
                onVerDetalles={() => setProductoDetalle(producto)}
                onVerUsos={() => setProductoUsos(producto)}
                onReportarFaltante={() => reportarFaltante(producto.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal Detalle Producto */}
      {productoDetalle && (
        <DetalleProducto
          producto={productoDetalle}
          onCerrar={() => setProductoDetalle(null)}
        />
      )}

      {/* Pantalla Usos */}
      {productoUsos && (
        <UsosProducto
          producto={productoUsos}
          onVolver={() => setProductoUsos(null)}
        />
      )}
    </div>
  );
}

// Componente Card de Producto - OPTIMIZADO
function ProductoCard({ producto, onVerDetalles, onVerUsos, onReportarFaltante }) {
  const tienePreciosMayor = producto.precios_por_mayor && producto.precios_por_mayor.length > 0;
  const yaReportado = producto.faltante_reportado === true;

  return (
    <div className={`rounded-xl border-2 p-2 shadow-md relative ${
      yaReportado
        ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
      {/* Badge faltante reportado */}
      {yaReportado && (
        <div className="absolute top-1 right-1 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 px-2 py-0.5 rounded-full text-xs font-bold z-10">
          Faltante
        </div>
      )}

      {/* Imagen más grande */}
      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2 flex items-center justify-center overflow-hidden relative">
        {producto.imagen ? (
          <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl text-gray-400 dark:text-gray-500">📦</span>
        )}

        {/* Ícono precios por mayor */}
        {tienePreciosMayor && (
          <div className="absolute top-1 right-1 bg-blue-500 dark:bg-blue-600 rounded-full p-1 text-xl">
            📦
          </div>
        )}
      </div>

      {/* Info compacta */}
      <div className="px-2">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1 line-clamp-2 font-medium">
          {producto.descripcion}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
          {producto.marca || 'Sin marca'}
        </p>

        {/* Precio destacado más compacto */}
        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg px-3 py-1.5 mb-2">
          <p className="text-center text-lg font-bold text-green-700 dark:text-green-400">
            Bs {producto.precio_venta_unidad?.toFixed(2) || '0.00'}
          </p>
        </div>

        {/* Botón Ver Usos compacto */}
        <button
          onClick={onVerUsos}
          className="w-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 py-1.5 rounded-lg mb-2 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm"
        >
          Ver Usos
        </button>

        {/* Botones de acción más pequeños */}
        <div className="grid grid-cols-2 gap-1.5 mb-1">
          <button
            onClick={onVerDetalles}
            className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 py-1.5 rounded-lg font-bold hover:bg-blue-200 dark:hover:bg-blue-900/60 text-xs"
          >
            Ver Detalles
          </button>

          <button
            onClick={onReportarFaltante}
            disabled={yaReportado}
            className={`py-1.5 rounded-lg font-bold text-xs transition-colors ${
              yaReportado
                ? 'bg-red-800 dark:bg-red-900 text-white cursor-not-allowed opacity-75'
                : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60'
            }`}
          >
            {yaReportado ? 'Reportado' : 'Faltante'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Atencion;
