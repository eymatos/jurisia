import { useState, useRef, useEffect, type FormEvent } from 'react';
import api from '../api/axios';
import { MessageSquare, Send, Loader2, Scale, ShieldCheck, Sparkles, FolderOpen, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Fuente {
  archivo: string;
  caso: string;
  idCaso: number;
}

interface Mensaje {
  rol: 'user' | 'ia';
  contenido: string;
  fuentes?: Fuente[]; // Nueva propiedad para mostrar los precedentes
}

const ChatLegalPage = () => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevaPregunta, setNuevaPregunta] = useState('');
  const [cargando, setCargando] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const enviarConsulta = async (e: FormEvent) => {
    e.preventDefault();
    if (!nuevaPregunta.trim() || cargando) return;

    const preguntaUsuario = nuevaPregunta.trim();
    setMensajes(prev => [...prev, { rol: 'user', contenido: preguntaUsuario }]);
    setNuevaPregunta('');
    setCargando(true);

    try {
      // Llamada al nuevo endpoint global de la Fase 9
      const res = await api.post('/ia/consultar-global', {
        pregunta: preguntaUsuario
      });
      
      setMensajes(prev => [...prev, { 
        rol: 'ia', 
        contenido: res.data.respuesta,
        fuentes: res.data.fuentes // Guardamos las fuentes del despacho
      }]);
    } catch {
      setMensajes(prev => [...prev, { 
        rol: 'ia', 
        contenido: "Error al conectar con el cerebro global del despacho. Revisa tu conexión." 
      }]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto h-[calc(100vh-100px)] flex flex-col animate-in fade-in duration-500">
      
      {/* Encabezado del Chat Responsivo */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 md:mb-8 gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="bg-slate-950 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-lg border border-slate-800 shrink-0">
            <Scale size={28} className="text-accent" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-xl md:text-3xl font-black text-slate-950 tracking-tight">Buscador Global</h1>
            <p className="text-slate-500 font-bold text-[10px] md:text-sm uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2">
              <Sparkles size={12} className="text-accent" /> Inteligencia Colectiva
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-blue-100">
          <ShieldCheck size={16} className="text-accent" />
          <span className="text-[9px] md:text-xs font-black text-accent uppercase tracking-tighter">Acceso Seguro</span>
        </div>
      </div>

      {/* Contenedor de Mensajes */}
      <div className="flex-1 bg-white rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-slate-200 shadow-2xl overflow-hidden flex flex-col mb-4">
        <div className="flex-1 p-4 md:p-8 overflow-y-auto space-y-6 md:space-y-8 bg-slate-50/30 custom-scrollbar">
          
          {mensajes.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-4 p-4">
              <div className="bg-white p-4 md:p-6 rounded-full shadow-sm border border-slate-100">
                <MessageSquare size={32} className="text-slate-200 md:w-12 md:h-12" />
              </div>
              <h3 className="text-lg md:text-xl font-black text-slate-800 tracking-tight">Consultoría Semántica</h3>
              <p className="text-slate-500 font-medium leading-relaxed text-xs md:text-sm">
                Analizaré cada página de cada expediente en tu base de datos para encontrar precedentes.
              </p>
            </div>
          )}

          {mensajes.map((m, idx) => (
            <div key={idx} className={`flex flex-col ${m.rol === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[95%] md:max-w-[85%] p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-md text-sm md:text-lg leading-relaxed ${
                m.rol === 'user' 
                  ? 'bg-accent text-white rounded-tr-none font-bold' 
                  : 'bg-white text-slate-950 rounded-tl-none border border-slate-200 font-bold border-l-4 border-l-accent'
              }`}>
                {m.contenido}
              </div>

              {/* RENDERIZADO DE FUENTES Adaptativo */}
              {m.fuentes && m.fuentes.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 md:gap-3 w-full md:max-w-[90%]">
                  <p className="w-full text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Origen de la información:</p>
                  {m.fuentes.map((f, fIdx) => (
                    <Link 
                      key={fIdx}
                      to={`/casos/${f.idCaso}`}
                      className="bg-white border border-slate-200 p-2 md:p-3 rounded-xl flex items-center gap-2 md:gap-3 hover:border-accent hover:shadow-md transition-all group flex-1 min-w-[140px] md:min-w-[200px]"
                    >
                      <div className="bg-slate-100 p-1.5 md:p-2 rounded-lg group-hover:bg-blue-50 group-hover:text-accent transition-colors shrink-0">
                        <FolderOpen size={14} className="md:w-4 md:h-4" />
                      </div>
                      <div className="overflow-hidden flex-1">
                        <p className="text-[9px] md:text-[10px] font-black text-slate-900 truncate">{f.caso}</p>
                        <p className="text-[8px] md:text-[9px] text-slate-500 font-bold flex items-center gap-1 truncate italic">
                          <FileText size={8} className="md:w-2.5 md:h-2.5" /> {f.archivo}
                        </p>
                      </div>
                      <ArrowRight size={12} className="text-slate-300 group-hover:text-accent transition-colors shrink-0 md:w-3.5 md:h-3.5" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {cargando && (
            <div className="flex justify-start">
              <div className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm flex gap-2 md:gap-3 items-center">
                <Loader2 className="animate-spin text-accent w-4 h-4 md:w-5 md:h-5" />
                <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">
                  Buscando en el archivo...
                </span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Entrada de Texto Adaptativa */}
        <div className="p-4 md:p-6 bg-white border-t-2 border-slate-100">
          <form className="flex gap-2 md:gap-4 bg-slate-100 p-1.5 md:p-2 rounded-2xl md:rounded-3xl border-2 border-slate-200 focus-within:border-accent transition-all shadow-sm" onSubmit={enviarConsulta}>
            <input 
              type="text" 
              value={nuevaPregunta}
              onChange={(e) => setNuevaPregunta(e.target.value)}
              placeholder="Pregunta al despacho..."
              className="flex-1 bg-transparent px-4 md:px-6 py-3 md:py-4 text-sm md:text-lg font-bold text-slate-950 focus:outline-none placeholder:text-slate-400"
            />
            <button 
              type="submit"
              disabled={cargando || !nuevaPregunta.trim()}
              className="bg-accent text-white p-3.5 md:p-5 rounded-xl md:rounded-2xl hover:bg-blue-700 transition-all shadow-xl active:scale-95 disabled:opacity-30 shrink-0"
            >
              <Send className="w-[18px] h-[18px] md:w-6 md:h-6" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatLegalPage;