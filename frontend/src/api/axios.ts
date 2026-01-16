import axios from 'axios';

/**
 * Detectamos el entorno:
 * Si estamos en producción (desplegados en Render), usamos la URL del backend en Render.
 * Si estamos en desarrollo (npm run dev), usamos localhost.
 */
const isProduction = import.meta.env.PROD;

const api = axios.create({
    baseURL: isProduction 
        ? 'https://jurisia-backend.onrender.com/api' 
        : 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// INTERCEPTOR DE PETICIÓN: Adjunta el Token JWT automáticamente
api.interceptors.request.use(
    (config) => {
        // Obtenemos el token almacenado tras el login
        const token = localStorage.getItem('token');
        
        if (token && config.headers) {
            // Lo enviamos en las cabeceras como Bearer Token
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// INTERCEPTOR DE RESPUESTA: Manejo de errores globales (Sesión expirada)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Si el backend responde 401 (No autorizado), limpiamos la sesión
        if (error.response && error.response.status === 401) {
            console.warn("Sesión inválida o expirada. Limpiando credenciales...");
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            
            // Si no estamos ya en el login, redirigimos al usuario
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;