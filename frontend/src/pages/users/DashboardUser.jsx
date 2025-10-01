import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, CardBody, CardTitle, CardText, Button, Input } from "reactstrap";
import Swal from "sweetalert2";

import { useAuth } from "../../hooks/useAuth";
import { getUserDataList, createUser } from "../../services/UserService";

import BackButton from "../../components/utils/BackButtonComponent";
import Spinner from '../../components/utils/SpinnerComponent';
import TableUserAccountComponent from "../../components/user/TableUserAccountComponent";
import TableUserDataComponent from "../../components/user/TableUserDataComponent";
import AddModifyUserCo from "../../components/user/AddModifyUserComponent";

const DashboardUser = () => {
    const { user: currentUser, token, logout } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [userAccounts, setUserAccounts] = useState([]);
    const [userData, setUserData] = useState([]);
    const [statsType, setStatsType] = useState("Accounts");
    const [search, setSearch] = useState("");
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
            let responseUserData, responseUserAccounts;
            if (currentUser.usertype === "DEPARTMENT") {
                responseUserData = await getUserDataList(token, currentUser.department);
                responseUserAccounts = await getUserDataList(token, currentUser.department);
            } else {
                responseUserData = await getUserDataList(token);
                responseUserAccounts = await getUserDataList(token);
            }

            if (responseUserData.success && responseUserAccounts.success) {
                setUserData(responseUserData);
                setUserAccounts(responseUserAccounts);
                if (statsType === "Accounts") {
                    // Ajustar currentPage si la página actual quedó vacía
                    const totalPages = Math.ceil(userAccounts.length / rowsPerPage);
                    if (currentPage > totalPages && totalPages > 0) {
                        setCurrentPage(totalPages);
                    }
                } else {
                    // Ajustar currentPage si la página actual quedó vacía
                    const totalPages = Math.ceil(userData.length / rowsPerPage);
                    if (currentPage > totalPages && totalPages > 0) {
                        setCurrentPage(totalPages);
                    }
                }

            }
        } catch {
            Swal.fire("Error", "No se pudo obtener la lista de usuarios", 'error');
        }
        setLoading(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchUsers(); }, [token, currentUser, logout, navigate]);

    const handleCreateUser = async () => {
        await AddModifyUserCo({
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
                    { label: "Cuentas de Usuario", value: userAccounts.length, type: "Accounts" },
                    { label: "Datos de Trabajadores", value: userData.length, type: "Data" },
                ].map((metric, idx) => (
                    (currentUser?.usertype !== "DEPARTMENT" || metric.label === "Trabajadores") && (
                        <Col key={idx} xs={6} sm={4} md={3}>
                            <Card
                                className={`shadow-lg mb-2 border-2 ${statsType === metric.type ? "border-primary" : ""}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => { setStatsType(metric.type); setCurrentPage(1); }}
                            >
                                <CardBody className="text-center pt-3">
                                    <CardTitle tag="h6">{metric.label}</CardTitle>
                                    <CardText className="fs-4 fw-bold">{metric.value}</CardText>
                                </CardBody>
                            </Card>
                        </Col>
                    )
                ))}
            </Row>

            {/* Fila con tipo de usuario seleccionado + búsqueda */}
            <div className="d-flex justify-content-between mb-3 align-items-center">
                <div style={{ fontWeight: "bold", fontSize: "1rem" }}>{statsType === "Accounts" ? "Cuentas de Usuario" : "Datos de Trabajadores"}</div>
                <Input
                    type="text"
                    placeholder="Buscar por usuario..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: "250px" }}
                />
            </div>

            {/* Tabla de usuarios modular */}
            {statsType === "Accounts" ?
                <TableUserAccountComponent
                    users={userAccounts}
                    currentUser={currentUser}
                    token={token}
                    search={search}
                    setSearch={setSearch}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    rowsPerPage={rowsPerPage}
                    refreshData={fetchUsers}
                /> :
                <TableUserDataComponent
                    users={userData}
                    currentUser={currentUser}
                    token={token}
                    search={search}
                    setSearch={setSearch}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    rowsPerPage={rowsPerPage}
                    refreshData={fetchUsers}
                />}
        </Container>
    );
};

export default DashboardUser;
