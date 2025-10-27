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
 *  - Forzar cambio de contraseña a un usuario
 *  - Cambiar la contraseña de un usuario marcado para cambio de contraseña
 *  - Obtener la información del perfil conectado
 *  - Modificar la información del perfil conectado
 *  - Eliminar la cuenta del perfil conectado
 */

//#region Recoger listas de usuarios

/**
 * Solicitud para obtener la lista de todos los usuario existentes sin detalles
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
 * @param {String|null} [department=null] - Departamento por el que filtrar (opcional)
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const getWorkerDataList = async (department = null) => {
    try {
        const endpoint = department
            ? `/data/worker-department`
            : '/data/worker';

        const res = await api.get(endpoint, {});

        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

/**
 * Solicitud para obtener la lista de todos los usuario existentes con detalles y sus cuentas de usuario
 * @param {String|null} [department=null] - Departamento por el que filtrar (opcional)
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const getUsersList = async (department = null) => {
    try {
        const endpoint = department
            ? `/acc/list-department`
            : '/acc/list';

        const res = await api.get(endpoint, {});
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

//#endregion

//#region Operaciones CRUD de usuarios
/**
 * Solicitud de creación de un nuevo usuario
 * @param {Object} user - la información del usuario que se quiere crear
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const createUser = async (user) => {
    try {
        const res = await api.post('/acc/', user, {});
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};
/**
 * Solicitud de creación de nuevos datos de usuario
 * @param {Object} userdata - la información de datos de usuario que se quiere crear
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const createUserData = async (userdata) => {
    try {
        const res = await api.post('/data/', userdata, {});
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

/**
 * Solicitud de modificación de un usuario existente
 * @param {String} id - ID del usuario a modificar
 * @param {Object} user - la información del usuario que se quiere modificar
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const modifyUser = async (id, user) => {
    try {
        const res = await api.put(`/acc/${id}`, user, {});
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

/**
 * Solicitud de modificación de la información de usuario existente
 * @param {Object} user - la información del usuario que se quiere modificar
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const modifyUserData = async (id, user) => {
    try {
        const res = await api.put(`/data/${id}`, user, {});
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

/**
 * Solicitud de eliminación de un usuario
 * @param {Object} userId - el ID del usuario que se quiere eliminar
 * @param {String} version - versión del usuario a eliminar
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const deleteUser = async (userId, version) => {
    try {
        const res = await api.delete(`/acc/${userId}`, {
            params: { version },
        });
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

/**
 * Solicitud de eliminación de un usuario
 * @param {Object} userId - el ID del usuario que se quiere eliminar
 * @param {String} version - versión del usuario a eliminar
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const deleteUserData = async (userId, version) => {
    try {
        const res = await api.delete(`/data/${userId}`, {
            params: { version },
        });
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

//#endregion

//#region Operaciones de cambios de contraseña
/**
 * Solicitud para marcar a un usuario para forzar un cambio de contraseña
 * @param {Object} userId - el ID del usuario que se quiere va a marcar
 * @param {Object} password - la constraseña temporal establecida por el usuario que realizó la marcación 
 *  * @param {String} version - versión del usuario a marcar
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const markPWDCUser = async (userId, password, version) => {
    try {
        const res = await api.patch(`/acc/${userId}/forcepwd`,  password , {
            params: { version },
        });
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
}

/**
 * Solicitud de cambio de contraseña para un usuario que ha sido marcado para cambio de contraseña
 * @param {String} newPassword - Nueva contraseña para el usuario marcado para el cambio de contraseña
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const changePasswordPWD = async (newPassword) => {
    try {
        const res = await api.patch(`acc/profile-PWD`, newPassword, {});
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
}

//#endregion

//#region Acciones sobre el perfil conectado
/**
 * Solicitud para obtener la información del usuario conectado
 * @param {String} version - versión del usuario asociado al perfil
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const getProfile = async (version) => {
    try {
        const res = await api.get('/data/profile', {
            params: { version },
        });
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

/**
 * Solicitud de eliminación de un perfil
 * @param {String} version - versión del usuario asociado al perfil a eliminar
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const deleteProfileAcc = async (version) => {
    try {
        const res = await api.delete(`/acc/profile-del`, {
            params: { version },
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
 * @param {String} version - versión del usuario asociado al perfil a modificar
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const modifyProfileAcc = async (useraccount, version) => {
    try {
        const res = await api.put(`/acc/profile-update`, useraccount, {
            params: { version },
        });
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
}

//#endregion