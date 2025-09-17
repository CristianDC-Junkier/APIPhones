import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook para acceder al contexto de autenticación.
 *
 * Retorna:
 * - user: Objeto del usuario autenticado (o null si no hay sesión).
 * - loading: Boolean que indica si el estado de autenticación se está cargando.
 * - login: Función para iniciar sesión con credenciales.
 * - logout: Función para cerrar sesión.
 *
 * Uso:
 * const { user, login, logout, loading } = useAuth();
 *
 * @returns {Object} Contexto de autenticación
 */
export const useAuth = () => {
    return useContext(AuthContext);
};
