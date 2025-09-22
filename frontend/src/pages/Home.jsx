import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeButtonComponent from '../components/utils/HomeButtonComponent';
import LogoutButton from '../components/utils/LogoutComponent';
import { useAuth } from '../hooks/useAuth';
import { changePassword } from '../services/UserService'
import Swal from 'sweetalert2';
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
 * Página que muestra las acciones disponibles al usuario
 * Solo disponible para administradores o superadministradores
 */

const Home = () => {
    const [loadingLogout, setLoadingLogout] = useState(false);

    const navigate = useNavigate();
    const { user, logout, token } = useAuth();

    const rowStyleStep1 = 'display:flex; align-items:center; margin-bottom:1rem; font-size:1rem;';
    const rowStyleStep2 = 'margin-bottom:1rem; font-size:1rem;';
    const labelStyle = 'width:180px; font-weight:bold; text-align:left;';
    const inputStyleStep1 = 'flex:1; padding:0.35rem; font-size:1rem; border:1px solid #ccc; border-radius:4px;';

    const handlePWDC = async () => {
        const swal = await Swal.fire({
            title: "Cambio de contraseña",
            html: `<div style="${rowStyleStep2}">Su usuario ha sido marcado para un cambio de contraseña.</div>
                   <div style="${rowStyleStep1}">Introduzca a continuación una nueva contraseña para su usuario.</div>
                   <div style="${rowStyleStep1}">
                   <label style="${labelStyle}">Contraseña <span style="color:red">*</span></label>
                   <input id="swal-newpassword" type="password" style="${inputStyleStep1}" placeholder="Nueva Contraseña">
                   </div>
                   <div style="${rowStyleStep1}">Introduzca a continuación la contraseña con la que ha iniciado sesión.</div>
                   <div style="${rowStyleStep1}">
                   <label style="${labelStyle}">Contraseña <span style="color:red">*</span></label>
                   <input id="swal-oldpassword" type="password" style="${inputStyleStep1}" placeholder="Contraseña">
                   </div>`,
            showCancelButton: false,
            confirmButtonText: "Confirmar",
            allowOutsideClick: false,
            allowEscapeKey: false,
            preConfirm: () => {
                const newP = document.getElementById("swal-newpassword").value.trim();
                const oldP = document.getElementById("swal-oldpassword").value.trim();
                if (!newP) { Swal.showValidationMessage("La nueva contraseña no puede estar vacía"); return false; }
                if (!oldP) { Swal.showValidationMessage("La contraseña no puede estar vacía"); return false; }

                return { oldP, newP };
            }
        });
        if (!swal.value) return;
        const result = await changePassword({ oldPassword: swal.value.oldP, newPassword: swal.value.newP }, token);
        if (result.success) {
            Swal.fire('Éxito', 'Constraseña actualizada correctamente', 'success');
        } else {
            Swal.fire('Error', result.error || 'No se pudo cambiar la contraseña', 'error');
        }
    }

    useEffect(() => {
        if (user.forcePwdChange) handlePWDC()
    }, []);

    //Acciones que relizan los botones presentes en la página
    const actions = user.usertype != 'WORKER' ?
    [
        { label: 'Continuar al listin', icon: faAddressBook, action: () => navigate('/app') },
        { label: 'Gestión de Usuarios', icon: faUsers, action: () => navigate('/users') },
        { label: 'Gestión de Departamentos', icon: faBriefcase, action: () => navigate('/departments') },
        { label: 'Acceder Logs', icon: faScroll, action: () => navigate('/logs') },
    ] :
    [
        { label: 'Continuar al listin', icon: faAddressBook, action: () => navigate('/app') },
        { label: 'Perfil de Usuario', icon: faUserAlt, action: () => navigate('/profile') },
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
                        <Col xs="6" md={12/actions.length} key={idx} className="d-flex justify-content-center">
                            <HomeButtonComponent label={label} icon={icon} onClick={action} />
                        </Col>
                    ))}
                </Row>
            </div>

        </Container>
    );
};

export default Home;