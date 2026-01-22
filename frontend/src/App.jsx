import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Registro from './pages/Registro';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Navbar */}
        <nav className="bg-blue-600 text-white shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <h1 className="text-xl font-bold">📦 Catálogo Productos</h1>
                <div className="hidden md:flex space-x-4">
                  <Link 
                    to="/registro" 
                    className="px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    📝 Registro
                  </Link>
                  <Link 
                    to="/atencion" 
                    className="px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    👥 Atención
                  </Link>
                  <Link 
                    to="/inventario" 
                    className="px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    📊 Inventario
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Rutas */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/registro" element={<Registro />} />
          {/* Más rutas después */}
        </Routes>
      </div>
    </Router>
  );
}

// Componente Home temporal
function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Bienvenido al Sistema de Catálogo
        </h2>
        <p className="text-gray-600 mb-8">
          Selecciona una opción del menú superior
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Link 
            to="/registro" 
            className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-lg transition"
          >
            <div className="text-4xl mb-2">📝</div>
            <div className="font-bold">Registro de Productos</div>
          </Link>
          <div className="bg-gray-300 text-gray-600 p-6 rounded-lg">
            <div className="text-4xl mb-2">👥</div>
            <div className="font-bold">Atención al Cliente</div>
            <div className="text-sm mt-2">(Próximamente)</div>
          </div>
          <div className="bg-gray-300 text-gray-600 p-6 rounded-lg">
            <div className="text-4xl mb-2">📊</div>
            <div className="font-bold">Inventario</div>
            <div className="text-sm mt-2">(Próximamente)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;