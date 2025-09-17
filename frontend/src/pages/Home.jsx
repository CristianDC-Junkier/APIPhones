import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeButtonComponent from '../components/user/HomeButtonComponent';
import LogoutButton from '../components/user/LogoutComponent';
import { useAuth } from '../hooks/useAuth';
import {
    Container,
    Row,
    Col,
} from 'reactstrap';
import {
    faUsers,
    faGlobeEurope,
    faScroll,
} from '@fortawesome/free-solid-svg-icons';

/**
 * Página que muestra las acciones disponibles al usuario
 * Solo disponible para administradores o superadministradores
 */

const Home = () => {
    const [loadingLogout, setLoadingLogout] = useState(false);

    const navigate = useNavigate();
    const { logout } = useAuth();

    //Acciones que relizan los botones presentes en la página
    const actions = [
        { label: 'Continuar a la aplicación', icon: faGlobeEurope, action: () => navigate('/app') },
        { label: 'Gestión de Usuarios', icon: faUsers, action: () => navigate('/users') },
        { label: 'Acceder Logs', icon: faScroll, action: () => navigate('/logs') },
    ];

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
            style={{
                minHeight: '70vh',
            }}
        >
            {/*Botón de cierre de sesión*/ }
            <Row className="align-items-center m-0 p-0">
                <Col className="d-flex justify-content-start p-2">
                    <LogoutButton onClick={handleLogout} loading={loadingLogout} />
                </Col>
            </Row>

            {/*Botones con las acciones definidas anteriormente*/ }
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ flexGrow: 1 }}>
                <Row className="g-3 mb-4 w-100">
                    {actions.map(({ label, icon, action }, idx) => (
                        <Col xs="6" md="4" key={idx} className="d-flex justify-content-center">
                            <HomeButtonComponent label={label} icon={icon} onClick={action} />
                        </Col>
                    ))}
                </Row>
            </div>

        </Container>
    );
};

export default Home;