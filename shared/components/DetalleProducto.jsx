function DetalleProducto({ producto, onCerrar }) {
  const tienePreciosMayor = producto.precios_por_mayor && producto.precios_por_mayor.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-blue-500 dark:bg-blue-700 text-white p-4 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-2xl font-bold">Detalles del Producto</h2>
          <button
            onClick={onCerrar}
            className="text-3xl hover:bg-blue-600 dark:hover:bg-blue-800 w-10 h-10 rounded-full flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Imagen */}
          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
            {producto.imagen ? (
              <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl">📦</span>
            )}
          </div>

          {/* Información básica */}
          <div className="mb-6">
            <h3 className="text-3xl font-bold dark:text-white mb-2">
              {producto.nombre_producto || producto.nombre || producto.descripcion}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              {producto.descripcion}
            </p>

            <div className="grid grid-cols-2 gap-3 text-lg">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Marca:</span>
                <span className="ml-2 font-semibold dark:text-white">{producto.marca || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Proveedor:</span>
                <span className="ml-2 font-semibold dark:text-white">{producto.proveedor || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Categoría:</span>
                <span className="ml-2 font-semibold dark:text-white">{producto.categoria || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Stock:</span>
                <span className="ml-2 font-semibold text-blue-600 dark:text-blue-400">
                  {producto.cantidad_ingresada || 0} unidades
                </span>
              </div>
            </div>
          </div>

          {/* Precio unitario */}
          <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4 mb-6">
            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Precio Unitario
            </h4>
            <p className="text-3xl font-bold text-green-700 dark:text-green-400">
              Bs {producto.precio_venta_unidad?.toFixed(2) || '0.00'}
            </p>
            {producto.precio_compra_unidad && (
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                Precio de compra: Bs {producto.precio_compra_unidad.toFixed(2)}
              </p>
            )}
          </div>

          {/* Precios por mayor */}
          {tienePreciosMayor && (
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 mb-6">
              <h4 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                📦 Precios por Mayor Disponibles
              </h4>

              <div className="space-y-2">
                {producto.precios_por_mayor.map((precio, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-lg"
                  >
                    <span className="font-semibold dark:text-white">
                      {precio.cantidad_minima}+ unidades
                    </span>
                    <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                      Bs {precio.precio_mayor?.toFixed(2) || '0.00'} c/u
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Usos y aplicaciones */}
          {producto.usos_aplicaciones && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mb-4">
              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Usos y Aplicaciones
              </h4>
              <p className="text-lg text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {producto.usos_aplicaciones}
              </p>
            </div>
          )}

          {/* Botón cerrar */}
          <button
            onClick={onCerrar}
            className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetalleProducto;
