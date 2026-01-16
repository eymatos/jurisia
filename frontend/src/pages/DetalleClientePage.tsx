import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  User, 
  Building2, 
  Phone, 
  Mail, 
  FileText, 
  ArrowLeft, 
  Loader2, 
  FolderOpen, 
  Gavel,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Caso {
  id: number;
  titulo: string;
  numero_expediente: string;
  estatus: string;
  tribunales: string;
}

interface Cliente {
  id: number;
  nombre: string;
  documento_identidad: string;
  tipo_persona: 'Fisica' | 'Juridica';
  email: string;
  telefono: string;
  direccion?: string;
  casos?: Caso[];
}

const DetalleClientePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClienteDetalle = async () => {
    try {
      setLoading(true);
      // El backend debe devolver el cliente con sus casos relacionados
      const res = await api.get(`/clientes/${id}`);
      setCliente(res.data);
    } catch (error) {
      console.error("Error cargando detalle del cliente", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClienteDetalle();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Cargando perfil jurídico...</p>
      </div>
    );
  }

  if (!cliente) return <div className="p-10 text-center font-bold">Cliente no encontrado.</div>;

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto animate-in fade-in duration-500 min-h-screen">
      
      {/* Botón Volver */}
      <button 
        onClick={() => navigate('/clientes')}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors mb-8 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        VOLVER AL DIRECTORIO
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: Perfil del Cliente (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8">
            <div className="flex justify-center mb-6">
              <div className={`p-6 rounded-[2rem] ${cliente.tipo_persona === 'Juridica' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                {cliente.tipo_persona === 'Juridica' ? <Building2 size={48} /> : <User size={48} />}
              </div>
            </div>

            <div className="text-center mb-8">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 px-3 py-1 rounded-full">
                {cliente.tipo_persona === 'Juridica' ? 'Empresa / Entidad' : 'Persona Física'}
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-4 leading-tight">
                {cliente.nombre}
              </h1>
              <p className="text-slate-400 font-bold text-sm mt-1">{cliente.documento_identidad}</p>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-50">
              <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                <div className="bg-white shadow-sm p-2 rounded-lg text-slate-400"><Mail size={18} /></div>
                <div className="truncate">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Email</p>
                  <p className="text-sm font-bold text-slate-700">{cliente.email || 'No registrado'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                <div className="bg-white shadow-sm p-2 rounded-lg text-slate-400"><Phone size={18} /></div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Teléfono</p>
                  <p className="text-sm font-bold text-slate-700">{cliente.telefono || 'No registrado'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                <div className="bg-white shadow-sm p-2 rounded-lg text-slate-400"><FileText size={18} /></div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Documentación</p>
                  <p className="text-sm font-bold text-slate-700">Validada satisfactoriamente</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Expedientes Asociados (8/12) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 h-full">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <FolderOpen className="text-blue-600" size={28} />
                  Expedientes Asociados
                </h2>
                <p className="text-slate-400 font-bold text-xs uppercase mt-1">Historial y procesos activos</p>
              </div>
              <Link 
                to="/expedientes" 
                className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                <Plus size={16} /> Nuevo Caso
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cliente.casos && cliente.casos.length > 0 ? (
                cliente.casos.map((caso) => (
                  <Link 
                    key={caso.id}
                    to={`/casos/${caso.id}`}
                    className="group p-5 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:border-blue-200 hover:shadow-xl transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 uppercase tracking-tighter">
                          {caso.estatus}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {caso.numero_expediente}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-4 line-clamp-2">
                        {caso.titulo}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                        <Gavel size={14} />
                        <span className="truncate max-w-[120px]">{caso.tribunales || 'Sede N/A'}</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                  <FolderOpen size={48} className="text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Este cliente no tiene casos registrados</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleClientePage;