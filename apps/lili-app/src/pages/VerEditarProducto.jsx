import { useState, useEffect } from 'react';
import { getProducto, updateProducto, deleteProducto } from '../utils/api';
import SelectorImagen from '../components/SelectorImagen';
import APP_CONFIG from '../config';

function VerEditarProducto({ productoId, onCerrar, onGuardar }) {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [producto, setProducto] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    cargarProducto();
  }, [productoId]);

  const cargarProducto = async () => {
    try {
      const response = await getProducto(productoId);
      const productoData = response.data;

      // Convertir stock de la tienda a cantidad_ingresada para el formulario
      const stockTienda = productoData[APP_CONFIG.campo_stock] || productoData.cantidad_ingresada || 0;

      setProducto(productoData);
      setFormData({
        ...productoData,
        cantidad_ingresada: stockTienda
      });
      setLoading(false);
    } catch (error) {
      alert('Error al cargar producto: ' + error.message);
      onCerrar();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      // Solo enviar campos editables (sin campos calculados ni relaciones)
      const dataToSend = {
        nombre: formData.nombre || formData.descripcion,
        descripcion: formData.descripcion,
        precio_compra_unidad: parseFloat(formData.precio_compra_unidad),
        precio_venta_unidad: parseFloat(formData.precio_venta_unidad),
        // Enviar stock con el nombre de campo correcto para la tienda
        [APP_CONFIG.campo_stock]: parseInt(formData.cantidad_ingresada),
        nombre_producto: formData.nombre_producto,
        categoria: formData.categoria,
        subcategoria: formData.subcategoria,
        marca: formData.marca,
        proveedor: formData.proveedor,
        rotacion: formData.rotacion,
        estado: formData.estado,
        usos_aplicaciones: formData.usos_aplicaciones,
        notas_internas: formData.notas_internas
      };

      // Agregar imagen solo si existe
      if (formData.imagen) {
        dataToSend.imagen = formData.imagen;
      }

      console.log('📤 Enviando actualización:', dataToSend);

      await updateProducto(productoId, dataToSend);
      
      alert('✅ Producto actualizado exitosamente');
      setModoEdicion(false);
      cargarProducto(); // Recargar datos
      onGuardar();
    } catch (error) {
      alert('❌ Error al actualizar: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async () => {
    const confirmacion = window.confirm(
      `¿Estás seguro de eliminar el producto "${formData.descripcion || formData.nombre_producto}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmacion) return;

    setEliminando(true);
    try {
      await deleteProducto(productoId);
      alert('✅ Producto eliminado exitosamente');
      onGuardar(); // Recargar lista
      onCerrar(); // Cerrar modal
    } catch (error) {
      alert('❌ Error al eliminar: ' + error.message);
      setEliminando(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b z-10">
          <div>
            <h2 className="text-3xl font-bold text-green-600">
              {modoEdicion ? '✏️ Editar Producto' : '👁️ Ver Producto'}
            </h2>
            <p className="text-lg text-gray-600">ID: #{productoId}</p>
          </div>
          <button 
            onClick={onCerrar} 
            className="text-3xl text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Selector de Imagen */}
          {modoEdicion ? (
            <div className="mb-6">
              <SelectorImagen
                imagenActual={formData.imagen}
                onImagenCambiada={(url) => setFormData({ ...formData, imagen: url })}
                productId={productoId}
              />
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-lg font-bold mb-2">Foto del Producto</label>
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-300">
                {formData.imagen ? (
                  <img
                    src={formData.imagen}
                    alt="Producto"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <span className="text-5xl">📷</span>
                    <p className="text-lg mt-2">Sin imagen</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Información General */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-blue-800 mb-4">📋 Información General</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-lg font-medium text-gray-700 mb-1">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  name="nombre_producto"
                  value={formData.nombre_producto || ''}
                  onChange={handleChange}
                  disabled={!modoEdicion}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    modoEdicion 
                      ? 'border-gray-300 focus:ring-2 focus:ring-green-500' 
                      : 'bg-gray-100 border-gray-200'
                  }`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-lg font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  name="descripcion"
                  value={formData.descripcion || ''}
                  onChange={handleChange}
                  disabled={!modoEdicion}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    modoEdicion 
                      ? 'border-gray-300 focus:ring-2 focus:ring-green-500' 
                      : 'bg-gray-100 border-gray-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-1">Marca</label>
                <input
                  type="text"
                  name="marca"
                  value={formData.marca || ''}
                  onChange={handleChange}
                  disabled={!modoEdicion}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    modoEdicion 
                      ? 'border-gray-300 focus:ring-2 focus:ring-green-500' 
                      : 'bg-gray-100 border-gray-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-1">Proveedor</label>
                <input
                  type="text"
                  name="proveedor"
                  value={formData.proveedor || ''}
                  onChange={handleChange}
                  disabled={!modoEdicion}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    modoEdicion 
                      ? 'border-gray-300 focus:ring-2 focus:ring-green-500' 
                      : 'bg-gray-100 border-gray-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-1">Categoría</label>
                <input
                  type="text"
                  name="categoria"
                  value={formData.categoria || ''}
                  onChange={handleChange}
                  disabled={!modoEdicion}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    modoEdicion 
                      ? 'border-gray-300 focus:ring-2 focus:ring-green-500' 
                      : 'bg-gray-100 border-gray-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-1">Subcategoría</label>
                <input
                  type="text"
                  name="subcategoria"
                  value={formData.subcategoria || ''}
                  onChange={handleChange}
                  disabled={!modoEdicion}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    modoEdicion 
                      ? 'border-gray-300 focus:ring-2 focus:ring-green-500' 
                      : 'bg-gray-100 border-gray-200'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Precios */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-green-800 mb-4">💰 Precios y Ganancias</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-1">
                  Precio Compra (Bs)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="precio_compra_unidad"
                  value={formData.precio_compra_unidad || ''}
                  onChange={handleChange}
                  disabled={!modoEdicion}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    modoEdicion 
                      ? 'border-gray-300 focus:ring-2 focus:ring-green-500' 
                      : 'bg-gray-100 border-gray-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-1">
                  Precio Venta (Bs)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="precio_venta_unidad"
                  value={formData.precio_venta_unidad || ''}
                  onChange={handleChange}
                  disabled={!modoEdicion}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    modoEdicion 
                      ? 'border-gray-300 focus:ring-2 focus:ring-green-500' 
                      : 'bg-gray-100 border-gray-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-1">
                  Ganancia (Bs)
                </label>
                <input
                  type="text"
                  value={(() => {
                    const precioCompra = parseFloat(formData.precio_compra_unidad) || 0;
                    const precioVenta = parseFloat(formData.precio_venta_unidad) || 0;
                    const ganancia = precioVenta - precioCompra;
                    return ganancia.toFixed(2);
                  })()}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 font-bold text-green-600"
                />
              </div>
            </div>

            {/* Cálculo en tiempo real de ganancia y porcentaje */}
            {(() => {
              const precioCompra = parseFloat(formData.precio_compra_unidad) || 0;
              const precioVenta = parseFloat(formData.precio_venta_unidad) || 0;
              const ganancia = precioVenta - precioCompra;
              const porcentaje = precioCompra > 0 ? ((ganancia / precioCompra) * 100) : 0;
              const esGanancia = ganancia >= 0;

              return (
                <div className={`mt-4 p-4 rounded-lg border-2 ${
                  esGanancia
                    ? 'bg-green-100 border-green-400'
                    : 'bg-red-100 border-red-400'
                }`}>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-base text-gray-600 mb-1">Ganancia por unidad</p>
                      <p className={`text-2xl font-bold ${
                        esGanancia ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {esGanancia ? '+' : ''} Bs {ganancia.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-base text-gray-600 mb-1">Porcentaje de ganancia</p>
                      <p className={`text-2xl font-bold ${
                        esGanancia ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {esGanancia ? '+' : ''} {porcentaje.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  {!esGanancia && (
                    <p className="text-center text-base text-red-600 mt-2 font-semibold">
                      ⚠️ Estás vendiendo con pérdida
                    </p>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Stock */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-blue-800 mb-4">📦 Stock</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-1">
                  Cantidad en Stock
                </label>
                <input
                  type="number"
                  name="cantidad_ingresada"
                  value={formData.cantidad_ingresada || ''}
                  onChange={handleChange}
                  disabled={!modoEdicion}
                  className={`w-full px-4 py-3 border rounded-lg font-bold text-blue-600 ${
                    modoEdicion 
                      ? 'border-gray-300 focus:ring-2 focus:ring-green-500' 
                      : 'bg-gray-100 border-gray-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-1">Rotación</label>
                <select
                  name="rotacion"
                  value={formData.rotacion || 'medio'}
                  onChange={handleChange}
                  disabled={!modoEdicion}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    modoEdicion 
                      ? 'border-gray-300 focus:ring-2 focus:ring-green-500' 
                      : 'bg-gray-100 border-gray-200'
                  }`}
                >
                  <option value="basico">Básico</option>
                  <option value="medio">Medio</option>
                  <option value="no_basico">No Básico</option>
                  <option value="irrelevante">Irrelevante</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">📝 Notas</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-1">
                  Usos / Aplicaciones
                </label>
                <textarea
                  name="usos_aplicaciones"
                  value={formData.usos_aplicaciones || ''}
                  onChange={handleChange}
                  disabled={!modoEdicion}
                  rows="2"
                  className={`w-full px-4 py-3 border rounded-lg ${
                    modoEdicion 
                      ? 'border-gray-300 focus:ring-2 focus:ring-green-500' 
                      : 'bg-gray-100 border-gray-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-1">
                  Notas Internas
                </label>
                <textarea
                  name="notas_internas"
                  value={formData.notas_internas || ''}
                  onChange={handleChange}
                  disabled={!modoEdicion}
                  rows="2"
                  className={`w-full px-4 py-3 border rounded-lg ${
                    modoEdicion 
                      ? 'border-gray-300 focus:ring-2 focus:ring-green-500' 
                      : 'bg-gray-100 border-gray-200'
                  }`}
                />
              </div>
            </div>
          </div>

{/* Botones */}
<div className="flex gap-4 sticky bottom-0 bg-white pt-4 border-t">
  {!modoEdicion ? (
    <>
      <button
        type="button"
        onClick={onCerrar}
        className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-lg font-bold hover:bg-gray-300"
      >
        Cerrar
      </button>
      <button
        type="button"
        onClick={handleEliminar}
        disabled={eliminando}
        className="flex-1 bg-red-500 text-white py-4 rounded-lg font-bold hover:bg-red-600 disabled:bg-gray-400"
      >
        {eliminando ? '⏳ Eliminando...' : '🗑️ Eliminar'}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setModoEdicion(true);
        }}
        className="flex-1 bg-green-500 text-white py-4 rounded-lg font-bold hover:bg-green-600"
      >
        ✏️ Editar
      </button>
    </>
  ) : (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setModoEdicion(false);
          setFormData(producto);
        }}
        className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-lg font-bold hover:bg-gray-300"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={guardando}
        className="flex-1 bg-green-500 text-white py-4 rounded-lg font-bold hover:bg-green-600 disabled:bg-gray-400"
      >
        {guardando ? '⏳ Guardando...' : '✅ Guardar Cambios'}
      </button>
    </>
  )}
</div>
        </form>
      </div>
    </div>
  );
}

export default VerEditarProducto;