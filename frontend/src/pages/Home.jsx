import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeButtonComponent from '../components/utils/HomeButtonComponent';
import LogoutButton from '../components/utils/LogoutComponent';
import { useAuth } from '../hooks/useAuth';
import {
    Container,
    Row,
    Col,
} from 'reactstrap';
import {
    faUserAlt,
    faBriefcase,
    faAddressBook,
    faUsers,
    faScroll,
} from '@fortawesome/free-solid-svg-icons';

/**
 * Página que muestra las acciones disponibles al usuario.
 * Solo disponible para administradores o superadministradores.
 */
const Home = () => {
    const [loadingLogout, setLoadingLogout] = useState(false);

    const navigate = useNavigate();
    const { user, logout } = useAuth();

    //Acciones disponibles según el tipo de usuario
    const actions = (() => {
        switch (user.usertype) {
            case 'USER': return [
                { label: 'Continuar al listin', icon: faAddressBook, action: () => navigate('/workers') },
                { label: 'Perfil de Usuario', icon: faUserAlt, action: () => navigate('/profile') },
            ];
            default: return [
                { label: 'Continuar al listin', icon: faAddressBook, action: () => navigate('/workers') },
                { label: 'Gestión de Usuarios', icon: faUsers, action: () => navigate('/users') },
                { label: 'Gestión de Departamentos', icon: faBriefcase, action: () => navigate('/departments') },
                { label: 'Acceder Logs', icon: faScroll, action: () => navigate('/logs') },
                { label: 'Perfil de Usuario', icon: faUserAlt, action: () => navigate('/profile') },
            ]
        }
    })();

    //Función que gestiona el cierre de sesión
    const handleLogout = async () => {
        setLoadingLogout(true);
        try {
            await logout();
            navigate('/');
        } finally {
            setLoadingLogout(false);
        }
    };

    return (
        <Container
            fluid
            className="d-flex flex-column py-4"
            style={{ minHeight: '80vh' }}
        >

            {/* Botón de cierre de sesión */}
            <Row className="align-items-center m-0 p-0">
                <Col className="d-flex justify-content-start">
                    <LogoutButton onClick={handleLogout} loading={loadingLogout} />
                </Col>
            </Row>

            {/* Botones con las acciones definidas */}
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ flexGrow: 1 }}>
                <Row className="g-3 mb-4 w-100 justify-content-center">
                    {actions.map(({ label, icon, action }, idx) => (
                        <Col
                            key={idx}
                            xs={12} sm={8} md={6} lg={4} xl={3}
                            className="d-flex justify-content-center"
                        >
                            <HomeButtonComponent label={label} icon={icon} onClick={action} />
                        </Col>
                    ))}
                </Row>

            </div>
        </Container>
    );
};

export default Home;
