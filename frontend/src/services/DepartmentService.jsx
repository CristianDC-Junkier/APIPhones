import api from './AxiosService';

/**
 * Servicio encargado de hacer las llamadas al servidor
 * sobre las acciones que afectan a los departamentos
 * 
 * Proporciona métodos para:
 *  - Listar todos los departamentos
 *  - Listar todos los subdepartamentos
 *  - Recoger todos los subdepartamentos de un departamento
 *  - Recoger un departamento por ID
 *  - Crear un departamento
 *  - Crear un subdepartamento
 *  - Modificar un departamento
 *  - Modificar un subdepartamento
 *  - Eliminar un departamento
 *  - Eliminar un subdepartamento
 */

/**
 * Solicitud para obtener la lista de todos los departamentos existentes
 * @param {String} token - Token del usuario conectado para comprobar autorización
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const getDepartmentsList = async () => {
    try {
        const res = await api.get('/department/');
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

/**
 * Solicitud para obtener la lista de subdepartamentos
 * @param {String|null} [departmentId=null] - Id del departamento padre (opcional)
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const getSubDepartmentsList = async (departmentId = null) => {
    try {
        const endpoint = departmentId
            ? `/subdepartment/father/${departmentId}`
            : '/subdepartment/';

        const res = await api.get(endpoint, {});

        return { success: true, data: res.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error || error.message
        };
    }
};

/**
 * Solicitud para obtener un departamento por id
 * @param {String} id - Id del departamento a consultar
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const getDepartmentById = async (id) => {
    try {
        const res = await api.get(`/department/${id}`, {});
        return { success: true, data: res.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error || error.message
        };
    }
};

/**
 * Solicitud para crear un departamento
 * @param {Object} departmentData - Datos del departamento a crear { name }
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const createDepartment = async (departmentData) => {
    try {
        const res = await api.post('/department/', departmentData, {});
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

/**
 * Solicitud para crear un subdepartamento
 * @param {Object} subDepartmentData - Datos del subdepartamento a crear { name, departmentId }
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const createSubDepartment = async (subDepartmentData) => {
    try {
        const res = await api.post('/subdepartment/', subDepartmentData, {});
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

/**
 * Solicitud para modificar un departamento existente
 * @param {Object} departmentData - Datos del departamento { id, name }
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const modifyDepartment = async (departmentData) => {
    try {
        const res = await api.put(`/department/${departmentData.id}`, departmentData, {});
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

/**
 * Solicitud para modificar un subdepartamento existente
 * @param {Object} subDepartmentData - Datos del subdepartamento { id, name, departmentId }
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const modifySubDepartment = async (subDepartmentData) => {
    try {
        const res = await api.put(`/subdepartment/${subDepartmentData.id}`, subDepartmentData, {});
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

/**
 * Solicitud para eliminar un departamento existente
 * @param {Number} departmentId - ID del departamento a eliminar
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const deleteDepartment = async (departmentId) => {
    try {
        const res = await api.delete(`/department/${departmentId}`, {});
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

/**
 * Solicitud para eliminar un subdepartamento existente
 * @param {Number} subDepartmentId - ID del subdepartamento a eliminar
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const deleteSubDepartment = async (subDepartmentId) => {
    try {
        const res = await api.delete(`/subdepartment/${subDepartmentId}`, {});
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};
