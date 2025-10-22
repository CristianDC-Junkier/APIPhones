import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody, CardTitle, CardText, Button, Input } from "reactstrap";
import Swal from "sweetalert2";

import { useAuth } from "../../hooks/useAuth";
import { getDepartmentsList, getDepartmentById, getSubDepartmentsList, createDepartment, createSubDepartment } from "../../services/DepartmentService";

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
    const [selectedDepartment, setSelectedDepartment] = useState("");
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

    /** Carga inicial de datos */
    const fetchDepartments = async () => {
        if (!token) return;
        setLoading(true);
        try {
            let deptResp, subResp;

            // admin / superadmin
            [deptResp, subResp] = await Promise.all([
                getDepartmentsList(token),
                getSubDepartmentsList(token)
            ]);
            if (deptResp.success) {
                const depts = deptResp.data.departments ?? [];
                setDepartments(depts);

                const totalPages = Math.ceil(depts.length / rowsPerPage);
                if (currentPage > totalPages && totalPages > 0) {
                    setCurrentPage(totalPages);
                }
            }

            if (subResp.success) {
                const subs = subResp.data.subdepartments ?? [];
                setSubdepartments(subs);

                const totalPages = Math.ceil(subs.length / rowsPerPage);
                if (currentPage > totalPages && totalPages > 0) {
                    setCurrentPage(totalPages);
                }
            }
        } catch (err) {
            Swal.fire("Error", "No se pudo obtener la lista de departamentos", err);
        }
        setLoading(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchDepartments(); }, [token, currentUser, rowsPerPage]);



    /** Crear departamento */
    const handleCreateDepartment = async () => {
        await AddModifyDepartmentComponent({
            token,
            currentUser,
            action: "create",
            onConfirm: async (formValues) => {
                const result = await createDepartment(formValues, token);
                if (result.success) {
                    Swal.fire("Éxito", "Departamento creado correctamente", "success");
                    await fetchDepartments();
                } else {
                    Swal.fire("Error", result.error || "No se pudo crear el departamento", "error");
                }
            }
        });
    };

    /** Crear subdepartamento */
    const handleCreateSubdepartment = async () => {
        await AddModifySubdepartmentComponent({
            token,
            currentUser,
            action: "create",
            departments,
            onConfirm: async (formValues) => {
                const result = await createSubDepartment(formValues, token);
                if (result.success) {
                    Swal.fire("Éxito", "Subdepartamento creado correctamente", "success");

                    await fetchDepartments();
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
            <Row className="mb-3 mt-4 justify-content-center g-3">
                    <Col xs={6} sm={6} md={4} l={3} xl={3}>
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
                <Col xs={6} sm={6} md={4} l={3} xl={3}>
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

            {/* Fila con tipo de usuario seleccionado + búsqueda */}
            <div className="d-flex flex-column flex-md-row justify-content-between mb-2 align-items-start align-items-md-center">
                {/* título */}
                <div className="fw-bold fs-6 mb-2 mb-md-0">
                    {currentView === "subdepartments" ? "Subdepartamentos" : "Departamentos"}
                </div>
                <div className="d-flex  gap-2">
                    {/* Select de filtrado por departamento solo si es subdepartamentos y no DEPARTMENT */}
                    {currentView === "subdepartments" && (
                        <Input
                            type="select"
                            value={selectedDepartment || ""}
                            onChange={e => setSelectedDepartment(Number(e.target.value))}
                            style={{ minWidth: "200px" }}
                        >
                            <option value="">Todos los departamentos</option>
                            {departments.map(d => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </Input>
                    )}
                    {/* Input de búsqueda siempre visible */}
                    <Input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ minWidth: "200px" }}
                    />


                </div>
            </div>


            {/* Tabla de departamentos */}
            {currentView === "departments" && (
                <TableDepartmentComponent
                    token={token}
                    currentUser={currentUser}
                    departments={departments ?? []}
                    search={search}
                    rowsPerPage={rowsPerPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    refreshData={fetchDepartments}
                />
            )}

            {/* Tabla de subdepartamentos */}
            {currentView === "subdepartments" && (
                <TableSubDepartmentComponent
                    token={token}
                    departments={departments ?? []}
                    subdepartments={subdepartments ?? []}
                    selectedDepartment={selectedDepartment}
                    search={search}
                    rowsPerPage={rowsPerPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    refreshData={fetchDepartments}
                />
            )}
        </Container>
    );
};

export default DashboardDepartment;
