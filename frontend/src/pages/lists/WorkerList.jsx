import { useRef, useState, useEffect } from "react";
import { Col, Button, Spinner, Input, Container, Row } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

import { exportPDF } from "../../utils/ExportList";
import { useAuth } from '../../hooks/UseAuth';
import { getWorkerDataList } from "../../services/UserService";
import { getDepartmentsList } from "../../services/DepartmentService";

import PhoneDepartmentComponent from "../../components/lists/PhoneDepartmentComponent";
import BackButtonComponent from "../../components/utils/BackButtonComponent";

const WorkerList = () => {
    const listRef = useRef();
    const [loading, setLoading] = useState(false);
    const [searchUser, setSearchUser] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [departments, setDepartments] = useState([]);
    const [users, setUsers] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [showPhones, setShowPhones] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const { date } = useAuth();

    useEffect(() => {
        document.title = "Lista Privada - Listín telefónico - Ayuntamiento de Almonte";
    }, []);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const fetchDate = async () => {
            if (loading) return;
            const result = await date();
            setLastUpdate(result);
        };
        fetchDate();
    }, [date, loading]);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            const result = await getWorkerDataList();
            if (result.success) {
                setUsers(result.data.users);
            }
            setLoading(false);
        };
        fetchUsers();
    }, []);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const deptResp = await getDepartmentsList();
            if (deptResp.success) {
                const depts = deptResp.data.departments ?? [];
                depts.sort((a, b) => a.name.localeCompare(b.name));
                setDepartments(depts);
            }
        } catch (err) {
            Swal.fire("Error", "No se pudo obtener la lista de departamentos", err);
        }
        setLoading(false);
    };

    useEffect(() => { fetchDepartments(); }, []);

    // --- Procesar departamentos ---
    const departmentsArray = Object.values(
        users.filter(u => u && u.departmentId)
            .reduce((acc, u) => {
                const depId = u.departmentId;
                const subdepId = u.subdepartmentId;
                if (!acc[depId]) {
                    acc[depId] = { id: depId, name: u.departmentName || "Sin nombre", workers: [], subdepartments: {} };
                }
                if (subdepId) {
                    if (!acc[depId].subdepartments[subdepId]) {
                        acc[depId].subdepartments[subdepId] = {
                            id: subdepId,
                            name: u.subdepartmentName || "Subdep",
                            workers: []
                        };
                    }
                    acc[depId].subdepartments[subdepId].workers.push(u);
                } else {
                    acc[depId].workers.push(u);
                }
                return acc;
            }, {})
    ).map(dep => {
        const sortedWorkers = dep.workers.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        const sortedSubdeps = Object.values(dep.subdepartments)
            .map(sub => ({
                ...sub,
                workers: sub.workers.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
            }))
            .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        return { ...dep, workers: sortedWorkers, subdepartments: sortedSubdeps };
    }).sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    // --- Filtros ---
    const filteredDepartments = departmentsArray.filter(dep => {
        const matchDept = selectedDepartment ? dep.id === selectedDepartment : true;
        const term = (searchUser || "").toLowerCase();
        const matchUser = searchUser
            ? dep.workers.some(t => (t.name || "").toLowerCase().includes(term)) ||
            dep.subdepartments.some(sd =>
                sd.workers.some(t => (t.name || "").toLowerCase().includes(term))
            )
            : true;
        return matchDept && matchUser;
    });

    // --- Distribución inicial ---
    const colCount = 3;
    const perColumn = Math.ceil(filteredDepartments.length / colCount);
    let columns = Array.from({ length: colCount }, (_, i) =>
        filteredDepartments.slice(i * perColumn, (i + 1) * perColumn)
    );

    // --- Función para calcular peso de una columna ---
    const getWeight = col =>
        col.reduce(
            (sum, dep) =>
                sum + dep.workers.length + dep.subdepartments.reduce((s, sd) => s + sd.workers.length, 0),
            0
        );

    // --- Ajuste dinámico para balancear columnas ---
    let improved = true;
    while (improved) {
        improved = false;

        for (let i = 0; i < colCount - 1; i++) {
            const colA = columns[i];
            const colB = columns[i + 1];

            const weightA = getWeight(colA);
            const weightB = getWeight(colB);
            const diffBefore = Math.abs(weightA - weightB);

            // Intentar mover 1 del final de A al inicio de B
            if (colA.length) {
                const moved = colA[colA.length - 1];
                const movedWeight = moved.workers.length + moved.subdepartments.reduce((s, sd) => s + sd.workers.length, 0);
                const diffAfter = Math.abs(weightA - movedWeight - (weightB + movedWeight));

                if (diffAfter < diffBefore) {
                    colA.pop();
                    colB.unshift(moved);
                    improved = true;
                    continue;
                }
            }

            // Intentar mover 1 del inicio de B al final de A
            if (colB.length) {
                const moved = colB[0];
                const movedWeight = moved.workers.length + moved.subdepartments.reduce((s, sd) => s + sd.workers.length, 0);
                const diffAfter = Math.abs((weightA + movedWeight) - (weightB - movedWeight));

                if (diffAfter < diffBefore) {
                    colB.shift();
                    colA.push(moved);
                    improved = true;
                    continue;
                }
            }
        }
    }


    return (
        <Container fluid className="mt-4 d-flex flex-column mb-3" >
            {/* Botón Volver */}
            <div className="position-absolute top-0 start-0">
                <BackButtonComponent back="/home" />
            </div>

            {/* Título */}
            <div className="text-center my-4">
                <h2
                    style={{
                        fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
                        fontWeight: "bold",
                        padding: isMobile ? "0 15px" : "0",
                    }}
                >
                    Ayuntamiento de Almonte - Listín Telefónico - Última Actualización: {lastUpdate}
                </h2>
            </div>

            {/* Fila de filtros y botones */}
            <Row
                className="align-items-center justify-content-between flex-wrap mb-3"
                style={{ gap: "10px", padding: isMobile ? "0 15px" : "0 25px" }}
            >
                {/* Select departamento */}
                <Col xs="12" lg="4" className="d-flex align-items-center">
                    <Input
                        type="select"
                        value={selectedDepartment || ""}
                        onChange={e => setSelectedDepartment(Number(e.target.value))}
                        style={{
                            flex: 1,
                            minWidth: "180px",
                            height: "38px",
                            fontSize: "clamp(0.8rem, 2vw, 1rem)",
                        }}
                    >
                        <option value="">Todos los departamentos</option>
                        {departments.map(d => (
                            <option key={d.id} value={d.id}>
                                {d.name}
                            </option>
                        ))}
                    </Input>
                </Col>

                {/* Input búsqueda */}
                <Col xs="12" lg="4" className="d-flex align-items-center">
                    <Input
                        type="text"
                        placeholder="Buscar trabajador..."
                        value={searchUser}
                        onChange={e => setSearchUser(e.target.value)}
                        style={{
                            flex: 1,
                            minWidth: "160px",
                            height: "38px", 
                            fontSize: "clamp(0.8rem, 2vw, 1rem)",
                        }}
                    />
                </Col>

                {/* Botones de acción */}
                <Col
                    xs="12"
                    lg="3"
                    className="d-flex flex-column flex-lg-row justify-content-lg-end justify-content-center align-items-stretch gap-2"
                >
                    <Button
                        color={showPhones ? "primary" : "secondary"}
                        onClick={() => setShowPhones(true)}
                        className="w-100"
                        style={{
                            fontWeight: 500,
                            fontSize: "clamp(0.8rem, 2vw, 1rem)",
                            height: "38px",
                            lineHeight: "1",
                            padding: "0 12px",
                        }}
                    >
                        Teléfonos
                    </Button>

                    <Button
                        color={!showPhones ? "primary" : "secondary"}
                        onClick={() => setShowPhones(false)}
                        className="w-100"
                        style={{
                            fontWeight: 500,
                            fontSize: "clamp(0.8rem, 2vw, 1rem)",
                            height: "38px",
                            lineHeight: "1",
                            padding: "0 12px",
                        }}
                    >
                        Correos
                    </Button>

                    <Button
                        color="secondary"
                        disabled={loading}
                        className="w-100"
                        style={{
                            fontWeight: 500,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "5px",
                            height: "38px",
                            lineHeight: "1",
                            padding: "0 12px",
                            fontSize: "clamp(0.8rem, 2vw, 1rem)",
                        }}
                        onClick={() =>
                            exportPDF({
                                showEmails: !showPhones,
                                colCount,
                                listRef,
                                lastUpdate,
                                setLoading
                            })
                        }
                    >
                        {loading ? (
                            <Spinner size="sm" color="light" />
                        ) : (
                            <FontAwesomeIcon icon={faFilePdf} />
                        )}
                        {loading ? " Generando..." : " Exportar PDF"}
                    </Button>
                </Col>
            </Row>


            {/* Lista */}
            <div ref={listRef} className="row mx-2 mx-md-3">
                {columns.map((col, colIdx) => (
                    <Col key={colIdx} xs="12" md="4" className={colIdx < colCount - 1 ? "pe-md-1" : ""}>
                        {col.map((dep, depIdx) => (
                            <PhoneDepartmentComponent
                                key={depIdx}
                                departmentName={dep.name}
                                departmentWorkers={dep.workers}
                                subdepartmentNames={dep.subdepartments.map(sd => sd.name)}
                                subdepartmentWorkers={dep.subdepartments.map(sd => sd.workers)}
                                showPhones={showPhones}
                                publicAccess={false}
                            />
                        ))}
                    </Col>
                ))}
            </div>
        </Container>
    );
};

export default WorkerList;
