import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import { FaUser, FaPhone, FaEnvelope, FaBuilding, FaEdit, FaTrash, FaCalendarAlt } from 'react-icons/fa';
import Spinner from '../../components/utils/SpinnerComponent';
import { useAuth } from "../../hooks/useAuth";
import { deleteProfileAcc, getProfile, modifyProfileAcc, modifyProfileData } from "../../services/UserService";
import BackButton from "../../components/utils/BackButtonComponent";
import ModifyUserAccountComponent from '../../components/user/ModifyUserAccountComponent';
import ModifyUserDataComponent from '../../components/user/ModifyUserDataComponent';

const WorkerProfile = () => {
    const [profile, setProfile] = useState();
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { token, version, logout, update, user } = useAuth();

    // Fetch profile
    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const response = await getProfile(token, version);
                if (response.success) {
                    setProfile(response.data);
                } else if (response.error === "Token inválido") {
                    Swal.fire('Error', 'El tiempo de acceso caducó, reinicie sesión', 'error')
                        .then(() => { logout(); navigate('/login'); });
                } else {
                    Swal.fire('Error', response.error || 'No se pudo cargar el perfil', 'error');
                }
            } catch (err) {
                Swal.fire('Error', err.message || 'Error al obtener perfil', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [logout, navigate, token, version]);

    if (loading) return <Spinner />;

    const firstUserData = profile.userData?.[0] || {};

    // Modify profile
    const handleModify = async (type) => {
        try {
            if (type === 'Account') {
                await ModifyUserAccountComponent({ 
                    token,
                    profile,
                    onConfirm: async (formValues) => {
                        const result = await modifyProfileAcc(formValues, token, version);
                        if (result.success) {
                            Swal.fire("Éxito", "Datos de la cuenta modificados correctamente", "success");
                            update(result.user, result.token);
                        } else {
                            Swal.fire("Error", result.error || "No se pudo modificar el perfil", "error");
                        }
                    }
                });
            }
            else {
                await ModifyUserDataComponent({ 
                    token,
                    profile,
                    user,
                    onConfirm: async (formValues) => {
                        const result = await modifyProfileData(formValues, token, version);
                        if (result.success) {
                            Swal.fire("Éxito", "Datos de usuario modificados correctamente", "success");
                        } else {
                            Swal.fire("Error", result.error || "No se pudo modificar el perfil", "error");
                        }
                    }
                });
            }
        } catch (err) {
            Swal.fire("Error", err.message || "Error al modificar perfil", "error");
        }
    };

    // Eliminar el Usuario 
    const handleDelete = async () => {
        try {
            const swal = await Swal.fire({
                title: "Eliminar su Cuenta",
                html: "¿Está seguro de que quiere eliminar su usuario?<br>Esta acción no se podrá deshacer",
                icon: 'warning',
                iconColor: '#FF3131',
                showCancelButton: true,
                confirmButtonText: "Aceptar",
                cancelButtonText: "Cancelar"
            });

            if (swal.isConfirmed) {
                const response = await deleteProfileAcc(token, version);
                if (response.success) {
                    Swal.fire("Éxito", "Cuenta eliminada correctamente. Cerrando sesión", "success");
                    logout();
                    navigate('/');
                } else {
                    Swal.fire("Error", response.error || "No se eliminó el usuario", "error");
                }
            }
        } catch (err) {
            Swal.fire("Error", err.message || "Error al eliminar usuario", "error");
        }
    };

    // Función para formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    };

    return (
        <Container fluid className="mt-4 d-flex flex-column" style={{ minHeight: "80vh" }}>
            {/* Botón Volver */}
            <div className="position-absolute top-0 start-0">
                <BackButton back="/home" />
            </div>

            {/* Contenedor para centrar verticalmente */}
            <div className="d-flex flex-grow-1 align-items-center">
                <Row className="mb-3 mt-4 justify-content-center g-3 w-100">
                    {/* BLOQUE 1: Información de la cuenta */}
                    <Col xs="12" md="6" className="d-flex justify-content-center">
                        <Card className="h-100 shadow-lg rounded-4 bg-light border-0 mx-auto w-100">
                            <CardBody className="d-flex flex-column justify-content-between p-4">
                                <div>
                                    <h4 className="mb-4 text-primary d-flex align-items-center">
                                        <FaUser className="me-2" /> Cuenta
                                    </h4>
                                    <Row className="mb-2">
                                        <Col md="5"><strong>Usuario:</strong></Col>
                                        <Col md="7">{profile.username || "-"}</Col>
                                    </Row>
                                    <Row className="mb-2">
                                        <Col md="5"><strong>Departamento:</strong></Col>
                                        <Col md="7">{profile.departmentName || "-"}</Col>
                                    </Row>
                                    <Row className="mb-2">
                                        <Col md="5"><FaCalendarAlt className="me-2" /> Fecha de creación:</Col>
                                        <Col md="7">{formatDate(profile.createdAt)}</Col>
                                    </Row>
                                    <Row className="mb-2">
                                        <Col md="5"><FaCalendarAlt className="me-2" /> Última modificación:</Col>
                                        <Col md="7">{formatDate(profile.updatedAt)}</Col>
                                    </Row>
                                </div>
                                <div className="d-flex justify-content-between mt-4 flex-wrap gap-2">
                                    <Button color="primary" className="rounded-pill px-4" onClick={() => handleModify('Account')}>
                                        <FaEdit className="me-2" /> Modificar
                                    </Button>
                                    <Button color="danger" className="rounded-pill px-4" onClick={handleDelete}>
                                        <FaTrash className="me-2" /> Eliminar
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* BLOQUE 2: Primer userData */}
                    <Col xs="12" md="6" className="d-flex justify-content-center">
                        <Card className="h-100 shadow-lg rounded-4 bg-light border-0 mx-auto w-100">
                            <CardBody className="d-flex flex-column justify-content-between p-4">
                                <div>
                                    <h4 className="mb-4 text-success d-flex align-items-center">
                                        <FaBuilding className="me-2" /> Datos Personales
                                    </h4>
                                    <Row className="mb-2">
                                        <Col md="5"><FaUser className="me-2" /> Nombre:</Col>
                                        <Col md="7">{firstUserData.name || "-"}</Col>
                                    </Row>
                                    <Row className="mb-2">
                                        <Col md="5"><FaEnvelope className="me-2" /> Email:</Col>
                                        <Col md="7">{firstUserData.email || "-"}</Col>
                                    </Row>
                                    <Row className="mb-2">
                                        <Col md="5"><FaPhone className="me-2" /> Teléfono:</Col>
                                        <Col md="7">{firstUserData.number || "-"}</Col>
                                    </Row>
                                    <Row className="mb-2">
                                        <Col md="5"><strong>Extensión:</strong></Col>
                                        <Col md="7">{firstUserData.extension || "-"}</Col>
                                    </Row>
                                    <Row className="mb-2">
                                        <Col md="5"><strong>Subdepartamento:</strong></Col>
                                        <Col md="7">{firstUserData.subdepartmentName || "-"}</Col>
                                    </Row>
                                </div>
                                <div className="d-flex justify-content-start mt-4 flex-wrap gap-2">
                                    <Button color="success" className="rounded-pill px-4" onClick={() => handleModify('userdata')}>
                                        <FaEdit className="me-2" /> Modificar
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        </Container>

    );
};

export default WorkerProfile;
