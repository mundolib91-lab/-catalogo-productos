import { useState, useEffect } from 'react';
import SelectorImagen from './SelectorImagen';
import Toast from './Toast';
import { useToast } from '../hooks/useToast';

function FormularioLoteMarca({ isOpen, onClose, onSubmitLote }) {
  const { toast, success, error: mostrarError, cerrarToast } = useToast();
  const [paso, setPaso] = useState(1);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState('');
  const [marcas, setMarcas] = useState([]);
  const [productosLote, setProductosLote] = useState([]);
  const [ubicacion, setUbicacion] = useState('tienda');
  const [guardando, setGuardando] = useState(false);

  const [productoActual, setProductoActual] = useState({
    imagen: '',
    nombre: '',
    descripcion: '',
    proveedor: '',
    cantidad: '',
    precio_compra: '',
    precio_venta: ''
  });

  const [errores, setErrores] = useState({});
  const [productoEditando, setProductoEditando] = useState(null);

  useEffect(() => {
    if (isOpen) {
      cargarMarcas();
    }
  }, [isOpen]);

  const cargarMarcas = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/productos/marcas`);
      const data = await response.json();
      if (data.success) {
        setMarcas(data.data);
      }
    } catch (error) {
      console.error('Error al cargar marcas:', error);
      mostrarError('Error al cargar marcas');
    }
  };

  const validarProducto = () => {
    const nuevosErrores = {};

    if (!productoActual.descripcion?.trim()) {
      nuevosErrores.descripcion = 'La descripción es obligatoria';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const agregarProductoALote = () => {
    if (!validarProducto()) return;

    if (productoEditando !== null) {
      const nuevosProductos = [...productosLote];
      nuevosProductos[productoEditando] = { ...productoActual };
      setProductosLote(nuevosProductos);
      success('Producto actualizado');
      setProductoEditando(null);
    } else {
      setProductosLote([...productosLote, { ...productoActual }]);
      success(`Producto agregado al lote (${productosLote.length + 1} total)`);
    }

    setProductoActual({
      imagen: '',
      nombre: '',
      descripcion: '',
      proveedor: '',
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
      proveedor: '',
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
      const productosNormalizados = productosLote.map(prod => ({
        imagen: prod.imagen || '',
        nombre: prod.nombre || '',
        descripcion: prod.descripcion || '',
        proveedor: prod.proveedor || '',
        cantidad: parseInt(prod.cantidad) || 0,
        precio_compra: parseFloat(prod.precio_compra) || 0,
        precio_venta: parseFloat(prod.precio_venta) || null
      }));

      await onSubmitLote({
        marca: marcaSeleccionada,
        productos: productosNormalizados,
        ubicacion
      });

      setMarcaSeleccionada('');
      setProductosLote([]);
      setProductoActual({
        imagen: '',
        nombre: '',
        descripcion: '',
        proveedor: '',
        cantidad: '',
        precio_compra: '',
        precio_venta: ''
      });
      setProductoEditando(null);
      setUbicacion('tienda');
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
    setMarcaSeleccionada('');
    setProductosLote([]);
    setProductoActual({
      imagen: '',
      nombre: '',
      descripcion: '',
      proveedor: '',
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
      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={cerrarToast} />}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-pink-500 to-pink-600 dark:from-pink-600 dark:to-pink-700 p-6 rounded-t-2xl sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🏷️</span>
                <div>
                  <h2 className="text-2xl font-bold text-white">Registro por Marca</h2>
                  <p className="text-pink-100 text-lg">
                    {paso === 1 ? 'Selecciona la marca' : `Marca: ${marcaSeleccionada} (${productosLote.length} productos)`}
                  </p>
                </div>
              </div>
              <button onClick={handleClose} className="text-white hover:bg-white/20 rounded-full p-2 transition-colors">✕</button>
            </div>
          </div>

          <div className="p-6">
            {paso === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-bold text-gray-700 dark:text-gray-300 mb-3">
                    Nombre de la Marca <span className="text-red-500">*</span>
                  </label>
                  <p className="text-base text-gray-600 dark:text-gray-400 mb-3">
                    Escribe el nombre o selecciona una existente. Todos los productos del lote tendrán esta marca.
                  </p>
                  <input
                    type="text"
                    list="marcas-list"
                    value={marcaSeleccionada}
                    onChange={(e) => setMarcaSeleccionada(e.target.value)}
                    placeholder="Ej: L'Oréal, Maybelline, Revlon..."
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                  <datalist id="marcas-list">
                    {marcas.map((marca, index) => (
                      <option key={index} value={marca} />
                    ))}
                  </datalist>
                  {marcas.length > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      💡 Sugerencias: {marcas.slice(0, 3).join(', ')}{marcas.length > 3 ? '...' : ''}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-lg font-bold text-gray-700 dark:text-gray-300 mb-3">
                    Ubicacion del stock del lote
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setUbicacion('tienda')}
                      className={`py-3 rounded-xl font-bold text-base border-2 transition-colors ${
                        ubicacion === 'tienda'
                          ? 'bg-pink-500 text-white border-pink-500'
                          : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-pink-400'
                      }`}
                    >
                      Tienda
                    </button>
                    <button
                      type="button"
                      onClick={() => setUbicacion('deposito')}
                      className={`py-3 rounded-xl font-bold text-base border-2 transition-colors ${
                        ubicacion === 'deposito'
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-orange-400'
                      }`}
                    >
                      Deposito
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button type="button" onClick={handleClose} className="flex-1 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-lg font-semibold">
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!marcaSeleccionada || marcaSeleccionada.trim() === '') {
                        mostrarError('Debes ingresar el nombre de la marca');
                        return;
                      }
                      setPaso(2);
                    }}
                    className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-xl transition-all text-lg font-bold shadow-lg"
                  >
                    Continuar →
                  </button>
                </div>
              </div>
            )}

            {paso === 2 && (
              <div className="space-y-6">
                {productosLote.length > 0 && (
                  <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                      Productos en el lote ({productosLote.length})
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {productosLote.map((prod, index) => (
                        <div key={index} className={`flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg ${
                          productoEditando === index ? 'ring-2 ring-amber-500' : ''
                        }`}>
                          {prod.imagen ? (
                            <img src={prod.imagen} alt={prod.nombre || prod.descripcion} className="w-12 h-12 object-cover rounded" />
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

                  <div>
                    <SelectorImagen
                      imagenActual={productoActual.imagen}
                      onImagenCambiada={(url) => {
                        setProductoActual({ ...productoActual, imagen: url });
                        setErrores({ ...errores, imagen: '' });
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Descripción <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={productoActual.descripcion}
                      onChange={(e) => setProductoActual({ ...productoActual, descripcion: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 dark:text-white resize-none"
                    />
                    {errores.descripcion && <p className="text-red-600 text-base mt-1">{errores.descripcion}</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        value={productoActual.cantidad}
                        onChange={(e) => setProductoActual({ ...productoActual, cantidad: e.target.value })}
                        className="w-full px-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 dark:text-white"
                      />
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
                        className="w-full px-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 dark:text-white"
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
                        className="w-full px-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Cálculo en tiempo real de ganancia */}
                  {productoActual.precio_compra && productoActual.precio_venta && (() => {
                    const precioCompra = parseFloat(productoActual.precio_compra) || 0;
                    const precioVenta = parseFloat(productoActual.precio_venta) || 0;
                    const ganancia = precioVenta - precioCompra;
                    const porcentaje = precioCompra > 0 ? ((ganancia / precioCompra) * 100) : 0;
                    const esGanancia = ganancia >= 0;

                    return (
                      <div className={`p-4 rounded-lg border-2 ${
                        esGanancia ? 'bg-green-50 dark:bg-green-900/20 border-green-400' : 'bg-red-50 dark:bg-red-900/20 border-red-400'
                      }`}>
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ganancia por unidad</p>
                            <p className={`text-xl font-bold ${esGanancia ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                              {esGanancia ? '+' : ''} Bs {ganancia.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Porcentaje</p>
                            <p className={`text-xl font-bold ${esGanancia ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                              {esGanancia ? '+' : ''} {porcentaje.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        {!esGanancia && (
                          <p className="text-center text-sm text-red-600 dark:text-red-400 mt-2 font-semibold">
                            ⚠️ Estás vendiendo con pérdida
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  <button
                    type="button"
                    onClick={agregarProductoALote}
                    className={`w-full py-3 rounded-lg font-bold transition-colors text-lg ${
                      productoEditando !== null
                        ? 'bg-amber-500 dark:bg-amber-600 text-white hover:bg-amber-600 dark:hover:bg-amber-700'
                        : 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-900/60'
                    }`}
                  >
                    {productoEditando !== null ? '💾 Guardar Cambios' : '➕ Agregar al Lote'}
                  </button>
                </div>

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

export default FormularioLoteMarca;
