import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, CardBody, CardTitle, CardText, Button, Input } from "reactstrap";
import Swal from "sweetalert2";

import { useAuth } from "../../hooks/useAuth";
import { getUserDataList, getUserDataByDepartmentList, createUser } from "../../services/UserService";

import BackButton from "../../components/utils/BackButtonComponent";
import Spinner from '../../components/utils/SpinnerComponent';
import TableUserComponent from "../../components/user/TableUserComponent";
import AddModifyUserComponent from "../../components/user/AddModifyUserComponent";

const DashboardUser = () => {
    const { user: currentUser, token, logout } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedType, setSelectedType] = useState("Todos los usuarios");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(8);

    // Ajuste filas según altura de ventana
    useEffect(() => {
        const updateRows = () => {
            const vh = window.innerHeight;
            const headerHeight = 220;
            const rowHeight = 50;
            const footerHeight = 150;
            setRowsPerPage(Math.max(3, Math.floor((vh - headerHeight - footerHeight) / rowHeight)));
        };
        updateRows();
        window.addEventListener("resize", updateRows);
        return () => window.removeEventListener("resize", updateRows);
    }, []);

    const fetchUsers = async () => {
        if (!token) return;
        setLoading(true);
        try {
            let response;
            if (currentUser.usertype === "DEPARTMENT") {
                response = await getUserDataByDepartmentList(token);
            } else {
                response = await getUserDataList(token);
            }

            if (response.success) {
                const fetchedUsers = response.data.users ?? [];
                setUsers(fetchedUsers);

                // Ajustar currentPage si la página actual quedó vacía
                const totalPages = Math.ceil(fetchedUsers.length / rowsPerPage);
                if (currentPage > totalPages && totalPages > 0) {
                    setCurrentPage(totalPages);
                }
            }
            else if (response.error === "Token inválido") {
                Swal.fire('Error', 'El tiempo de acceso caducó, reinicie sesión', 'error')
                    .then(() => { logout(); navigate('/login'); });
                return;
            }
        } catch (err) {
            Swal.fire("Error", "No se pudo obtener la lista de usuarios", err);
        }
        setLoading(false);
    };

    useEffect(() => { fetchUsers(); }, [token, currentUser, logout, navigate]);

    const handleCreateUser = async () => {
        await AddModifyUserComponent({
            token,
            currentUser,
            action: "create",
            onConfirm: async (formValues) => {
                const result = await createUser(formValues, token);
                if (result.success) {
                    Swal.fire("Éxito", "Usuario creado correctamente", "success");
                    await fetchUsers();
                } else {
                    Swal.fire("Error", result.error || "No se pudo crear el usuario", "error");
                }
            }
        });
    };

    if (loading) return <Spinner />;

    // Filtrar usuarios según tipo seleccionado
    const filteredByType = users.filter(u => {
        if (selectedType === "Todos los usuarios") return true;
        if (selectedType === "Administradores") return ["DEPARTMENT", "ADMIN", "SUPERADMIN"].includes(u.usertype);
        if (selectedType === "Trabajadores") return u.usertype === "WORKER";
        return true;
    });

    // Estadísticas
    const stats = {
        total: users.length,
        admin: users.filter(u => ["DEPARTMENT", "ADMIN", "SUPERADMIN"].includes(u.usertype)).length,
        worker: users.filter(u => u.usertype === "WORKER").length,
    };

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
                    style={{ background: "none", border: "none", color: "black", fontWeight: "bold", padding: 0 }}
                    onClick={handleCreateUser}
                >
                    ➕ Crear Usuario
                </Button>
            </div>

            {/* Tarjetas de estadísticas */}
            <Row className="mb-3 mt-1 justify-content-center g-3">
                {[
                    { label: "Total", value: stats.total, type: "Todos los usuarios" },
                    { label: "Administradores", value: stats.admin, type: "Administradores" },
                    { label: "Trabajadores", value: stats.worker, type: "Trabajadores" }
                ].map((metric, idx) => (
                    <Col key={idx} xs={6} sm={4} md={3}>
                        <Card
                            className={`shadow-lg mb-2 border-2 ${selectedType === metric.type ? "border-primary" : ""}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => { setSelectedType(metric.type); setCurrentPage(1); }}
                        >
                            <CardBody className="text-center pt-3">
                                <CardTitle tag="h6">{metric.label}</CardTitle>
                                <CardText className="fs-4 fw-bold">{metric.value}</CardText>
                            </CardBody>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Fila con tipo de usuario seleccionado + búsqueda */}
            <div className="d-flex justify-content-between mb-3 align-items-center">
                <div style={{ fontWeight: "bold", fontSize: "1rem" }}>{selectedType}</div>
                <Input
                    type="text"
                    placeholder="Buscar por usuario..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: "250px" }}
                />
            </div>

            {/* Tabla de usuarios modular */}
            <TableUserComponent
                users={filteredByType}
                currentUser={currentUser}
                token={token}
                search={search}
                setSearch={setSearch}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                rowsPerPage={rowsPerPage}
                refreshData={fetchUsers}
            />
        </Container>
    );
};

export default DashboardUser;
