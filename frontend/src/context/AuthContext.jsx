/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { login, logout, getDate, refreshAccessToken } from '../services/AuthService';
import { setUpdateUserState } from '../utils/AuthInterceptorHelper';
import SpinnerComponent from '../components/utils/SpinnerComponent';

import Swal from "sweetalert2";

export const AuthContext = createContext();

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

/**
 * Proveedor de autenticación.
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Usuario actual
    const [loading, setLoading] = useState(true); // Estado de carga inicial
    const [version, setVersion] = useState(0); // Versión del usuario

    /**
     * Actualiza el usuario y su versión, función que será inyectada en el interceptor.
     * Esta función debe ser estable.
     * @param {Object} newUser - Objeto de usuario más reciente recibido del backend.
     */
    const contextUpdate = useCallback((newUser) => {
        setUser(newUser);
        setVersion(newUser.version || 0);
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

    /** * Restaurar sesión al cargar la app usando cookie HttpOnly
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
     * Login
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
                    department: result.data.user.departmentId || null,
                    forcePwdChange: result.data.user.forcePwdChange || false,
                    version: result.data.user.version || 0, // version desde backend
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
     * Logout
     */
    const contextLogout = async () => {
        try {
            await logout(); // la cookie HttpOnly se borra desde el backend
        } finally {
            setUser(null);
            setVersion(0);
        }
    };

    /** Obtener fecha del listín */
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
                update: contextUpdate, // Exponer también la función para uso interno si es necesario
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
