/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import { FaUser, FaPhone, FaEnvelope, FaBuilding, FaEdit, FaTrash, FaCalendarAlt, FaTicketAlt } from 'react-icons/fa';

import { useAuth } from "../../hooks/useAuth";
import { deleteProfileAcc, getProfile, modifyProfileAcc, getWorkerDataList } from "../../services/UserService";
import { createNewTicket } from "../../services/TicketService";

import BackButtonComponent from "../../components/utils/BackButtonComponent";
import ModifyUserAccountComponent from '../../components/user/ModifyUserAccountComponent';
import CreateTicketComponent from '../../components/ticket/CreateTicketComponent';
import SpinnerComponent from '../../components/utils/SpinnerComponent';
import PaginationComponent from "../../components/PaginationComponent";


const ProfileUser = () => {
    const [profile, setProfile] = useState();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const navigate = useNavigate();
    const { version, logout, update, user } = useAuth();

    const fetchData = async () => {
        setLoading(true);
        try {
            // Obtener perfil
            const profileResponse = await getProfile(version);
            if (profileResponse.success) {
                setProfile(profileResponse.data);
            }

            // Obtener datos solo si el usuario tiene departamento
            if (user.department) {
                const dataResponse = await getWorkerDataList(user.department);
                if (dataResponse.success) {
                    setData(dataResponse.data.datalist);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    /**
     * Recargar perfil cuando cambia la versión del usuario globalmente
     */
    useEffect(() => {
        if (version === null || version === undefined) return;
        fetchData(version);
    }, [version]);

    if (loading || !profile) return <SpinnerComponent />;

    const totalPages = (data?.length || 0);

    //Create Ticket
    const handleTicket = async (dataItem) => {
        try {
            await CreateTicketComponent({
                dataItem,
                onConfirm: async (formValues) => {
                    const result = await createNewTicket(formValues);
                    if (result.success) {
                        Swal.fire("Éxito", "Ticket enviado correctamente", "success");
                    } else {
                        Swal.fire("Error", result.error || "No se pudo mandar el ticket", "error");
                    }
                }
            })
        } catch (err) {
            Swal.fire("Error", err.message || "Error al mandar el ticket", "error");
        }
    }

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
    const haveDepartment = Boolean(user.department);

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
                    {haveDepartment && (
                        <Col xs="12" md="7" className="d-flex justify-content-center">
                            <Card className="h-100 shadow-lg rounded-4 bg-light border-0 mx-auto w-100">
                                {totalPages > 0 ? (
                                    // Si hay datos, los mostramos
                                    data.map((us, idx) => (
                                        <CardBody key={idx} className="d-flex flex-column justify-content-between p-4">
                                            <div>
                                                <h4 className="mb-4 text-success d-flex align-items-center position-relative">
                                                    <FaBuilding className="me-2" /> Datos Personales
                                                    <Button
                                                        color="warning"
                                                        className="rounded-pill px-4 position-absolute top-1 end-0 me-4"
                                                        onClick={() => handleTicket(us)}
                                                    >
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
                                    ))
                                ) : (
                                    // Si no hay datos, mostrar mensaje centrado
                                    <CardBody className="d-flex justify-content-center align-items-center p-4" style={{ minHeight: '200px' }}>
                                        <h5 className="text-muted text-center">
                                            No existe ningún tipo de datos de usuario en el departamento
                                        </h5>
                                    </CardBody>
                                )}
                            </Card>
                        </Col>
                    )}
                </Row>
            </div>
        </Container>
    );
};

export default ProfileUser;
