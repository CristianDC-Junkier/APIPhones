import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody, CardTitle, CardText, Button, Input } from "reactstrap";
import Swal from "sweetalert2";

import { useAuth } from "../../hooks/useAuth";
import { getDepartmentsList, getSubDepartmentsList, createDepartment, createSubDepartment } from "../../services/DepartmentService";

import BackButton from "../../components/utils/BackButtonComponent";
import Spinner from "../../components/utils/SpinnerComponent";

import TableDepartmentComponent from "../../components/department/TableDepartmentComponent";
import TableSubDepartmentComponent from "../../components/department/TableSubDepartmentComponent";
import AddModifyDepartmentComponent from "../../components/department/AddModifyDepartmentComponent";
import AddModifySubdepartmentComponent from "../../components/department/AddModifySubDepartmentComponent";

/**
 * Dashboard de Departamentos y Subdepartamentos
 * 
 * ADMIN / SUPERADMIN: pueden alternar entre departamentos y subdepartamentos.
 * DEPARTMENT: solo ve subdepartamentos de su departamento.
 */
const DashboardDepartment = () => {
    const { user: currentUser, token } = useAuth();

    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [subdepartments, setSubdepartments] = useState([]);
    const [currentView, setCurrentView] = useState("departments"); // "departments" | "subdepartments"
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(8);

    /** Ajusta el número de filas según altura de ventana */
    useEffect(() => {
        const updateRows = () => {
            const vh = window.innerHeight;
            const headerHeight = 220;
            const rowHeight = 50;
            const footerHeight = 150;
            const availableHeight = vh - headerHeight - footerHeight;
            const rows = Math.max(3, Math.floor(availableHeight / rowHeight));
            setRowsPerPage(rows);
        };
        updateRows();
        window.addEventListener("resize", updateRows);
        return () => window.removeEventListener("resize", updateRows);
    }, []);

    /** Si el usuario es DEPARTMENT, siempre mostrar subdepartamentos */
    useEffect(() => {
        if (currentUser?.usertype === "DEPARTMENT") {
            setCurrentView("subdepartments");
        }
    }, [currentUser]);

    /** Carga inicial de datos */
    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const [deptResp, subResp] = await Promise.all([getDepartmentsList(token), getSubDepartmentsList(token)]);
                if (deptResp.success) setDepartments(deptResp.data.departments ?? []);
                if (subResp.success) {
                    // Filtrar solo subdepartamentos del departamento del usuario si es DEPARTMENT
                    if (currentUser?.usertype === "DEPARTMENT") {
                        setSubdepartments(subResp.data?.subdepartments.filter(sd => sd.departmentId === currentUser.departmentId) ?? []);
                    } else {
                        setSubdepartments(subResp.data.subdepartments ?? []);
                    }
                }
            } catch (error) {
                Swal.fire("Error", "No se pudo obtener los datos", error);
            }
            setLoading(false);
        };
        fetchData();
    }, [token, currentUser, currentView]);


    /** Crear departamento */
    const handleCreateDepartment = async () => {
        await AddModifyDepartmentComponent({
            action: "create",
            onConfirm: async (formValues) => {
                const result = await createDepartment(formValues, token);
                if (result.success) {
                    Swal.fire("Éxito", "Departamento creado correctamente", "success");
                    const resp = await getDepartmentsList(token);
                    if (resp.success) {
                        setDepartments(resp.data.departments ?? []);
                    }
                } else {
                    Swal.fire("Error", result.error || "No se pudo crear el departamento", "error");
                }
            }
        });
    };

    /** Crear subdepartamento */
    const handleCreateSubdepartment = async () => {
        await AddModifySubdepartmentComponent({
            action: "create",
            departments: currentUser?.usertype === "DEPARTMENT"
                ? departments.filter(d => d.id === currentUser.departmentId)
                : departments,
            onConfirm: async (formValues) => {
                if (currentUser?.usertype === "DEPARTMENT") formValues.departmentId = currentUser.departmentId;

                const result = await createSubDepartment(formValues, token);
                if (result.success) {
                    Swal.fire("Éxito", "Subdepartamento creado correctamente", "success");
                    const resp = await getSubDepartmentsList(token);
                    if (resp.success) {
                        if (currentUser?.usertype === "DEPARTMENT") {
                            setSubdepartments(resp.data?.subdepartments.filter(sd => sd.departmentId === currentUser.departmentId) ?? []);
                        } else {
                            setSubdepartments(resp.data.subdepartments ?? []);
                        }
                    }
                } else {
                    Swal.fire("Error", result.error || "No se pudo crear el subdepartamento", "error");
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

            {/* Botón Crear Departamento/Subdepartamento */}
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
                    onClick={currentView === "departments" ? handleCreateDepartment : handleCreateSubdepartment}
                >
                    ➕ {currentView === "departments" ? "Crear Departamento" : "Crear Subdepartamento"}
                </Button>
            </div>   

            {/* Tarjetas para cambiar de vista solo para ADMIN/SUPERADMIN */}
            {currentUser?.usertype !== "DEPARTMENT" && (
                <Row className="mb-3 mt-1 justify-content-center g-3">
                    <Col xs={6} sm={4} md={3}>
                        <Card
                            className={`shadow-lg mb-2 border-2 ${currentView === "departments" ? "border-primary" : ""}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setCurrentView("departments")}
                        >
                            <CardBody className="text-center pt-3">
                                <CardTitle tag="h6">Departamentos</CardTitle>
                                <CardText className="fs-4 fw-bold">{departments.length}</CardText>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xs={6} sm={4} md={3}>
                        <Card
                            className={`shadow-lg mb-2 border-2 ${currentView === "subdepartments" ? "border-primary" : ""}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setCurrentView("subdepartments")}
                        >
                            <CardBody className="text-center pt-3">
                                <CardTitle tag="h6">Subdepartamentos</CardTitle>
                                <CardText className="fs-4 fw-bold">{subdepartments.length}</CardText>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Input de búsqueda alineado a la derecha */}
            <div className="d-flex justify-content-end mb-3">
                <Input
                    type="text"
                    placeholder={`Buscar por nombre...`}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: "250px" }}
                />
            </div>

            {/* Tabla de departamentos */}
            {currentUser?.usertype !== "DEPARTMENT" && currentView === "departments" && (
                <TableDepartmentComponent
                    token={token}
                    currentUser={currentUser}
                    departments={departments ?? []}
                    search={search}
                    rowsPerPage={rowsPerPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    refreshData={async () => {
                        const resp = await getDepartmentsList(token);
                        if (resp.success) {
                            setDepartments(resp.data.departments ?? []);
                            const totalPages = Math.ceil(resp.data.departments?.length / rowsPerPage);
                            if (currentPage > totalPages && totalPages > 0) {
                                setCurrentPage(totalPages);
                            }
                        }
                    }}
                />
            )}

            {/* Tabla de subdepartamentos */}
            {currentView === "subdepartments" && (
                <TableSubDepartmentComponent
                    token={token}
                    departments={departments ?? []}
                    subdepartments={subdepartments ?? []}
                    search={search}
                    rowsPerPage={rowsPerPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    refreshData={async () => {
                        const resp = await getSubDepartmentsList(token);
                        if (resp.success) {
                            if (currentUser?.usertype === "DEPARTMENT") {
                                setSubdepartments(resp.data?.subdepartments.filter(sd => sd.departmentId === currentUser.departmentId) ?? []);
                            } else {
                                setSubdepartments(resp.data.subdepartments ?? []);
                            }
                            const totalPages = Math.ceil(resp.data.subdepartments?.length / rowsPerPage);
                            if (currentPage > totalPages && totalPages > 0) {
                                setCurrentPage(totalPages);
                            }
                        }
                    }}
                />
            )}
        </Container>
    );   
};

export default DashboardDepartment;
