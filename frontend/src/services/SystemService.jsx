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
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const getLogs = async () => {
    try {
        const res = await api.get('/logs', {});
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

/**
 * Solicitud para obtener el contenido de un log
 * @param {Object} log - Log del que se quiere obtener la información
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const getLog = async (log) => {
    try {
        const res = await api.get(`/logs/${encodeURIComponent(log)}`, {});
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};

/**
 * Solicitud para descargar un log
 * @param {Object} log - Log que se quiere descargar
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const downloadLog = async (log) => {
    try {
        const res = await api.get(
            `/logs/${encodeURIComponent(log)}/download`,
            {
                responseType: 'blob',
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
 * @returns {JSON} - Devuelve la información recibida de la llamada
 */
export const getSystemMetrics = async () => {
    try {
        const res = await api.get('/system',{});
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
};
