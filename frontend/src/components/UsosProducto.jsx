function UsosProducto({ producto, onVolver }) {
  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 z-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-blue-500 dark:bg-blue-700 text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center">
          <button
            onClick={onVolver}
            className="text-2xl font-bold hover:bg-blue-600 dark:hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors"
          >
            ← ATRÁS
          </button>
          <h1 className="flex-1 text-center text-lg font-bold pr-24">
            Usos y Aplicaciones
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Referencia del producto */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md mb-6">
          <div className="flex gap-4 items-center">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
              {producto.imagen ? (
                <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">📦</span>
              )}
            </div>

            <div className="flex-1">
              <h2 className="font-bold text-lg dark:text-white">
                {producto.nombre_producto || producto.nombre || producto.descripcion}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {producto.descripcion}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Marca: {producto.marca || 'Sin marca'} | Bs {producto.precio_venta_unidad?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md space-y-6">
          {/* Usos Principales */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              USOS PRINCIPALES
            </h3>
            <div className="h-0.5 bg-gray-200 dark:bg-gray-700 mb-4"></div>

            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              {producto.usos_aplicaciones ? (
                producto.usos_aplicaciones.split('\n').map((uso, index) => (
                  <p key={index} className="pl-4">• {uso}</p>
                ))
              ) : (
                <>
                  <p className="pl-4">• Uso general del producto</p>
                  <p className="pl-4">• Aplicación en diversos contextos</p>
                  <p className="pl-4">• Utilidad para diferentes necesidades</p>
                </>
              )}
            </div>
          </section>

          {/* Aplicaciones */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              APLICACIONES
            </h3>
            <div className="h-0.5 bg-gray-200 dark:bg-gray-700 mb-4"></div>

            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p className="pl-4">• Ideal para estudiantes y profesionales</p>
              <p className="pl-4">• Uso en oficinas y hogares</p>
              <p className="pl-4">• Aplicable en diversos entornos</p>
            </div>
          </section>

          {/* Características */}
          {(producto.nombre_producto || producto.categoria || producto.subcategoria) && (
            <section>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                CARACTERÍSTICAS
              </h3>
              <div className="h-0.5 bg-gray-200 dark:bg-gray-700 mb-4"></div>

              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                {producto.categoria && <p className="pl-4">• Categoría: {producto.categoria}</p>}
                {producto.subcategoria && <p className="pl-4">• Subcategoría: {producto.subcategoria}</p>}
                {producto.marca && <p className="pl-4">• Marca: {producto.marca}</p>}
                {producto.proveedor && <p className="pl-4">• Proveedor: {producto.proveedor}</p>}
              </div>
            </section>
          )}

          {/* Recomendaciones */}
          {producto.notas_internas && (
            <section>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                RECOMENDACIONES
              </h3>
              <div className="h-0.5 bg-gray-200 dark:bg-gray-700 mb-4"></div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="pl-4">{producto.notas_internas}</p>
              </div>
            </section>
          )}
        </div>

        {/* Botón volver */}
        <button
          onClick={onVolver}
          className="w-full mt-6 bg-blue-500 dark:bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors shadow-lg"
        >
          Volver a la Lista
        </button>
      </div>
    </div>
  );
}

export default UsosProducto;
