import axios from 'axios';
import Swal from 'sweetalert2';

/**
 * Servicio encargado de conectar con el servidor
 * baseURL cambia según el entorno (VITE_MODE)
 */

const api = axios.create({
    baseURL: '/listin-telefonico/api',
    withCredentials: false,
});

// Control para no disparar varias veces el SweetAlert
let isLoggingOut = false; 

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401 && !isLoggingOut) {
            isLoggingOut = true; // Se marca que ya está en proceso

            Swal.fire({
                icon: 'warning',
                title: 'Sesión expirada',
                html: 'Por motivos de seguridad su sesión expiró.<br> Por favor, vuelve a iniciar sesión.',
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                allowEscapeKey: false
            }).then(() => {
                // Solo cuando el usuario pulse "Aceptar"
                sessionStorage.removeItem("user");
                localStorage.removeItem("user");

                // Redirigir al login
                window.location.href = '/listin-telefonico/login';
            });
        }
        return Promise.reject(error);
    }
);



export default api;
