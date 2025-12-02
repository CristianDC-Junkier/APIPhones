import { useRef, useState, useEffect, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { Col, Button, Spinner, Input } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faUserCircle, faHome } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

import { exportPDF } from "../../utils/ExportList";
import { useAuth } from '../../hooks/UseAuth';
import { getPublicList } from "../../services/UserService";
import { getDepartmentsList } from "../../services/DepartmentService";

import PhoneDepartmentComponent from "../../components/lists/PhoneDepartmentComponent";

const PublicList = () => {
    const listRef = useRef();
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [users, setUsers] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const { date, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Lista Pública - Listín telefónico - Ayuntamiento de Almonte";
    }, [])

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const fetchDate = async () => {
            const result = await date();
            setLastUpdate(result);
        };

        fetchDate();
    }, [date]);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            const result = await getPublicList();
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

    // Construir departamentos a partir de users
    const departmentsArray = Object.values(
        users.filter(u => u && u.departmentId)
            .reduce((acc, u) => {
                const depId = u.departmentId;
                const subdepId = u.subdepartmentId;

                if (!acc[depId]) {
                    acc[depId] = {
                        id: depId,
                        name: u.departmentName || "Sin nombre",
                        workers: [],
                        subdepartments: {}
                    };
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
        // Ordenar trabajadores del departamento principal usando username
        const sortedWorkers = dep.workers.sort((a, b) =>
            (a.username || "").localeCompare(b.username || "")
        );

        // Convertir subdepartamentos a array y ordenar
        const sortedSubdeps = Object.values(dep.subdepartments)
            .map(sub => ({
                ...sub,
                workers: sub.workers.sort((a, b) =>
                    (a.username || "").localeCompare(b.username || "")
                )
            }))
            .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

        return {
            ...dep,
            workers: sortedWorkers,
            subdepartments: sortedSubdeps
        };
    })
        // Finalmente ordenar departamentos
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""));


    // Filtrar departamentos según búsqueda
    const filteredDepartments = useMemo(() => {
        return departmentsArray.filter(u => {
            const matchesDept = selectedDepartment ? u.id === selectedDepartment : true;
            return matchesDept;
        });
    }, [departmentsArray, selectedDepartment]);


    // Distribución vertical-first sobre los filtrados
    const colCount = 3;
    const columns = Array.from({ length: colCount }, () => []);
    const perColumn = Math.ceil(filteredDepartments.length / colCount);

    for (let i = 0; i < colCount; i++) {
        const start = i * perColumn;
        const end = start + perColumn;
        columns[i] = filteredDepartments.slice(start, end);
    }

    return (
        <div className="container-fluid my-4" style={{ position: "relative" }}>
            {/* Botón flotante redondo con tooltip */}
            <div
                style={{
                    position: "fixed",
                    bottom: isMobile ? "120px" : "80px",
                    right: "20px",
                    zIndex: 1000,
                    padding: isMobile ? "0 20px" : "0 25px",
                }}
            >
                <div className="position-relative d-inline-block">
                    <Button
                        color="primary"
                        onClick={() => navigate("/login")}
                        style={{
                            width: isMobile ? "52px" : "60px",
                            height: isMobile ? "52px" : "60px",
                            borderRadius: "50%",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0,
                        }}
                    >
                        <FontAwesomeIcon
                            icon={user ? faHome : faUserCircle}
                            size={isMobile ? "lg" : "xl"}
                        />
                    </Button>

                    {/* Tooltip personalizado */}
                    <div
                        style={{
                            position: "absolute",
                            bottom: "-30px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            backgroundColor: "#333",
                            color: "#fff",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            whiteSpace: "nowrap",
                            opacity: 0.9,
                        }}
                    >
                        {user ? "Ir al menú" : "Iniciar sesión"}
                    </div>
                </div>
            </div>

            {/* Título */}
            <div className="text-center my-4">
                <h2
                    style={{
                        fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
                        fontWeight: "bold",
                    }}
                >
                    Ayuntamiento de Almonte - Listín Telefónico - Última Actualización:{" "}
                    {lastUpdate}
                </h2>
            </div>

            {/* Buscador y botón exportar */}
            <div
                className="d-flex justify-content-between flex-wrap mb-2"
                style={{
                    gap: "10px",
                    padding: isMobile ? "0 20px" : "0 25px",
                }}
            >
                <div className="d-flex gap-2 flex-wrap">
                    <Input
                        type="select"
                        value={selectedDepartment || ""}
                        onChange={(e) => setSelectedDepartment(Number(e.target.value))}
                        style={{
                            minWidth: "160px",
                            maxWidth: "240px",
                            flex: "1 1 auto",
                            fontSize: "clamp(0.8rem, 2vw, 1rem)",
                        }}
                    >
                        <option value="">Todos los departamentos</option>
                        {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.name}
                            </option>
                        ))}
                    </Input>
                </div>

                <div className="d-flex gap-2 flex-wrap">
                    <Button
                        color="secondary"
                        disabled={loading}
                        style={{
                            fontWeight: 500,
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "clamp(0.8rem, 2vw, 1rem)",
                        }}
                        onClick={() =>
                            exportPDF({ colCount, listRef, lastUpdate, setLoading })
                        }
                    >
                        {loading ? (
                            <Spinner size="sm" color="light" />
                        ) : (
                            <FontAwesomeIcon icon={faFilePdf} />
                        )}
                        {loading ? " Generando..." : " Exportar PDF"}
                    </Button>
                </div>
            </div>

            {/* Listado de departamentos */}
            <div ref={listRef} className="row mx-2 mx-md-3">
                {columns.map((col, colIdx) => (
                    <Col
                        key={colIdx}
                        xs="12"
                        md="4"
                        className={colIdx < colCount - 1 ? "pe-md-1" : ""}
                    >
                        {col.map((dep, depIdx) => (
                            <PhoneDepartmentComponent
                                key={depIdx}
                                departmentName={dep.name}
                                departmentWorkers={dep.workers}
                                subdepartmentNames={dep.subdepartments.map((sd) => sd.name)}
                                subdepartmentWorkers={dep.subdepartments.map(
                                    (sd) => sd.workers
                                )}
                                showPhones={true}
                                publicAccess={true}
                            />
                        ))}
                    </Col>
                ))}
            </div>
        </div>
    );
};

export default PublicList;
