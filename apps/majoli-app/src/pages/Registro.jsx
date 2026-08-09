import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { createProductoRapido, updateProducto } from '../utils/api';
import { getProductosPorEstadoDirecto } from '../utils/supabase';
import FormularioCompleto from './FormularioCompleto';
import VerEditarProducto from './VerEditarProducto';
import SelectorImagen from '../components/SelectorImagen';
import { useTheme } from '../hooks/useTheme';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import MenuRegistro from '../components/MenuRegistro';
import FormularioLoteProveedor from '../components/FormularioLoteProveedor';
import FormularioLoteMarca from '../components/FormularioLoteMarca';
import APP_CONFIG from '../config';

function Registro({ menuHamburguesa }) {
  const { theme, toggleTheme } = useTheme();
  const { toast, success, error: mostrarError, cerrarToast } = useToast();
  const [pestanaActiva, setPestanaActiva] = useState('existente');
  const [todosLosProductos, setTodosLosProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Nuevos estados para registro por lotes
  const [menuRegistroAbierto, setMenuRegistroAbierto] = useState(false);
  const [formularioLoteProveedorAbierto, setFormularioLoteProveedorAbierto] = useState(false);
  const [formularioLoteMarcaAbierto, setFormularioLoteMarcaAbierto] = useState(false);

  // Filtros
  const [filtroProveedor, setFiltroProveedor] = useState('');
  const [filtroMarca, setFiltroMarca] = useState('');
  const [filtroOrden, setFiltroOrden] = useState('recientes'); // 'recientes' o 'antiguos'
  const [proveedores, setProveedores] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [totalProductos, setTotalProductos] = useState(0);

  // Cargar productos según pestaña activa
  useEffect(() => {
    cargarProductos();
  }, [pestanaActiva]);

  // Cargar proveedores y marcas al montar
  useEffect(() => {
    cargarProveedores();
    cargarMarcas();
  }, []);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const response = await getProductosPorEstadoDirecto(pestanaActiva, {
        tienda: APP_CONFIG.tienda
      });

      const productosData = response.data || [];
      setTodosLosProductos(productosData);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarProveedores = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/productos/proveedores`);
      const data = await response.json();
      if (data.success) {
        setProveedores(data.data);
      }
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    }
  };

  const cargarMarcas = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/productos/marcas`);
      const data = await response.json();
      if (data.success) {
        setMarcas(data.data);
      }
    } catch (error) {
      console.error('Error al cargar marcas:', error);
    }
  };

  const limpiarFiltros = () => {
    setFiltroProveedor('');
    setFiltroMarca('');
    setFiltroOrden('recientes');
  };

  const productosFiltrados = useMemo(() => {
    let lista = todosLosProductos;

    if (busqueda.trim()) {
      const palabras = busqueda.trim().split(/\s+/).filter(Boolean);
      let idsValidos = null;

      for (const palabra of palabras) {
        const fuse = new Fuse(lista, {
          keys: ['descripcion', 'nombre', 'marca', 'proveedor'],
          threshold: 0.4,
          minMatchCharLength: 2,
        });
        const ids = new Set(fuse.search(palabra).map(r => r.item.id));
        idsValidos = idsValidos === null ? ids : new Set([...idsValidos].filter(id => ids.has(id)));
      }

      lista = lista.filter(p => idsValidos?.has(p.id));
    }

    if (filtroProveedor) lista = lista.filter(p => p.proveedor === filtroProveedor);
    if (filtroMarca) lista = lista.filter(p => p.marca === filtroMarca);

    const resultado = [...lista];
    if (filtroOrden === 'recientes') {
      resultado.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      resultado.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    return resultado;
  }, [todosLosProductos, busqueda, filtroProveedor, filtroMarca, filtroOrden]);

  const handleSeleccionarTipoRegistro = (tipo) => {
    setMenuRegistroAbierto(false);

    if (tipo === 'individual') {
      setMostrarFormulario(true);
    } else if (tipo === 'proveedor') {
      setFormularioLoteProveedorAbierto(true);
    } else if (tipo === 'marca') {
      setFormularioLoteMarcaAbierto(true);
    }
  };

  const handleSubmitLote = async (dataLote) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/productos/lote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: dataLote.proveedor ? 'proveedor' : 'marca',
          proveedor: dataLote.proveedor,
          marca: dataLote.marca,
          productos: dataLote.productos,
          tienda: APP_CONFIG.tienda,
          ubicacion: dataLote.ubicacion || 'tienda'
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar lote');
      }

      const result = await response.json();
      success(`${result.data.length} productos guardados correctamente`);
      cargarProductos();
    } catch (error) {
      console.error('Error:', error);
      mostrarError('Error al guardar lote de productos');
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-amber-500 dark:bg-amber-700 text-white p-4 shadow-lg relative">
        {/* Menú hamburguesa (solo en móvil) */}
        {menuHamburguesa}

        <h1 className="text-2xl md:text-2xl font-bold text-center">
          REGISTRO DE PRODUCTOS
        </h1>

        {/* Botón de tema */}
        <button
          onClick={toggleTheme}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-amber-600 dark:hover:bg-amber-800 transition-colors"
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
          className="w-full px-6 py-4 text-2xl border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Pestañas */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex gap-2 border-b-2 border-gray-200 dark:border-gray-700">
          {/* Pestaña Existentes */}
          <button
            onClick={() => setPestanaActiva('existente')}
            className={`flex-1 py-4 px-4 font-bold text-lg md:text-2xl transition-all ${
              pestanaActiva === 'existente'
                ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 border-b-4 border-green-600 dark:border-green-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            ✅ Productos Existentes
          </button>

          {/* Pestaña En Proceso */}
          <button
            onClick={() => setPestanaActiva('proceso')}
            className={`flex-1 py-4 px-4 font-bold text-lg md:text-2xl transition-all ${
              pestanaActiva === 'proceso'
                ? 'bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 border-b-4 border-amber-600 dark:border-amber-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            ⏳ En Proceso
          </button>

          {/* Pestaña Completados */}
          <button
            onClick={() => setPestanaActiva('completado')}
            className={`flex-1 py-4 px-4 font-bold text-lg md:text-2xl transition-all ${
              pestanaActiva === 'completado'
                ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border-b-4 border-purple-600 dark:border-purple-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            🎉 Completados
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-6xl mx-auto px-4 mt-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              🔍 Filtros
            </h3>
            {(filtroProveedor || filtroMarca || filtroOrden !== 'recientes') && (
              <button
                onClick={limpiarFiltros}
                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
              >
                ✕ Limpiar todos
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Filtro por Proveedor */}
            {proveedores.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Proveedor
                </label>
                <select
                  value={filtroProveedor}
                  onChange={(e) => setFiltroProveedor(e.target.value)}
                  className="w-full px-3 py-2 text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="">📦 Todos</option>
                  {proveedores.map((prov, index) => (
                    <option key={index} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Filtro por Marca */}
            {marcas.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Marca
                </label>
                <select
                  value={filtroMarca}
                  onChange={(e) => setFiltroMarca(e.target.value)}
                  className="w-full px-3 py-2 text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="">🏷️ Todas</option>
                  {marcas.map((marca, index) => (
                    <option key={index} value={marca}>
                      {marca}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Filtro por Orden */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Ordenar por
              </label>
              <select
                value={filtroOrden}
                onChange={(e) => setFiltroOrden(e.target.value)}
                className="w-full px-3 py-2 text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="recientes">📅 Más recientes primero</option>
                <option value="antiguos">🕐 Más antiguos primero</option>
              </select>
            </div>
          </div>

          {/* Contador de resultados */}
          {!loading && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {(filtroProveedor || filtroMarca || busqueda.trim())
                  ? <>Mostrando <span className="font-bold text-gray-800 dark:text-white">{productosFiltrados.length}</span> de <span className="font-bold text-gray-800 dark:text-white">{todosLosProductos.length}</span> producto{todosLosProductos.length !== 1 ? 's' : ''}</>
                  : <>{todosLosProductos.length} producto{todosLosProductos.length !== 1 ? 's' : ''}</>
                }
                {filtroProveedor && <span> • Proveedor: <span className="font-semibold">{filtroProveedor}</span></span>}
                {filtroMarca && <span> • Marca: <span className="font-semibold">{filtroMarca}</span></span>}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contenido según pestaña */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando productos...</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
            <p className="text-3xl">📦</p>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              {busqueda.trim() ? 'No se encontraron productos con esa búsqueda' : 'No hay productos en esta sección'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productosFiltrados.map((producto) => (
              <ProductoCard
                key={producto.id}
                producto={producto}
                tipo={pestanaActiva}
                onActualizar={cargarProductos}
              />
            ))}
          </div>
        )}
      </div>

      {/* Botón flotante para agregar */}
      <button
        onClick={() => setMenuRegistroAbierto(true)}
        className={`fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl text-white text-3xl font-bold flex items-center justify-center transition-transform hover:scale-110 z-30 ${
          pestanaActiva === 'existente'
            ? 'bg-green-500'
            : pestanaActiva === 'proceso'
            ? 'bg-amber-500'
            : 'bg-purple-500'
        }`}
      >
        +
      </button>

      {/* Menú de tipo de registro */}
      <MenuRegistro
        isOpen={menuRegistroAbierto}
        onClose={() => setMenuRegistroAbierto(false)}
        onSelectTipo={handleSeleccionarTipoRegistro}
      />

      {/* Modal formulario individual */}
      {mostrarFormulario && (
        <FormularioRapido
          onCerrar={() => setMostrarFormulario(false)}
          onGuardar={() => {
            setMostrarFormulario(false);
            cargarProductos();
          }}
        />
      )}

      {/* Formulario Lote por Proveedor */}
      <FormularioLoteProveedor
        isOpen={formularioLoteProveedorAbierto}
        onClose={() => setFormularioLoteProveedorAbierto(false)}
        onSubmitLote={handleSubmitLote}
      />

      {/* Formulario Lote por Marca */}
      <FormularioLoteMarca
        isOpen={formularioLoteMarcaAbierto}
        onClose={() => setFormularioLoteMarcaAbierto(false)}
        onSubmitLote={handleSubmitLote}
      />

      {/* Toast de notificaciones */}
      {toast && (
        <Toast
          mensaje={toast.mensaje}
          tipo={toast.tipo}
          onClose={cerrarToast}
        />
      )}
    </div>
  );
}

const formatFechaIngreso = (fecha) => {
  if (!fecha) return null;
  return new Date(fecha).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Componente Card de Producto
function ProductoCard({ producto, tipo, onActualizar }) {
  const colorBorde =
    tipo === 'existente' ? 'border-green-500 dark:border-green-400' :
    tipo === 'proceso' ? 'border-amber-500 dark:border-amber-400' :
    'border-purple-500 dark:border-purple-400';

  const colorFondo =
    tipo === 'existente' ? 'bg-green-50 dark:bg-green-900/20' :
    tipo === 'proceso' ? 'bg-amber-50 dark:bg-amber-900/20' :
    'bg-purple-50 dark:bg-purple-900/20';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border-2 ${colorBorde} p-4 shadow-md`}>
      {/* Imagen */}
      <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
        {producto.imagen ? (
          <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl text-gray-400 dark:text-gray-500">📦</span>
        )}
      </div>

      {/* Info */}
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-1 line-clamp-2 min-h-[2.5rem]">
        {producto.descripcion || producto.nombre || 'Sin descripción'}
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 min-h-[1rem]" title="Fecha del último ingreso de stock">
        {formatFechaIngreso(producto.fecha_ingreso) ? `📅 Ingreso: ${formatFechaIngreso(producto.fecha_ingreso)}` : ''}
      </p>

      {tipo === 'existente' && (
        <ProductoExistente producto={producto} onActualizar={onActualizar} />
      )}

      {tipo === 'proceso' && (
        <ProductoEnProceso producto={producto} onActualizar={onActualizar} colorFondo={colorFondo} />
      )}

      {tipo === 'completado' && (
        <ProductoCompletado producto={producto} onActualizar={onActualizar} colorFondo={colorFondo} />
      )}
    </div>
  );
}

// Componente para productos existentes
function ProductoExistente({ producto, onActualizar }) {
  const [mostrarVerEditar, setMostrarVerEditar] = useState(false);
  const [mostrarAgregarStock, setMostrarAgregarStock] = useState(false);

  return (
    <>
      <div className="flex justify-between text-lg mb-2">
        <span className="text-gray-600 dark:text-gray-400">Compra:</span>
        <span className="font-bold dark:text-white">Bs {producto.precio_compra_unidad?.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-lg mb-2">
        <span className="text-gray-600 dark:text-gray-400">Venta:</span>
        <span className="font-bold text-green-600 dark:text-green-400">Bs {producto.precio_venta_unidad?.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-lg mb-3">
        <span className="text-gray-600 dark:text-gray-400">Stock:</span>
        <span className="font-bold text-blue-600 dark:text-blue-400">{producto[APP_CONFIG.campo_stock] || producto.cantidad_ingresada || 0} unid</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setMostrarVerEditar(true)}
          className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 py-2 rounded-lg font-bold hover:bg-green-200 dark:hover:bg-green-900/60 text-lg"
        >
          Ver / Editar
        </button>
        <button
          onClick={() => setMostrarAgregarStock(true)}
          className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 py-2 rounded-lg font-bold hover:bg-blue-200 dark:hover:bg-blue-900/60 text-lg"
        >
          + Stock
        </button>
      </div>

      {mostrarVerEditar && (
        <VerEditarProducto
          productoId={producto.id}
          onCerrar={() => setMostrarVerEditar(false)}
          onGuardar={() => {
            setMostrarVerEditar(false);
            onActualizar();
          }}
        />
      )}

      {mostrarAgregarStock && (
        <AgregarStock
          producto={producto}
          onCerrar={() => setMostrarAgregarStock(false)}
          onGuardar={() => {
            setMostrarAgregarStock(false);
            onActualizar();
          }}
        />
      )}
    </>
  );
}

// Componente para productos en proceso
function ProductoEnProceso({ producto, onActualizar, colorFondo }) {
  const { toast, success, error: mostrarError, cerrarToast } = useToast();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarConfirmarEliminar, setMostrarConfirmarEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const handleEliminar = async () => {
    setEliminando(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/productos/${producto.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar producto');
      }

      success('Producto eliminado correctamente');
      setTimeout(() => {
        onActualizar();
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      mostrarError('Error al eliminar producto');
    } finally {
      setEliminando(false);
      setMostrarConfirmarEliminar(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast
          mensaje={toast.mensaje}
          tipo={toast.tipo}
          onClose={cerrarToast}
        />
      )}
      <div className={`${colorFondo} p-2 rounded mb-2 dark:text-white`}>
        <p className="text-lg">Cantidad: <span className="font-bold">{producto[APP_CONFIG.campo_stock] || producto.cantidad_ingresada || 0} unid</span></p>
      </div>
      <div className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-base p-2 rounded mb-3">
        ⚠️ FALTAN: Precios y datos completos
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setMostrarFormulario(true)}
          className="bg-amber-500 dark:bg-amber-600 text-white py-2 rounded-lg font-bold hover:bg-amber-600 dark:hover:bg-amber-700 text-base"
        >
          Completar
        </button>
        <button
          onClick={() => setMostrarConfirmarEliminar(true)}
          className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 py-2 rounded-lg font-bold hover:bg-red-200 dark:hover:bg-red-900/60 text-base"
        >
          🗑️ Eliminar
        </button>
      </div>

      {mostrarFormulario && (
        <FormularioCompleto
          productoId={producto.id}
          onCerrar={() => setMostrarFormulario(false)}
          onGuardar={() => {
            setMostrarFormulario(false);
            onActualizar();
          }}
        />
      )}

      {mostrarConfirmarEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              ⚠️ Confirmar Eliminación
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro de eliminar este producto?
              <br />
              <span className="font-bold text-gray-800 dark:text-white">
                {producto.descripcion || producto.nombre || 'Sin descripción'}
              </span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMostrarConfirmarEliminar(false)}
                disabled={eliminando}
                className="py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                disabled={eliminando}
                className="py-3 bg-red-600 dark:bg-red-700 text-white rounded-lg font-bold hover:bg-red-700 dark:hover:bg-red-800 disabled:opacity-50"
              >
                {eliminando ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Componente para productos completados
function ProductoCompletado({ producto, onActualizar, colorFondo }) {
  const { toast, success, error: mostrarError, cerrarToast } = useToast();
  const [mostrarVerEditar, setMostrarVerEditar] = useState(false);
  const [moviendoAExistente, setMoviendoAExistente] = useState(false);

  const handlePasarAExistente = async () => {
    setMoviendoAExistente(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/productos/${producto.id}/pasar-existente`, {
        method: 'PUT'
      });

      if (!response.ok) {
        throw new Error('Error al mover a existente');
      }

      success('Producto movido a Existente correctamente');
      setTimeout(() => {
        onActualizar();
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      mostrarError('Error al mover producto');
    } finally {
      setMoviendoAExistente(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast
          mensaje={toast.mensaje}
          tipo={toast.tipo}
          onClose={cerrarToast}
        />
      )}
      <div className="flex justify-between text-lg mb-2">
        <span className="text-gray-600 dark:text-gray-400">Compra:</span>
        <span className="font-bold dark:text-white">Bs {producto.precio_compra_unidad?.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-lg mb-2">
        <span className="text-gray-600 dark:text-gray-400">Venta:</span>
        <span className="font-bold text-green-600 dark:text-green-400">Bs {producto.precio_venta_unidad?.toFixed(2)}</span>
      </div>
      {(() => {
        const precioCompra = producto.precio_compra_unidad || 0;
        const precioVenta = producto.precio_venta_unidad || 0;
        const ganancia = precioVenta - precioCompra;
        const porcentaje = precioCompra > 0 ? ((ganancia / precioCompra) * 100) : 0;
        return (
          <div className="flex justify-between text-lg mb-2">
            <span className="text-gray-600 dark:text-gray-400">Ganancia:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              Bs {ganancia.toFixed(2)} ({porcentaje.toFixed(1)}%)
            </span>
          </div>
        );
      })()}
      <div className="flex justify-between text-lg mb-3">
        <span className="text-gray-600 dark:text-gray-400">Stock:</span>
        <span className="font-bold text-blue-600 dark:text-blue-400">{producto[APP_CONFIG.campo_stock] || producto.cantidad_ingresada || 0} unid</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setMostrarVerEditar(true)}
          className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 py-2 rounded-lg font-bold hover:bg-purple-200 dark:hover:bg-purple-900/60 text-base"
        >
          Ver Detalles
        </button>
        <button
          onClick={handlePasarAExistente}
          disabled={moviendoAExistente}
          className="bg-green-500 dark:bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-600 dark:hover:bg-green-700 disabled:opacity-50 text-base"
        >
          {moviendoAExistente ? 'Verificando...' : 'Verificar OK ✓'}
        </button>
      </div>

      {mostrarVerEditar && (
        <VerEditarProducto
          productoId={producto.id}
          onCerrar={() => setMostrarVerEditar(false)}
          onGuardar={() => {
            setMostrarVerEditar(false);
            onActualizar();
          }}
        />
      )}
    </>
  );
}

// Componente Formulario Rápido
function FormularioRapido({ onCerrar, onGuardar }) {
  const { toast, success, error: mostrarError, cerrarToast } = useToast();
  const [formData, setFormData] = useState({
    descripcion: '',
    cantidad_ingresada: '',
    imagen: '',
    precio_compra_unidad: '',
    precio_venta_unidad: ''
  });
  const [ubicacion, setUbicacion] = useState('tienda');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cantidad = formData.cantidad_ingresada ? parseInt(formData.cantidad_ingresada) : 0;
      const dataToSend = {
        descripcion: formData.descripcion,
        imagen: formData.imagen,
        tienda_origen: APP_CONFIG.tienda,
        stock_deposito: ubicacion === 'deposito' ? cantidad : 0,
        [APP_CONFIG.campo_stock]: ubicacion === 'tienda' ? cantidad : 0
      };

      // Agregar precios si fueron ingresados
      if (formData.precio_compra_unidad) {
        dataToSend.precio_compra_unidad = parseFloat(formData.precio_compra_unidad);
      }
      if (formData.precio_venta_unidad) {
        dataToSend.precio_venta_unidad = parseFloat(formData.precio_venta_unidad);
      }

      await createProductoRapido(dataToSend);

      // Mensaje según si tiene precios o no
      const tienePrecio = formData.precio_compra_unidad && formData.precio_venta_unidad;
      const mensaje = tienePrecio ? 'Producto registrado como completado' : 'Producto registrado en proceso';
      success(mensaje);
      setTimeout(() => onGuardar(), 1500);
    } catch (error) {
      mostrarError('Error al registrar producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast
          mensaje={toast.mensaje}
          tipo={toast.tipo}
          onClose={cerrarToast}
        />
      )}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-amber-600">➕ Registro Rápido</h2>
          <button onClick={onCerrar} className="text-3xl text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Selector de Imagen */}
          <SelectorImagen
            imagenActual={formData.imagen}
            onImagenCambiada={(url) => setFormData({ ...formData, imagen: url })}
          />

          <div className="mb-4">
            <label className="block text-lg font-bold mb-2">Descripción del Producto *</label>
            <input
              type="text"
              required
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              placeholder="Ej: Bolígrafo tinta azul"
            />
          </div>

          <div className="mb-4">
            <label className="block text-lg font-bold mb-2">Cantidad Ingresada</label>
            <input
              type="number"
              value={formData.cantidad_ingresada}
              onChange={(e) => setFormData({ ...formData, cantidad_ingresada: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              placeholder="120"
            />
          </div>

          <div className="mb-4">
            <label className="block text-lg font-bold mb-2">Ubicacion del stock</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUbicacion('tienda')}
                className={`py-3 rounded-xl font-bold text-base border-2 transition-colors ${
                  ubicacion === 'tienda'
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-amber-400'
                }`}
              >
                Tienda ({APP_CONFIG.nombre_corto})
              </button>
              <button
                type="button"
                onClick={() => setUbicacion('deposito')}
                className={`py-3 rounded-xl font-bold text-base border-2 transition-colors ${
                  ubicacion === 'deposito'
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-orange-400'
                }`}
              >
                Deposito
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-lg font-bold mb-2">Precio de Compra (Bs)</label>
            <input
              type="number"
              step="0.01"
              value={formData.precio_compra_unidad}
              onChange={(e) => setFormData({ ...formData, precio_compra_unidad: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              placeholder="2.50"
            />
          </div>

          <div className="mb-4">
            <label className="block text-lg font-bold mb-2">Precio de Venta (Bs)</label>
            <input
              type="number"
              step="0.01"
              value={formData.precio_venta_unidad}
              onChange={(e) => setFormData({ ...formData, precio_venta_unidad: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              placeholder="5.00"
            />
          </div>

          {/* Cálculo en tiempo real de ganancia */}
          {formData.precio_compra_unidad && formData.precio_venta_unidad && (() => {
            const precioCompra = parseFloat(formData.precio_compra_unidad) || 0;
            const precioVenta = parseFloat(formData.precio_venta_unidad) || 0;
            const ganancia = precioVenta - precioCompra;
            const porcentaje = precioCompra > 0 ? ((ganancia / precioCompra) * 100) : 0;
            const esGanancia = ganancia >= 0;

            return (
              <div className={`mb-6 p-4 rounded-lg border-2 ${
                esGanancia ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'
              }`}>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Ganancia por unidad</p>
                    <p className={`text-xl font-bold ${esGanancia ? 'text-green-700' : 'text-red-700'}`}>
                      {esGanancia ? '+' : ''} Bs {ganancia.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Porcentaje</p>
                    <p className={`text-xl font-bold ${esGanancia ? 'text-green-700' : 'text-red-700'}`}>
                      {esGanancia ? '+' : ''} {porcentaje.toFixed(1)}%
                    </p>
                  </div>
                </div>
                {!esGanancia && (
                  <p className="text-center text-sm text-red-600 mt-2 font-semibold">
                    ⚠️ Estás vendiendo con pérdida
                  </p>
                )}
              </div>
            );
          })()}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 text-white py-4 rounded-lg font-bold text-2xl hover:bg-amber-600 disabled:bg-gray-400"
          >
            {loading ? '⏳ Guardando...' : '💾 Guardar Producto'}
          </button>
        </form>
      </div>
    </div>
    </>
  );
}

// Componente Agregar Stock
function AgregarStock({ producto, onCerrar, onGuardar }) {
  const { toast, success, error: mostrarError, warning, cerrarToast } = useToast();
  const [cantidadAgregar, setCantidadAgregar] = useState('');
  const [loading, setLoading] = useState(false);

  // Obtener stock actual de la tienda
  const stockActual = producto[APP_CONFIG.campo_stock] || producto.cantidad_ingresada || 0;
  const nuevoStock = stockActual + (parseInt(cantidadAgregar) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cantidad = parseInt(cantidadAgregar);
    if (!cantidad || cantidad <= 0) {
      warning('Ingresa una cantidad válida mayor a 0');
      return;
    }

    setLoading(true);
    try {
      await updateProducto(producto.id, {
        [APP_CONFIG.campo_stock]: nuevoStock
      });
      success(`Stock actualizado: +${cantidad} unidades`);
      setTimeout(() => onGuardar(), 1500);
    } catch (error) {
      mostrarError('Error al actualizar stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast
          mensaje={toast.mensaje}
          tipo={toast.tipo}
          onClose={cerrarToast}
        />
      )}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-blue-600">📦 Agregar Stock</h2>
          <button onClick={onCerrar} className="text-3xl text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Información del producto */}
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="font-bold text-2xl mb-2">{producto.nombre || producto.descripcion}</p>
            <div className="flex justify-between text-lg">
              <span className="text-gray-600">Stock actual:</span>
              <span className="font-bold text-blue-600">{stockActual} unidades</span>
            </div>
          </div>

          {/* Cantidad a agregar */}
          <div className="mb-4">
            <label className="block text-lg font-bold mb-2">Cantidad a agregar *</label>
            <input
              type="number"
              required
              min="1"
              value={cantidadAgregar}
              onChange={(e) => setCantidadAgregar(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-2xl font-bold text-center"
              placeholder="0"
              autoFocus
            />
          </div>

          {/* Nuevo stock */}
          {cantidadAgregar && parseInt(cantidadAgregar) > 0 && (
            <div className="bg-green-50 p-4 rounded-lg mb-4 border-2 border-green-300">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-bold">Nuevo stock:</span>
                <span className="text-3xl font-bold text-green-600">{nuevoStock} unidades</span>
              </div>
              <p className="text-base text-gray-600 mt-2">
                {stockActual} + {cantidadAgregar} = {nuevoStock}
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onCerrar}
              className="bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? '⏳ Guardando...' : '✅ Agregar Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}

export default Registro;