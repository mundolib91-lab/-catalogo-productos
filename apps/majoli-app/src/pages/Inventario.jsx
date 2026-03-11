import { useState, useEffect, useRef } from 'react';
import APP_CONFIG from '../config';

const API_URL = import.meta.env.VITE_API_URL;

function Inventario({ menuHamburguesa }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Modal editar stock
  const [modalStock, setModalStock] = useState(null); // { producto, ubicacion, label }
  const [nuevoStock, setNuevoStock] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Modal trasladar
  const [modalTrasladar, setModalTrasladar] = useState(null); // { producto, varianteId? }
  const [traslado, setTraslado] = useState({ tienda: 'mundo_lib', cantidad: '' });
  const [trasladando, setTrasladando] = useState(false);

  // Variantes
  const [expandidos, setExpandidos] = useState(new Set());
  const [variantesPorProducto, setVariantesPorProducto] = useState({}); // { productoId: { data: [], loading: false } }

  const searchTimeout = useRef(null);

  const cargarProductos = async (pagina = 1, busqueda = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: pagina, limit: 50, search: busqueda, tienda: APP_CONFIG.tienda });
      const res = await fetch(`${API_URL}/inventario?${params}`);
      const json = await res.json();
      if (json.success) {
        setProductos(json.data);
        setPagination(json.pagination);
      }
    } catch (e) {
      console.error('Error cargando inventario:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos(1, '');
  }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => cargarProductos(1, val), 400);
  };

  const abrirEditarStock = (producto, ubicacion, label) => {
    setModalStock({ producto, ubicacion, label });
    setNuevoStock(String(producto[ubicacion] ?? 0));
  };

  const guardarStock = async () => {
    if (nuevoStock === '' || parseInt(nuevoStock) < 0) return;
    setGuardando(true);
    try {
      if (modalStock.varianteId) {
        // Editar stock de una variante
        const json = await guardarStockVariante(modalStock.varianteId, modalStock.productoId, modalStock.ubicacion, nuevoStock);
        if (json.success) setModalStock(null);
      } else {
        // Editar stock del producto base
        const res = await fetch(`${API_URL}/inventario/${modalStock.producto.id}/stock`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ubicacion: modalStock.ubicacion, cantidad: parseInt(nuevoStock) })
        });
        const json = await res.json();
        if (json.success) {
          setProductos(prev => prev.map(p => p.id === json.data.id ? { ...p, ...json.data } : p));
          setModalStock(null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGuardando(false);
    }
  };

  const ejecutarTraslado = async () => {
    const cant = parseInt(traslado.cantidad);
    if (!cant || cant <= 0) return;
    setTrasladando(true);
    try {
      if (modalTrasladar.varianteId) {
        // Trasladar variante
        const res = await fetch(`${API_URL}/variantes/${modalTrasladar.varianteId}/trasladar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tienda_destino: traslado.tienda, cantidad: cant })
        });
        const json = await res.json();
        if (json.success) {
          const productoId = modalTrasladar.productoId;
          setVariantesPorProducto(prev => ({
            ...prev,
            [productoId]: {
              ...prev[productoId],
              data: prev[productoId].data.map(v => v.id === json.data.id ? json.data : v)
            }
          }));
          setModalTrasladar(null);
          setTraslado({ tienda: 'mundo_lib', cantidad: '' });
        } else {
          alert(json.error);
        }
      } else {
        // Trasladar producto base
        const res = await fetch(`${API_URL}/inventario/trasladar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            producto_id: modalTrasladar.producto.id,
            tienda_destino: traslado.tienda,
            cantidad: cant
          })
        });
        const json = await res.json();
        if (json.success) {
          setProductos(prev => prev.map(p => p.id === json.data.id ? { ...p, ...json.data } : p));
          setModalTrasladar(null);
          setTraslado({ tienda: 'mundo_lib', cantidad: '' });
        } else {
          alert(json.error);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTrasladando(false);
    }
  };

  const totalStock = (p) =>
    (p.stock_deposito || 0) + (p.stock_mundo_lib || 0) + (p.stock_majoli || 0) + (p.stock_lili || 0);

  const toggleExpandir = async (productoId) => {
    const nuevosExpandidos = new Set(expandidos);
    if (nuevosExpandidos.has(productoId)) {
      nuevosExpandidos.delete(productoId);
    } else {
      nuevosExpandidos.add(productoId);
      if (!variantesPorProducto[productoId]) {
        setVariantesPorProducto(prev => ({ ...prev, [productoId]: { data: [], loading: true } }));
        try {
          const res = await fetch(`${API_URL}/productos/${productoId}/variantes`);
          const json = await res.json();
          setVariantesPorProducto(prev => ({
            ...prev,
            [productoId]: { data: json.success ? json.data : [], loading: false }
          }));
        } catch (e) {
          setVariantesPorProducto(prev => ({ ...prev, [productoId]: { data: [], loading: false } }));
        }
      }
    }
    setExpandidos(nuevosExpandidos);
  };

  const guardarStockVariante = async (varianteId, productoId, ubicacion, cantidad) => {
    const res = await fetch(`${API_URL}/variantes/${varianteId}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ubicacion, cantidad: parseInt(cantidad) })
    });
    const json = await res.json();
    if (json.success) {
      setVariantesPorProducto(prev => ({
        ...prev,
        [productoId]: {
          ...prev[productoId],
          data: prev[productoId].data.map(v => v.id === json.data.id ? json.data : v)
        }
      }));
    }
    return json;
  };

  const stockTiendaDestino = modalTrasladar
    ? (modalTrasladar.producto[`stock_${traslado.tienda}`] || 0)
    : 0;
  const cantTraslado = parseInt(traslado.cantidad) || 0;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 sticky top-0 z-10">
        <div className="relative flex items-center justify-center">
          {menuHamburguesa}
          <h1 className="text-2xl font-bold">Inventario</h1>
        </div>
        <div className="mt-3">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Buscar producto..."
            className="w-full px-4 py-2 rounded-lg text-gray-900 text-lg"
          />
        </div>
        <div className="mt-2 text-sm opacity-80 text-center">
          {pagination.total} productos en existencias
        </div>
      </div>

      {/* Tabla con scroll horizontal */}
      <div className="overflow-x-auto relative z-0">
        <table className="w-full border-collapse bg-white dark:bg-gray-800 text-base min-w-[520px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-200 dark:border-gray-600">
              <th className="sticky left-0 bg-gray-50 dark:bg-gray-700 text-left px-3 py-3 font-bold text-gray-700 dark:text-gray-300 min-w-[180px] z-10">
                Producto
              </th>
              <th className="px-2 py-3 text-center font-bold text-orange-600 dark:text-orange-400 min-w-[55px]">Dep</th>
              <th className="px-2 py-3 text-center font-bold text-amber-600 dark:text-amber-400 min-w-[55px]">ML</th>
              <th className="px-2 py-3 text-center font-bold text-emerald-600 dark:text-emerald-400 min-w-[55px]">Maj</th>
              <th className="px-2 py-3 text-center font-bold text-pink-600 dark:text-pink-400 min-w-[55px]">Lili</th>
              <th className="px-2 py-3 text-center font-bold text-gray-600 dark:text-gray-400 min-w-[55px]">Tot</th>
              <th className="px-2 py-3 min-w-[50px]"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-gray-500 dark:text-gray-400 text-lg">
                  Cargando...
                </td>
              </tr>
            ) : productos.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-gray-500 dark:text-gray-400 text-lg">
                  {search ? 'Sin resultados' : 'No hay productos en existencias'}
                </td>
              </tr>
            ) : (
              productos.flatMap((p, i) => {
                const rowBg = i % 2 === 0
                  ? 'bg-white dark:bg-gray-800'
                  : 'bg-gray-50 dark:bg-gray-850';
                const estaExpandido = expandidos.has(p.id);
                const variantesInfo = variantesPorProducto[p.id];
                const tieneVariantes = variantesInfo && variantesInfo.data.length > 0;

                const filaProducto = (
                  <tr key={p.id} className={`border-b border-gray-100 dark:border-gray-700 ${rowBg}`}>
                    {/* Producto - columna pegada */}
                    <td className={`sticky left-0 px-3 py-2 z-10 ${rowBg}`}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleExpandir(p.id)}
                          className={`w-6 h-6 flex-shrink-0 rounded text-sm font-bold transition-colors ${
                            estaExpandido
                              ? 'bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-purple-900/40'
                          }`}
                          title="Ver/ocultar variantes"
                        >
                          {variantesInfo?.loading ? '⟳' : estaExpandido ? '▼' : '▶'}
                        </button>
                        {p.imagen ? (
                          <img src={p.imagen} alt="" className="w-10 h-10 object-cover rounded flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0 flex items-center justify-center text-gray-400 text-lg">
                            ?
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 dark:text-white text-sm leading-tight truncate max-w-[110px]">
                            {p.descripcion}
                          </div>
                          {p.marca && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[110px]">{p.marca}</div>
                          )}
                          {tieneVariantes && (
                            <div className="text-xs text-purple-600 dark:text-purple-400">{variantesInfo.data.length} variantes</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Deposito */}
                    <td className="px-1 py-2 text-center">
                      <button
                        onClick={() => abrirEditarStock(p, 'stock_deposito', 'Deposito')}
                        className="w-11 h-9 rounded-lg font-bold text-base bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800/60 transition-colors"
                      >
                        {p.stock_deposito ?? 0}
                      </button>
                    </td>

                    {/* Mundo Lib */}
                    <td className="px-1 py-2 text-center">
                      <button
                        onClick={() => abrirEditarStock(p, 'stock_mundo_lib', 'Mundo Lib')}
                        className="w-11 h-9 rounded-lg font-bold text-base bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800/60 transition-colors"
                      >
                        {p.stock_mundo_lib ?? 0}
                      </button>
                    </td>

                    {/* Majoli */}
                    <td className="px-1 py-2 text-center">
                      <button
                        onClick={() => abrirEditarStock(p, 'stock_majoli', 'Majoli')}
                        className="w-11 h-9 rounded-lg font-bold text-base bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800/60 transition-colors"
                      >
                        {p.stock_majoli ?? 0}
                      </button>
                    </td>

                    {/* Lili */}
                    <td className="px-1 py-2 text-center">
                      <button
                        onClick={() => abrirEditarStock(p, 'stock_lili', 'Lili')}
                        className="w-11 h-9 rounded-lg font-bold text-base bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-800/60 transition-colors"
                      >
                        {p.stock_lili ?? 0}
                      </button>
                    </td>

                    {/* Total */}
                    <td className="px-1 py-2 text-center font-bold text-gray-700 dark:text-gray-300 text-base">
                      {totalStock(p)}
                    </td>

                    {/* Trasladar */}
                    <td className="px-1 py-2 text-center">
                      <button
                        onClick={() => {
                          setModalTrasladar({ producto: p });
                          setTraslado({ tienda: 'mundo_lib', cantidad: '' });
                        }}
                        className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-colors text-base font-bold"
                        title="Trasladar deposito a tienda"
                      >
                        ↔
                      </button>
                    </td>
                  </tr>
                );

                // Filas de variantes (si está expandido)
                const filasVariantes = estaExpandido && variantesInfo ? (
                  variantesInfo.loading ? [
                    <tr key={`${p.id}-loading`} className="bg-purple-50 dark:bg-purple-900/10">
                      <td colSpan={7} className="px-6 py-2 text-purple-500 text-sm italic">Cargando variantes...</td>
                    </tr>
                  ] : variantesInfo.data.length === 0 ? [
                    <tr key={`${p.id}-empty`} className="bg-purple-50 dark:bg-purple-900/10">
                      <td colSpan={7} className="px-6 py-2 text-gray-400 text-sm italic">Sin variantes registradas</td>
                    </tr>
                  ] : variantesInfo.data.map(v => (
                    <tr key={`v-${v.id}`} className="bg-purple-50 dark:bg-purple-900/10 border-b border-purple-100 dark:border-purple-900/30">
                      <td className="sticky left-0 bg-purple-50 dark:bg-purple-900/10 px-3 py-1.5 z-10">
                        <div className="flex items-center gap-2 pl-8">
                          <span className="text-xs bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded font-semibold uppercase">{v.tipo}</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{v.valor}</span>
                          {v.precio_venta && (
                            <span className="text-green-600 dark:text-green-400 text-xs">Bs {parseFloat(v.precio_venta).toFixed(2)}</span>
                          )}
                        </div>
                      </td>
                      {['stock_deposito', 'stock_mundo_lib', 'stock_majoli', 'stock_lili'].map((campo, ci) => {
                        const colores = [
                          'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100',
                          'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100',
                          'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100',
                          'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 hover:bg-pink-100'
                        ];
                        const labels = ['Deposito', 'Mundo Lib', 'Majoli', 'Lili'];
                        return (
                          <td key={campo} className="px-1 py-1.5 text-center">
                            <button
                              onClick={() => {
                                setModalStock({ producto: { ...v, descripcion: `${p.descripcion} - ${v.valor}` }, ubicacion: campo, label: labels[ci], varianteId: v.id, productoId: p.id });
                                setNuevoStock(String(v[campo] ?? 0));
                              }}
                              className={`w-11 h-8 rounded-lg font-bold text-sm ${colores[ci]} transition-colors`}
                            >
                              {v[campo] ?? 0}
                            </button>
                          </td>
                        );
                      })}
                      <td className="px-1 py-1.5 text-center text-sm font-bold text-purple-700 dark:text-purple-300">
                        {totalStock(v)}
                      </td>
                      <td className="px-1 py-1.5 text-center">
                        <button
                          onClick={() => {
                            setModalTrasladar({ producto: { ...v, descripcion: `${p.descripcion} - ${v.valor}` }, varianteId: v.id, productoId: p.id });
                            setTraslado({ tienda: 'mundo_lib', cantidad: '' });
                          }}
                          className="w-9 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 transition-colors text-sm font-bold"
                          title="Trasladar deposito a tienda"
                        >
                          ↔
                        </button>
                      </td>
                    </tr>
                  ))
                ) : [];

                return [filaProducto, ...filasVariantes];
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginacion */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 p-4">
          <button
            disabled={pagination.page <= 1}
            onClick={() => cargarProductos(pagination.page - 1, search)}
            className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-40 font-semibold"
          >
            Anterior
          </button>
          <span className="text-gray-600 dark:text-gray-400 font-semibold">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => cargarProductos(pagination.page + 1, search)}
            className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-40 font-semibold"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal Editar Stock */}
      {modalStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Editar stock - {modalStock.label}
            </h3>
            <p className="text-base text-gray-500 dark:text-gray-400 mb-5">
              {modalStock.producto.descripcion}
            </p>
            <div className="mb-5">
              <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Stock actual: <span className="text-gray-900 dark:text-white">{modalStock.producto[modalStock.ubicacion] ?? 0}</span>
              </label>
              <input
                type="number"
                min="0"
                value={nuevoStock}
                onChange={e => setNuevoStock(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && guardarStock()}
                className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-2xl text-center font-bold bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-green-500 focus:outline-none"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setModalStock(null)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-lg"
              >
                Cancelar
              </button>
              <button
                onClick={guardarStock}
                disabled={guardando || nuevoStock === ''}
                className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold text-lg disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Trasladar */}
      {modalTrasladar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Trasladar a tienda
            </h3>
            <p className="text-base text-gray-500 dark:text-gray-400 mb-4">
              {modalTrasladar.producto.descripcion}
            </p>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 mb-4 text-center">
              <span className="text-base text-orange-700 dark:text-orange-300 font-semibold">
                Deposito disponible: {modalTrasladar.producto.stock_deposito ?? 0} unidades
              </span>
            </div>
            <div className="mb-4">
              <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tienda destino
              </label>
              <select
                value={traslado.tienda}
                onChange={e => setTraslado(prev => ({ ...prev, tienda: e.target.value }))}
                className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="mundo_lib">Mundo Lib (tiene: {modalTrasladar.producto.stock_mundo_lib ?? 0})</option>
                <option value="majoli">Majoli (tiene: {modalTrasladar.producto.stock_majoli ?? 0})</option>
                <option value="lili">Lili Cosmeticos (tiene: {modalTrasladar.producto.stock_lili ?? 0})</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Cantidad a trasladar
              </label>
              <input
                type="number"
                min="1"
                max={modalTrasladar.producto.stock_deposito ?? 0}
                value={traslado.cantidad}
                onChange={e => setTraslado(prev => ({ ...prev, cantidad: e.target.value }))}
                placeholder="0"
                className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-2xl text-center font-bold bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                autoFocus
              />
            </div>
            {cantTraslado > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 mb-4 text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <div>Deposito: {modalTrasladar.producto.stock_deposito ?? 0} &rarr; {(modalTrasladar.producto.stock_deposito ?? 0) - cantTraslado}</div>
                <div>
                  {traslado.tienda === 'mundo_lib' ? 'Mundo Lib' : traslado.tienda === 'majoli' ? 'Majoli' : 'Lili'}
                  : {stockTiendaDestino} &rarr; {stockTiendaDestino + cantTraslado}
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setModalTrasladar(null)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-lg"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarTraslado}
                disabled={trasladando || cantTraslado <= 0 || cantTraslado > (modalTrasladar.producto.stock_deposito ?? 0)}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold text-lg disabled:opacity-50"
              >
                {trasladando ? 'Trasladando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventario;
