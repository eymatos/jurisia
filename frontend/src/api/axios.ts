import axios from 'axios';

// Configuramos la instancia central de Axios
const api = axios.create({
    baseURL: 'http://localhost:3000/api', // La URL de tu backend
    headers: {
        'Content-Type': 'application/json',
    },
});

// INTERCEPTOR: Adjunta el Token JWT automáticamente en cada petición
api.interceptors.request.use(
    (config) => {
        // Buscamos el token almacenado en el navegador
        const token = localStorage.getItem('token');
        
        if (token && config.headers) {
            // Inyectamos el token en el formato estándar Bearer
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// INTERCEPTOR: Manejo de errores globales (ej: si el token expira)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Si el servidor dice que no estamos autorizados, limpiamos el acceso
            console.warn("Sesión expirada o no autorizada. Redirigiendo...");
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            // Aquí podríamos redirigir a /login si fuera necesario
        }
        return Promise.reject(error);
    }
);

export default api;