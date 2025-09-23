import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, InputGroup, InputGroupText } from 'reactstrap';
import { changePassword } from '../../services/UserService';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

/**
 * Modal de cambio de contraseña.
 * Se abre automáticamente si user.forcePwdChange === true.
 */
const PWDChangeModal = () => {
    const { user, token, logout, updateUser } = useAuth();
    const navigate = useNavigate();

    const [modalOpen, setModalOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.forcePwdChange) {
            setModalOpen(true);
        }
    }, [user]);

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
        const result = await changePassword({ newPassword: password }, token);
        setLoading(false);

        if (result.success) {
            // Actualizamos user y storage para reflejar que ya no requiere cambio de contraseña
            const updatedUser = { ...user, forcePwdChange: false };
            updateUser(updatedUser);

            await Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Contraseña actualizada correctamente',
                confirmButtonColor: '#3085d6',
            });

            setModalOpen(false);
        } else {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.error || 'No se pudo cambiar la contraseña',
                confirmButtonColor: '#d33',
            });
            await logout();
            navigate('/login', { replace: true });
        }
    };

    return (
        <Modal
            isOpen={modalOpen}
            backdrop="static"
            keyboard={false}
            centered
            style={{ maxWidth: '400px', borderRadius: '0.5rem' }}
        >
            <ModalHeader
                tag="h2"
                className="justify-content-center"
                style={{ borderBottom: 'none', fontWeight: '600', color: '#545454' }}
            >
                Cambio de contraseña
            </ModalHeader>

            <ModalBody className="text-center">
                <p>Introduzca a continuación una nueva contraseña para su usuario:</p>
                <InputGroup>
                    <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nueva contraseña"
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

export default PWDChangeModal;
