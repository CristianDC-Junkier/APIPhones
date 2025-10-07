/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useState, useEffect } from 'react';
import { login, logout, getDate, getVersion } from '../services/AuthService';
import CryptoJS from 'crypto-js';
import Swal from "sweetalert2";

export const AuthContext = createContext();

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

/**
 * Proveedor de autenticación.
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Usuario actual
    const [token, setToken] = useState(null); // Token actual
    const [loading, setLoading] = useState(true); // Estado de carga inicial
    const [version, setVersion] = useState(0); // Versión del usuario

    /**
     * Guarda el usuario en storage cifrado con expiración.
     */
    const saveUserWithExpiry = (token, user, rememberMe) => {
        const now = new Date();
        const item = {
            token,
            user,
            version: user.version || 0,
            expiry: now.getTime() + 60 * 60 * 1000, // Expira en 1 hora
        };

        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(item), SECRET_KEY).toString();
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("user", encrypted);
    };

    /**
     * Recupera el usuario desde storage y valida expiración.
     */
    const getUserWithExpiry = () => {
        const encrypted = sessionStorage.getItem("user") || localStorage.getItem("user");
        if (!encrypted) return null;

        try {
            const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
            const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            const now = new Date();
            if (now.getTime() > decrypted.expiry) {
                sessionStorage.removeItem("user");
                localStorage.removeItem("user");
                return null;
            }
            return decrypted;
        } catch {
            sessionStorage.removeItem("user");
            localStorage.removeItem("user");
            return null;
        }
    };

    /** Restaurar usuario al cargar la app */
    useEffect(() => {

        const restoreAndCheckVersion = async () => {
            const storedValues = getUserWithExpiry();
            if (!storedValues) {
                setLoading(false);
                return;
            }

            setToken(storedValues.token);
            setUser(storedValues.user);
            setVersion(storedValues.version);


            try {
                const result = await getVersion(storedValues.token);
                if (result.success) {

                    if (result.data.version !== storedValues.version) {
                        //Si la versión no es correcta, cerrar sesión
                        await contextLogout();
                        await Swal.fire({
                            icon: "warning",
                            title: "Sesión expirada",
                            html: 'Por motivos de seguridad su sesión expiró.<br> Por favor, vuelve a iniciar sesión.',
                            confirmButtonText: "Aceptar",
                        });
                    }
                }
            } catch {
                //Si la cuenta no existe, cerrar sesión
                await contextLogout();
                await Swal.fire({
                    icon: "warning",
                    title: "Sesión eliminada",
                    html: "Su cuenta ya no existe, <br> será redirigido al Inicio de Sesión.",
                    confirmButtonText: "Aceptar",
                });
            }
            setLoading(false);
        };

        restoreAndCheckVersion();
    }, []);


    /** Loguear usuario */
    const contextLogin = async (credentials) => {
        const result = await login(credentials);
        if (result.success === true) {
            const userLog = {
                id: result.data.user.id,
                username: result.data.user.username,
                usertype: result.data.user.usertype,
                department: result.data.user.departmentId || null,
                forcePwdChange: result.data.user.forcePwdChange || false,
                version: result.data.user.version || 0, // version desde backend
            };
            setUser(userLog);
            setToken(result.data.token);
            setVersion(userLog.version);
            saveUserWithExpiry(result.data.token, userLog, credentials.remember);
            return result;
        } else {
            setUser(null);
            setToken(null);
            setVersion(0);
            sessionStorage.removeItem("user");
            localStorage.removeItem("user");
            return result;
        }
    };

    /**
     * Actualiza el usuario y su versión en contexto y storage.
     */
    const contextUpdate = (newUser, newToken) => {
        setUser(newUser);
        setVersion(newUser.version == version ? (version + 1) : newUser.version); // Incrementa si no viene versión del backend

        // Guardar en storage
        const storage = localStorage.getItem("user") ? localStorage : sessionStorage;
        const existingEncrypted = storage.getItem("user");
        if (existingEncrypted) {
            try {
                const bytes = CryptoJS.AES.decrypt(existingEncrypted, SECRET_KEY);
                const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                const updatedItem = {
                    token: newToken,
                    user: newUser,
                    version: newUser.version,
                    expiry: decrypted.expiry
                };
                const encrypted = CryptoJS.AES.encrypt(JSON.stringify(updatedItem), SECRET_KEY).toString();
                storage.setItem("user", encrypted);
            } catch {
                storage.removeItem("user");
            }
        }
    };

    /** Cerrar sesión */
    const contextLogout = async () => {
        try {
            await logout(token);
        }
        finally {
            setUser(null);
            setToken(null);
            setVersion(0);
            sessionStorage.removeItem("user");
            localStorage.removeItem("user");
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
                token,
                version,
                loading,
                login: contextLogin,
                logout: contextLogout,
                update: contextUpdate,
                date: contextDate,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
