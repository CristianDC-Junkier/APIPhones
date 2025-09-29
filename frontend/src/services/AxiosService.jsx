import axios from 'axios';

/**
 * Servicio encargado de conectar con el servidor
 * baseURL cambia según el entorno (VITE_MODE)
 */

const api = axios.create({
    baseURL: '/listin-telefonico/api',
    withCredentials: false,
});

// Interceptor de respuesta
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            sessionStorage.removeItem("user");
            localStorage.removeItem("user");
            window.location.href = '/listin-telefonico/login';
        }
        return Promise.reject(error);
    }
);
export default api;
