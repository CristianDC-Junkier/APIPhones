import api from './AxiosService';

/**
 * Servicio encargado de hacer las solicitudes al servidor de inicio y cierre de sesión
 */

/**
 * Solicitud de inicio de sesión
 * @param {Object} credentials - El usuario y contraseña de quien realiza la solicitud
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const login = async (credentials) => {
    try {
        const response = await api.post('/login', credentials);
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};


/**
 * Solicitud de cierre de sesión
 * @param {String} token - Token del usuario conectado para comprobar autorización
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const logout = async (token) => {
    try {
        const response = await api.get('/logout', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};


/**
 * Solicitud de la fecha del listin
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const date = async () => {
    try {
        const response = await api.get('/date');
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};
