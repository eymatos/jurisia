import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import api from '../api/axios';
import { FolderOpen, Plus, Search, Gavel, User, X, Loader2, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Caso {
  id: number;
  titulo: string;
  numero_expediente: string;
  tribunales: string;
  estatus: string;
  fecha_apertura: string;
  cliente: {
    nombre: string;
  };
}

interface ClienteSimplificado {
  id: number;
  nombre: string;
}

const ExpedientesPage = () => {
  const [casos, setCasos] = useState<Caso[]>([]);
  const [clientes, setClientes] = useState<ClienteSimplificado[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const [nuevoCaso, setNuevoCaso] = useState({
    titulo: '',
    tribunales: '',
    clienteId: '' 
  });

  const cargarCasos = async () => {
    try {
      const res = await api.get('/casos');
      setCasos(res.data);
    } catch (err) {
      console.error("Error al cargar expedientes", err);
    }
  };

  const cargarClientes = async () => {
    try {
      const res = await api.get('/clientes');
      setClientes(res.data);
    } catch (err) {
      console.error("Error al cargar la lista de clientes", err);
    }
  };

  useEffect(() => {
    cargarCasos();
    cargarClientes();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNuevoCaso({ ...nuevoCaso, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const datosAEnviar = {
        ...nuevoCaso,
        clienteId: Number(nuevoCaso.clienteId)
      };
      
      await api.post('/casos', datosAEnviar);
      setIsModalOpen(false);
      setNuevoCaso({ titulo: '', tribunales: '', clienteId: '' });
      await cargarCasos(); 
    } catch (err) {
      alert("Error al crear el expediente.");
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  const casosFiltrados = casos.filter(caso => 
    caso.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    (caso.numero_expediente && caso.numero_expediente.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500 bg-slate-50 min-h-screen">
      {/* Header con diseño más limpio */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FolderOpen className="text-blue-600" size={32} />
            Expedientes Jurídicos
          </h1>
          <p className="text-slate-500 font-medium mt-1">Administración centralizada de procesos y litigios.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-blue-200 font-bold active:scale-95"
        >
          <Plus size={22} />
          Nuevo Expediente
        </button>
      </div>

      {/* Buscador estilizado */}
      <div className="relative mb-12">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
        <input 
          type="text"
          placeholder="Filtrar por nombre, cliente o número de expediente..."
          className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all shadow-sm text-slate-800 font-medium placeholder:text-slate-400"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Grid Optimizado: 4 columnas en pantallas grandes para evitar espacio vacío */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {casosFiltrados.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white rounded-[2.5rem] border border-slate-200 shadow-sm">
            <FolderOpen size={48} className="text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900">No se encontraron expedientes</h3>
            <p className="text-slate-500">Intenta con otro término de búsqueda.</p>
          </div>
        ) : (
          casosFiltrados.map(caso => (
            <Link 
              key={caso.id}
              to={`/casos/${caso.id}`} 
              className="group bg-white rounded-[2rem] border border-slate-200 p-6 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 flex flex-col relative overflow-hidden"
            >
              {/* Badge de Estatus Decorativo */}
              <div className="flex justify-between items-start mb-6">
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  caso.estatus === 'Abierto' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                }`}>
                  {caso.estatus}
                </div>
                <div className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                  {caso.numero_expediente}
                </div>
              </div>
              
              <h3 className="text-lg font-black text-slate-900 mb-6 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3rem]">
                {caso.titulo}
              </h3>

              {/* Información Compacta */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-600 font-semibold">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                    <User size={16} />
                  </div>
                  <span className="truncate">{caso.cliente?.nombre || 'Sin Cliente'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 font-semibold">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                    <Gavel size={16} />
                  </div>
                  <span className="truncate">{caso.tribunales || 'Sede no asignada'}</span>
                </div>
              </div>

              {/* Footer de Tarjeta */}
              <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                  <Calendar size={12} />
                  {caso.fecha_apertura ? new Date(caso.fecha_apertura).toLocaleDateString() : 'Reciente'}
                </div>
                <div className="text-blue-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                  <ChevronRight size={18} />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Modal - Se mantiene igual pero con ligeros ajustes de padding */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">NUEVO CASO</h2>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-slate-100 p-2 rounded-full transition-colors text-slate-400">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Título Descriptivo</label>
                <input required name="titulo" value={nuevoCaso.titulo} onChange={handleInputChange} type="text" placeholder="Ej: Litigio Civil - Propiedad A" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all text-slate-900 font-bold" />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Cliente Asociado</label>
                <select 
                  required 
                  name="clienteId" 
                  value={nuevoCaso.clienteId} 
                  onChange={handleInputChange} 
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all text-slate-900 font-bold appearance-none cursor-pointer"
                >
                  <option value="">Seleccione un cliente...</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Tribunal o Sede</label>
                <input name="tribunales" value={nuevoCaso.tribunales} onChange={handleInputChange} type="text" placeholder="Cámara Civil y Comercial" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all text-slate-900 font-bold" />
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-[11px] text-blue-700 font-medium">
                El sistema generará automáticamente un código de expediente único tras el registro.
              </div>

              <button 
                disabled={enviando}
                type="submit" 
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {enviando ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                {enviando ? 'REGISTRANDO...' : 'CREAR EXPEDIENTE'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpedientesPage;