import api from './AxiosService';

/**
 * Servicio encargado de hacer las llamadas al servidor 
 * sobre las acciones que afectan a los usuarios
 * 
 * Proporciona metodos para:
 *  - Listar todos los usuarios
 *  - Crear un usuario
 *  - Modificar un usuario
 *  - Eliminar un usuario
 * 
 */


/**
 * Solicitud para obtener la lista de todos los usuario existentes
 * @param {String} token - Token del usuario conectado para comprobar si tiene autorización
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const getUsersList = async (token) => {
    try {
        const res = await api.get('/', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Solicitud de creación de un nuevo usuario
 * @param {Object} user - la información del usuario que se quiere crear
 * @param {String} token - Token del usuario conectado para comprobar si tiene autorización
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const createUser = async (user, token) => {
    try {
        const res = await api.post('/', user, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Solicitud de modificación de un usuario existente
 * @param {Object} user - la información del usuario que se quiere modificar
 * @param {String} token - Token del usuario conectado para comprobar si tiene autorización
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const modifyUser = async (user, token) => {
    try {
        const res = await api.put(`/${user.id}`, user, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data || error.message };
    }
};

/**
 * Solicitud de eliminación de un usuario
 * @param {Object} userId - el ID del usuario que se quiere eliminar
 * @param {String} token - Token del usuario conectado para comprobar si tiene autorización
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const deleteUser = async (userId, token) => {
    try {
        const res = await api.delete(`/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data || error.message };
    }
};

