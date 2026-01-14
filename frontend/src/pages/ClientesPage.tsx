import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Users, UserPlus, Search, Building2, User, Phone, Mail, FileText, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FormularioCliente from '../components/FormularioCliente'; 

interface CasoRelacionado {
  id: number;
  titulo: string;
  estatus: string;
}

interface Cliente {
  id: number;
  nombre: string;
  documento_identidad: string;
  tipo_persona: 'Fisica' | 'Juridica';
  email: string;
  telefono: string;
  casos?: CasoRelacionado[];
}

const ClientesPage = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/clientes');
      setClientes(res.data);
    } catch (error) {
      console.error("Error cargando clientes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const clientesFiltrados = clientes.filter(c => 
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    c.documento_identidad.includes(busqueda)
  );

  if (loading && clientes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-6">
        <Loader2 className="animate-spin text-accent mb-4" size={40} />
        <p className="font-black text-slate-400 uppercase tracking-widest text-sm text-center">Sincronizando directorio...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto animate-in fade-in duration-500 min-h-screen">
      
      {/* Header Adaptativo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-10 gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-4xl font-black text-slate-950 tracking-tight flex items-center justify-center md:justify-start gap-3 md:gap-4">
            <div className="bg-slate-900 p-2.5 md:p-3 rounded-xl md:rounded-2xl shadow-lg shrink-0">
              <Users className="text-white" size={28} />
            </div>
            Clientes
          </h1>
          <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] md:text-xs tracking-[0.2em]">
            Gestión de directorio legal
          </p>
        </div>
        <button 
          className="w-full md:w-auto bg-accent hover:bg-blue-700 text-white px-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95"
          onClick={() => setShowModal(true)}
        >
          <UserPlus size={20} />
          Nuevo Cliente
        </button>
      </div>

      {/* Barra de Búsqueda Adaptativa */}
      <div className="relative mb-8">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar cliente..."
          className="w-full bg-white border-2 border-slate-100 rounded-xl md:rounded-[2rem] py-3.5 md:py-5 pl-14 pr-6 text-sm md:text-lg font-bold text-slate-900 focus:border-accent focus:outline-none shadow-sm transition-all"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Listado de Clientes: Grid Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {clientesFiltrados.map((cliente) => (
          <div 
            key={cliente.id}
            className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-slate-50 shadow-xl shadow-slate-200/50 p-6 md:p-8 hover:border-accent/30 transition-all group relative overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${cliente.tipo_persona === 'Juridica' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                {cliente.tipo_persona === 'Juridica' ? <Building2 size={24} /> : <User size={24} />}
              </div>
              <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                {cliente.tipo_persona === 'Juridica' ? 'Empresa' : 'Persona'}
              </span>
            </div>

            <h3 className="text-lg md:text-xl font-black text-slate-900 mb-1 truncate uppercase tracking-tight">
              {cliente.nombre}
            </h3>
            <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-tighter mb-6 flex items-center gap-2">
              <FileText size={14} /> {cliente.documento_identidad}
            </p>

            <div className="space-y-3 mb-8 flex-1">
              <div className="flex items-center gap-3 text-slate-600 font-medium text-xs md:text-sm truncate">
                <Phone size={16} className="text-slate-300 shrink-0" />
                {cliente.telefono || 'Sin teléfono'}
              </div>
              <div className="flex items-center gap-3 text-slate-600 font-medium text-xs md:text-sm truncate">
                <Mail size={16} className="text-slate-300 shrink-0" />
                {cliente.email || 'Sin correo'}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
              <div className="flex flex-col text-left">
                <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-tighter">Expedientes</span>
                <span className="text-base md:text-lg font-black text-slate-900">{cliente.casos?.length || 0}</span>
              </div>
              <button 
                onClick={() => navigate(`/clientes/${cliente.id}`)}
                className="bg-slate-100 hover:bg-accent hover:text-white p-3 md:p-4 rounded-xl md:rounded-2xl transition-all text-slate-400 group-hover:translate-x-1"
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <FormularioCliente 
          onClose={() => setShowModal(false)} 
          onSuccess={() => {
            setShowModal(false);
            fetchClientes();
          }} 
        />
      )}
    </div>
  );
};

export default ClientesPage;