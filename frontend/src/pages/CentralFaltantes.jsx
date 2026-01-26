import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

function CentralFaltantes({ menuHamburguesa }) {
  const { theme, toggleTheme } = useTheme();
  const { toast, success, error: mostrarError, cerrarToast } = useToast();

  const [faltantes, setFaltantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [estadoActivo, setEstadoActivo] = useState('todos');

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroOrigen, setFiltroOrigen] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');

  // Modal detalle
  const [faltanteSeleccionado, setFaltanteSeleccionado] = useState(null);

  // Contadores por estado
  const [contadores, setContadores] = useState({
    todos: 0,
    reportado: 0,
    confirmado: 0,
    en_compras: 0,
    pedido: 0,
    recibido: 0
  });

  useEffect(() => {
    cargarFaltantes();
  }, [estadoActivo, filtroTipo, filtroOrigen, filtroPrioridad]);

  const cargarFaltantes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (estadoActivo !== 'todos') {
        params.append('estado', estadoActivo);
      }
      if (filtroTipo) params.append('tipo', filtroTipo);
      if (filtroOrigen) params.append('origen', filtroOrigen);
      if (filtroPrioridad) params.append('prioridad', filtroPrioridad);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/faltantes?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Error al cargar faltantes');
      }

      const result = await response.json();
      setFaltantes(result.data || []);

      // Calcular contadores (hacer otra petición sin filtros para obtener totales)
      const responseContadores = await fetch(
        `${import.meta.env.VITE_API_URL}/faltantes?limit=1000`
      );
      if (responseContadores.ok) {
        const resultContadores = await responseContadores.json();
        const todos = resultContadores.data || [];

        setContadores({
          todos: todos.length,
          reportado: todos.filter(f => f.estado === 'reportado').length,
          confirmado: todos.filter(f => f.estado === 'confirmado').length,
          en_compras: todos.filter(f => f.estado === 'en_compras').length,
          pedido: todos.filter(f => f.estado === 'pedido').length,
          recibido: todos.filter(f => f.estado === 'recibido').length
        });
      }
    } catch (error) {
      console.error('Error al cargar faltantes:', error);
      mostrarError('Error al cargar faltantes');
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (faltanteId, nuevoEstado, nota = '') => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/faltantes/${faltanteId}/estado`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            estado: nuevoEstado,
            nota: nota || `Cambio a estado: ${nuevoEstado}`,
            rol: 'atencion_cliente' // TODO: cambiar según el rol del usuario
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Error al cambiar estado');
      }

      success('Estado actualizado correctamente');
      cargarFaltantes();
      setFaltanteSeleccionado(null);
    } catch (error) {
      console.error('Error:', error);
      mostrarError('Error al cambiar estado');
    }
  };

  const calcularTiempoEnEstado = (fechaCambio) => {
    const ahora = new Date();
    const fecha = new Date(fechaCambio);
    const diffMs = ahora - fecha;
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffHoras / 24);

    if (diffDias > 0) {
      return `Hace ${diffDias} día${diffDias > 1 ? 's' : ''}`;
    } else if (diffHoras > 0) {
      return `Hace ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
    } else {
      return 'Hace menos de 1 hora';
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

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Header */}
        <div className="bg-red-600 dark:bg-red-700 text-white p-4 shadow-lg relative">
          {menuHamburguesa}

          <h1 className="text-2xl md:text-2xl font-bold text-center">
            🔴 Central Faltantes
          </h1>

          <button
            onClick={toggleTheme}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
            aria-label="Cambiar tema"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        {/* Pestañas de estado */}
        <div className="bg-white dark:bg-gray-800 shadow-md overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex gap-2 flex-nowrap">
              {/* Pestaña Todos */}
              <button
                onClick={() => setEstadoActivo('todos')}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-lg font-bold transition-all ${
                  estadoActivo === 'todos'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                Todos ({contadores.todos})
              </button>

              {/* Pestañas de estados */}
              {[
                { estado: 'reportado', label: 'Reportados', color: 'red' },
                { estado: 'confirmado', label: 'Confirmados', color: 'orange' },
                { estado: 'en_compras', label: 'En Compras', color: 'blue' },
                { estado: 'pedido', label: 'Pedidos', color: 'purple' },
                { estado: 'recibido', label: 'Recibidos', color: 'green' }
              ].map(({ estado, label, color }) => (
                <button
                  key={estado}
                  onClick={() => setEstadoActivo(estado)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-lg font-bold transition-all ${
                    estadoActivo === estado
                      ? `bg-${color}-600 text-white`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {label} ({contadores[estado]})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-3">Filtros:</p>
            <div className="flex flex-wrap gap-2">
              {/* Filtro Tipo */}
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-lg"
              >
                <option value="">Todos los tipos</option>
                <option value="existente">Existente</option>
                <option value="nuevo">Nuevo</option>
                <option value="grupo">Grupo/Repisa</option>
              </select>

              {/* Filtro Origen */}
              <select
                value={filtroOrigen}
                onChange={(e) => setFiltroOrigen(e.target.value)}
                className="px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-lg"
              >
                <option value="">Todos los orígenes</option>
                <option value="atencion_cliente">Atención Cliente</option>
                <option value="inventario">Inventario</option>
              </select>

              {/* Filtro Prioridad */}
              <select
                value={filtroPrioridad}
                onChange={(e) => setFiltroPrioridad(e.target.value)}
                className="px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-lg"
              >
                <option value="">Todas las prioridades</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>

              {/* Limpiar filtros */}
              {(filtroTipo || filtroOrigen || filtroPrioridad) && (
                <button
                  onClick={() => {
                    setFiltroTipo('');
                    setFiltroOrigen('');
                    setFiltroPrioridad('');
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-lg font-medium"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lista de faltantes */}
        <div className="max-w-7xl mx-auto px-4 pb-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-2xl text-gray-600 dark:text-gray-400">Cargando faltantes...</p>
            </div>
          ) : faltantes.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
              <p className="text-2xl text-gray-600 dark:text-gray-400">
                No hay faltantes con estos filtros
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {faltantes.map((faltante) => (
                <FaltanteCard
                  key={faltante.id}
                  faltante={faltante}
                  onCambiarEstado={(nuevoEstado) => cambiarEstado(faltante.id, nuevoEstado)}
                  onVerDetalle={() => setFaltanteSeleccionado(faltante)}
                  calcularTiempoEnEstado={calcularTiempoEnEstado}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modal de Detalle */}
        {faltanteSeleccionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header del modal */}
              <div className="bg-red-600 dark:bg-red-700 text-white p-4 rounded-t-xl flex justify-between items-center">
                <h2 className="text-2xl font-bold">Detalle del Faltante</h2>
                <button
                  onClick={() => setFaltanteSeleccionado(null)}
                  className="text-3xl hover:bg-red-700 dark:hover:bg-red-800 rounded-full w-10 h-10 flex items-center justify-center"
                >
                  ×
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="p-6">
                {/* Imagen grande */}
                {faltanteSeleccionado.imagen && (
                  <div className="mb-4">
                    <img
                      src={faltanteSeleccionado.imagen}
                      alt={faltanteSeleccionado.descripcion}
                      className="w-full max-h-64 object-contain rounded-lg"
                    />
                  </div>
                )}

                {/* Información principal */}
                <div className="space-y-4">
                  <div>
                    <p className="text-lg font-bold text-gray-500 dark:text-gray-400">Descripción:</p>
                    <p className="text-xl text-gray-900 dark:text-white">
                      {faltanteSeleccionado.producto_nombre || faltanteSeleccionado.descripcion}
                    </p>
                  </div>

                  {faltanteSeleccionado.notas && (
                    <div>
                      <p className="text-lg font-bold text-gray-500 dark:text-gray-400">Notas:</p>
                      <p className="text-xl text-gray-900 dark:text-white">
                        {faltanteSeleccionado.notas}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-lg font-bold text-gray-500 dark:text-gray-400">Tipo:</p>
                      <p className="text-xl text-gray-900 dark:text-white capitalize">
                        {faltanteSeleccionado.tipo === 'existente' ? 'Existente' :
                         faltanteSeleccionado.tipo === 'nuevo' ? 'Nuevo' :
                         'Grupo/Repisa'}
                      </p>
                    </div>

                    <div>
                      <p className="text-lg font-bold text-gray-500 dark:text-gray-400">Origen:</p>
                      <p className="text-xl text-gray-900 dark:text-white">
                        {faltanteSeleccionado.origen === 'atencion_cliente' ? 'Atención Cliente' : 'Inventario'}
                      </p>
                    </div>

                    <div>
                      <p className="text-lg font-bold text-gray-500 dark:text-gray-400">Prioridad:</p>
                      <p className={`text-xl font-bold ${
                        faltanteSeleccionado.prioridad === 'alta' ? 'text-red-600' :
                        faltanteSeleccionado.prioridad === 'media' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {faltanteSeleccionado.prioridad?.toUpperCase()}
                      </p>
                    </div>

                    <div>
                      <p className="text-lg font-bold text-gray-500 dark:text-gray-400">Estado:</p>
                      <p className="text-xl text-gray-900 dark:text-white">
                        {faltanteSeleccionado.estado === 'reportado' ? '🔴 REPORTADO' :
                         faltanteSeleccionado.estado === 'confirmado' ? '🟠 CONFIRMADO' :
                         faltanteSeleccionado.estado === 'en_compras' ? '🔵 EN COMPRAS' :
                         faltanteSeleccionado.estado === 'pedido' ? '🟣 PEDIDO' :
                         faltanteSeleccionado.estado === 'recibido' ? '🟢 RECIBIDO' :
                         '⚪ ARCHIVADO'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-lg font-bold text-gray-500 dark:text-gray-400">ID del Faltante:</p>
                    <p className="text-xl text-gray-900 dark:text-white">
                      #FLT-{String(faltanteSeleccionado.id).padStart(5, '0')}
                    </p>
                  </div>

                  <div>
                    <p className="text-lg font-bold text-gray-500 dark:text-gray-400">Tiempo en este estado:</p>
                    <p className="text-xl text-gray-900 dark:text-white">
                      {calcularTiempoEnEstado(faltanteSeleccionado.fecha_cambio_estado)}
                    </p>
                  </div>
                </div>

                {/* Botón cerrar */}
                <button
                  onClick={() => setFaltanteSeleccionado(null)}
                  className="mt-6 w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-xl font-bold"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Componente Card de Faltante
function FaltanteCard({ faltante, onCambiarEstado, onVerDetalle, calcularTiempoEnEstado }) {
  const estadoConfig = {
    reportado: { color: 'red', label: 'REPORTADO', emoji: '🔴' },
    confirmado: { color: 'orange', label: 'CONFIRMADO', emoji: '🟠' },
    en_compras: { color: 'blue', label: 'EN COMPRAS', emoji: '🔵' },
    pedido: { color: 'purple', label: 'PEDIDO', emoji: '🟣' },
    recibido: { color: 'green', label: 'RECIBIDO', emoji: '🟢' },
    archivado: { color: 'gray', label: 'ARCHIVADO', emoji: '⚪' }
  };

  const tipoConfig = {
    existente: { color: 'green', label: 'Existente' },
    nuevo: { color: 'yellow', label: 'Nuevo' },
    grupo: { color: 'red', label: 'Grupo' }
  };

  const origenConfig = {
    atencion_cliente: { label: 'Cliente', color: 'blue' },
    inventario: { label: 'Inventario', color: 'green' }
  };

  const prioridadConfig = {
    alta: { color: 'red', label: 'ALTA' },
    media: { color: 'yellow', label: 'MEDIA' },
    baja: { color: 'green', label: 'BAJA' }
  };

  const config = estadoConfig[faltante.estado] || estadoConfig.reportado;
  const tipoInfo = tipoConfig[faltante.tipo] || tipoConfig.existente;
  const origenInfo = origenConfig[faltante.origen] || origenConfig.atencion_cliente;
  const prioridadInfo = prioridadConfig[faltante.prioridad] || prioridadConfig.media;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border-2 border-${config.color}-300 dark:border-${config.color}-700 shadow-lg p-4`}>
      {/* Badges superiores */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-3 py-1 rounded-full text-base font-bold bg-${config.color}-500 text-white`}>
          {config.emoji} {config.label}
        </span>
        <span className={`px-3 py-1 rounded-full text-base bg-${tipoInfo.color}-100 dark:bg-${tipoInfo.color}-900/30 text-${tipoInfo.color}-800 dark:text-${tipoInfo.color}-200`}>
          {tipoInfo.label}
        </span>
        <span className={`px-3 py-1 rounded-full text-base bg-${origenInfo.color}-100 dark:bg-${origenInfo.color}-900/30 text-${origenInfo.color}-800 dark:text-${origenInfo.color}-200`}>
          {origenInfo.label}
        </span>
        <span className={`px-3 py-1 rounded-full text-base font-bold bg-${prioridadInfo.color}-100 dark:bg-${prioridadInfo.color}-900/30 text-${prioridadInfo.color}-800 dark:text-${prioridadInfo.color}-200`}>
          {prioridadInfo.label}
        </span>
      </div>

      {/* Imagen y descripción */}
      <div className="flex gap-3 mb-3">
        {faltante.imagen && (
          <img
            src={faltante.imagen}
            alt={faltante.descripcion}
            className="w-20 h-20 object-cover rounded-lg"
          />
        )}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
            {faltante.producto_nombre || faltante.descripcion}
          </h3>
          {faltante.notas && (
            <p className="text-base text-gray-600 dark:text-gray-400 line-clamp-2">
              {faltante.notas}
            </p>
          )}
        </div>
      </div>

      {/* Tiempo en estado */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2 mb-3">
        <p className="text-base text-yellow-800 dark:text-yellow-200">
          ⏱️ En este estado: {calcularTiempoEnEstado(faltante.fecha_cambio_estado)}
        </p>
      </div>

      {/* Botón Ver Detalle */}
      <button
        onClick={onVerDetalle}
        className="w-full py-2 mb-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors text-lg font-semibold"
      >
        Ver Detalle
      </button>

      {/* Botones de Estado */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onCambiarEstado('reportado')}
          disabled={faltante.estado === 'reportado'}
          className={`py-2 rounded-lg transition-colors text-sm font-bold ${
            faltante.estado === 'reportado'
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60'
          }`}
        >
          🔴 Reportado
        </button>
        <button
          onClick={() => onCambiarEstado('confirmado')}
          disabled={faltante.estado === 'confirmado'}
          className={`py-2 rounded-lg transition-colors text-sm font-bold ${
            faltante.estado === 'confirmado'
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/60'
          }`}
        >
          🟠 Confirmado
        </button>
        <button
          onClick={() => onCambiarEstado('en_compras')}
          disabled={faltante.estado === 'en_compras'}
          className={`py-2 rounded-lg transition-colors text-sm font-bold ${
            faltante.estado === 'en_compras'
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/60'
          }`}
        >
          🔵 En Compras
        </button>
        <button
          onClick={() => onCambiarEstado('pedido')}
          disabled={faltante.estado === 'pedido'}
          className={`py-2 rounded-lg transition-colors text-sm font-bold ${
            faltante.estado === 'pedido'
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/60'
          }`}
        >
          🟣 Pedido
        </button>
        <button
          onClick={() => onCambiarEstado('recibido')}
          disabled={faltante.estado === 'recibido'}
          className={`py-2 rounded-lg transition-colors text-sm font-bold ${
            faltante.estado === 'recibido'
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/60'
          }`}
        >
          🟢 Recibido
        </button>
        <button
          onClick={() => onCambiarEstado('archivado')}
          disabled={faltante.estado === 'archivado'}
          className={`py-2 rounded-lg transition-colors text-sm font-bold ${
            faltante.estado === 'archivado'
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
          }`}
        >
          ⚪ Archivar
        </button>
      </div>
    </div>
  );
}

export default CentralFaltantes;
