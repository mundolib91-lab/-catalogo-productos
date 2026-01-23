import { useState, useEffect } from 'react';
import { getProductosPorEstado, createProductoRapido, updateProducto } from '../utils/api';
import FormularioCompleto from './FormularioCompleto';
import VerEditarProducto from './VerEditarProducto';
import SelectorImagen from '../components/SelectorImagen';
import { useTheme } from '../hooks/useTheme';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

function Registro({ menuHamburguesa }) {
  const { theme, toggleTheme } = useTheme();
  const [pestanaActiva, setPestanaActiva] = useState('existentes');
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Cargar productos según pestaña activa
  useEffect(() => {
    cargarProductos();
  }, [pestanaActiva, busqueda]);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const response = await getProductosPorEstado(pestanaActiva, {
        search: busqueda
      });
      setProductos(response.data || []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-amber-500 dark:bg-amber-700 text-white p-4 shadow-lg relative">
        {/* Menú hamburguesa (solo en móvil) */}
        {menuHamburguesa}

        <h1 className="text-lg md:text-xl font-bold text-center">
          APP REGISTROS DE PRODUCTOS
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
          className="w-full px-6 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Pestañas */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex gap-2 border-b-2 border-gray-200 dark:border-gray-700">
          {/* Pestaña Existentes */}
          <button
            onClick={() => setPestanaActiva('existente')}
            className={`flex-1 py-4 px-4 font-bold text-sm md:text-base transition-all ${
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
            className={`flex-1 py-4 px-4 font-bold text-sm md:text-base transition-all ${
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
            className={`flex-1 py-4 px-4 font-bold text-sm md:text-base transition-all ${
              pestanaActiva === 'completado'
                ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border-b-4 border-purple-600 dark:border-purple-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            🎉 Completados
          </button>
        </div>
      </div>

      {/* Contenido según pestaña */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando productos...</p>
          </div>
        ) : productos.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
            <p className="text-2xl">📦</p>
            <p className="text-gray-600 dark:text-gray-400 mt-4">No hay productos en esta sección</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productos.map((producto) => (
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
        onClick={() => setMostrarFormulario(true)}
        className={`fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl text-white text-3xl font-bold flex items-center justify-center transition-transform hover:scale-110 ${
          pestanaActiva === 'existente'
            ? 'bg-green-500'
            : pestanaActiva === 'proceso'
            ? 'bg-amber-500'
            : 'bg-purple-500'
        }`}
      >
        +
      </button>

      {/* Modal formulario */}
      {mostrarFormulario && (
        <FormularioRapido
          onCerrar={() => setMostrarFormulario(false)}
          onGuardar={() => {
            setMostrarFormulario(false);
            cargarProductos();
          }}
        />
      )}
    </div>
  );
}

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
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2 min-h-[2.5rem]">
        {producto.descripcion || producto.nombre || 'Sin descripción'}
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
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-600 dark:text-gray-400">Compra:</span>
        <span className="font-bold dark:text-white">Bs {producto.precio_compra_unidad?.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-600 dark:text-gray-400">Venta:</span>
        <span className="font-bold text-green-600 dark:text-green-400">Bs {producto.precio_venta_unidad?.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm mb-3">
        <span className="text-gray-600 dark:text-gray-400">Stock:</span>
        <span className="font-bold text-blue-600 dark:text-blue-400">{producto.cantidad_ingresada} unid</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setMostrarVerEditar(true)}
          className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 py-2 rounded-lg font-bold hover:bg-green-200 dark:hover:bg-green-900/60 text-sm"
        >
          Ver / Editar
        </button>
        <button
          onClick={() => setMostrarAgregarStock(true)}
          className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 py-2 rounded-lg font-bold hover:bg-blue-200 dark:hover:bg-blue-900/60 text-sm"
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
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  return (
    <>
      <div className={`${colorFondo} p-2 rounded mb-2 dark:text-white`}>
        <p className="text-sm">Cantidad: <span className="font-bold">{producto.cantidad_ingresada} unid</span></p>
      </div>
      <div className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs p-2 rounded mb-3">
        ⚠️ FALTAN: Precios y datos completos
      </div>
      <button
        onClick={() => setMostrarFormulario(true)}
        className="w-full bg-amber-500 dark:bg-amber-600 text-white py-2 rounded-lg font-bold hover:bg-amber-600 dark:hover:bg-amber-700"
      >
        Completar Registro
      </button>

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
    </>
  );
}

// Componente para productos completados
function ProductoCompletado({ producto, onActualizar, colorFondo }) {
  const [mostrarVerEditar, setMostrarVerEditar] = useState(false);

  return (
    <>
      <div className={`${colorFondo} p-2 rounded mb-2 dark:text-white`}>
        <p className="text-sm">✅ Registro completo</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Completado: {new Date(producto.fecha_completado).toLocaleDateString()}
        </p>
      </div>
      <button
        onClick={() => setMostrarVerEditar(true)}
        className="w-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 py-2 rounded-lg font-bold hover:bg-purple-200 dark:hover:bg-purple-900/60"
      >
        Ver Detalles
      </button>
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">Se queda aquí 2 días</p>

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
    imagen: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createProductoRapido(formData);
      success('Producto registrado en proceso');
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
          <h2 className="text-2xl font-bold text-amber-600">➕ Registro Rápido</h2>
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
            <label className="block text-sm font-bold mb-2">Descripción del Producto *</label>
            <input
              type="text"
              required
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              placeholder="Ej: Bolígrafo tinta azul"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">Cantidad Ingresada *</label>
            <input
              type="number"
              required
              value={formData.cantidad_ingresada}
              onChange={(e) => setFormData({ ...formData, cantidad_ingresada: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              placeholder="120"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-amber-600 disabled:bg-gray-400"
          >
            {loading ? '⏳ Guardando...' : '💾 Guardar en Proceso'}
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

  const stockActual = producto.cantidad_ingresada || 0;
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
        cantidad_ingresada: nuevoStock
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
          <h2 className="text-2xl font-bold text-blue-600">📦 Agregar Stock</h2>
          <button onClick={onCerrar} className="text-3xl text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Información del producto */}
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="font-bold text-lg mb-2">{producto.nombre || producto.descripcion}</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Stock actual:</span>
              <span className="font-bold text-blue-600">{stockActual} unidades</span>
            </div>
          </div>

          {/* Cantidad a agregar */}
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">Cantidad a agregar *</label>
            <input
              type="number"
              required
              min="1"
              value={cantidadAgregar}
              onChange={(e) => setCantidadAgregar(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg font-bold text-center"
              placeholder="0"
              autoFocus
            />
          </div>

          {/* Nuevo stock */}
          {cantidadAgregar && parseInt(cantidadAgregar) > 0 && (
            <div className="bg-green-50 p-4 rounded-lg mb-4 border-2 border-green-300">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-bold">Nuevo stock:</span>
                <span className="text-2xl font-bold text-green-600">{nuevoStock} unidades</span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
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