/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import { login, logout, date } from '../services/AuthService';
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
    const [token, setToken] = useState(null); // Token actual
    const [loading, setLoading] = useState(true); // Estado de carga inicial


    /**
     * Guarda el usuario en storage cifrado con expiración.
     * @param {Object} token - Token del usuario.
     * @param {Object} user - Campos minimos del usuario.
     * @param {boolean} rememberMe - true → localStorage, false → sessionStorage.
     */
    const saveUserWithExpiry = (token, user, rememberMe) => {
        const now = new Date();
        const item = {
            token,
            user,
            expiry: now.getTime() + 60 * 60 * 1000, // Expira en 1 hora
        };

        // Cifrar con AES
        const encrypted = CryptoJS.AES.encrypt(
            JSON.stringify(item),
            SECRET_KEY
        ).toString();

        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("user", encrypted);
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
            return decrypted;
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
        const storedValues = getUserWithExpiry();
        if (storedValues) {
            setToken(storedValues.token);
            setUser(storedValues.user);
        }
        setLoading(false);
    }, []);

    /** 
     * Loguear usuario
     * 
     * @param {Object} credentials - { username, password, remember }
     * @return {Object} Resultado del login { success: boolean, data/message }
     */
    const contextLogin = async (credentials) => {
        const result = await login(credentials);
        if (result.success) {
            setToken(result.data.token);
            const userLog = {
                id: result.data.user.id,
                username: result.data.user.username,
                usertype: result.data.user.usertype,
                department: result.data.user.userData.departmentId || null,
                forcePwdChange: result.data.user.forcePwdChange || false,
            };
            setUser(userLog);
            saveUserWithExpiry(result.data.token, userLog, credentials.remember);
        }
        else {
            setUser(null);
            sessionStorage.removeItem("user");
            localStorage.removeItem("user");
        }
        return result;
    };

    /**
    * Actualiza el usuario en el contexto y en el storage correspondiente.
    * @param {Object} newUser - Usuario actualizado.
    */
    const updateUser = (newUser) => {
        setUser(newUser);

        // Determinar dónde estaba guardado
        const storage = localStorage.getItem("user") ? localStorage : sessionStorage;
        const existingEncrypted = storage.getItem("user");
        if (existingEncrypted) {
            try {
                const bytes = CryptoJS.AES.decrypt(existingEncrypted, SECRET_KEY);
                const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                const updatedItem = {
                    ...decrypted,
                    user: newUser
                };
                const encrypted = CryptoJS.AES.encrypt(
                    JSON.stringify(updatedItem),
                    SECRET_KEY
                ).toString();
                storage.setItem("user", encrypted);
            } catch {
                // Si hay error, limpiar storage
                storage.removeItem("user");
            }
        }
    };

    /**
     * Cerrar sesión
     */
    const contextLogout = async () => {
        await logout(token);
        setUser(null);
        setToken(null);
        sessionStorage.removeItem("user");
        localStorage.removeItem("user");
    };

    /**
     * Recoger fecha del listin
     */
    const contextDate = async () => {
        const result = await date(); 
        if (result.success) return result.data.date;
        else return "Fecha no disponible";
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login: contextLogin,
                logout: contextLogout,
                date: contextDate,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};