import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import SpinnerComponent from '../components/utils/SpinnerComponent';
import PWDChangeComponent from '../components/user/PWDChangeComponent';

/**
 * Componente de ruta privada.
 * 
 * Protege rutas que requieren autenticación:
 * - Si el usuario no está autenticado → redirige a /login.
 * - Mientras se carga la información del usuario → muestra un spinner.
 * - Si el usuario está autenticado → renderiza los children.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes hijos que se mostrarán si el usuario está autenticado.
 */
const PrivateRoute = ({ children }) => {
    const { user, token, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login', { replace: true });
        }
    }, [loading, user, navigate]);

    if (loading) return <SpinnerComponent />;

    return (
        <>
            {/* Prompt para cambio de contraseña si es necesario */}
            {user?.forcePwdChange && <PWDChangeComponent user={user} token={token} />}
            {user ? children : <SpinnerComponent />}
        </>
    );

};

export default PrivateRoute;
