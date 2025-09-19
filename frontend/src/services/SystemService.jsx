import api from './AxiosService';

/**
 * Servicio en cargado de obtener información del estado del servidor 
 * y los logs que contienen las acciones realizadas por los usuarios
 * 
 * Proporciona métodos para:
 *   - Obtener un listado de los logs presentes en el servidor
 *   - Obtener el contenido de un log seleccionado
 *   - Descargar un log seleccionado
 *   - Obtener las estadísticas del servidor
 */

/**
 * Solicitud para obtener un listado con todos los logs
 * @param {String} token - Token del usuario conectado para comprobar si tiene autorización
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const getLogs = async (token) => {
    try {
        const res = await api.get('/logs', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

/**
 * Solicitud para obtener el contenido de un log
 * @param {Object} log - Log del que se quiere obtener la información
 * @param {String} token - Token del usuario conectado para comprobar si tiene autorización
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const getLog = async (log,token) => {
    try {
        const res = await api.get(`/logs/${encodeURIComponent(log)}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

/**
 * Solicitud para descargar un log
 * @param {Object} log - Log que se quiere descargar
 * @param {String} token - Token del usuario conectado para comprobar si tiene autorización
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const downloadLog = async (log,token) => {
    try {
        const res = await api.get(
            `/logs/${encodeURIComponent(log)}/download`,
            {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        // Crear un enlace para descargar el archivo
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', log);
        document.body.appendChild(link);
        link.click();
        link.remove();

        return { success: true };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

/**
 * Solicitud para obtener las métricas del sistema
 * @param {String} token - Token del usuario conectado para comprobar si tiene autorización
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const getSystemMetrics = async (token) => {
    try {
        const res = await api.get('/system',{
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};
