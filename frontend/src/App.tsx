import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AlertasPage from './pages/AlertasPage';
import ExpedientesPage from './pages/ExpedientesPage';
import DetalleExpedientePage from './pages/DetalleExpedientePage';
import Dashboard from './pages/Dashboard';
import ChatLegalPage from './pages/ChatLegalPage';
import ClientesPage from './pages/ClientesPage'; 
import LoginPage from './pages/LoginPage';
import DetalleClientePage from './pages/DetalleClientePage'; 

import ProtectedRoute from './components/ProtectedRoute'; 

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/*"
            element={
              <div className="flex min-h-screen bg-slate-50">
                <Sidebar />

                <main className="flex-1 w-full lg:ml-64 min-h-screen overflow-x-hidden transition-all duration-300">
                  <div className="w-full h-full pt-16 lg:pt-0"> 
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/casos" element={<ExpedientesPage />} />
                      <Route path="/alertas" element={<AlertasPage />} />
                      <Route path="/clientes" element={<ClientesPage />} />
                      
                      {/* REPARACIÓN: Eliminamos la ruta duplicada con el "div" de próximamente y dejamos el componente real */}
                      <Route path="/clientes/:id" element={<DetalleClientePage />} />
                      
                      <Route path="/chat" element={<ChatLegalPage />} />
                      <Route path="/casos/:id" element={<DetalleExpedientePage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </div>
                </main>
              </div>
            }
          />
        </Route>

        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;