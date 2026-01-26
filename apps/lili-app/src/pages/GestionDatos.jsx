import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

function GestionDatos({ menuHamburguesa }) {
  const { theme, toggleTheme } = useTheme();
  const { toast, success, error: mostrarError, cerrarToast } = useToast();
  const [tabActiva, setTabActiva] = useState('proveedores'); // 'proveedores' o 'marcas'
  const [proveedores, setProveedores] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState(null); // { tipo: 'proveedor', nombreViejo: 'X', nombreNuevo: 'Y' }

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar proveedores con estadísticas
      const respProveedores = await fetch(`${import.meta.env.VITE_API_URL}/proveedores/estadisticas`);
      const dataProveedores = await respProveedores.json();
      if (dataProveedores.success) {
        setProveedores(dataProveedores.data);
      }

      // Cargar marcas con estadísticas
      const respMarcas = await fetch(`${import.meta.env.VITE_API_URL}/marcas/estadisticas`);
      const dataMarcas = await respMarcas.json();
      if (dataMarcas.success) {
        setMarcas(dataMarcas.data);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      mostrarError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleRenombrar = async (tipo, nombreViejo, nombreNuevo) => {
    if (!nombreNuevo || nombreNuevo.trim() === '') {
      mostrarError('El nombre no puede estar vacío');
      return;
    }

    if (nombreViejo === nombreNuevo) {
      mostrarError('El nombre nuevo debe ser diferente');
      return;
    }

    try {
      const endpoint = tipo === 'proveedor'
        ? `/proveedores/${encodeURIComponent(nombreViejo)}/renombrar`
        : `/marcas/${encodeURIComponent(nombreViejo)}/renombrar`;

      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombreNuevo }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al renombrar');
      }

      success(`${data.productosActualizados} productos actualizados`);
      setEditando(null);
      cargarDatos();
    } catch (error) {
      console.error('Error:', error);
      mostrarError(error.message || 'Error al renombrar');
    }
  };

  const datos = tabActiva === 'proveedores' ? proveedores : marcas;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-blue-500 dark:bg-blue-700 text-white p-4 shadow-lg relative">
        {menuHamburguesa}
        <h1 className="text-2xl md:text-2xl font-bold text-center">
          GESTIÓN DE DATOS
        </h1>
        <button
          onClick={toggleTheme}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-blue-600 dark:hover:bg-blue-800 transition-colors"
          aria-label="Cambiar tema"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="flex gap-2 border-b-2 border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setTabActiva('proveedores')}
            className={`flex-1 py-4 px-4 font-bold text-lg md:text-xl transition-all ${
              tabActiva === 'proveedores'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-4 border-blue-600 dark:border-blue-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            🏢 Proveedores ({proveedores.length})
          </button>
          <button
            onClick={() => setTabActiva('marcas')}
            className={`flex-1 py-4 px-4 font-bold text-lg md:text-xl transition-all ${
              tabActiva === 'marcas'
                ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border-b-4 border-purple-600 dark:border-purple-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            🏷️ Marcas ({marcas.length})
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando datos...</p>
          </div>
        ) : datos.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
            <p className="text-3xl">📦</p>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              No hay {tabActiva === 'proveedores' ? 'proveedores' : 'marcas'} registrados
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {datos.map((item, index) => (
              <ItemCard
                key={index}
                item={item}
                tipo={tabActiva === 'proveedores' ? 'proveedor' : 'marca'}
                editando={editando}
                onEditar={(nombreViejo) => setEditando({ tipo: tabActiva === 'proveedores' ? 'proveedor' : 'marca', nombreViejo, nombreNuevo: nombreViejo })}
                onCancelar={() => setEditando(null)}
                onGuardar={handleRenombrar}
                setEditando={setEditando}
              />
            ))}
          </div>
        )}
      </div>

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

function ItemCard({ item, tipo, editando, onEditar, onCancelar, onGuardar, setEditando }) {
  const [nuevoNombre, setNuevoNombre] = useState(item.nombre);
  const estaEditando = editando && editando.nombreViejo === item.nombre;

  useEffect(() => {
    if (estaEditando) {
      setNuevoNombre(item.nombre);
    }
  }, [estaEditando, item.nombre]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-2 border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          {estaEditando ? (
            <input
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              className="w-full px-3 py-2 text-lg font-bold border-2 border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
              autoFocus
            />
          ) : (
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {item.nombre}
            </h3>
          )}
          <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
            {item.cantidad_productos} producto{item.cantidad_productos !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-2">
          {estaEditando ? (
            <>
              <button
                onClick={() => onGuardar(tipo, item.nombre, nuevoNombre)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors"
              >
                ✓ Guardar
              </button>
              <button
                onClick={onCancelar}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg font-bold hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                ✕ Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={() => onEditar(item.nombre)}
              className="px-4 py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg font-bold hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
            >
              ✏️ Editar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default GestionDatos;
