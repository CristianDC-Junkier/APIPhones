/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody, CardTitle, CardText, Button, Input } from "reactstrap";
import Swal from "sweetalert2";

import { useAuth } from "../../hooks/useAuth";
import { getDepartmentsList } from "../../services/DepartmentService";
import { getUsersList, getWorkerDataList, createUser, createUserData, getProfile } from "../../services/UserService";

import BackButtonComponent from "../../components/utils/BackButtonComponent";
import SpinnerComponent from '../../components/utils/SpinnerComponent';
import TableUserAccountComponent from "../../components/user/TableUserAccountComponent";
import TableUserDataComponent from "../../components/user/TableUserDataComponent";
import AddModifyUserCommponent from "../../components/user/AddModifyUserComponent";
import AddModifyUserDataCommponent from "../../components/user/AddModifyUserDataComponent";

const DashboardUser = () => {
    const { user: currentUser } = useAuth();

    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [userAccounts, setUserAccounts] = useState([]);
    const [userData, setUserData] = useState([]);
    const [statsType, setStatsType] = useState("Accounts");
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const [sortBy, setSortBy] = useState("id");
    const [userProfile, setUserProfile] = useState(null);

    // Configurar título
    useEffect(() => {
        document.title = "Panel de control de Usuarios - Listín telefónico - Ayuntamiento de Almonte";
    }, []);

    // Resetear página al cambiar filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedUser, selectedDepartment, statsType]);

    // Ajustar filas según altura de ventana
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

    // Obtener perfil del usuario actual
    useEffect(() => {
        const fetchData = async () => {
            const response = await getProfile(currentUser.version);
            if (response.success) setUserProfile(response.data);
        };
        fetchData();
    }, [currentUser.version]);

    // Función para obtener usuarios con orden dinámico
    const fetchUsers = async (currentSortBy = sortBy) => {
        setLoading(true);
        try {
            const responseUserData = await getWorkerDataList();
            const responseUserAccounts = await getUsersList();

            if (responseUserData.success && responseUserAccounts.success) {
                let usersData = responseUserData.data.users ?? [];
                let usersAccounts = responseUserAccounts.data.users ?? [];

                // Función de ordenación
                const sortFn = (a, b) => {
                    const aVal = a[currentSortBy] ?? "";
                    const bVal = b[currentSortBy] ?? "";
                    if (typeof aVal === "number" && typeof bVal === "number") return aVal - bVal;
                    return aVal.toString().localeCompare(bVal.toString());
                };

                usersData.sort(sortFn);
                usersAccounts.sort(sortFn);

                setUserData(usersData);
                setUserAccounts(usersAccounts);

            }
        } finally {
            setLoading(false);
        }
    };

    // Función para obtener departamentos
    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const deptResp = await getDepartmentsList();
            if (deptResp.success) {
                let depts = deptResp.data.departments ?? [];
                depts.sort((a, b) => a.name.localeCompare(b.name));
                setDepartments(depts);
            }
        } finally {
            setLoading(false);
        }
    };

    // Cargar datos al inicio o al cambiar filas
    useEffect(() => { fetchUsers(); }, [sortBy, statsType, rowsPerPage]);
    useEffect(() => { fetchDepartments(); }, [currentUser, rowsPerPage]);

    // Crear usuario
    const handleCreateUser = async () => {
        await AddModifyUserCommponent({
            currentUser,
            action: "create",
            onConfirm: async (formValues) => {
                const result = await createUser(formValues);
                if (result.success) {
                    Swal.fire("Éxito", "Usuario creado correctamente", "success");
                    await fetchUsers();
                } else {
                    Swal.fire("Error", result.error || "No se pudo crear el usuario", "error");
                }
            }
        });
    };

    // Crear datos de usuario
    const handleCreateUserData = async () => {
        await AddModifyUserDataCommponent({
            currentUser,
            action: "create",
            onConfirm: async (formValues) => {
                const result = await createUserData(formValues);
                if (result.success) {
                    Swal.fire("Éxito", "Datos de usuario creados correctamente", "success");
                    await fetchUsers();
                } else {
                    Swal.fire("Error", result.error || "No se pudo crear el usuario", "error");
                }
            }
        });
    };

    if (loading) return <SpinnerComponent />;

    return (
        <Container fluid className="mt-4 d-flex flex-column" style={{ minHeight: "80vh" }}>
            <div className="position-absolute top-0 start-0">
                <BackButtonComponent back="/home" />
            </div>

            <div className="position-absolute top-0 end-0 p-3">
                {statsType === "Accounts" ?
                    <Button color="transparent" style={{ background: "none", border: "none", color: "black", fontWeight: "bold", padding: 0 }}
                        onClick={handleCreateUser}>
                        ➕ Crear Usuario
                    </Button>
                    :
                    <Button color="transparent" style={{ background: "none", border: "none", color: "black", fontWeight: "bold", padding: 0 }}
                        onClick={handleCreateUserData}>
                        ➕ Crear Datos de Usuario
                    </Button>
                }
            </div>

            <Row className="mb-3 mt-3 justify-content-center g-3">
                {[{ label: "Cuentas de Usuario", value: userAccounts.length, type: "Accounts" },
                { label: "Datos de Trabajadores", value: userData.length, type: "Data" }].map((metric, idx) => (
                    <Col key={idx} xs={6} sm={4} md={4} l={4} xl={3}>
                        <Card className={`shadow-lg mb-2 border-2 ${statsType === metric.type ? "border-primary" : ""}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => { setStatsType(metric.type); setCurrentPage(1); }}>
                            <CardBody className="text-center pt-3">
                                <CardTitle tag="h6">{metric.label}</CardTitle>
                                <CardText className="fs-4 fw-bold">{metric.value}</CardText>
                            </CardBody>
                        </Card>
                    </Col>
                ))}
            </Row>

            <div className="d-flex flex-column flex-md-row justify-content-between mb-2 align-items-start align-items-md-center gap-2">

                {/* Título */}
                <div className="fw-bold fs-6 text-center text-md-start w-100 w-md-auto">
                    {statsType === "Accounts" ? "Cuentas de Usuario" : "Datos de Trabajadores"}
                </div>

                {/* Contenedor inputs + botón */}
                <div className="d-flex flex-column flex-md-row gap-2 w-100 w-md-auto">
                    {/* Buscador */}
                    <Input
                        type="text"
                        placeholder="Buscar por usuario..."
                        value={selectedUser}
                        onChange={e => setSelectedUser(e.target.value)}
                        className="w-100 w-md-auto"
                    />

                    {/* Filtro departamento */}
                    {currentUser?.usertype !== "DEPARTMENT" && (
                        <Input
                            type="select"
                            value={selectedDepartment || ""}
                            onChange={e => setSelectedDepartment(Number(e.target.value))}
                            className="w-100 w-md-auto"
                        >
                            <option value="">Todos los departamentos</option>
                            {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </Input>
                    )}

                    {/* Botón Ordenación */}
                    <Button
                        color="secondary"
                        className="w-100 w-md-auto"
                        onClick={() => setSortBy(sortBy === "name" ? "id" : "name")}
                    >
                        {sortBy === "name" ? "Identificador" : "Nombre"}
                    </Button>
                </div>
            </div>


            {statsType === "Accounts" ?
                <TableUserAccountComponent
                    users={userAccounts}
                    currentUser={currentUser}
                    search={selectedUser}
                    selectedDepartment={selectedDepartment}
                    setSearch={setSelectedUser}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    rowsPerPage={rowsPerPage}
                    refreshData={() => fetchUsers(sortBy)}
                /> :
                <TableUserDataComponent
                    users={userData}
                    currentUser={userProfile}
                    search={selectedUser}
                    selectedDepartment={selectedDepartment}
                    setSearch={setSelectedUser}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    rowsPerPage={rowsPerPage}
                    refreshData={() => fetchUsers(sortBy)}
                />}
        </Container>
    );
};

export default DashboardUser;
