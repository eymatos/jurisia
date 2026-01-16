import axios from 'axios';

/**
 * Determinamos el entorno de ejecución de forma segura.
 */
const isProduction = import.meta.env.PROD;

const api = axios.create({
    // URLs oficiales confirmadas para tu despliegue
    baseURL: isProduction 
        ? 'https://jurisia-backend.onrender.com/api' 
        : 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    // Tiempo límite de 30 segundos para manejar el "cold start" de Render
    timeout: 30000, 
});

// INTERCEPTOR DE PETICIÓN: Inyección automática de seguridad
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        
        if (token && config.headers) {
            // Adjuntamos el token siguiendo el estándar Bearer
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// INTERCEPTOR DE RESPUESTA: Gestión de sesión y errores de red
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Caso 1: Error de autenticación (Token expirado o inválido)
        if (error.response && error.response.status === 401) {
            console.error("Sesión expirada. Limpiando datos...");
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            
            // Redirigimos al login solo si no estamos ya allí
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        // Caso 2: Error de conexión (Backend caído o reiniciando)
        if (!error.response) {
            console.error("No hay respuesta del servidor. Verifica tu conexión o el estado del backend.");
        }

        return Promise.reject(error);
    }
);

export default api;