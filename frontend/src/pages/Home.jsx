import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Alert, Badge } from 'reactstrap';
import { faUserAlt, faBriefcase, faAddressBook, faUsers, faScroll, faStickyNote } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../hooks/useAuth';
import { getCount } from '../services/TicketService';
import HomeButtonComponent from '../components/utils/HomeButtonComponent';
import LogoutButton from '../components/utils/LogoutComponent';
/**
 * Página que muestra las acciones disponibles al usuario.
 */
const Home = () => {
    const [loadingLogout, setLoadingLogout] = useState(false);
    const [count, setCount] = useState(0);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    //Acciones disponibles según el tipo de usuario
    const actions = (() => {
        switch (user.usertype) {
            case 'USER': return [
                { label: 'Continuar al listin', icon: faAddressBook, action: () => navigate('/workers') },
                { label: 'Mi perfil', icon: faUserAlt, action: () => navigate('/profile') },
            ];
            default: return [
                { label: 'Continuar al listin', icon: faAddressBook, action: () => navigate('/workers') },
                { label: 'Gestión de Usuarios', icon: faUsers, action: () => navigate('/users') },
                { label: 'Gestión de Departamentos', icon: faBriefcase, action: () => navigate('/departments') },
                { label: 'Gestión de Tickets', icon: faStickyNote, action: () => navigate('/tickets') },
                { label: 'Acceder a Logs', icon: faScroll, action: () => navigate('/logs') },
                { label: 'Mi perfil', icon: faUserAlt, action: () => navigate('/profile') },
            ]
        }
    })();

    useEffect(() => {
        const getUnresolved = async () => {
            const response = await getCount();
            if (response.success) {
                setCount(response.data);
            }
        };
        getUnresolved();
    }, []);

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

            {/*Información de tickets sin resolver*/}
            {count > 0 && (
                <Row className="justify-content-center mb-3">
                    <Col xs="auto">
                        <span className=" fs-5 d-flex align-items-center gap-2 fw-bold text-dark">
                            <span>
                                {count === 1 ? 'Existe' : 'Existen'}{' '}
                                <Badge color="danger" pill>
                                    {count}
                                </Badge>{' '}
                                {count === 1 ? 'ticket sin resolver' : 'tickets sin resolver'}
                            </span>
                        </span>
                    </Col>
                </Row>
            )}



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
