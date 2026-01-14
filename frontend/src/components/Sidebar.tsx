import { useState } from 'react';
import { LayoutDashboard, FolderOpen, Bell, MessageSquare, Scale, Users, LogOut, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar el menú en móvil
  const location = useLocation();
  const navigate = useNavigate();

  const usuarioData = localStorage.getItem('usuario');
  const usuario = usuarioData ? JSON.parse(usuarioData) : null;

  const getIniciales = (nombre: string) => {
    return nombre
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Clientes', icon: Users, path: '/clientes' },
    { name: 'Expedientes', icon: FolderOpen, path: '/casos' },
    { name: 'Alertas', icon: Bell, path: '/alertas' },
    { name: 'Chat Legal', icon: MessageSquare, path: '/chat' },
  ];

  // Función para cerrar el sidebar al hacer click en un link (solo en móvil)
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* BOTÓN HAMBURGUESA: Solo visible en móviles */}
      <button 
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-[60] bg-primary p-2.5 rounded-xl shadow-lg border border-slate-700 text-white"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* OVERLAY: Capa oscura al abrir el menú en móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[40] lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* SIDEBAR */}
      <div className={`
        fixed left-0 top-0 h-screen bg-primary text-white flex flex-col shadow-xl z-[50] transition-transform duration-300 ease-in-out
        w-64 
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Logo y Nombre */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-700">
          <div className="bg-accent p-2 rounded-lg">
            <Scale size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Juris IA</span>
        </div>

        {/* Menú de Navegación */}
        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)} // Cerrar al navegar
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-accent text-white shadow-md' 
                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Perfil y Logout */}
        <div className="p-4 border-t border-slate-700 space-y-4 bg-slate-900/50">
          <div className="bg-slate-800/50 p-3 rounded-xl flex items-center gap-3 border border-slate-700">
            <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-xs font-black shrink-0 shadow-inner">
              {usuario ? getIniciales(usuario.nombre_completo) : 'AD'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold leading-none truncate uppercase tracking-tighter">
                {usuario ? usuario.nombre_completo : 'Abogado Admin'}
              </p>
              <p className="text-[9px] text-slate-500 mt-1 uppercase font-black tracking-widest">
                {usuario ? usuario.rol : 'Pro Account'}
              </p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-black text-xs uppercase tracking-widest"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;