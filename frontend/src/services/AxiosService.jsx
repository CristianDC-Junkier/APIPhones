import axios from 'axios';

/**
 * Servicio encargado de conectar con el servidor
 * baseURL cambia según el entorno (VITE_MODE)
 */

const api = axios.create({
    baseURL: '/visor-sig/api',
    withCredentials: false,
});

export default api;
