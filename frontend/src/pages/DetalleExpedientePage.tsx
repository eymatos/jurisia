import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import api from '../api/axios';
import { FileText, Upload, MessageSquare, Info, Loader2, Send, AlertCircle, X, ExternalLink, Bell, Calendar, FileEdit } from 'lucide-react';
import axios from 'axios';
import FileUpload from '../components/FileUpload';

interface Documento {
  id: number;
  nombre_archivo: string;
  ruta_url: string;
  resumen_ia?: string;
}

interface Alerta {
  id: number;
  titulo: string;
  descripcion: string;
  fechaVencimiento: string;
  prioridad: string;
  completada: boolean;
}

interface Caso {
  id: number;
  titulo: string;
  numero_expediente?: string;
  tribunales?: string;
  estatus: string;
  documentos: Documento[];
  alertas?: Alerta[];
}

interface Mensaje {
  role: 'user' | 'ia';
  contenido: string;
}

const DetalleExpedientePage = () => {
  const { id } = useParams<{ id: string }>();
  const [caso, setCaso] = useState<Caso | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState<boolean>(false);
  const [generandoReporte, setGenerandoReporte] = useState<boolean>(false);
  const [redactando, setRedactando] = useState<boolean>(false); 
  
  const [urlPdfSeleccionado, setUrlPdfSeleccionado] = useState<string | null>(null);
  const [nombreArchivoActivo, setNombreArchivoActivo] = useState<string | null>(null);
  
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevaPregunta, setNuevaPregunta] = useState('');
  const [escribiendoIA, setEscribiendoIA] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const cargarDatos = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/casos/${id}`);
      
      if (res.data) {
        setCaso(res.data);
      } else {
        setError("El servidor respondió pero no envió datos.");
      }
    } catch (err: unknown) {
      let mensajeFinal = "Error de conexión con el servidor.";
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          mensajeFinal = `El expediente ${id} no existe en la base de datos (Error 404).`;
        } else if (err.response?.status === 500) {
          mensajeFinal = "Error interno del servidor (500). Verifica el Backend.";
        }
      }
      setError(mensajeFinal);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const handleDownloadReport = async () => {
    if (!id) return;
    try {
      setGenerandoReporte(true);
      const response = await api.get(`/casos/${id}/reporte`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Informe_Analisis_Caso_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error descargando reporte:", err);
      alert("No se pudo generar el reporte PDF.");
    } finally {
      setGenerandoReporte(false);
    }
  };

  const handleGenerateWord = async (tipo: string) => {
    if (!id) return;
    try {
      setRedactando(true);
      const response = await api.post('/ia/generar-escrito', {
        casoId: id,
        tipoDocumento: tipo
      }, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${tipo.replace(/\s+/g, '_')}_Caso_${id}.docx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al redactar escrito:", error);
      alert("Error al conectar con el motor de redacción legal.");
    } finally {
      setRedactando(false);
    }
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0];
    if (!archivo || !id) return;

    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('casoId', id);

    try {
      setSubiendo(true);
      await api.post('/documentos/subir', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Documento subido y procesado por IA con éxito.");
      await cargarDatos(); 
    } catch {
      alert("Error al subir el archivo.");
    } finally {
      setSubiendo(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };

  const enviarPregunta = async (e: FormEvent) => {
    e.preventDefault();
    if (!nuevaPregunta.trim() || escribiendoIA) return;

    const preguntaUsuario = nuevaPregunta.trim();
    setMensajes(prev => [...prev, { role: 'user', contenido: preguntaUsuario }]);
    setNuevaPregunta('');
    setEscribiendoIA(true);

    try {
      const res = await api.post('/ia/preguntar', {
        pregunta: preguntaUsuario,
        casoId: Number(id)
      });
      setMensajes(prev => [...prev, { role: 'ia', contenido: res.data.respuesta }]);
    } catch {
      setMensajes(prev => [...prev, { role: 'ia', contenido: "Error al procesar consulta." }]);
    } finally {
      setEscribiendoIA(false);
    }
  };

  const seleccionarDocumento = (doc: Documento) => {
    const fullUrl = `http://localhost:3000/${doc.ruta_url}`;
    setUrlPdfSeleccionado(fullUrl);
    setNombreArchivoActivo(doc.nombre_archivo);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen text-slate-500 bg-slate-50 p-6">
      <Loader2 className="animate-spin mb-4 text-accent" size={40} />
      <p className="font-bold tracking-wide text-lg text-slate-900 text-center uppercase tracking-widest text-sm">Localizando expediente en archivos...</p>
    </div>
  );

  if (error) return (
    <div className="p-4 md:p-8 flex flex-col items-center justify-center h-screen bg-slate-50">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-red-100 flex flex-col items-center max-w-md text-center">
        <div className="bg-red-100 p-4 rounded-full mb-4">
          <AlertCircle size={40} className="text-red-600" />
        </div>
        <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2">Expediente no accesible</h2>
        <p className="text-slate-600 mb-8 leading-relaxed font-medium text-sm md:text-base">{error}</p>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button 
            onClick={() => window.location.href = '/casos'}
            className="flex-1 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm"
          >
            Regresar
          </button>
          <button 
            onClick={cargarDatos}
            className="flex-1 bg-accent text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg text-sm"
          >
            Reintentar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500 min-h-screen bg-slate-50">
      <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileUpload} />

      {/* Header Adaptativo: Apila en móvil, fila en desktop */}
      <div className="mb-8 border-b border-slate-200 pb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="w-full lg:w-auto">
          <h1 className="text-2xl md:text-4xl font-black text-slate-950 tracking-tight leading-tight">{caso?.titulo}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="bg-green-100 text-green-700 text-[10px] md:text-xs px-3 py-1 rounded-full font-black uppercase tracking-wider border border-green-200">{caso?.estatus}</span>
            <p className="text-slate-600 flex items-center gap-1.5 text-sm md:text-base font-bold">
              <Info size={18} className="text-accent" /> Exp: {caso?.numero_expediente || 'S/N'}
            </p>
          </div>
        </div>
        
        {/* Acciones Rápidas: Scroll horizontal en pantallas pequeñas */}
        <div className="flex gap-3 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide">
          <div className="relative group flex-shrink-0">
            <button 
              disabled={redactando}
              className="bg-white border-2 border-slate-200 text-slate-700 px-4 md:px-6 py-2.5 md:py-3 rounded-2xl flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm font-black text-sm md:text-lg whitespace-nowrap disabled:opacity-50"
            >
              {redactando ? <Loader2 className="animate-spin" size={20} /> : <FileEdit size={20} className="text-blue-600" />}
              {redactando ? 'Redactando...' : 'Redactar Escrito'}
            </button>
            
            {!redactando && (
              <div className="absolute right-0 top-full pt-1 w-64 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 overflow-hidden">
                  {["Demanda Laboral", "Acto de Alguacil", "Contrato de Cuota Litis", "Escrito de Defensa"].map(tipo => (
                    <button key={tipo} onClick={() => handleGenerateWord(tipo)} className="w-full text-left px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-accent transition-all">{tipo}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleDownloadReport}
            disabled={generandoReporte}
            className="flex-shrink-0 bg-white border-2 border-slate-200 text-slate-700 px-4 md:px-6 py-2.5 md:py-3 rounded-2xl flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm font-black text-sm md:text-lg whitespace-nowrap disabled:opacity-50"
          >
            {generandoReporte ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} className="text-red-500" />}
            {generandoReporte ? 'Generando...' : 'Reporte IA'}
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={subiendo}
            className="flex-shrink-0 bg-accent text-white px-4 md:px-6 py-2.5 md:py-3 rounded-2xl flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl font-black text-sm md:text-lg whitespace-nowrap disabled:opacity-50"
          >
            {subiendo ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
            {subiendo ? 'Subiendo...' : 'Subir'}
          </button>
        </div>
      </div>

      {/* Grid Principal: 1 columna en móvil/tablet, 2 en desktop LG */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <FileUpload casoId={id!} onUploadSuccess={cargarDatos} />

          <div className="flex justify-between items-center px-1">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
              <FileText size={22} className="text-accent" /> 
              {urlPdfSeleccionado ? 'Visor de Documento' : 'Expediente Digital'}
            </h2>
            {urlPdfSeleccionado && (
              <button 
                onClick={() => { setUrlPdfSeleccionado(null); setNombreArchivoActivo(null); }}
                className="text-slate-500 hover:text-red-600 flex items-center gap-1 font-bold text-xs bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm transition-all"
              >
                <X size={14} /> Cerrar Visor
              </button>
            )}
          </div>

          {/* Visor Adaptativo: Altura fija pero ajustada para pantallas pequeñas */}
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border-2 border-slate-200 shadow-xl overflow-hidden h-[400px] md:h-[600px] relative">
            {!urlPdfSeleccionado ? (
              <div className="divide-y divide-slate-100 overflow-y-auto h-full custom-scrollbar">
                {caso?.documentos && caso.documentos.length > 0 ? (
                  caso.documentos.map((doc: Documento) => (
                    <div 
                      key={doc.id} 
                      onClick={() => seleccionarDocumento(doc)}
                      className="p-4 md:p-6 hover:bg-blue-50/50 cursor-pointer transition-all group flex items-center gap-3 md:gap-4"
                    >
                      <div className="bg-slate-100 p-3 md:p-4 rounded-xl md:rounded-2xl group-hover:bg-accent group-hover:text-white transition-all text-slate-500 shadow-sm shrink-0">
                        <FileText size={24} className="hidden md:block md:w-7 md:h-7" />
                        <FileText size={24} className="md:hidden" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-black text-slate-900 text-sm md:text-lg truncate group-hover:text-accent transition-colors">{doc.nombre_archivo}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[8px] md:text-[10px] bg-blue-100 text-accent px-2 py-0.5 rounded font-black uppercase tracking-widest">IA READY</span>
                          <p className="hidden sm:block text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-tighter">Click para visualizar</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
                    <Upload size={40} className="opacity-20 mb-2" />
                    <p className="text-xs md:text-sm font-black uppercase tracking-widest text-center">Sin documentos anexados</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col h-full bg-slate-800">
                <div className="bg-slate-900 p-3 md:p-4 flex justify-between items-center border-b border-slate-700">
                  <p className="text-white font-bold truncate pr-4 text-[10px] md:text-sm flex items-center gap-2">
                    <FileText size={14} className="text-accent" /> {nombreArchivoActivo}
                  </p>
                  <a href={urlPdfSeleccionado} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white shrink-0">
                    <ExternalLink size={16} />
                  </a>
                </div>
                {/* Desactivamos scroll nativo en iframe para móviles y forzamos ancho */}
                <iframe 
                  src={`${urlPdfSeleccionado}#toolbar=0&navpanes=0`} 
                  className="w-full h-full border-none"
                  title="Visor PDF"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2 px-1">
              <Bell size={22} className="text-red-500" /> Alertas de Plazos (IA)
            </h2>
            <div className="bg-white rounded-[2rem] border-2 border-slate-200 shadow-xl p-4 md:p-6 min-h-[150px]">
              {caso?.alertas && caso.alertas.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 md:gap-4">
                  {caso.alertas.map((alerta) => (
                    <div key={alerta.id} className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className={`p-2.5 rounded-xl flex-shrink-0 ${alerta.prioridad === 'critica' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                        <Calendar size={20} />
                      </div>
                      <div className="flex-1 w-full">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                          <h4 className="font-black text-slate-950 uppercase text-[11px] md:text-sm tracking-tight">{alerta.titulo}</h4>
                          <span className="text-[10px] font-black text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                            {new Date(alerta.fechaVencimiento).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-medium">{alerta.descripcion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                  <Bell size={32} className="opacity-10 mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest italic">Sin plazos detectados</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat IA Adaptativo: Altura ajustada para no dominar en móviles */}
        <div className="flex flex-col h-[500px] md:h-[800px] bg-white rounded-[2rem] md:rounded-[2.5rem] border-2 border-slate-200 shadow-2xl overflow-hidden mt-6 lg:mt-0">
          <div className="bg-slate-950 p-5 md:p-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-accent/20 p-2 md:p-3 rounded-xl border border-accent/30">
                <MessageSquare size={24} className="text-accent" />
              </div>
              <div>
                <span className="block font-black text-white text-sm md:text-lg tracking-tight uppercase italic">CONSULTOR IA</span>
                <span className="block text-[10px] text-blue-400 font-black uppercase tracking-widest mt-0.5">Expediente Activo</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-4 md:p-8 overflow-y-auto space-y-6 bg-slate-50/30 custom-scrollbar">
            {mensajes.length === 0 && (
              <div className="bg-white p-4 md:p-6 rounded-2xl rounded-tl-none max-w-[90%] border border-slate-200 shadow-md text-slate-800 text-sm md:text-lg leading-relaxed font-medium">
                <p className="font-black text-accent mb-1 uppercase text-xs">Asistente Legal</p>
                He indexado el caso. ¿Qué deseas saber sobre los documentos o plazos?
              </div>
            )}
            
            {mensajes.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-4 md:p-5 rounded-2xl md:rounded-[2rem] shadow-md text-sm md:text-lg leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-accent text-white rounded-tr-none font-bold' 
                    : 'bg-white text-slate-950 rounded-tl-none border border-slate-200 font-bold'
                }`}>
                  {m.contenido}
                </div>
              </div>
            ))}
            {escribiendoIA && (
               <div className="flex justify-start">
                 <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex gap-2 items-center">
                   <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce delay-150"></div>
                      <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce delay-300"></div>
                   </div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leyendo...</span>
                 </div>
               </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 md:p-6 bg-white border-t-2 border-slate-100 shrink-0">
            <form className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl md:rounded-3xl border-2 border-slate-200 focus-within:border-accent transition-all" onSubmit={enviarPregunta}>
              <input 
                type="text" 
                value={nuevaPregunta}
                onChange={(e) => setNuevaPregunta(e.target.value)}
                placeholder="Preguntar..."
                className="flex-1 bg-transparent px-4 py-3 text-sm md:text-lg font-bold text-slate-950 focus:outline-none placeholder:text-slate-400"
              />
              <button 
                type="submit"
                disabled={escribiendoIA || !nuevaPregunta.trim()}
                className="bg-accent text-white p-3 md:p-5 rounded-xl md:rounded-2xl hover:bg-blue-700 transition-all shadow-xl disabled:opacity-30 active:scale-95 shrink-0"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleExpedientePage;