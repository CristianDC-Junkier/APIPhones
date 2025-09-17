import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Spinner from '../utils/SpinnerComponent';

/**
 * Componente de ruta pública.
 * 
 * Protege rutas públicas para que los usuarios autenticados no puedan acceder:
 * - Si el usuario está autenticado:
 *    - Redirige a `/home` si es ADMIN o SUPERADMIN.
 *    - Redirige a `/app` si es USER.
 *    - Redirige a `/login` si el tipo de usuario es desconocido.
 * - Mientras se carga la información del usuario → muestra un spinner.
 * - Si el usuario no está autenticado → renderiza los children.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes hijos que se mostrarán si el usuario no está autenticado.
 */
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
                if (user.usertype === 'ADMIN' || user.usertype === 'SUPERADMIN') {
                    navigate('/home');
                }
                else if (user.usertype === 'USER') {
                    navigate('/app');
                } else {
                    navigate('/login');
                }
        }
    }, [loading, user, navigate]);

    if (loading) return <Spinner />;
    return !user ? children : <Spinner />;
};

export default PublicRoute;

