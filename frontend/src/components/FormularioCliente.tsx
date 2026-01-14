import React, { useState } from 'react';
import api from '../api/axios';
import { X, User, Building2, Save, Loader2, ShieldCheck, Mail, Phone, FileText, MapPin } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const FormularioCliente = ({ onClose, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    documento_identidad: '',
    tipo_persona: 'Fisica',
    email: '',
    telefono: '',
    direccion: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/clientes', formData);
      onSuccess();
    } catch (err: unknown) {
      let mensajeError = "Error al registrar el cliente. Verifique el RNC/Cédula.";
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { data: { message?: string } } };
        mensajeError = axiosError.response.data.message || mensajeError;
      }
      setError(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Contenedor del Modal: max-h-screen y scroll interno para móviles */}
      <div className="bg-white w-full max-w-2xl rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 my-auto flex flex-col max-h-[95vh]">
        
        {/* Header del Modal: Ajustado para pantallas pequeñas */}
        <div className="bg-slate-900 p-5 sm:p-8 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-3">
              <ShieldCheck className="text-accent shrink-0" size={24} />
              Registro de Cliente
            </h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Alta de Entidad Legal</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Cuerpo del formulario con scroll propio si es necesario */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-4 sm:space-y-6 overflow-y-auto">
          
          {error && (
            <div className="bg-red-50 border-2 border-red-100 p-3 rounded-xl text-red-600 text-xs sm:text-sm font-bold flex items-center gap-2">
              <X size={16} className="bg-red-500 text-white rounded-full p-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Selector de Tipo de Persona: Texto más pequeño en móvil */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tipo_persona: 'Fisica' })}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all font-bold text-xs sm:text-base ${
                formData.tipo_persona === 'Fisica' 
                ? 'border-accent bg-blue-50 text-accent' 
                : 'border-slate-100 text-slate-400 hover:border-slate-200'
              }`}
            >
              <User size={18} /> <span>Física</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tipo_persona: 'Juridica' })}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all font-bold text-xs sm:text-base ${
                formData.tipo_persona === 'Juridica' 
                ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                : 'border-slate-100 text-slate-400 hover:border-slate-200'
              }`}
            >
              <Building2 size={18} /> <span>Jurídica</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1 sm:space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre / Razón Social</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  required
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-2.5 sm:py-3 pl-11 pr-4 font-bold text-slate-800 focus:border-accent focus:outline-none transition-all text-sm sm:text-base"
                  placeholder="Juan Pérez"
                />
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                {formData.tipo_persona === 'Fisica' ? 'Cédula' : 'RNC'}
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  required
                  name="documento_identidad"
                  value={formData.documento_identidad}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-2.5 sm:py-3 pl-11 pr-4 font-bold text-slate-800 focus:border-accent focus:outline-none transition-all text-sm sm:text-base"
                  placeholder={formData.tipo_persona === 'Fisica' ? '001-0000000-0' : '1-30-00000-0'}
                />
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-2.5 sm:py-3 pl-11 pr-4 font-bold text-slate-800 focus:border-accent focus:outline-none transition-all text-sm sm:text-base"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-2.5 sm:py-3 pl-11 pr-4 font-bold text-slate-800 focus:border-accent focus:outline-none transition-all text-sm sm:text-base"
                  placeholder="809-000-0000"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1 sm:space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Dirección Legal</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3 text-slate-300" size={18} />
              <textarea
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                rows={2}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-2.5 pl-11 pr-4 font-bold text-slate-800 focus:border-accent focus:outline-none transition-all text-sm sm:text-base"
                placeholder="Calle, No., Sector..."
              />
            </div>
          </div>

          {/* Botones Adaptativos: Stack vertical en móvil si el espacio es muy reducido */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="order-2 sm:order-1 flex-1 px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="order-1 sm:order-2 flex-[2] bg-slate-950 text-white px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-accent transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save size={18} /> <span>Finalizar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioCliente;