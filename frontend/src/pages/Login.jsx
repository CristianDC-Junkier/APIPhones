import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Button,
    Form,
    FormGroup,
    Input,
    Row,
    Col,
    Card,
    CardBody,
    Label,
} from 'reactstrap';
import Swal from 'sweetalert2';
import { createRoot } from 'react-dom/client';
import { useAuth } from '../hooks/useAuth';
import CaptchaSlider from '../components/utils/CaptchaSliderComponent';
import '../styles/Global.css';
import '../styles/auth/Login.css';

/**
 * Página de inicio de sesión
 */

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

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
            await showCaptcha();

            // Hacer login
            const response = await login({ username, password, rememberMe });

            if (response.success) {
                const user = response.data.user;
                if (user.usertype === 'USER') {
                    navigate('/app');
                } else {
                    navigate('/home');
                }
            } else {
                console.error('Login error:', response.error);
                Swal.fire('Error', response?.error?.response?.data?.message || 'Login fallido', 'error');
            }
        } catch (err) {
            Swal.fire('Error', err?.response?.data?.message || 'Captcha no completado', 'error');
        }
    };

    return (
        <Row className="w-100 justify-content-center align-items-center min-vh-90">
            <Col xs="12" sm="10" md="6" lg="5" xl="4" xxl="4" className="cmaxW">
                <Card className="Card-login position-relative">
                    <CardBody className="p-0">
                        <h3 className="text-center mb-4 fw-bold mt-4">Login</h3>
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
                                            id="rememberMe"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <Label for="rememberMe" check className="fw-semibold ms-2">
                                            Recuerdame
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
    );
};

export default Login;
