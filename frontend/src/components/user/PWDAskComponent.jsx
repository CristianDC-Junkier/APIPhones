import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, InputGroup, InputGroupText } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { markPWDCUser } from '../../services/UserService';

/**
 * Modal para marcar la contraseña de un usuario como temporal.
 * @param {Object} props
 * @param {boolean} props.isOpen - Controla si el modal está abierto
 * @param {Function} props.toggle - Función para abrir/cerrar modal
 * @param {Object} props.userItem - Usuario a marcar con contraseña temporal
 * @param {string} props.token - Token de autenticación
 */
const PWDAskComponent = ({ isOpen, toggle, userItem, token }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!password.trim()) {
            Swal.fire({
                icon: 'warning',
                title: '¡Atención!',
                text: 'La contraseña no puede estar vacía',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        setLoading(true);
        const result = await markPWDCUser(userItem.id, { password }, token);
        setLoading(false);

        if (result.success) {
            await Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Usuario marcado correctamente',
                confirmButtonColor: '#3085d6',
            });
            toggle(); // cerrar modal
        } else {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.error || 'No se pudo marcar al usuario',
                confirmButtonColor: '#d33',
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            toggle={toggle}
            backdrop="static"
            keyboard={false}
            centered
            style={{ maxWidth: '400px', borderRadius: '0.5rem' }}
        >
            <ModalHeader
                toggle={toggle}
                className="justify-content-center"
                style={{ borderBottom: 'none', fontWeight: '600', color: '#545454' }}
            >
                Contraseña temporal
            </ModalHeader>
            <ModalBody className="text-center">
                <p>Ingrese la contraseña temporal para <strong>{userItem?.username}</strong>:</p>
                <InputGroup>
                    <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Contraseña temporal"
                    />
                    <InputGroupText
                        style={{ cursor: 'pointer' }}
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </InputGroupText>
                </InputGroup>
            </ModalBody>
            <ModalFooter className="justify-content-center" style={{ borderTop: 'none' }}>
                <Button color="primary" onClick={handleSubmit} disabled={loading} style={{ minWidth: '100px' }}>
                    {loading ? 'Guardando...' : 'Confirmar'}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default PWDAskComponent;
