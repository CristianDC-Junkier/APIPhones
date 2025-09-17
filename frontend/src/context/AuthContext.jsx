/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import { login } from '../services/AuthService';
import CryptoJS from 'crypto-js';

export const AuthContext = createContext();

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

/**
 * Proveedor de autenticación.
 *
 * Props:
 * - children: Componentes que consumen el contexto AuthContext.
 *
 * Funcionalidades:
 * - Guarda y recupera usuario en storage (session/local) cifrado con AES.
 * - Maneja expiración de sesión.
 * - Proporciona métodos login y logout para consumir en cualquier componente.
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Usuario actual
    const [loading, setLoading] = useState(true); // Estado de carga inicial

    /**
     * Guarda el usuario en storage cifrado con expiración.
     * @param {Object} userData - Información del usuario.
     * @param {boolean} rememberMe - true → localStorage, false → sessionStorage.
     */
    const saveUserWithExpiry = (userData, rememberMe) => {
        const now = new Date();
        const item = {
            value: userData,
            expiry: now.getTime() + 60 * 60 * 1000, // Expira en 1 hora
        };

        // Cifrar con AES
        const encrypted = CryptoJS.AES.encrypt(
            JSON.stringify(item),
            SECRET_KEY
        ).toString();

        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("user", encrypted);

        console.log(
            `✅ Usuario guardado en ${rememberMe ? "localStorage" : "sessionStorage"}`
        );
    };

    /**
     * Recupera el usuario desde storage y valida expiración.
     * @returns {Object|null} Usuario descifrado o null si expira/no existe.
     */
    const getUserWithExpiry = () => {
        const encrypted =
            sessionStorage.getItem("user") || localStorage.getItem("user");

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
            return decrypted.value;
        } catch {
            // En caso de error de descifrado → limpiar storage
            sessionStorage.removeItem("user");
            localStorage.removeItem("user");
            return null;
        }
    };

    /**  
     * Restaurar usuario al cargar la app 
     */
    useEffect(() => {
        const storedUser = getUserWithExpiry();
        if (storedUser) setUser(storedUser);
        setLoading(false);
    }, []);

    /** 
     * Loguear usuario
     * 
     * @param {Object} credentials - { username, password, rememberMe }
     * @return {Object} Resultado del login { success: boolean, data/message }
     */ 
    const contextLogin = async (credentials) => {
        const result = await login(credentials);
        if (result.success) {
            setUser(result.data.user);
            saveUserWithExpiry(result.data.user, credentials.rememberMe);
        } else {
            setUser(null);
            sessionStorage.removeItem("user");
            localStorage.removeItem("user");
        }
        return result;
    };

    /**
     * Cerrar sesión
     */
    const contextLogout = async () => {
        setUser(null);
        sessionStorage.removeItem("user");
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login: contextLogin,
                logout: contextLogout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};