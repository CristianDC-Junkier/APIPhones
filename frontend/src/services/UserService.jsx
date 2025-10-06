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

//#region Get Lists Functions

/**
 * Solicitud para obtener la lista de todos los usuario existentes sin detalles
 * @param {String} token - Token del usuario conectado para comprobar si tiene autorización
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const getPublicList = async () => {
    try {
        const res = await api.get('/data/');
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

/**
 * Solicitud para obtener la lista de todos los usuario existentes con detalles
 * @param {String} token - Token del usuario conectado para comprobar si tiene autorización
 * @param {String|null} [department=null] - Departamento por el que filtrar (opcional)
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const getUserDataList = async (token, department = null) => {
    try {
        const endpoint = department
            ? `/acc/list-department`
            : '/acc/list';

        const res = await api.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return { success: true, data: res.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error || error.message
        };
    }
};

/**
 * Solicitud para obtener la lista de todos los usuario existentes con detalles
 * @param {String} token - Token del usuario conectado para comprobar si tiene autorización
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const getWorkerDataList = async (token, department = null) => {
    try {
        const endpoint = department
            ? `/data/worker-department`
            : '/data/worker';

        const res = await api.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return { success: true, data: res.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error || error.message
        };
    }
};
//#endregion

//#region Generic User Action
/**
 * Solicitud de creación de un nuevo usuario
 * @param {Object} user - la información del usuario que se quiere crear
 * @param {String} token - Token del usuario conectado para comprobar si tiene autorización
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const createUser = async (user, token) => {
    try {
        const res = await api.post('/acc/', user, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

/**
 * Solicitud de modificación de un usuario existente
 * @param {Object} user - la información del usuario que se quiere modificar
 * @param {String} token - Token del usuario conectado para comprobar si tiene autorización
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const modifyUser = async (id, user, token) => {
    try {
        const res = await api.put(`/acc/${id}`, user, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

/**
 * Solicitud de modificación de la información de usuario existente
 * @param {Object} user - la información del usuario que se quiere modificar
 * @param {String} token - Token del usuario conectado para comprobar si tiene autorización
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const modifyUserData = async (id, user, token) => {
    try {
        const res = await api.put(`/data/${id}`, user, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

/**
 * Solicitud de eliminación de un usuario
 * @param {Object} userId - el ID del usuario que se quiere eliminar
 * @param {String} token - Token del usuario conectado para comprobar si tiene autorización
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const deleteUser = async (userId, token, version) => {
    try {
        const res = await api.delete(`/acc/${userId}`, {
            params: { version },
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

/**
 * Solicitud de eliminación de un usuario
 * @param {Object} userId - el ID del usuario que se quiere eliminar
 * @param {String} token - Token del usuario conectado para comprobar si tiene autorización
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const deleteUserData = async (userId, token, version) => {
    try {
        const res = await api.delete(`/data/${userId}`, {
            params: { version },
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

//#endregion

//#region Forced Password Change Actions
/**
 * Solicitud para marcar a un usuario para forzar un cambio de contraseña
 * @param {Object} userId - el ID del usuario que se quiere va a marcar
 * @param {Object} password - la constraseña temporal establecida por el usuario que realizó la marcación 
 * @param {String} token - Token del usuario conectado para comprobar si tiene autorización
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const markPWDCUser = async (userId, password, token, version) => {
    try {
        const res = await api.put(`/acc/${userId}/forcepwd`, password, {
            params: { version },
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
}

/**
 * Solicitud de cambio de contraseña para un usuario que ha sido marcado para cambio de contraseña
 * @param {String} newPassword - Nueva contraseña para el usuario marcado para el cambio de contraseña
 * @param {String} token - Token del usuario conectado para comprobar si tiene autorización
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const changePasswordPWD = async (newPassword, token) => {
    try {
        const res = await api.put(`acc/profile-PWD`, newPassword, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
}

//#endregion

//#region Profile Actions
/**
 * Solicitud para obtener la información del usuario conectado
 * @param {String} token - Token del usuario conectado para comprobar si tiene autorización
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const getProfile = async (token, version) => {
    try {
        const res = await api.get('/data/profile', {
            params: { version },
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

/**
 * Solicitud de eliminación de un usuario
 * @param {Object} userId - el ID del usuario que se quiere eliminar
 * @param {String} token - Token del usuario conectado para comprobar si tiene autorización
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const deleteProfileAcc = async (token, version) => {
    try {
        const res = await api.delete(`/acc/profile-del`, {
            params: { version },
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

/**
 * Solicitud de eliminación de un usuario
 * @param {Object} userId - el ID del usuario que se quiere eliminar
 * @param {String} token - Token del usuario conectado para comprobar si tiene autorización
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const deleteProfileData = async (token, version) => {
    try {
        const res = await api.delete(`/data/profile-del`, {
            params: { version },
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

/**
 * Solicitud de cambio de infromación de la cuenta del perfil conectado
 * 
 * @param {String} useraccount - Nueva información de inicio de sesion para el perfil concetado
 * @param {String} token - Token del usuario conectado para comprobar si tiene autorización
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const modifyProfileAcc = async (useraccount, token, version) => {
    try {
        const res = await api.put(`/acc/profile-update`, useraccount, {
            params: { version },
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
}

/**
 * Solicitud de modificar la información asociada al perfil
 * 
 * @param {String} userdata - Nueva información del perfil
 * @param {String} token - Token del usuario conectado para comprobar si tiene autorización
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const modifyProfileData = async (userdata, token, version) => {
    try {
        const res = await api.put('/data/profile-update', userdata, {
            params: { version },
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

//#endregion