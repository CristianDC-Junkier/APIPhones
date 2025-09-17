import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { Container, Row, Col, Card, CardBody, CardTitle, CardText, Button, Table } from "reactstrap";
import Swal from 'sweetalert2';

import { getUsersList, createUser, modifyUser, deleteUser } from "../../services/UserService";
import { useAuth } from "../../hooks/useAuth";

import BackButton from "../../components/utils/BackButtonComponent";
import Spinner from '../../components/utils/SpinnerComponent';
import Pagination from "../../components/PaginationComponent";
import CaptchaSlider from '../../components/utils/CaptchaSliderComponent';

/**
 * Página encargada de mostrar la tabla de usuario y las acciones asociadas a la gestión de los mismos
 */

const UserList = () => {
    const navigate = useNavigate();
    const { user: currentUser, logout } = useAuth();
    const token = currentUser?.token;

    const [loading, setLoading] = useState(true);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedType, setSelectedType] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    //Función encargada de obtener la información para la tabla
    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            setLoading(true);
            const response = await getUsersList(token);
            if (response.success) {
                setAllUsers(response.data ?? []);
            }
            else {
                if (handleError(response)) {
                    Swal.fire('Error', 'El tiempo de acceso caducó, reinicie sesión', 'error')
                        .then(() => {
                            logout();
                            navigate('/login');
                        });
                    return;
                }
            }
            setLoading(false);
        };
        fetchData();
    }, [token, logout, navigate]);

    // Estadísticas
    const stats = {
        total: allUsers.length,
        admin: allUsers.filter(u => u.usertype === "ADMIN" || u.usertype === "SUPERADMIN").length,
        user: allUsers.filter(u => u.usertype === "USER").length,
    };

    // Filtrado y paginación
    const filteredUsers = selectedType === "All"
        ? allUsers
        : allUsers.filter(user =>
            selectedType === "Usuarios"
                ? user.usertype === "USER"
                : ["ADMIN", "SUPERADMIN"].includes(user.usertype)
        );
    const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
    const currentUsers = filteredUsers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const handleError = (result) => {
        if (result.error.response?.data?.message === "Token inválido") {
            return true;
        }
        return false;
    };


    //Función que gestiona la creación de un usuario
    const handleCreate = async () => {
        const tipos = [
            { label: 'Usuario', value: 'USER' },
            { label: 'Administrador', value: 'ADMIN' }
        ];
        if (currentUser.usertype === 'SUPERADMIN') {
            tipos.push({ label: 'SuperAdmin', value: 'SUPERADMIN' });
        }

        const optionsHtml = tipos
            .map(tipo => `<option value="${tipo.value}">${tipo.label}</option>`)
            .join('');

        const { value: formValues } = await Swal.fire({
            title: 'Crear Usuario',
            html: `
                <input id="swal-username" class="swal2-input" placeholder="Usuario">
                <input id="swal-password" type="password" class="swal2-input" placeholder="Contraseña">
                <select id="swal-type" class="swal2-select">${optionsHtml}</select>
                <style>
                    .swal2-input, .swal2-select {
                        width: 100%;
                        padding: 0.5em 0.75em;
                        margin: 0.25em 0;
                        border: 1px solid #333;
                        border-radius: 0.25em;
                        font-size: 1em;
                    }
                    .swal2-select {
                        margin-bottom: 1em;
                        appearance: none;
                        background-color: #fff;
                    }
                </style>`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Crear',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const username = document.getElementById('swal-username').value.trim();
                const password = document.getElementById('swal-password').value.trim();
                const usertype = document.getElementById('swal-type').value;

                if (!username) {
                    Swal.showValidationMessage('El nombre de usuario no puede estar vacío');
                    return false;
                }
                if (!password) {
                    Swal.showValidationMessage('La contraseña no puede estar vacía');
                    return false;
                }

                return { username, password, usertype };
            }
        });

        if (formValues) {
            const result = await createUser(formValues, token);
            if (result.success) {
                Swal.fire('Éxito', 'Usuario creado correctamente', 'success');
                const response = await getUsersList(token);
                if (response.success) setAllUsers(response.data ?? []);
            } else {
                if (handleError(result)) {
                    Swal.fire('Error', 'El tiempo de acceso caducó, reinicie sesión', 'error')
                        .then(() => {
                            logout();
                            navigate('/login');
                        });
                    return;
                }
                else {
                    Swal.fire('Error', 'No se pudo crear el usuario', 'error');
                }
            }
        }
    };

    //Función que gestiona la modificación de un usuario
    const handleModify = async (userItem) => {
        const tipos = [
            { label: 'Usuario', value: 'USER' },
            { label: 'Administrador', value: 'ADMIN' }
        ];
        if (currentUser.usertype === 'SUPERADMIN') {
            tipos.push({ label: 'SuperAdmin', value: 'SUPERADMIN' });
        }

        const optionsHtml = tipos
            .map(tipo => `<option value="${tipo.value}" ${userItem.usertype === tipo.value ? 'selected' : ''}>${tipo.label}</option>`)
            .join('');

        const { value: formValues } = await Swal.fire({
            title: `${userItem.id === currentUser.id ? "Modificar su Usuario" : "Modificar Usuario"}`,
            html: `
                <input id="swal-username" class="swal2-input" placeholder="Usuario" value="${userItem.username}">
                <input id="swal-password" type="password" class="swal2-input" placeholder="Contraseña" value="">
                <select id="swal-type" class="swal2-select">${optionsHtml}</select>
                <style>
                    .swal2-input, .swal2-select {
                        width: 100%;
                        padding: 0.5em 0.75em;
                        margin: 0.25em 0;
                        border: 1px solid #333;
                        border-radius: 0.25em;
                        font-size: 1em;
                    }
                    .swal2-select {
                        margin-bottom: 1em;
                        appearance: none;
                        background-color: #fff;
                    }
                </style>`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const username = document.getElementById('swal-username').value.trim();
                const password = document.getElementById('swal-password').value.trim();
                const usertype = document.getElementById('swal-type').value;

                if (!username) {
                    Swal.showValidationMessage('El nombre de usuario no puede estar vacío');
                    return false;
                }
                if (!password) {
                    Swal.showValidationMessage('La contraseña no puede estar vacía');
                    return false;
                }

                return { username, password, usertype };
            }
        });

        if (formValues) {
            const result = await modifyUser({
                id: userItem.id,
                username: formValues.username,
                password: formValues.password,
                usertype: formValues.usertype
            }, token);

            if (result.success) {
                Swal.fire('Éxito', 'Usuario modificado correctamente', 'success');
                if (userItem.id === currentUser.id) {
                    await logout();
                    navigate('/login')
                }
                const response = await getUsersList(token);
                if (response.success) setAllUsers(response.data ?? []);
            } else {
                if (handleError(result)) {
                    Swal.fire('Error', 'El tiempo de acceso caducó, reinicie sesión', 'error')
                        .then(() => {
                            logout();
                            navigate('/login');
                        });
                    return;
                }
                else {
                    Swal.fire('Error', 'No se pudo modificar el usuario', 'error');
                }
            }
        }
    };

    //Función que gestiona la eliminación de un usuario
    const handleDelete = async (userItem) => {
        try {
            await showCaptcha(userItem.id);
        } catch (err) {
            Swal.fire('Atención', err.message || 'Captcha no completado', 'warning');
            return;
        }

        try {
            const result = await deleteUser(userItem.id, token);
            if (result.success) {
                Swal.fire('Éxito', 'Usuario eliminado correctamente', 'success');
                if (userItem.id === currentUser.id) {
                    await logout();
                    navigate('/login')
                }
                const response = await getUsersList(token);
                if (response.success) setAllUsers(response.data ?? []);
            }
            else {
                if (handleError(result)) {
                    Swal.fire('Error', 'El tiempo de acceso caducó, reinicie sesión', 'error')
                        .then(() => {
                            logout();
                            navigate('/login');
                        });
                    return;
                }
                else {
                    Swal.fire('Error', result.error?.message || 'No se pudo eliminar el usuario', 'error');
                }
            }
        } catch (err) {
            if (handleError(err)) {
                Swal.fire('Error', 'El tiempo de acceso caducó, reinicie sesión', 'error')
                    .then(() => {
                        logout();
                        navigate('/login');
                    });
                return;
            }
            else {
                Swal.fire('Error', err?.message || 'Error al eliminar el usuario', 'error');
            }
        }
    };

    //Función que gestiona el Captcha
    const showCaptcha = (idd) => {
        return new Promise((resolve, reject) => {
            const container = document.createElement('div');
            const reactRoot = createRoot(container);
            let completed = false;

            reactRoot.render(
                <CaptchaSlider
                    onSuccess={() => {
                        completed = true;
                        Swal.close();
                        resolve(true);
                        setTimeout(() => reactRoot.unmount(), 0);
                    }}
                />
            );

            Swal.fire({
                title: `Eliminar ${idd === currentUser.id ? "su Usuario" : "el Usuario"}`,
                html: container,
                showConfirmButton: true,
                confirmButtonText: 'Continuar',
                showCancelButton: true,
                cancelButtonText: 'Cancelar',
                allowOutsideClick: false,
                preConfirm: () => {
                    if (!completed) {
                        Swal.showValidationMessage('Debes completar el captcha antes de continuar');
                        return false;
                    }
                }
            }).then(() => {
                if (!completed) {
                    reject(new Error('Captcha no completado'));
                    setTimeout(() => reactRoot.unmount(), 0);
                }
            });
        });
    };


    const tipoLabels = {
        USER: "Usuario",
        ADMIN: "Administrador",
        SUPERADMIN: "Super Administrador"
    };

    //Función encargada de mostrar la tabla
    const renderUserTable = () => {
        // Número de filas que deben aparecer
        const emptyRows = rowsPerPage - currentUsers.length;

        return (
            <div className="mt-2 mb-2">
                <h3 className="mb-3 p-2 text-center">
                    {selectedType === "All" ? "Todos los Usuarios" : selectedType}
                </h3>
                <Table striped responsive>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Usuario</th>
                            <th>Tipo</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.map((userItem, idx) => {
                            const isSuperAdminUser = userItem.usertype === "SUPERADMIN";
                            const CanIModifySuperAdminUser = currentUser.usertype === "SUPERADMIN";
                            const isCurrentUser = userItem.id === currentUser.id;

                            return (
                                <tr key={idx}>
                                    <td style={isCurrentUser ? { color: "blue", fontWeight: "bold" } : {}}>
                                        {userItem?.id || "\u00A0"}
                                    </td>
                                    <td style={isCurrentUser ? { color: "blue", fontWeight: "bold" } : {}}>
                                        {userItem?.username || "\u00A0"}
                                    </td>
                                    <td style={isCurrentUser ? { color: "blue", fontWeight: "bold" } : {}}>
                                        {tipoLabels[userItem?.usertype] || "\u00A0"}
                                    </td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center flex-wrap m">
                                            {((CanIModifySuperAdminUser && isSuperAdminUser) || !isSuperAdminUser) && (
                                                <Button
                                                    color="warning"
                                                    size="sm"
                                                    style={{ padding: "0.2rem 0.4rem", margin: "0 0.25rem", fontSize: "0.8rem" }}
                                                    onClick={() => handleModify(userItem)}
                                                >
                                                    ✏️
                                                </Button>
                                            )}
                                            {!isSuperAdminUser && (
                                                <Button
                                                    color="danger"
                                                    size="sm"
                                                    style={{ padding: "0.2rem 0.4rem", margin: "0 0.25rem", fontSize: "0.8rem" }}
                                                    onClick={() => handleDelete(userItem)}
                                                >
                                                    🗑️
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {/* Filas vacías */}
                        {emptyRows > 0 && [...Array(emptyRows)].map((_, idx) => (
                            <tr key={`empty-${idx}`} style={{ height: '44px' }}>
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                {totalPages > 1 && (
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                )}
            </div>
        );
    };

    if (loading) return <Spinner />;

    return (
        <Container className="mt-4 d-flex flex-column" style={{ minHeight: "80vh" }}>
            {/* Botón Volver arriba a la izquierda */}
            <div className="position-absolute top-0 start-0">
                <BackButton back="/home" />
            </div>

            {/* Botón Crear Usuario arriba a la derecha */}
            <div className="position-absolute top-0 end-0 p-3">
                <Button
                    color="transparent"
                    style={{ color: 'black', border: 'none', padding: 0, fontWeight: 'bold' }}
                    onClick={handleCreate}
                >
                    ➕ Crear Usuario
                </Button>
            </div>

            {/* Tarjetas de estadísticas */}
            <Row className="mb-1 mt-4 justify-content-center g-2">
                {[
                    { label: "Total", value: stats.total },
                    { label: "Admins", value: stats.admin },
                    { label: "Usuarios", value: stats.user }
                ].map((metric, idx) => (
                    <Col key={idx} xs={6} md={3}>
                        <Card
                            className="shadow-sm border-info"
                            style={{
                                border: '2px solid blue',
                                borderRadius: '0.5rem',
                                height: '100px',
                                backgroundColor: '#f8f9fa',
                                cursor: 'pointer'
                            }}
                            onClick={() => {
                                if (metric.label === "Total") setSelectedType("All");
                                else if (metric.label === "Admins") setSelectedType("Admin");
                                else if (metric.label === "Usuarios") setSelectedType("Usuarios");
                            }}
                        >
                            <CardBody className="p-2 text-center">
                                <CardTitle tag="h6">{metric.label}</CardTitle>
                                <CardText className="fs-4 fw-bold">{metric.value}</CardText>
                            </CardBody>
                        </Card>
                    </Col>
                ))}
            </Row>


            {/* Tabla de usuarios */}
            {renderUserTable()}
        </Container>
    );
};

export default UserList;
