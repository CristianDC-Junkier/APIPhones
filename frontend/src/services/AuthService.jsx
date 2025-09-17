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
        return { success: false, error };
    }
};

/**
 * Solicitud de cierre de sesión del usuario actualmente conectado
 * @returns {JSNO} - Contiene un booleano con true en caso de exito y false en caso de error
 */
export const logout = async () => {
    try {
        await api.post('/logout');
        return { success: true };
    } catch {
        return { success: false };
    }
};