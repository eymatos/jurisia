import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Scale, FolderOpen, Bell, ShieldCheck, Zap, Loader2, Users, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Definición de interfaces para eliminar los errores de "any"
interface DashboardData {
  kpis: {
    totalCasos: number;
    totalClientes: number;
    alertasCriticas: number;
  };
  distribucionEstatus: Array<{ name: string; value: number }>;
  proximosPlazos: Array<{
    id: number;
    titulo: string;
    fechaVencimiento: string;
    caso?: { titulo: string };
  }>;
}

const Dashboard = () => {
  // Estado tipado correctamente
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      setData(res.data);
    } catch (error) {
      console.error("Error cargando estadísticas integradas", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

  const cards = [
    { title: 'Clientes', value: data?.kpis?.totalClientes || 0, icon: Users, color: 'bg-slate-800', link: '/clientes', desc: 'Directorio registrado' },
    { title: 'Expedientes', value: data?.kpis?.totalCasos || 0, icon: FolderOpen, color: 'bg-indigo-600', link: '/casos', desc: 'Casos activos' },
    { title: 'Alertas Críticas', value: data?.kpis?.alertasCriticas || 0, icon: Bell, color: 'bg-red-500', link: '/alertas', desc: 'Prioridad máxima' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-6">
        <Loader2 className="animate-spin text-accent mb-4" size={40} />
        <p className="font-black text-slate-400 uppercase tracking-widest text-sm text-center">Analizando datos del despacho...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto animate-in fade-in duration-700 space-y-8 md:space-y-12">
      
      {/* Header Adaptativo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black text-slate-950 tracking-tight flex items-center justify-center md:justify-start gap-3">
            <Scale size={32} className="text-accent" />
            Juris IA
          </h1>
          <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] md:text-xs tracking-[0.2em] flex items-center justify-center md:justify-start gap-2">
            <ShieldCheck size={14} className="text-emerald-500" /> 
            Panel de Control Legal
          </p>
        </div>
        <div className="bg-white px-5 py-3 rounded-2xl border-2 border-slate-100 shadow-sm flex items-center justify-center gap-4 self-center md:self-auto">
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Servidor</p>
            <p className="text-xs font-black text-slate-900">En Línea</p>
          </div>
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-100"></div>
        </div>
      </div>

      {/* Tarjetas KPI: 1 col en móvil, 3 en escritorio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link 
            key={card.title} 
            to={card.link} 
            className="bg-white p-6 md:p-8 rounded-[2rem] border-2 border-slate-50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-accent/20 transition-all group relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className={`${card.color} w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform`}>
                <card.icon size={24} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{card.title}</p>
              <p className="text-3xl md:text-4xl font-black text-slate-950 tracking-tighter">{card.value}</p>
              <p className="text-xs font-bold text-slate-500 mt-2">{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico Circular: Ajuste de tamaño para móvil */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border-2 border-slate-50 shadow-xl">
          <h3 className="text-lg md:text-xl font-black text-slate-900 mb-6 uppercase tracking-tight text-center md:text-left">Distribución de Casos</h3>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.distribucionEstatus || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data?.distribucionEstatus?.map((_, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lista de Vencimientos: Scroll interno en móvil */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border-2 border-slate-200 shadow-xl overflow-hidden flex flex-col h-[400px] lg:h-auto">
          <h3 className="text-lg md:text-xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center justify-center md:justify-start gap-2">
            <Calendar size={20} className="text-red-500" /> Vencimientos a 15 días
          </h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {data?.proximosPlazos && data.proximosPlazos.length > 0 ? (
              data.proximosPlazos.map((plazo) => (
                <div key={plazo.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-red-200 transition-colors gap-3">
                  <div className="overflow-hidden">
                    <p className="font-black text-slate-900 text-xs md:text-sm truncate uppercase">{plazo.titulo}</p>
                    <p className="text-[10px] text-slate-500 font-bold truncate">Caso: {plazo.caso?.titulo || 'S/N'}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-[10px] md:text-xs font-black text-red-600 uppercase bg-red-50 sm:bg-transparent px-2 py-1 sm:p-0 rounded-md inline-block">
                      {new Date(plazo.fechaVencimiento).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                <ShieldCheck size={40} className="opacity-10 mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest text-center">Sin plazos urgentes</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Banner IA: Columna en móvil, Fila en Escritorio */}
      <div className="bg-slate-950 rounded-[2.5rem] p-6 md:p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <Zap className="text-accent fill-accent" size={24} />
              <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase italic tracking-wider">Potencia de IA</h2>
            </div>
            <p className="text-slate-400 font-medium text-sm md:text-lg max-w-2xl leading-relaxed">
              Analizando <span className="text-white font-bold">{data?.kpis?.totalCasos || 0}</span> expedientes en tiempo real con <span className="text-white font-bold">Llama 3.3</span>.
            </p>
          </div>
          <Link 
            to="/casos" 
            className="w-full md:w-auto bg-accent hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2"
          >
            Ver expedientes <ArrowRight size={18} />
          </Link>
        </div>
        {/* Adorno visual sutil para el banner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-[80px] rounded-full"></div>
      </div>
    </div>
  );
};

export default Dashboard;