import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Bell, Clock, ArrowRight, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Alerta {
  id: number;
  titulo: string;
  descripcion: string;
  fechaVencimiento: string;
  prioridad: string;
  completada: boolean;
  caso?: {
    id: number;
    titulo: string;
  };
}

const AlertasPage = () => {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // CAMBIO: Solicitamos alertas para las próximas 360 horas (15 días)
    api.get('/alertas/urgentes?horas=360')
      .then(res => {
        setAlertas(res.data);
      })
      .catch(err => {
        console.error("Error cargando alertas", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-6">
        <Loader2 className="animate-spin text-accent mb-4" size={40} />
        <p className="font-black text-slate-400 uppercase tracking-widest text-sm text-center">Sincronizando calendario judicial...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto animate-in fade-in duration-500 min-h-screen">
      
      {/* Encabezado Responsivo */}
      <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-8 md:mb-10 gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black text-slate-950 tracking-tight flex flex-col md:flex-row items-center gap-4">
            <div className="bg-red-500 p-3 rounded-2xl shadow-lg shadow-red-100 shrink-0">
              <Bell className="text-white" size={28} />
            </div>
            Panel de Vencimientos
          </h1>
          <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] md:text-xs tracking-[0.2em]">
            Plazos detectados para los próximos 15 días
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {alertas.length === 0 ? (
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-10 md:p-20 border-2 border-dashed border-slate-200 text-center">
            <div className="bg-slate-50 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg md:text-xl font-black text-slate-800">Todo al día</h3>
            <p className="text-slate-500 font-medium text-sm md:text-base">No se han detectado plazos procesales urgentes para las próximas dos semanas.</p>
          </div>
        ) : (
          alertas.map(alerta => (
            <div 
              key={alerta.id} 
              className="bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-slate-200/50 border-2 border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 hover:border-accent/30 transition-all group"
            >
              <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-5 flex-1 w-full">
                {/* Icono de prioridad */}
                <div className={`p-3 md:p-4 rounded-2xl shrink-0 ${
                  alerta.prioridad === 'alta' || alerta.prioridad === 'critica' 
                    ? 'bg-red-50 text-red-500' 
                    : 'bg-blue-50 text-blue-500'
                }`}>
                  <AlertCircle size={24} className="md:w-7 md:h-7" />
                </div>

                <div className="w-full">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                    <h4 className="font-black text-lg md:text-xl text-slate-950 leading-tight uppercase tracking-tight">{alerta.titulo}</h4>
                    <span className={`text-[9px] md:text-[10px] uppercase px-2 md:px-3 py-1 rounded-full font-black tracking-widest border ${
                      alerta.prioridad === 'alta' || alerta.prioridad === 'critica' 
                        ? 'bg-red-100 text-red-700 border-red-200' 
                        : 'bg-blue-100 text-blue-700 border-blue-200'
                    }`}>
                      {alerta.prioridad}
                    </span>
                  </div>
                  
                  <p className="text-slate-600 font-medium text-xs md:text-sm leading-relaxed mb-4">
                    {alerta.descripcion}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 md:gap-4">
                    <div className="flex items-center gap-2 bg-slate-100 px-2.5 py-1 md:px-3 md:py-1.5 rounded-xl">
                      <Clock size={12} className="text-slate-500" />
                      <span className="text-[10px] md:text-xs font-black text-slate-700 uppercase">
                        Vence: {new Date(alerta.fechaVencimiento).toLocaleDateString('es-ES', { 
                          day: '2-digit', month: 'short'
                        })}
                      </span>
                    </div>
                    {alerta.caso && (
                      <div className="flex items-center gap-2 bg-blue-50 px-2.5 py-1 md:px-3 md:py-1.5 rounded-xl border border-blue-100 max-w-full">
                        <span className="hidden sm:inline text-[9px] font-black text-blue-400 uppercase tracking-tighter">Caso:</span>
                        <span className="text-[10px] md:text-xs font-black text-accent truncate max-w-[150px] md:max-w-[250px] uppercase tracking-tight">
                          {alerta.caso.titulo}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Botón adaptativo: Full width en móvil */}
              <button 
                onClick={() => alerta.caso && navigate(`/casos/${alerta.caso.id}`)}
                className="w-full lg:w-auto bg-slate-950 text-white px-6 py-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-3 hover:bg-accent transition-all shadow-lg font-black text-xs md:text-sm active:scale-95"
              >
                IR AL EXPEDIENTE
                <ArrowRight size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertasPage;