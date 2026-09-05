import axios from 'axios';

/**
 * Detectamos el entorno de ejecución para Juris-IA.
 * Prioriza la variable de entorno VITE_API_URL o la URL canónica de producción en Vercel.
 */
const isProduction = import.meta.env.PROD;

const api = axios.create({
    baseURL: isProduction 
        ? (import.meta.env.VITE_API_URL || 'https://jurisia-ekfr-ecru.vercel.app/api')
        : 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    // Tiempo de espera para peticiones
    timeout: 30000, 
});

// INTERCEPTOR DE PETICIÓN: Gestión de seguridad con JWT
api.interceptors.request.use(
    (config) => {
        // Recuperamos el token almacenado localmente
        const token = localStorage.getItem('token');
        
        if (token && config.headers) {
            // Inyectamos el token en las cabeceras de autorización
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// INTERCEPTOR DE RESPUESTA: Manejo de errores de autenticación y red
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Si el backend responde 401, significa que el token no es válido o expiró
        if (error.response && error.response.status === 401) {
            console.error("Acceso denegado o sesión expirada. Limpiando datos...");
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            
            // Redirigimos al usuario al login si no está ya ahí
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        // Manejo de errores cuando el backend no responde (ej. está reiniciando)
        if (!error.response) {
            console.error("Error de conexión: El servidor de Juris-IA no responde.");
        }

        return Promise.reject(error);
    }
);

export default api;
