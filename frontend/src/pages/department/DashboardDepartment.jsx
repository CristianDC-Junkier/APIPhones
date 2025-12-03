import { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody, CardTitle, CardText, Button, Input } from "reactstrap";
import Swal from "sweetalert2";

import { useAuth } from "../../hooks/useAuth";
import { getDepartmentsList, getSubDepartmentsList, createDepartment, createSubDepartment } from "../../services/DepartmentService";

import BackButtonComponent from "../../components/utils/BackButtonComponent";
import SpinnerComponent from "../../components/utils/SpinnerComponent";

import TableDepartmentComponent from "../../components/department/TableDepartmentComponent";
import TableSubDepartmentComponent from "../../components/department/TableSubDepartmentComponent";
import AddModifyDepartmentComponent from "../../components/department/AddModifyDepartmentComponent";
import AddModifySubdepartmentComponent from "../../components/department/AddModifySubDepartmentComponent";

const DashboardDepartment = () => {
    const { user: currentUser } = useAuth();

    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [subdepartments, setSubdepartments] = useState([]);
    const [currentView, setCurrentView] = useState("departments");
    const [search, setSearch] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const [sortBy, setSortBy] = useState("id");

    useEffect(() => {
        document.title = "Panel de control de Departamentos - Listín telefónico - Ayuntamiento de Almonte";
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, currentView]);

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
        setLoading(true);
        try {
            let deptResp, subResp;

            [deptResp, subResp] = await Promise.all([
                getDepartmentsList(),
                getSubDepartmentsList()
            ]);

            if (deptResp.success) {
                let depts = deptResp.data.departments ?? [];

                // Orden dinámico
                depts = depts.sort((a, b) => {
                    if (sortBy === "name") return a.name.localeCompare(b.name);
                    return a.id - b.id;
                });

                setDepartments(depts);

                const totalPages = Math.ceil(depts.length / rowsPerPage);
                if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
            }

            if (subResp.success) {
                let subs = subResp.data.subdepartments ?? [];

                subs = subs.sort((a, b) => {
                    if (sortBy === "name") return a.name.localeCompare(b.name);
                    return a.id - b.id;
                });

                setSubdepartments(subs);

                const totalPages = Math.ceil(subs.length / rowsPerPage);
                if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
            }
        } catch (err) {
            Swal.fire("Error", "No se pudo obtener la lista de departamentos", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser, rowsPerPage, sortBy]);


    /** Crear departamento */
    const handleCreateDepartment = async () => {
        await AddModifyDepartmentComponent({
            currentUser,
            action: "create",
            onConfirm: async (formValues) => {
                const result = await createDepartment(formValues);
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
            currentUser,
            action: "create",
            departments: [...departments].sort((a, b) => a.name.localeCompare(b.name)),
            onConfirm: async (formValues) => {
                const result = await createSubDepartment(formValues);
                if (result.success) {
                    Swal.fire("Éxito", "Subdepartamento creado correctamente", "success");
                    await fetchDepartments();
                } else {
                    Swal.fire("Error", result.error || "No se pudo crear el subdepartamento", "error");
                }
            }
        });
    };


    if (loading) return <SpinnerComponent />;

    return (
        <Container fluid className="mt-4 d-flex flex-column" style={{ minHeight: "80vh" }}>
            {/* Botón Volver */}
            <div className="position-absolute top-0 start-0">
                <BackButtonComponent back="/home" />
            </div>

            {/* Botón Crear */}
            <div className="position-absolute top-0 end-0 p-3">
                <Button
                    color="transparent"
                    style={{ background: "none", border: "none", color: "black", fontWeight: "bold", padding: 0 }}
                    onClick={currentView === "departments" ? handleCreateDepartment : handleCreateSubdepartment}
                >
                    ➕ {currentView === "departments" ? "Crear Departamento" : "Crear Subdepartamento"}
                </Button>
            </div>

            {/* Tarjetas */}
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

            {/* Buscador + Filtros + Orden */}
            <div className="d-flex flex-column flex-md-row mb-2 align-items-start align-items-md-center gap-2">

                {/* Título */}
                <div className="fw-bold fs-6 text-center text-md-start w-100 w-md-auto">
                    {currentView === "subdepartments" ? "Subdepartamentos" : "Departamentos"}
                </div>

                {/* Contenedor inputs + botón */}
                <div className="d-flex flex-column flex-md-row gap-2 w-100 w-md-auto">
                    {/* Buscador */}
                    <Input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-100 w-md-auto"
                    />

                    {/* Filtro Subdepartamentos */}
                    {currentView === "subdepartments" && (
                        <Input
                            type="select"
                            value={selectedDepartment || ""}
                            onChange={e => setSelectedDepartment(Number(e.target.value))}
                            className="w-100 w-md-auto"
                        >
                            <option value="">Todos los departamentos</option>

                            {[...departments]
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map(d => (
                                    <option key={d.id} value={d.id}>
                                        {d.name}
                                    </option>
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


            {/* TABLA */}
            {currentView === "departments" && (
                <TableDepartmentComponent
                    currentUser={currentUser}
                    departments={departments ?? []}
                    search={search}
                    rowsPerPage={rowsPerPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    refreshData={fetchDepartments}
                />
            )}

            {currentView === "subdepartments" && (
                <TableSubDepartmentComponent
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
