import { useState, useEffect } from 'react';
import SelectorImagen from './SelectorImagen';
import Toast from './Toast';
import { useToast } from '../hooks/useToast';

function FormularioLoteProveedor({ isOpen, onClose, onSubmitLote }) {
  const { toast, success, error: mostrarError, cerrarToast } = useToast();
  const [paso, setPaso] = useState(1); // 1: seleccionar proveedor, 2: agregar productos
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('');
  const [proveedores, setProveedores] = useState([]);
  const [productosLote, setProductosLote] = useState([]);
  const [guardando, setGuardando] = useState(false);

  // Formulario del producto actual
  const [productoActual, setProductoActual] = useState({
    imagen: '',
    nombre: '',
    descripcion: '',
    marca: '',
    cantidad: '',
    precio_compra: '',
    precio_venta: ''
  });

  const [errores, setErrores] = useState({});
  const [productoEditando, setProductoEditando] = useState(null); // null o índice del producto

  // Cargar proveedores al abrir
  useEffect(() => {
    if (isOpen) {
      cargarProveedores();
    }
  }, [isOpen]);

  const cargarProveedores = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/productos/proveedores`);
      const data = await response.json();
      if (data.success) {
        setProveedores(data.data);
      }
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      mostrarError('Error al cargar proveedores');
    }
  };

  const validarProducto = () => {
    const nuevosErrores = {};

    if (!productoActual.descripcion?.trim()) {
      nuevosErrores.descripcion = 'La descripción es obligatoria';
    }

    if (!productoActual.cantidad || parseInt(productoActual.cantidad) <= 0) {
      nuevosErrores.cantidad = 'La cantidad es obligatoria y debe ser mayor a 0';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const agregarProductoALote = () => {
    if (!validarProducto()) {
      return;
    }

    if (productoEditando !== null) {
      // Editar producto existente
      const nuevosProductos = [...productosLote];
      nuevosProductos[productoEditando] = { ...productoActual };
      setProductosLote(nuevosProductos);
      success('Producto actualizado');
      setProductoEditando(null);
    } else {
      // Agregar nuevo producto a la lista
      setProductosLote([...productosLote, { ...productoActual }]);
      success(`Producto agregado al lote (${productosLote.length + 1} total)`);
    }

    // Limpiar formulario para el siguiente
    setProductoActual({
      imagen: '',
      nombre: '',
      descripcion: '',
      marca: '',
      cantidad: '',
      precio_compra: '',
      precio_venta: ''
    });
    setErrores({});
  };

  const editarProductoDelLote = (index) => {
    setProductoActual({ ...productosLote[index] });
    setProductoEditando(index);
    success('Editando producto. Modifica los campos y presiona "Agregar al Lote" para guardar cambios.');
  };

  const cancelarEdicion = () => {
    setProductoEditando(null);
    setProductoActual({
      imagen: '',
      nombre: '',
      descripcion: '',
      marca: '',
      cantidad: '',
      precio_compra: '',
      precio_venta: ''
    });
    setErrores({});
  };

  const eliminarDelLote = (index) => {
    setProductosLote(productosLote.filter((_, i) => i !== index));
    success('Producto eliminado del lote');
  };

  const finalizarLote = async () => {
    if (productosLote.length === 0) {
      mostrarError('Debes agregar al menos un producto');
      return;
    }

    setGuardando(true);
    try {
      // Normalizar productos antes de enviar
      const productosNormalizados = productosLote.map(prod => ({
        imagen: prod.imagen || '',
        nombre: prod.nombre || '',
        descripcion: prod.descripcion || '',
        marca: prod.marca || '',
        cantidad: parseInt(prod.cantidad) || 0,
        precio_compra: parseFloat(prod.precio_compra) || 0,
        precio_venta: parseFloat(prod.precio_venta) || null
      }));

      // Enviar todos los productos con el proveedor seleccionado
      await onSubmitLote({
        proveedor: proveedorSeleccionado,
        productos: productosNormalizados
      });

      // Resetear todo
      setProveedorSeleccionado('');
      setProductosLote([]);
      setProductoActual({
        imagen: '',
        nombre: '',
        descripcion: '',
        marca: '',
        cantidad: '',
        precio_compra: '',
        precio_venta: ''
      });
      setProductoEditando(null);
      setPaso(1);
      onClose();
    } catch (error) {
      console.error('Error al guardar lote:', error);
      mostrarError('Error al guardar lote de productos');
    } finally {
      setGuardando(false);
    }
  };

  const handleClose = () => {
    // Resetear todo al cerrar
    setProveedorSeleccionado('');
    setProductosLote([]);
    setProductoActual({
      imagen: '',
      nombre: '',
      descripcion: '',
      marca: '',
      cantidad: '',
      precio_compra: '',
      precio_venta: ''
    });
    setErrores({});
    setProductoEditando(null);
    setPaso(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {toast && (
        <Toast
          mensaje={toast.mensaje}
          tipo={toast.tipo}
          onClose={cerrarToast}
        />
      )}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 p-6 rounded-t-2xl sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🏢</span>
                <div>
                  <h2 className="text-2xl font-bold text-white">Registro por Proveedor</h2>
                  <p className="text-purple-100 text-lg">
                    {paso === 1 ? 'Selecciona el proveedor' : `Proveedor: ${proveedorSeleccionado} (${productosLote.length} productos)`}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* PASO 1: Seleccionar Proveedor */}
            {paso === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-bold text-gray-700 dark:text-gray-300 mb-3">
                    Nombre del Proveedor <span className="text-red-500">*</span>
                  </label>
                  <p className="text-base text-gray-600 dark:text-gray-400 mb-3">
                    Escribe el nombre o selecciona uno existente. Todos los productos del lote tendrán este proveedor.
                  </p>
                  <input
                    type="text"
                    list="proveedores-list"
                    value={proveedorSeleccionado}
                    onChange={(e) => setProveedorSeleccionado(e.target.value)}
                    placeholder="Ej: Distribuidora ABC, Importadora XYZ..."
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                  <datalist id="proveedores-list">
                    {proveedores.map((prov, index) => (
                      <option key={index} value={prov} />
                    ))}
                  </datalist>
                  {proveedores.length > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      💡 Sugerencias: {proveedores.slice(0, 3).join(', ')}{proveedores.length > 3 ? '...' : ''}
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-lg font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!proveedorSeleccionado || proveedorSeleccionado.trim() === '') {
                        mostrarError('Debes ingresar el nombre del proveedor');
                        return;
                      }
                      setPaso(2);
                    }}
                    className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all text-lg font-bold shadow-lg"
                  >
                    Continuar →
                  </button>
                </div>
              </div>
            )}

            {/* PASO 2: Agregar Productos */}
            {paso === 2 && (
              <div className="space-y-6">
                {/* Lista de productos agregados */}
                {productosLote.length > 0 && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                      Productos en el lote ({productosLote.length})
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {productosLote.map((prod, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg ${
                            productoEditando === index ? 'ring-2 ring-amber-500' : ''
                          }`}
                        >
                          {prod.imagen ? (
                            <img
                              src={prod.imagen}
                              alt={prod.nombre || prod.descripcion}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                              📦
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 dark:text-white truncate">
                              {prod.descripcion || prod.nombre || 'Sin descripción'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {prod.cantidad ? `Cant: ${prod.cantidad}` : 'Sin cantidad'}
                              {prod.precio_compra ? ` • Bs ${prod.precio_compra}` : ''}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => editarProductoDelLote(index)}
                              disabled={productoEditando !== null}
                              className="text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => eliminarDelLote(index)}
                              disabled={productoEditando === index}
                              className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formulario para agregar producto */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      {productoEditando !== null
                        ? '✏️ Editando producto'
                        : productosLote.length === 0
                        ? 'Agregar primer producto'
                        : 'Agregar otro producto'}
                    </h3>
                    {productoEditando !== null && (
                      <button
                        onClick={cancelarEdicion}
                        className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        ✕ Cancelar edición
                      </button>
                    )}
                  </div>

                  {/* Imagen */}
                  <div>
                    <SelectorImagen
                      imagenActual={productoActual.imagen}
                      onImagenCambiada={(url) => {
                        setProductoActual({ ...productoActual, imagen: url });
                        setErrores({ ...errores, imagen: '' });
                      }}
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Descripción <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={productoActual.descripcion}
                      onChange={(e) => setProductoActual({ ...productoActual, descripcion: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:text-white resize-none"
                    />
                    {errores.descripcion && (
                      <p className="text-red-600 text-base mt-1">{errores.descripcion}</p>
                    )}
                  </div>

                  {/* Cantidad y Precios */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Cantidad <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={productoActual.cantidad}
                        onChange={(e) => setProductoActual({ ...productoActual, cantidad: e.target.value })}
                        className={`w-full px-4 py-3 text-lg border-2 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:text-white ${
                          errores.cantidad ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {errores.cantidad && (
                        <p className="text-red-600 text-base mt-1">{errores.cantidad}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Precio Compra
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={productoActual.precio_compra}
                        onChange={(e) => setProductoActual({ ...productoActual, precio_compra: e.target.value })}
                        className="w-full px-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Precio Venta
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={productoActual.precio_venta}
                        onChange={(e) => setProductoActual({ ...productoActual, precio_venta: e.target.value })}
                        className="w-full px-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Botones para agregar/actualizar producto */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={agregarProductoALote}
                      className={`flex-1 py-3 rounded-lg font-bold transition-colors text-lg ${
                        productoEditando !== null
                          ? 'bg-amber-500 dark:bg-amber-600 text-white hover:bg-amber-600 dark:hover:bg-amber-700'
                          : 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/60'
                      }`}
                    >
                      {productoEditando !== null ? '💾 Guardar Cambios' : '➕ Agregar al Lote'}
                    </button>
                  </div>
                </div>

                {/* Botones finales */}
                <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={guardando}
                    className="flex-1 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-lg font-semibold disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={finalizarLote}
                    disabled={guardando || productosLote.length === 0}
                    className="flex-1 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all text-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {guardando ? 'Guardando...' : `✅ Finalizar Lote (${productosLote.length})`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default FormularioLoteProveedor;
