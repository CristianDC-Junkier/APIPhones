import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import {
    Container, Row, Col, Card, CardBody, CardTitle, CardText,
    Button, Table, Input
} from "reactstrap";
import Swal from 'sweetalert2';

import { getUsersList, getUserDataList, getUserDataByDepartmentList, createUser, modifyUser, deleteUser } from "../../services/UserService";
import { useAuth } from "../../hooks/useAuth";

import BackButton from "../../components/utils/BackButtonComponent";
import Spinner from '../../components/utils/SpinnerComponent';
import Pagination from "../../components/PaginationComponent";
import CaptchaSlider from '../../components/utils/CaptchaSliderComponent';
import AddModifyUserComponent from "../../components/user/AddModifyUserComponent";

const UserList = () => {
    const navigate = useNavigate();
    const { user: currentUser, token, logout } = useAuth();

    const [loading, setLoading] = useState(true);
    const [allUsers, setAllUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedType, setSelectedType] = useState("Usuarios");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(8);

    // Ajustar filas por altura de ventana
    useEffect(() => {
        const updateRows = () => {
            const vh = window.innerHeight;
            const headerHeight = 220; // altura estimada de header + estadísticas
            const rowHeight = 50; // altura estimada por fila
            const footerHeight = 80; // altura del pagination
            const availableHeight = vh - headerHeight - footerHeight;
            const rows = Math.max(3, Math.floor(availableHeight / rowHeight));
            setRowsPerPage(rows);
        };

        updateRows();
        window.addEventListener("resize", updateRows);
        return () => window.removeEventListener("resize", updateRows);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            setLoading(true);
            let response;
            if (currentUser.usertype === "DEPARTMENT") {
                response = await getUserDataByDepartmentList(token);
            } else {
                response = await getUserDataList(token);
            }
            if (response.success) {
                setAllUsers(response.users ?? []);
            } else {
                if (response.error?.response?.data?.message === "Token inválido") {
                    Swal.fire('Error', 'El tiempo de acceso caducó, reinicie sesión', 'error')
                        .then(() => { logout(); navigate('/login'); });
                    return;
                }
            }
            setLoading(false);
        };
        fetchData();
    }, [token, logout, navigate, currentUser.usertype]);

    const tipoLabels = {
        ADMIN: "Administrador", SUPERADMIN: "Superadministrador", WORKER: "Trabajador", DEPARTMENT: "Jefe de Departamento"
    }

    const filteredUsers = useMemo(() => {
        return allUsers
            .filter(user =>
            (selectedType === "Usuarios" ||
                (selectedType === "Trabajadores" && ["DEPARTMENT", "WORKER"].includes(user.usertype)) ||
                (selectedType === "Administradores" && ["DEPARTMENT", "ADMIN", "SUPERADMIN"].includes(user.usertype))
            )
            )
            .filter(user =>
                user.username.toLowerCase().includes(search.toLowerCase())
            );
    }, [allUsers, search, selectedType]);

    const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
    const currentUsers = filteredUsers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const handleCreate = async () => {
        await AddModifyUserComponent({
            token,
            currentUser,
            action: "create",
            onConfirm: async (formValues) => {
                const result = await createUser(formValues, token);
                if (result.success) {
                    Swal.fire("Éxito", "Usuario creado correctamente", "success");
                    const response = await getUsersList(token);
                    if (response.success) setAllUsers(response.data ?? []);
                } else {
                    Swal.fire("Error", result.error?.message || "No se pudo crear el usuario", "error");
                }
            },
        });
    };

    const handleModify = async (userItem) => {
        await AddModifyUserComponent({
            token,
            userItem,
            currentUser,
            action: "modify",
            onConfirm: async (formValues) => {
                const result = await modifyUser({
                    id: userItem.id,
                    username: formValues.username,
                    password: formValues.password,
                    usertype: formValues.usertype,
                }, token);

                if (result.success) {
                    Swal.fire("Éxito", "Usuario modificado correctamente", "success");
                    if (userItem.id === currentUser.id) { await logout(); navigate("/login"); }
                    const response = await getUsersList(token);
                    if (response.success) setAllUsers(response.data ?? []);
                } else {
                    Swal.fire("Error", result.error?.message || "No se pudo modificar el usuario", "error");
                }
            },
        });
    };

    const handleDelete = async (userItem) => {
        try { await showCaptcha(userItem.id); }
        catch (err) { Swal.fire('Atención', err.message || 'Captcha no completado', 'warning'); return; }

        const result = await deleteUser(userItem.id, token);
        if (result.success) {
            Swal.fire('Éxito', 'Usuario eliminado correctamente', 'success');
            if (userItem.id === currentUser.id) { await logout(); navigate('/login') }
            const response = await getUsersList(token);
            if (response.success) setAllUsers(response.data ?? []);
        } else {
            Swal.fire('Error', result.error?.message || 'No se pudo eliminar el usuario', 'error');
        }
    };

    const showCaptcha = (idd) => {
        return new Promise((resolve, reject) => {
            const container = document.createElement('div');
            const reactRoot = createRoot(container);
            let completed = false;

            reactRoot.render(<CaptchaSlider onSuccess={() => { completed = true; Swal.close(); resolve(true); setTimeout(() => reactRoot.unmount(), 0); }} />);
            Swal.fire({
                title: `Eliminar ${idd === currentUser.id ? "su Usuario" : "el Usuario"}`,
                html: container,
                showConfirmButton: true,
                confirmButtonText: 'Continuar',
                showCancelButton: true,
                cancelButtonText: 'Cancelar',
                allowOutsideClick: false,
                preConfirm: () => { if (!completed) { Swal.showValidationMessage('Debes completar el captcha'); return false; } }
            }).then(() => { if (!completed) { reject(new Error('Captcha no completado')); setTimeout(() => reactRoot.unmount(), 0); } });
        });
    };

    const stats = {
        total: allUsers.length,
        admin: allUsers.filter(u => u.usertype === "DEPARTMENT" || u.usertype === "ADMIN" || u.usertype === "SUPERADMIN").length,
        worker: allUsers.filter(u => u.usertype === "WORKER").length,
    };

    const renderUserTable = () => (
        <div className="d-flex flex-column flex-grow-1">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="mb-0">{selectedType}</h5>
                <Input
                    type="text"
                    placeholder="Buscar por usuario..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: "250px" }}
                />
            </div>

            <Table striped hover responsive className="shadow-sm rounded flex-grow-1">
                <thead className="table-primary">
                    <tr>
                        <th className="text-center">ID</th>
                        <th className="text-center">Usuario</th>
                        <th className="text-center">Tipo</th>
                        <th className="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {currentUsers.map((userItem, idx) => {
                        
                        const isCurrentUser = userItem.id === currentUser.id;
                        // Determinar permisos de modificación y borrado
                        let canModify = false;
                        let canDelete = false;

                        switch (userItem.usertype) {
                            case "SUPERADMIN":
                                canModify = currentUser.usertype === "SUPERADMIN";
                                canDelete = false;
                                break;
                            case "ADMIN":
                                canModify = ["ADMIN", "SUPERADMIN"].includes(currentUser.usertype);
                                canDelete = ["ADMIN", "SUPERADMIN"].includes(currentUser.usertype);;
                                break;
                            case "DEPARTMENT":
                                canModify = ["ADMIN", "SUPERADMIN"].includes(currentUser.usertype);
                                canDelete = ["ADMIN", "SUPERADMIN"].includes(currentUser.usertype);;
                                break;
                            case "WORKER":
                                canModify = currentUser.usertype !== "WORKER";
                                canDelete = currentUser.usertype !== "WORKER"; 
                                break;
                            default:
                                break;
                        }

                        return (
                            <tr key={idx} style={isCurrentUser ? { fontWeight: "bold" } : {}}>
                                <td className="text-center" style={isCurrentUser ? { color: "#0d6efd"} : {}}>{userItem.id}</td>
                                <td className="text-center" style={isCurrentUser ? { color: "#0d6efd"} : {}}>{userItem.username}</td>
                                <td className="text-center" style={isCurrentUser ? { color: "#0d6efd"} : {}}>{tipoLabels[userItem.usertype]}</td>
                                <td className="text-center">
                                    <div className="d-flex justify-content-center flex-wrap">
                                        {canModify && (
                                            <Button
                                                color="warning"
                                                size="sm"
                                                className="me-1 mb-1"
                                                onClick={() => handleModify(userItem)}
                                            >
                                                ✏️
                                            </Button>
                                        )}
                                        {canDelete && (
                                            <Button
                                                color="danger"
                                                size="sm"
                                                className="me-1 mb-1"
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
                    {rowsPerPage - currentUsers.length > 0 &&
                        [...Array(rowsPerPage - currentUsers.length)].map((_, idx) => (
                            <tr key={`empty-${idx}`} style={{ height: '50px' }}>
                                <td colSpan={4}></td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>


            <div className="mt-auto">
                {totalPages > 1 && (
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                )}
            </div>
        </div>
    );

    if (loading) return <Spinner />;

    return (
        <Container fluid className="mt-4 d-flex flex-column" style={{ minHeight: "80vh" }}>
            {/* Botón Volver */}
            <div className="position-absolute top-0 start-0">
                <BackButton back="/home" />
            </div>

            {/* Botón Crear Usuario */}
            <div className="position-absolute top-0 end-0 p-3">
                <Button
                    color="transparent"
                    style={{
                        background: "none",
                        border: "none",
                        color: "black",
                        fontWeight: "bold",
                        padding: 0
                    }}
                    onClick={handleCreate}
                >
                    ➕ Crear Usuario
                </Button>
            </div>


            {/* Tarjetas de estadísticas */}
            <Row className="mb-3 mt-1 justify-content-center g-3">
                {[
                    { label: "Total", value: stats.total },
                    { label: "Administradores", value: stats.admin },
                    { label: "Trabajadores", value: stats.worker }
                ].map((metric, idx) => (
                    <Col key={idx} xs={6} sm={4} md={3}>
                        <Card
                            className="shadow-lg mb-2 border-2"
                            style={{ cursor: 'pointer', borderColor: '#0d6efd', borderRadius: '0.75rem' }}
                            onClick={() => {
                                if (metric.label === "Total") setSelectedType("Todos");
                                else if (metric.label === "Administradores") setSelectedType("Administradores");
                                else setSelectedType("Trabajadores");
                            }}
                        >
                            <CardBody className="text-center pt-3">
                                <CardTitle tag="h6">{metric.label}</CardTitle>
                                <CardText className="fs-4 fw-bold">{metric.value}</CardText>
                            </CardBody>
                        </Card>
                    </Col>
                ))}
            </Row>


            {/* Tabla */}
            {renderUserTable()}
        </Container>
    );
};

export default UserList;
