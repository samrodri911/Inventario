import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Páginas
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ItemsList from './pages/ItemsList';
import ItemForm from './pages/ItemForm';
import ItemDetail from './pages/ItemDetail';
import MovementForm from './pages/MovementForm';
import CategoriesList from './pages/CategoriesList';
import MovementsList from './pages/MovementsList';

// Componente protector
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const initAuth = useAuthStore(state => state.initAuth);
  const isInitialized = useAuthStore(state => state.isInitialized);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta raíz */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rutas protegidas */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/items" 
          element={
            <ProtectedRoute>
              <ItemsList />
            </ProtectedRoute>
          } 
        />

        {/* Crear item */}
        <Route 
          path="/items/new" 
          element={
            <ProtectedRoute>
              <ItemForm />
            </ProtectedRoute>
          } 
        />

        {/* Editar item */}
        <Route 
          path="/items/:id/edit" 
          element={
            <ProtectedRoute>
              <ItemForm />
            </ProtectedRoute>
          } 
        />
        {/* Ver item */}
        <Route 
          path="/items/:id" 
          element={
            <ProtectedRoute>
              <ItemDetail />
            </ProtectedRoute>
          } 
        />
        {/* Hacer movimientos */}
        <Route 
          path="/movements/new" 
          element={
            <ProtectedRoute>
              <MovementForm />
            </ProtectedRoute>
          } 
        />
        {/* Crud categorias */}
        <Route 
          path="/categories" 
          element={
            <ProtectedRoute>
              <CategoriesList />
            </ProtectedRoute>
          } 
        />
        {/* Ver todos los movimientos */}
        <Route 
          path="/movements" 
          element={
            <ProtectedRoute>
              <MovementsList />
            </ProtectedRoute>
          } 
        />
        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;