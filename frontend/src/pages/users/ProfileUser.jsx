/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import { FaUser, FaPhone, FaEnvelope, FaBuilding, FaEdit, FaTrash, FaCalendarAlt, FaTicketAlt } from 'react-icons/fa';

import { useAuth } from "../../hooks/useAuth";
import { deleteProfileAcc, getProfile, modifyProfileAcc, getWorkerDataList } from "../../services/UserService";

import BackButtonComponent from "../../components/utils/BackButtonComponent";
import ModifyUserAccountComponent from '../../components/user/ModifyUserAccountComponent';
import SpinnerComponent from '../../components/utils/SpinnerComponent';
import PaginationComponent from "../../components/PaginationComponent";


const ProfileUser = () => {
    const [profile, setProfile] = useState();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(1);


    const navigate = useNavigate();
    const { version, logout, update, user } = useAuth();

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await getProfile(version);

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

    const fetchData = async () => {
        if (user.usertype !== "USER") return;
        try {
            const response = await getWorkerDataList(user.department);
            if (response.success) {
                setUsers(response.data.users);
            } else if (response.error === "Token inválido") {
                Swal.fire('Error', 'El tiempo de acceso caducó, reinicie sesión', 'error')
                    .then(() => { logout(); navigate('/login'); });
            } else {
                Swal.fire('Error', response.error || 'No se pudo cargar los datos', 'error');
            }
        } catch (err) {
            Swal.fire('Error', err.message || 'Error al obtener los datos', 'error');
        }
    };

    // Recuperar usuario
    useEffect(() => {
        fetchData();
        fetchProfile();
    }, [logout, navigate, version]);

    if (loading) return <SpinnerComponent />;

    const totalPages = Math.ceil(users.length / rowsPerPage);
    const currentUsers = users.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    // Modify profile
    const handleModify = async () => {
        try {
            await ModifyUserAccountComponent({
                profile,
                onConfirm: async (formValues) => {
                    const result = await modifyProfileAcc(formValues, version);
                    if (result.success) {
                        Swal.fire("Éxito", "Datos de la cuenta modificados correctamente", "success");
                        update(result.data.user, result.data.token);
                    } else {
                        Swal.fire("Error", result.error || "No se pudo modificar el perfil", "error");
                    }
                }
            });

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
                const response = await deleteProfileAcc(version);
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

    const isUser = user.usertype === "USER";

    return (
        <Container fluid className="mt-4 d-flex flex-column" style={{ minHeight: "80vh" }}>
            {/* Botón Volver */}
            <div className="position-absolute top-0 start-0">
                <BackButtonComponent back="/home" />
            </div>

            {/* Contenedor para centrar verticalmente */}
            <div className="d-flex flex-grow-1 align-items-center">
                <Row className="mb-3 mt-4 justify-content-center g-3 w-100">
                    {/* BLOQUE 1: Información de la cuenta */}
                    <Col xs="12" md="5" className="d-flex justify-content-center">
                        <Card className="h-100 shadow-lg rounded-4 bg-light border-0 mx-auto w-100">
                            <CardBody className="d-flex flex-column justify-content-between p-4">
                                <div>
                                    <h4 className="mb-4 text-primary d-flex align-items-center">
                                        <FaUser className="me-2" /> Cuenta
                                    </h4>
                                    <Row className="mb-2">
                                        <Col md="6"><strong>Usuario:</strong></Col>
                                        <Col md="6">{profile.username || "-"}</Col>
                                    </Row>
                                    <Row className="mb-2">
                                        <Col md="6"><strong>Departamento:</strong></Col>
                                        <Col md="6">{profile.departmentName || "-"}</Col>
                                    </Row>
                                    <Row className="mb-2">
                                        <Col md="6"><strong>Tipo de Usuario:</strong></Col>
                                        <Col md="6">{profile.usertype || "-"}</Col>
                                    </Row>
                                    <Row className="mb-2">
                                        <Col md="6"><FaCalendarAlt className="me-2" /> Fecha de creación:</Col>
                                        <Col md="6">{formatDate(profile.createdAt)}</Col>
                                    </Row>
                                    <Row className="mb-2">
                                        <Col md="6"><FaCalendarAlt className="me-2" /> Última modificación:</Col>
                                        <Col md="6">{formatDate(profile.updatedAt)}</Col>
                                    </Row>
                                </div>
                                {!isUser && <div className="d-flex justify-content-between mt-4 flex-wrap gap-2">
                                    <Button color="primary" className="rounded-pill px-4" onClick={() => handleModify()}>
                                        <FaEdit className="me-2" /> Modificar
                                    </Button>
                                    <Button color="danger" className="rounded-pill px-4" disabled={profile.id === 1 ? true : false} onClick={handleDelete}>
                                        <FaTrash className="me-2" /> Eliminar
                                    </Button>
                                </div>}
                            </CardBody>
                        </Card>
                    </Col>

                    {/* BLOQUE 2: userDatas */}
                    {isUser && <Col xs="12" md="7" className="d-flex justify-content-center">
                        <Card className="h-100 shadow-lg rounded-4 bg-light border-0 mx-auto w-100">
                            {currentUsers.map((us, idx) => (
                                <CardBody key={idx} className="d-flex flex-column justify-content-between p-4">
                                    <div>
                                        <h4 className="mb-4 text-success d-flex align-items-center">
                                            <FaBuilding className="me-2" /> Datos Personales
                                            <Button color="warning" className="rounded-pill px-4 position-absolute top-1 end-0 me-4" onClick={() => alert(us.name)}>
                                                <FaTicketAlt className="me-2" /> Mandar Ticket
                                            </Button>
                                        </h4>
                                        <Row className="mb-2">
                                            <Col md="6"><FaUser className="me-2" /> Nombre:</Col>
                                            <Col md="6">{us.name || "-"}</Col>
                                        </Row>
                                        <Row className="mb-2">
                                            <Col md="6"><FaEnvelope className="me-2" /> Email:</Col>
                                            <Col md="6">{us.email || "-"}</Col>
                                        </Row>
                                        <Row className="mb-2">
                                            <Col md="6"><FaPhone className="me-2" /> Teléfono:</Col>
                                            <Col md="6">{us.number || "-"}</Col>
                                        </Row>
                                        <Row className="mb-2">
                                            <Col md="6"><strong>Extensión:</strong></Col>
                                            <Col md="6">{us.extension || "-"}</Col>
                                        </Row>
                                        <Row className="mb-2">
                                            <Col md="6"><strong>Subdepartamento:</strong></Col>
                                            <Col md="6">{us.subdepartmentName || "-"}</Col>
                                        </Row>
                                    </div>
                                    <div className="mt-3" style={{ minHeight: '40px' }}>
                                        {totalPages > 1 ? (
                                            <PaginationComponent currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                                        ) : (
                                            <div style={{ height: '40px' }}></div>
                                        )}
                                    </div>
                                </CardBody>
                            ))}
                        </Card>
                    </Col>}
                </Row>
            </div>
        </Container>
    );
};

export default ProfileUser;
