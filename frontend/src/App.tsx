import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AlertasPage from './pages/AlertasPage';
import ExpedientesPage from './pages/ExpedientesPage';
import DetalleExpedientePage from './pages/DetalleExpedientePage';
import Dashboard from './pages/Dashboard';
import ChatLegalPage from './pages/ChatLegalPage';
import ClientesPage from './pages/ClientesPage'; 
import LoginPage from './pages/LoginPage'; 
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
                {/* El Sidebar ya maneja su responsive interno */}
                <Sidebar />

                {/* CORRECCIÓN CRUCIAL: 
                  - w-full: Ocupa todo el ancho siempre.
                  - lg:ml-64: Solo aplica margen en PC (pantallas grandes).
                  - overflow-x-hidden: Evita que el contenido se salga horizontalmente.
                */}
                <main className="flex-1 w-full lg:ml-64 min-h-screen overflow-x-hidden transition-all duration-300">
                  <div className="w-full h-full pt-16 lg:pt-0"> 
                    {/* pt-16 arriba en móvil para que el contenido no quede debajo del botón hamburguesa */}
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/casos" element={<ExpedientesPage />} />
                      <Route path="/alertas" element={<AlertasPage />} />
                      <Route path="/clientes" element={<ClientesPage />} />
                      <Route path="/clientes/:id" element={<div className="p-10 font-bold text-slate-400">Perfil (Próximamente)</div>} />
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