import api from './AxiosService';

/**
 * Servicio encargado de hacer las solicitudes al servidor de inicio y cierre de sesión
 */

// Token en memoria
let accessToken = null;

/**
 * Devuelve el accessToken actual
 */
export const getAccessToken = () => accessToken;

/**
 * Guarda el accessToken
 */
export const setAccessToken = (token) => {
    accessToken = token;
};

/**
 * Limpia el accessToken
 */
export const clearAccessToken = () => {
    accessToken = null;
};

/**
 * Solicitud de inicio de sesión
 * @param {Object} credentials - El usuario y contraseña de quien realiza la solicitud
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const login = async (credentials) => {
    try {
        const response = await api.post('/auth/login', credentials);

        // Guardar el accessToken recibido
        if (response.data?.accessToken) {
            setAccessToken(response.data.accessToken);
        }

        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};


/**
 * Solicitud de cierre de sesión
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const logout = async () => {
    try {
        const response = await api.get('/auth/logout');
        clearAccessToken();

        return { success: true, data: response.data };
    } catch (error) {
        clearAccessToken();
        return { success: false, error: error.response?.data?.error };
    }
};


/**
 * Solicitud de la fecha del listin
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const getDate = async () => {
    try {
        const response = await api.get('/auth/date');
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};


/**
 * Llamada al backend para refrescar el accessToken usando la cookie refreshToken
 */
export const refreshAccessToken = async () => {
    try {
        const response = await api.get('/auth/refresh', {});
        if (response.data?.accessToken) {
            setAccessToken(response.data.accessToken);
        }
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error || 'Error al recargar Token',
        };
    }
};
