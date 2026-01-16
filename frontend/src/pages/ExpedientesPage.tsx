import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import api from '../api/axios';
import { FolderOpen, Plus, Search, Gavel, User, X, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Caso {
  id: number;
  titulo: string;
  numero_expediente: string;
  tribunales: string;
  estatus: string;
  cliente: {
    nombre: string;
  };
}

// Interfaz para el listado de clientes en el selector
interface ClienteSimplificado {
  id: number;
  nombre: string;
}

const ExpedientesPage = () => {
  const [casos, setCasos] = useState<Caso[]>([]);
  const [clientes, setClientes] = useState<ClienteSimplificado[]>([]); // Estado para los clientes
  const [busqueda, setBusqueda] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const [nuevoCaso, setNuevoCaso] = useState({
    titulo: '',
    numero_expediente: '',
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

  // Nueva función para cargar la lista de clientes para el modal
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
    cargarClientes(); // Cargamos los clientes al iniciar la página
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
      setNuevoCaso({ titulo: '', numero_expediente: '', tribunales: '', clienteId: '' });
      await cargarCasos(); 
    } catch (err) {
      alert("Error al crear el expediente. Por favor verifica los datos.");
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  const casosFiltrados = casos.filter(caso => 
    caso.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    caso.numero_expediente?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500 bg-slate-50 min-h-screen">
      {/* Header Adaptativo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-slate-200 pb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-950 flex items-center gap-3 tracking-tight">
            <FolderOpen className="text-accent shrink-0" size={32} />
            Expedientes
          </h1>
          <p className="text-slate-600 mt-1 text-sm md:text-lg font-medium italic">Gestión de procesos activos.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-accent hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-200 font-black text-sm md:text-lg active:scale-95"
        >
          <Plus size={20} />
          <span>Nuevo Caso</span>
        </button>
      </div>

      {/* Buscador Full Width */}
      <div className="relative mb-8 md:mb-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text"
          placeholder="Buscar expediente..."
          className="w-full pl-12 pr-6 py-3 md:py-4 bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-accent transition-all shadow-sm text-slate-900 font-bold text-sm md:text-lg"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Modal Responsive */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
              <h2 className="text-xl md:text-2xl font-black text-slate-950 uppercase tracking-tight">Registrar Caso</h2>
              <button onClick={() => setIsModalOpen(false)} className="bg-white p-2 rounded-full text-slate-500 hover:text-red-600 transition-all border border-slate-200">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 md:space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Título del Caso</label>
                <input required name="titulo" value={nuevoCaso.titulo} onChange={handleInputChange} type="text" placeholder="Ej: Divorcio - María López" className="w-full p-3 md:p-4 bg-slate-50 border-2 border-slate-200 rounded-xl md:rounded-2xl focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Nº Expediente</label>
                  <input name="numero_expediente" value={nuevoCaso.numero_expediente} onChange={handleInputChange} type="text" placeholder="ESIV-0045" className="w-full p-3 md:p-4 bg-slate-50 border-2 border-slate-200 rounded-xl md:rounded-2xl focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm" />
                </div>
                <div>
                  {/* SELECTOR DE CLIENTES MEJORADO */}
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Seleccionar Cliente</label>
                  <select 
                    required 
                    name="clienteId" 
                    value={nuevoCaso.clienteId} 
                    onChange={handleInputChange} 
                    className="w-full p-3 md:p-4 bg-slate-50 border-2 border-slate-200 rounded-xl md:rounded-2xl focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm appearance-none cursor-pointer"
                  >
                    <option value="">Seleccione...</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Tribunal / Sede</label>
                <input name="tribunales" value={nuevoCaso.tribunales} onChange={handleInputChange} type="text" placeholder="Cámara Civil" className="w-full p-3 md:p-4 bg-slate-50 border-2 border-slate-200 rounded-xl md:rounded-2xl focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm" />
              </div>
              <button 
                disabled={enviando}
                type="submit" 
                className="w-full bg-accent text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center gap-3 mt-2 text-sm md:text-lg"
              >
                {enviando ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                {enviando ? 'PROCESANDO...' : 'REGISTRAR'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Grid de Tarjetas Adaptativo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {casosFiltrados.length === 0 ? (
          <div className="col-span-full py-20 md:py-32 text-center bg-white rounded-[2rem] md:rounded-[3rem] border-4 border-dashed border-slate-200 px-6">
            <div className="bg-slate-50 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <FolderOpen size={40} className="text-slate-300" />
            </div>
            <p className="text-slate-900 font-black text-xl md:text-2xl uppercase tracking-tight">Sin resultados</p>
            <p className="text-slate-500 text-sm md:text-lg mt-2 font-medium">No encontramos expedientes con ese criterio.</p>
          </div>
        ) : (
          casosFiltrados.map(caso => (
            <div key={caso.id} className="bg-white rounded-[2rem] md:rounded-[2.5rem] border-2 border-slate-200 p-6 md:p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative flex flex-col">
              <div className="flex justify-between items-center mb-5 md:mb-6">
                <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                  {caso.estatus}
                </span>
                <span className="text-[10px] md:text-xs text-slate-400 font-mono font-bold bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 truncate max-w-[120px]">
                  {caso.numero_expediente}
                </span>
              </div>
              
              <h3 className="text-lg md:text-2xl font-black text-slate-950 mb-6 group-hover:text-accent transition-colors leading-tight line-clamp-2 min-h-[3.5rem] md:min-h-[4rem]">
                {caso.titulo}
              </h3>

              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-center gap-3 text-sm md:text-base text-slate-600 font-bold">
                  <div className="bg-slate-50 p-2 rounded-lg text-slate-400 group-hover:text-accent transition-colors"><User size={18} /></div>
                  <span className="truncate">{caso.cliente?.nombre || 'Sin Cliente'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm md:text-base text-slate-600 font-bold">
                  <div className="bg-slate-50 p-2 rounded-lg text-slate-400 group-hover:text-accent transition-colors"><Gavel size={18} /></div>
                  <span className="truncate">{caso.tribunales || 'N/A'}</span>
                </div>
              </div>

              <Link 
                to={`/casos/${caso.id}`} 
                className="w-full text-center py-4 md:py-5 bg-slate-950 hover:bg-accent text-white font-black rounded-xl md:rounded-2xl transition-all shadow-lg text-xs md:text-sm uppercase tracking-widest active:scale-95"
              >
                Gestionar Expediente
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExpedientesPage;