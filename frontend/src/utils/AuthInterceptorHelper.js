/**
 * Referencia global a la función encargada de actualizar el estado del usuario.
 * @type {Function|null}
 */
let updateUserState = null;

/**
 * Registra la función de actualización del usuario.
 * 
 * Esta función debe ser llamada al iniciar la aplicación, normalmente
 * en el componente raíz (App) o en el provider del contexto de usuario.
 * 
 * @param {Function} updateFunc - Función que actualiza el estado global del usuario.
 */
export const setUpdateUserState = (updateFunc) => {
    updateUserState = updateFunc;
};

/**
 * Obtiene la función actualmente registrada para actualizar el usuario.
 * 
 * @returns {Function|null} - Función registrada o null si no existe.
 */
export const getUpdateUserState = () => updateUserState;
