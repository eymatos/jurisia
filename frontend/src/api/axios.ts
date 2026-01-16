import axios from 'axios';

/**
 * Detectamos el entorno de ejecución.
 * Render define automáticamente import.meta.env.PROD como verdadero durante el build.
 */
const isProduction = import.meta.env.PROD;

const api = axios.create({
    // Utilizamos las URLs exactas que confirmamos para el ecosistema Juris-IA
    baseURL: isProduction 
        ? 'https://jurisia-backend.onrender.com/api' 
        : 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    // Tiempo de espera para evitar que la app se quede colgada si el backend está en "cold start"
    timeout: 30000, 
});

// INTERCEPTOR DE PETICIÓN: Gestión de seguridad con JWT
api.interceptors.request.use(
    (config) => {
        // Recuperamos el token almacenado en el navegador tras un login exitoso
        const token = localStorage.getItem('token');
        
        if (token && config.headers) {
            // Inyectamos el token en la cabecera estándar de autorización
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        console.error("[Axios Request Error]:", error);
        return Promise.reject(error);
    }
);

// INTERCEPTOR DE RESPUESTA: Manejo de seguridad y estado de sesión
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Manejo específico para errores de autenticación (Token expirado o inválido)
        if (error.response && error.response.status === 401) {
            console.error("Acceso denegado o sesión expirada. Redirigiendo al login...");
            
            // Limpiamos los datos locales para forzar una nueva autenticación
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            
            // Redirección inmediata si no estamos ya en la página de login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        
        // Manejo de errores de conexión (cuando el backend está apagado o reiniciando)
        if (!error.response) {
            console.error("Error de red: No se pudo establecer conexión con el servidor de Juris-IA.");
        }

        return Promise.reject(error);
    }
);

export default api;