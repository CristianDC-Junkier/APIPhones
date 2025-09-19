import api from './AxiosService';

/**
 * Servicio encargado de hacer las llamadas al servidor 
 * sobre las acciones que afectan a los departamentos
 * 
 * Proporciona metodos para:
 *  - Listar todos los departamentos
 *  - Crear un departamento
 *  - Modificar un departamento
 *  - Eliminar un departamento
 * 
 */


/**
 * Solicitud para obtener la lista de todos los departamentos existentes
 * @param {String} token - Token del usuario conectado para comprobar si tiene autorización
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const getDepartmentsList = async (token) => {
    try {
        const res = await api.get('department/', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Solicitud para obtener la lista de todos los subdepartamentos existentes
 * @param {String} token - Token del usuario conectado para comprobar si tiene autorización
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const getSubDepartmentsList = async (token) => {
    try {
        const res = await api.get('subdepartment/', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error };
    }
};