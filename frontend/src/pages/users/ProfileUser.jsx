/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import { FaUser, FaPhone, FaEnvelope, FaBuilding, FaEdit, FaTrash, FaCalendarAlt, FaTicketAlt } from 'react-icons/fa';

import { useAuth } from "../../hooks/useAuth";
import { deleteProfileAcc, getProfile, modifyProfileAcc, getWorkerDataList, changeMailProfile } from "../../services/UserService";
import { createNewTicket } from "../../services/TicketService";

import BackButtonComponent from "../../components/utils/BackButtonComponent";
import ModifyUserAccountComponent from '../../components/user/ModifyUserAccountComponent';
import AddModifyMailProfileComponent from '../../components/user/AddModifyMailProfileComponent';
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

    useEffect(() => {
        document.title = "Mi Perfil - Listín telefónico - Ayuntamiento de Almonte";
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Obtener perfil
            const profileResponse = await getProfile(version);
            if (profileResponse.success) {
                const profileData = profileResponse.data;
                setProfile(profileData);

                // Mostrar alerta si hay tickets resueltos
                const count = profileData.ticketsResolvedCount || 0;
                if (count > 0) {
                    Swal.fire({
                        title: 'Información',
                        icon: 'info',
                        text:
                            count === 1
                                ? 'Se ha resuelto su ticket'
                                : `Se han resuelto ${count} tickets`,
                        confirmButtonText: 'Aceptar',
                    });
                }
            }

            await fetchList();

        } finally {
            setLoading(false);
        }
    };

    const fetchList = async () => {
        setLoading(true);
        try {
            if (user.department) {
                const dataResponse = await getWorkerDataList(user.department);
                if (dataResponse.success) {
                    
                    setData(dataResponse.data.datalist);
                    console.log(dataResponse.data.datalist);
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

    // Enviar ticket
    const handleTicket = async (dataItem) => {
        try {
            await CreateTicketComponent({
                dataItem,
                onConfirm: async (formValues) => {
                    setLoading(true);
                    const result = await createNewTicket(formValues);
                    setLoading(false);
                    if (result.success) {
                        Swal.fire("Éxito", "Ticket enviado correctamente", "success");
                    } else {
                        Swal.fire("Error", result.error || "No se pudo mandar el ticket", "error");
                    }
                    fetchList();
                }
            })
        } catch (err) {
            Swal.fire("Error", err.message || "Error al mandar el ticket", "error");
        }
    }

    // Modificar el Usuario
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

    //Cambiar correo
    const handleMail = async () => {
        try {
            await AddModifyMailProfileComponent({
                profile,
                onConfirm: async (mail) => {
                    const result = await changeMailProfile(mail, version);
                    if (result.success) {
                        Swal.fire("Éxito", "Correo modificado correctamente", "success");
                        update(result.data.user, result.data.token);
                    } else {
                        Swal.fire("Error", result.error || "No se pudo modificar el correo", "error");
                    }
                }
            })
        }
        catch (err) {
            Swal.fire("Error", err.message || "Error al cambiar el correo", "error");
        }
    }

    // Función para formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    };

    const isUser = user.usertype === "USER";
    const haveDepartment = Boolean(user.department);
    const currentData = data.slice((currentPage - 1), currentPage);

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
                    <Col xs="12" md="7" className="d-flex justify-content-center">
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
                                    {!isUser && <Row className="mb-2">
                                        <Col md="6"><strong>Tipo de Usuario:</strong></Col>
                                        <Col md="6">{profile.usertype || "-"}</Col>
                                    </Row>}
                                    {!isUser && <Row className="mb-2">
                                        <Col md="6"><strong>Correo de notificaciones:</strong></Col>
                                        <Col md="6">
                                            {profile.mail || ""}
                                            <span
                                                onClick={() => handleMail() }
                                                style={{
                                                    display: "inline-block",
                                                    padding: "2px 6px",
                                                    borderRadius: "50px",
                                                    backgroundColor: `${ profile.mail ? "blue" : "green" }`,
                                                    color: "#fff",
                                                    fontWeight: 500,
                                                    fontSize: "0.8rem",
                                                    whiteSpace: "nowrap",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                {profile.mail ? "Cambiar" : "+ Añadir"}
                                            </span>
                                        </Col>
                                    </Row>}
                                    {isUser && <Row className="mb-2">
                                        <Col md="12">
                                            <div style={{ height: '20px' }}></div>
                                        </Col>
                                    </Row>}
                                    <Row className="mb-2">
                                        <Col md="6"><FaCalendarAlt className="me-2" /> Fecha de creación:</Col>
                                        <Col md="6" className="text-primary fw-semibold">{formatDate(profile.createdAt)}</Col>
                                    </Row>
                                    <Row className="mb-2">
                                        <Col md="6"><FaCalendarAlt className="me-2" /> Última modificación:</Col>
                                        <Col md="6" className="text-primary fw-semibold">{formatDate(profile.updatedAt)}</Col>
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
                                    currentData.map((us, idx) => (
                                        <CardBody key={idx} className="d-flex flex-column justify-content-between p-4">
                                            <div>
                                                <h4 className="mb-4 text-success d-flex align-items-center justify-content-between">
                                                    <span className="d-flex align-items-center">
                                                        <FaBuilding className="me-2" /> Datos del Departamento
                                                    </span>

                                                    {!us.ticket ? (
                                                        // Botón verde activo
                                                        <Button
                                                            className="text-success px-3 py-1 border border-success rounded-pill d-flex align-items-center justify-content-center"
                                                            style={{
                                                                backgroundColor: 'transparent',
                                                                fontSize: '0.85rem',
                                                                fontWeight: '500',
                                                                lineHeight: '1rem',
                                                                transition: 'all 0.2s ease',
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.backgroundColor = '#198754';
                                                                e.currentTarget.style.setProperty('color', 'white', 'important');
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                                e.currentTarget.style.setProperty('color', '#198754', 'important');
                                                            }}
                                                            onClick={() => handleTicket(us)}
                                                        >
                                                            <FaTicketAlt className="me-2 mt-1" size={15} /> Mandar Ticket
                                                        </Button>
                                                    ) : (
                                                        // Botón rojo deshabilitado
                                                        <Button
                                                            color="danger"
                                                            className="px-3 py-1 rounded-pill"
                                                            style={{
                                                                fontSize: '0.85rem',
                                                                fontWeight: '500',
                                                                lineHeight: '1rem',
                                                                cursor: 'not-allowed',
                                                            }}
                                                            disabled
                                                        >
                                                            Ya hay un Ticket Asignado
                                                        </Button>
                                                    )}

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
                                            <div className="mt-3" >
                                                {totalPages > 1 ? (
                                                    <PaginationComponent currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                                                ) : null
                                                }
                                            </div>
                                        </CardBody>
                                    ))
                                ) : (
                                    // Si no hay datos, mostrar mensaje centrado
                                    <CardBody className="d-flex justify-content-center align-items-center p-4" style={{ minHeight: '200px' }}>
                                        <h5 className="text-muted text-center">
                                            Este departamento no tiene ningún perfil de datos asociado
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
