// src/services/AxiosService.js
import axios from 'axios';

/**
 * Servicio encargado de conectar con el servidor
 */

const api = axios.create({
    baseURL: import.meta.env.VITE_IP + '/api',
    withCredentials: false,
});

export default api;