import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Label, Row, Col, Card, CardBody, Form, FormGroup, Button, Input } from "reactstrap";
import Swal from 'sweetalert2';
import { createRoot } from 'react-dom/client';
import { useAuth } from '../hooks/useAuth';

import BackButton from '../components/utils/BackButtonComponent';
import CaptchaSlider from '../components/utils/CaptchaSliderComponent';
import '../styles/Global.css';
import '../styles/auth/Login.css';

/**
 * Página de inicio de sesión
 */

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    //Función que gestiona el Captcha
    const showCaptcha = () => {
        return new Promise((resolve, reject) => {
            const container = document.createElement('div');
            const reactRoot = createRoot(container);
            let completed = false;

            reactRoot.render(
                <CaptchaSlider
                    onSuccess={() => {
                        completed = true;
                        resolve(true);
                        Swal.close();
                        setTimeout(() => reactRoot.unmount(), 0);
                    }}
                />
            );

            Swal.fire({
                title: 'Completa el captcha',
                html: container,
                showConfirmButton: true,
                allowOutsideClick: false,
                preConfirm: () => {
                    if (!completed) {
                        Swal.showValidationMessage('Debes completar el captcha antes de continuar');
                        return false;
                    }
                }
            }).then(() => {
                if (!completed) reject(new Error('Captcha no completado'));
            });
        });
    };



    //Función encargada de gestionar la información aportada por el usuario
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Mostrar captcha obligatorio
            //await showCaptcha();                                                                          //SOLO DURANTE DESARROLLO

            // Hacer login
            const response = await login({ username, password, remember });

            if (response.success) {
                //const user = response.data.user;
                navigate('/home');

            } else {
                Swal.fire('Error', response.error || 'Login fallido', 'error');
            }
        } catch (err) {
            Swal.fire('Error', err?.error || err?.message || 'Captcha no completado', 'error');
        }
    };

    return (
        <Container fluid className="mt-4 d-flex flex-column" style={{ minHeight: "80vh" }}>
            {/* Botón Volver */}
            <div className="position-absolute top-0 start-0">
                <BackButton back="/public" />
            </div>

            {/* Row que ocupa todo el contenedor y centra verticalmente */}
            <Row className="w-100 flex-grow-1 justify-content-center align-items-center">
                <Col xs="12" sm="10" md="8" lg="6" xl="5" xxl="4" >
                    <Card className="Card-login position-relative">
                        <CardBody className="p-0">
                            <h3 className="text-center mb-4 fw-bold mt-4">Inicio de Sesión</h3>
                            <Form onSubmit={handleSubmit} className="px-4">
                                <FormGroup className="mb-2">
                                    <Label className="fw-semibold">Usuario</Label>
                                    <Input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        placeholder="Usuario"
                                        className="border-0 border-bottom border-dark rounded-0 bg-white px-3 py-2"
                                    />
                                </FormGroup>

                                <FormGroup className="mb-4">
                                    <Label className="fw-semibold">Contraseña</Label>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="Contraseña"
                                        className="border-0 border-bottom border-dark rounded-0 bg-white px-3 py-2"
                                    />
                                </FormGroup>

                                <Row className="align-items-center mb-4 px-1">
                                    <Col xs="7" className="d-flex align-items-center">
                                        <FormGroup check className="mb-0">
                                            <Input
                                                type="checkbox"
                                                id="remember"
                                                checked={remember}
                                                onChange={(e) => setRemember(e.target.checked)}
                                            />
                                            <Label for="remember" check className="fw-semibold ms-2">
                                                Recuérdame
                                            </Label>
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Button color="dark" type="submit" className="w-100 fw-bold mb-3 py-2">
                                    Entrar
                                </Button>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>

    );
};

export default Login;
