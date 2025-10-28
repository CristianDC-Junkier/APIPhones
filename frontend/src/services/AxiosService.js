import axios from 'axios';
import Swal from 'sweetalert2';
import { getAccessToken, setAccessToken, refreshAccessToken, clearAccessToken } from "./AuthService";
import { getUpdateUserState } from '../utils/AuthInterceptorHelper';

/**
 * Servicio encargado de realizar las llamadas al servidor
 * e interceptar las peticiones/respuestas para gestionar
 * 
 * Utiliza metodos para:
 *  - Interceptar requests y añadir el token de acceso
 *  - Interceptar responses y gestionar la expiración del token
 *  - Gestionar la actualización de la información del usuario en caso de conflicto
 */

const BASE_URL = "/listin-telefonico"

const api = axios.create({
    baseURL: `${BASE_URL}/api`,
    withCredentials: true,
});

/**
 * Interceptor de solicitud (request)
 * 
 * Inserta automáticamente el token de autenticación (Bearer Token)
 * en las cabeceras de todas las solicitudes salientes, excepto aquellas
 * destinadas a login, logout o refresh, donde no se debe incluir.
 * 
 * @param {Object} config - Configuración de la solicitud Axios.
 * @returns {Object} - Configuración modificada con el encabezado Authorization si corresponde.
 */
api.interceptors.request.use((config) => {
    const token = getAccessToken();

    // No adjuntar token a login, logout o refresh
    const skipAuth =
        config.url.includes("/auth/login") ||
        config.url.includes("/auth/logout") ||
        config.url.includes("/auth/refresh");

    if (token && !skipAuth) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});


//#region variables de control de concurrencia

let isRefreshing = false;   // Indica si hay un refresh de token en curso
let failedQueue = [];       // Cola de promesas para peticiones que esperan un token nuevo

/**
 * Procesa la cola de peticiones fallidas durante la renovación del token.
 * 
 * Si la renovación fue exitosa, reintenta todas las solicitudes pendientes
 * con el nuevo token. Si ocurrió un error, las rechaza.
 * 
 * @param {Error|null} error - Error ocurrido durante el refresh (si aplica).
 * @param {string|null} token - Nuevo token de acceso obtenido.
 */
const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};
//#endregion

/**
 * Interceptor global de respuestas Axios.
 *
 * Gestiona automáticamente:
 *  - Errores de autenticación (401) para refrescar el token de acceso.
 *  - Conflictos de versión de usuario (409) para mantener sincronizado el estado global del usuario.
 *
 * Flujo principal:
 *  - 401 → Intenta refrescar el token mediante cookie HttpOnly y reintenta la solicitud original.
 *  - 409 → Actualiza el estado del usuario en React (AuthContext) si la versión local está desactualizada.
 *
 * Controla los flags `isRefreshing` e `isUpdatingUser` para evitar condiciones de carrera
 * entre múltiples solicitudes concurrentes.
 */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        /**
         * CASO 401 - Token expirado o inválido
         *
         * Si la sesión ha expirado o el token es inválido, se intenta refrescar el token de acceso.
         * Este bloque se evalúa antes que el 409, ya que sin un token válido no se pueden
         * ejecutar operaciones autenticadas, incluida la actualización del usuario.
         */
        if (
            status === 401 &&
            !originalRequest._handled401 &&
            !originalRequest.url.includes("/auth/login") &&
            !originalRequest.url.includes("/auth/refresh")
        ) {
            originalRequest._handled401 = true;

            isRefreshing = true;
            try {
                const ok = await refreshAccessToken();
                isRefreshing = false;

                if (ok?.success && ok.data?.accessToken) {
                    const newToken = ok.data.accessToken;
                    setAccessToken(newToken);
                    processQueue(null, newToken);
                    originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                    return api(originalRequest); // Reintenta la solicitud original
                } else {
                    processQueue(error, null);
                    clearAccessToken();

                    await Swal.fire({
                        icon: "warning",
                        title: "Sesión expirada",
                        html: "Por motivos de seguridad su sesión expiró.<br>Por favor, vuelve a iniciar sesión.",
                        confirmButtonText: "Aceptar",
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                    });

                    window.location.href = `${BASE_URL}/login`;
                    return Promise.reject(error);
                }
            } catch (err) {
                isRefreshing = false;
                processQueue(err, null);
                clearAccessToken();
                return Promise.reject(err);
            }
        }

        /**
         * CASO 409 - Usuario desactualizado
         *
         * Si el backend devuelve un código 409 (Conflict), significa que la versión del usuario
         * local no coincide con la versión registrada en el servidor. En ese caso, se obtiene
         * el objeto `latestUser` desde la respuesta y se actualiza el estado global del usuario
         * mediante la función proporcionada por el helper `getUpdateUserState`.
         *
         * No se reintenta automáticamente la solicitud original para evitar duplicaciones;
         * el componente React asociado puede volver a solicitar los datos cuando detecte
         * el nuevo estado del usuario.
         */
        if (
            status === 409 &&
            !originalRequest.url.includes("/auth/login") &&
            !originalRequest.url.includes("/auth/logout") &&
            !originalRequest._handled409
        ) {
            originalRequest._handled409 = true;

            /* Espera si hay un proceso de refresh activo, para evitar conflicto con 401 */
            if (isRefreshing) {
                await new Promise((resolve) => {
                    const check = setInterval(() => {
                        if (!isRefreshing) {
                            clearInterval(check);
                            resolve();
                        }
                    }, 100);
                });
            }

            const latestUser = error.response.data?.latestUser;
            const updateUserState = getUpdateUserState();

            if (latestUser && updateUserState) {
                updateUserState(latestUser);
                return Promise.resolve();
            } else {
                return Promise.reject(error);
            }
        }

        /**
         * Otros errores no gestionados (404, 500, etc.)
         *
         * Cualquier otro código de error no contemplado se envía al flujo estándar
         * de manejo de errores definido por la aplicación.
         */
        return Promise.reject(error);
    }
);



export default api;
