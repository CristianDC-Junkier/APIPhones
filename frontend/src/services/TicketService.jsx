import api from './AxiosService';


/**
 * Servicio encargado de hacer las llamadas al servidor 
 * sobre las acciones que afectan a los ticket
 * 
 * Proporciona metodos para:
 *  - Listar todos los tickets
 *  - Crear un ticket
 *  - Marcar un ticket
 */

/**
* Solicitud para obtener la lista de todos los tickets
*/
export const getTicketList = async () => {
    try {
        const res = await api.get('/ticket/');
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
}

/** 
 * Solicitud para obtener el total de ticket no resueltos
 */
export const getCount = async () => {
    try {
        const res = await api.get('/ticket/count');
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
}

/**
* Solicitud de creación de un ticket
*/
export const createNewTicket = async (ticket) => {
    try {
        const res = await api.post('/ticket/', ticket);
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
}

/**
 * Solicitud para cambiar el estado de un ticket
 */
export const markTicket = async (ticket) => {
    try {
        const res = await api.patch("/ticket/mark", ticket);
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.error };
    }
}