import axios from 'axios';

/**
 * Determinamos el entorno de ejecución. 
 * Render utiliza import.meta.env.PROD para indicar producción.
 */
const isProduction = import.meta.env.PROD;

const api = axios.create({
    // Usamos los links exactos de tu proyecto Juris IA
    baseURL: isProduction 
        ? 'https://jurisia-backend.onrender.com/api' 
        : 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    // Tiempo de espera para manejar el inicio lento de Render (Cold Start)
    timeout: 30000, 
});

// INTERCEPTOR DE PETICIÓN: Añade el Token JWT si existe
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// INTERCEPTOR DE RESPUESTA: Manejo de autenticación fallida
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Si el servidor responde 401, el usuario o la contraseña están mal en la DB
        if (error.response && error.response.status === 401) {
            console.error("Acceso denegado o sesión expirada. Redirigiendo al login...");
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;