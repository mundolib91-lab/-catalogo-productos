import { useState, useEffect } from 'react';
import { getProducto, completarProducto } from '../utils/api';
import SelectorImagen from '../components/SelectorImagen';

function FormularioCompleto({ productoId, onCerrar, onGuardar }) {
  const [formData, setFormData] = useState({
    // Datos ya existentes
    imagen: '',
    descripcion: '',
    cantidad_ingresada: '',
    
    // Datos a completar - OBLIGATORIOS
    precio_compra_unidad: '',
    precio_venta_unidad: '',
    nombre_producto: '',
    
    // Datos a completar - OPCIONALES
    marca: '',
    categoria: '',
    subcategoria: '',
    proveedor: '',
    rotacion: 'medio',
    estado: 'activo',
    usos_aplicaciones: '',
    notas_internas: ''
  });

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Cargar datos del producto
  useEffect(() => {
    cargarProducto();
  }, [productoId]);

  const cargarProducto = async () => {
    try {
      const response = await getProducto(productoId);
      const producto = response.data;
      
      setFormData({
        imagen: producto.imagen || '',
        descripcion: producto.descripcion || '',
        cantidad_ingresada: producto.cantidad_ingresada || '',
        precio_compra_unidad: producto.precio_compra_unidad || '',
        precio_venta_unidad: producto.precio_venta_unidad || '',
        nombre_producto: producto.nombre_producto || producto.nombre || '',
        marca: producto.marca || '',
        categoria: producto.categoria || '',
        subcategoria: producto.subcategoria || '',
        proveedor: producto.proveedor || '',
        rotacion: producto.rotacion || 'medio',
        estado: producto.estado || 'activo',
        usos_aplicaciones: producto.usos_aplicaciones || '',
        notas_internas: producto.notas_internas || ''
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
      // Convertir números
      const dataToSend = {
        ...formData,
        precio_compra_unidad: parseFloat(formData.precio_compra_unidad),
        precio_venta_unidad: parseFloat(formData.precio_venta_unidad),
        cantidad_ingresada: parseInt(formData.cantidad_ingresada)
      };

      await completarProducto(productoId, dataToSend);
      
      alert('✅ Producto completado exitosamente');
      onGuardar();
    } catch (error) {
      alert('❌ Error al completar: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
          <div>
            <h2 className="text-2xl font-bold text-amber-600">📋 Completar Registro</h2>
            <p className="text-sm text-gray-600">ID: #{productoId}</p>
          </div>
          <button 
            onClick={onCerrar} 
            className="text-3xl text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Datos ya registrados */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-blue-800 mb-3">✅ Datos ya registrados</h3>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción inicial
              </label>
              <input
                type="text"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad ingresada
              </label>
              <input
                type="number"
                name="cantidad_ingresada"
                value={formData.cantidad_ingresada}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
              />
            </div>

            {/* Selector de Imagen */}
            <div className="mt-4">
              <SelectorImagen
                imagenActual={formData.imagen}
                onImagenCambiada={(url) => setFormData({ ...formData, imagen: url })}
                productId={productoId}
              />
            </div>
          </div>

          {/* Datos OBLIGATORIOS a completar */}
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-red-800 mb-3">⚠️ Datos OBLIGATORIOS</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio de Compra (Bs) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="precio_compra_unidad"
                  value={formData.precio_compra_unidad}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="2.50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio de Venta (Bs) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="precio_venta_unidad"
                  value={formData.precio_venta_unidad}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="4.00"
                />
              </div>

              {/* Cálculo en tiempo real de ganancia */}
              {formData.precio_compra_unidad && formData.precio_venta_unidad && (
                <div className="md:col-span-2">
                  {(() => {
                    const precioCompra = parseFloat(formData.precio_compra_unidad) || 0;
                    const precioVenta = parseFloat(formData.precio_venta_unidad) || 0;
                    const ganancia = precioVenta - precioCompra;
                    const porcentaje = precioCompra > 0 ? ((ganancia / precioCompra) * 100) : 0;
                    const esGanancia = ganancia >= 0;

                    return (
                      <div className={`p-4 rounded-lg border-2 ${
                        esGanancia
                          ? 'bg-green-100 border-green-400'
                          : 'bg-red-100 border-red-400'
                      }`}>
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Ganancia por unidad</p>
                            <p className={`text-2xl font-bold ${
                              esGanancia ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {esGanancia ? '+' : ''} Bs {ganancia.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Porcentaje de ganancia</p>
                            <p className={`text-2xl font-bold ${
                              esGanancia ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {esGanancia ? '+' : ''} {porcentaje.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        {!esGanancia && (
                          <p className="text-center text-xs text-red-600 mt-2 font-semibold">
                            ⚠️ Estás vendiendo con pérdida
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  name="nombre_producto"
                  value={formData.nombre_producto}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Ej: Marcador Permanente Sharpie Negro"
                />
              </div>
            </div>
          </div>

          {/* Datos OPCIONALES */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-green-800 mb-3">📝 Datos Opcionales (Recomendados)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                <input
                  type="text"
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ej: Sharpie"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                <input
                  type="text"
                  name="proveedor"
                  value={formData.proveedor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ej: Distribuidora ABC"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <input
                  type="text"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ej: Escritura"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategoría</label>
                <input
                  type="text"
                  name="subcategoria"
                  value={formData.subcategoria}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ej: Marcadores"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rotación</label>
                <select
                  name="rotacion"
                  value={formData.rotacion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="basico">Básico</option>
                  <option value="medio">Medio</option>
                  <option value="no_basico">No Básico</option>
                  <option value="irrelevante">Irrelevante</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado Web</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usos / Aplicaciones
                </label>
                <textarea
                  name="usos_aplicaciones"
                  value={formData.usos_aplicaciones}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Describe para qué sirve el producto..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas Internas
                </label>
                <textarea
                  name="notas_internas"
                  value={formData.notas_internas}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Observaciones adicionales..."
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 sticky bottom-0 bg-white pt-4 border-t">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-lg font-bold hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 bg-amber-500 text-white py-4 rounded-lg font-bold hover:bg-amber-600 disabled:bg-gray-400"
            >
              {guardando ? '⏳ Guardando...' : '✅ Completar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormularioCompleto;