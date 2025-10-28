/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { login, logout, getDate, refreshAccessToken } from '../services/AuthService';
import { setUpdateUserState } from '../utils/AuthInterceptorHelper';
import SpinnerComponent from '../components/utils/SpinnerComponent';

export const AuthContext = createContext();

/**
 * Contexto de autenticación global.
 * @typedef {Object} AuthContextType
 * @property {Object|null} user - Usuario actualmente autenticado.
 * @property {number} version - Versión actual del usuario.
 * @property {boolean} loading - Indica si se está restaurando la sesión.
 * @property {Function} login - Inicia sesión con credenciales.
 * @property {Function} logout - Cierra la sesión.
 * @property {Function} date - Obtiene la fecha del listín.
 * @property {Function} update - Actualiza los datos del usuario globalmente.
 */

/**
 * Proveedor de autenticación con gestión automática de sesión y refresh token.
 * Inyecta en el interceptor global la función `contextUpdate` para mantener sincronizado
 * el estado del usuario ante actualizaciones (por ejemplo, error 409 del backend).
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Usuario actual
    const [version, setVersion] = useState(1); // Versión del usuario
    const [loading, setLoading] = useState(true); // Estado de carga inicial

    /**
     * Actualiza el usuario y su versión, función que será inyectada en el interceptor.
     * Esta función debe ser estable.
     * @param {Object} newUser - Objeto de usuario más reciente recibido del backend.
     */
    const contextUpdate = useCallback((newUser) => {
        setUser(newUser);
        setVersion(newUser.version || 1);
    }, []);

    /**
     * Inyecta la función de actualización (contextUpdate) en el helper global.
     * Se llama una sola vez para que el interceptor pueda usarla.
     */
    useEffect(() => {
        setUpdateUserState(contextUpdate);
        return () => {
            setUpdateUserState(null);
        };
    }, [contextUpdate]);

    /** 
     *  Restaurar sesión al cargar la app usando cookie HttpOnly
     */
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const res = await refreshAccessToken();
                if (!res.success) throw new Error("No hay sesión");

                // Usamos contextUpdate para establecer el estado de manera consistente
                contextUpdate(res.data.user);
            } catch {
                // Si no hay sesión o hay error → limpiar estado
                setUser(null);
                setVersion(0);
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, [contextUpdate]); // contextUpdate es estable gracias a useCallback.

    /**
     * Inicio de sesión
     * @param {Object} credentials - { username, password, remember }
     */
    const contextLogin = async (credentials) => {
        try {
            const result = await login(credentials);

            if (result.success) {
                // Reconstruimos el objeto para asegurar que tiene todas las propiedades clave
                const userLog = {
                    id: result.data.user.id,
                    username: result.data.user.username,
                    usertype: result.data.user.usertype,
                    department: result.data.user.department || null,
                    forcePwdChange: result.data.user.forcePwdChange || false,
                    version: result.data.user.version || 1, 
                };
                setUser(userLog);
                setVersion(userLog.version);
            } else {
                setUser(null);
                setVersion(0);
            }

            return result;
        } catch (err) {
            setUser(null);
            setVersion(0);
            // Retorna un error consistente
            return { success: false, message: err.message || "Error de inicio de sesión." };
        }
    };

    /**
     * Desconectar usuario
     */
    const contextLogout = async () => {
        try {
            await logout(); // la cookie HttpOnly se borra desde el backend
        } finally {
            setUser(null);
            setVersion(0);
        }
    };

    /** 
     * Obtener fecha del listín 
     */
    const contextDate = async () => {
        const result = await getDate();
        if (result.success) return result.data.date;
        return "Fecha no disponible";
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                version,
                loading,
                date: contextDate,
                login: contextLogin,
                logout: contextLogout,
                update: contextUpdate, 
            }}
        >
            {/* Mostrar un spinner de carga si es necesario antes de renderizar children */}
            {loading ? (
                <div className="flex items-center justify-center min-h-screen bg-gray-50">
                    <SpinnerComponent />
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}
