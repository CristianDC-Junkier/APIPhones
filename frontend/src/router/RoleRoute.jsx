import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import SpinnerComponent from '../components/utils/SpinnerComponent';
import PWDChangeComponent from '../components/user/PWDChangeComponent';

/**
 * Componente de ruta por roles.
 *
 * Protege rutas restringidas a ciertos roles de usuario:
 * - Si el usuario no está autenticado o su rol no está permitido → redirige a /accessdenied.
 * - Mientras se carga la información del usuario → muestra un spinner.
 * - Si el usuario está autenticado y su rol es permitido → renderiza los children.
 *
 * @param {Object} props
 * @param {Array<string>} props.allowedRoles - Roles permitidos para acceder a esta ruta.
 * @param {React.ReactNode} props.children - Componentes hijos que se mostrarán si el usuario tiene rol permitido.
 */
const RoleRoute = ({ allowedRoles, children }) => {
    const { user, token, loading } = useAuth();

    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!loading && (!user || !allowedRoles.includes(user.usertype))) {
                navigate('/accessdenied', { replace: true });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [loading, user, navigate, allowedRoles]);

    if (loading) return <SpinnerComponent />;
    if (!user || !allowedRoles.includes(user.usertype)) return null;
    return (
        <>
            {/* Prompt para cambio de contraseña si es necesario */}
            {user?.forcePwdChange && <PWDChangeComponent user={user} token={token} />}
            {user ? children : <SpinnerComponent />}
        </>
    );
};

export default RoleRoute;
