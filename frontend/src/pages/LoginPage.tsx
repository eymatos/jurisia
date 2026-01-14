import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import axios from 'axios'; // Importación necesaria para el tipado de errores

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/usuarios/login', { email, password });
            
            // Guardamos el token y los datos del usuario en el storage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('usuario', JSON.stringify(response.data.usuario));

            // Redirigimos al Dashboard (o la ruta principal)
            navigate('/dashboard');
        } catch (err: unknown) {
            // CORRECCIÓN: Eliminamos el 'any' y especificamos el tipo de error
            let mensajeError = 'Error al intentar iniciar sesión';
            
            if (axios.isAxiosError(err)) {
                mensajeError = err.response?.data?.message || mensajeError;
            } else if (err instanceof Error) {
                mensajeError = err.message;
            }
            
            setError(mensajeError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl border-2 border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-500">
                <div className="p-10 pt-12 text-center">
                    <div className="bg-accent/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-accent/20">
                        <ShieldCheck className="text-accent" size={40} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                        Juris IA
                    </h1>
                    <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs">
                        Plataforma de Inteligencia Legal
                    </p>
                </div>

                <form onSubmit={handleLogin} className="p-10 pt-0 space-y-6">
                    {error && (
                        <div className="bg-red-50 border-2 border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-sm">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Email Profesional</label>
                        <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-900 focus:outline-none focus:border-accent transition-all"
                                placeholder="nombre@juris.ia"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-900 focus:outline-none focus:border-accent transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent text-white py-5 rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                        {loading ? <Loader2 className="animate-spin" size={24} /> : 'Acceder al Sistema'}
                    </button>

                    <p className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-tighter pt-4">
                        Solo personal autorizado por la firma. <br />
                        © 2026 Juris IA - Todos los derechos reservados.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;