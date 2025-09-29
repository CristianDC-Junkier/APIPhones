import React, { useRef, useState, useEffect } from "react";
import { Col, Button, Spinner } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import PhoneDepartmentComponent from "../../components/lists/PhoneDepartmentComponent";
import BackButtonComponent from "../../components/utils/BackButtonComponent";
import { exportPDF } from "./ExportList";
import { useAuth } from '../../hooks/UseAuth';
import { getUserDataList } from "../../services/UserService";



const WorkerList = () => {
    const listRef = useRef();
    const [loading, setLoading] = useState(false);
    const [searchUser, setSearchUser] = useState("");
    const [searchDepartment, setSearchDepartment] = useState("");
    const [users, setUsers] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [showPhones, setShowPhones] = useState(true);
    const { token } = useAuth();
    const { date } = useAuth();

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
            if (!token) return;
            const result = await getUserDataList(token);
            if (result.success) {
                setUsers(result.data.users);
            }
            setLoading(false);
        };
        fetchUsers();
    }, [token]);

    // Construir departamentos a partir de users
    const realDepartamentos = users
        .filter(u => u.userData && u.userData.departmentId)
        .reduce((acc, u) => {
            const depId = u.userData.departmentId;
            const subdepId = u.userData.subdepartmentId;

            if (!acc[depId]) {
                acc[depId] = {
                    id: depId,
                    nombre: u.userData.departmentName || "Sin nombre",
                    trabajadores: [],
                    subdepartamentos: {}
                };
            }

            if (subdepId) {
                if (!acc[depId].subdepartamentos[subdepId]) {
                    acc[depId].subdepartamentos[subdepId] = {
                        id: subdepId,
                        nombre: u.userData.subdepartmentName || "Subdep",
                        trabajadores: []
                    };
                }
                acc[depId].subdepartamentos[subdepId].trabajadores.push(u.userData);
            } else {
                acc[depId].trabajadores.push(u.userData);
            }

            return acc;
        }, {});

    // Convertir a array y generar subdepartamentos
    const departamentosArray = Object.values(realDepartamentos).map(dep => ({
        ...dep,
        subdepartamentos: Object.values(dep.subdepartamentos)
    }));

    // Función para estimar altura
    const estimateHeight = (dep) =>
        dep.trabajadores.length +
        dep.subdepartamentos.reduce((acc, sd) => acc + sd.trabajadores.length + 1, 1);

    // Distribución vertical-first
    const colCount = 3;
    const columns = Array.from({ length: colCount }, () => []);
    const heights = Array(colCount).fill(0);
    const totalHeight = departamentosArray.reduce((sum, d) => sum + estimateHeight(d), 0);
    const targetHeight = totalHeight / colCount;

    [...departamentosArray].reverse().forEach((dep) => {
        const h = estimateHeight(dep);
        let colIdx = colCount - 1;
        while (colIdx > 0 && heights[colIdx] + h > targetHeight) colIdx--;
        columns[colIdx].push(dep);
        heights[colIdx] += h;
    });

    columns.forEach((col, idx) => columns[idx] = col.reverse());

    // Filtrar columnas según búsqueda
    const filteredColumns = columns.map(col =>
        col.filter(dep => {
            // Coincidencia en nombre del departamento
            const matchDept = dep.nombre.toLowerCase().includes(searchDepartment.toLowerCase());

            // Coincidencia en trabajadores del departamento principal
            const matchMain = dep.trabajadores.some(t =>
                t.name.toLowerCase().includes(searchUser.toLowerCase())
            );

            // Coincidencia en trabajadores de subdepartamentos
            const matchSub = dep.subdepartamentos.some(sd =>
                sd.trabajadores.some(t => t.name.toLowerCase().includes(searchUser.toLowerCase()))
            );

            // Retorna true si coincide en el departamento o en cualquier trabajador
            return matchDept || matchMain || matchSub;
        })
    );


    return (
        <div className="container-fluid my-4">
            <div style={{ position: "absolute", top: "10px", left: "10px" }}>
                <BackButtonComponent back="/home" />
            </div>

            <div className="text-center my-4">
                <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                    Ayuntamiento de Almonte - Listín Telefónico - Última Actualización: {lastUpdate}
                </h2>
            </div>

            {/* Buscador y botón exportar */}
            <div className="d-flex justify-content-between mb-2">
                <div className="d-flex gap-2" style={{ marginLeft: "26px" }}>
                    {/* Departamento */}
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar departamento..."
                        value={searchDepartment}
                        onChange={(e) => setSearchDepartment(e.target.value)}
                    />
                    {/* Usuario */}
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar usuario..."
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                    />
                </div>
                <div className="d-flex gap-2" style={{ marginRight: "28px" }}>
                    <Button
                        color={showPhones ? "primary" : "secondary"}
                        onClick={() => setShowPhones(true)}
                        style={{ fontWeight: 500 }}
                    >
                        Teléfonos
                    </Button>

                    <Button
                        color={!showPhones ? "primary" : "secondary"}
                        onClick={() => setShowPhones(false)}
                        style={{ fontWeight: 500 }}
                    >
                        Correos
                    </Button>

                    <Button
                        color="secondary"
                        disabled={loading}
                        style={{ fontWeight: 500, display: "flex", alignItems: "center", gap: "5px" }}
                        onClick={() => exportPDF({ showEmails: !showPhones, colCount, listRef, lastUpdate, setLoading })}
                    >
                        {loading ? <Spinner size="sm" color="light" /> : <FontAwesomeIcon icon={faFilePdf} />}
                        {loading ? " Generando..." : " Exportar PDF"}
                    </Button>
                </div>
            </div>


            <div ref={listRef} className="row mx-3">
                {filteredColumns.map((col, colIdx) => (
                    <Col key={colIdx} xs="12" md="4" className={colIdx < colCount - 1 ? "pe-1" : ""}>
                        {col.map((dep, depIdx) => (
                            <PhoneDepartmentComponent
                                key={depIdx}
                                nombreDepartamento={dep.nombre}
                                trabajadoresDepartamento={dep.trabajadores}
                                nombresSubdepartamentos={dep.subdepartamentos.map(sd => sd.nombre)}
                                trabajadoresSubdepartamentos={dep.subdepartamentos.map(sd => sd.trabajadores)}
                                showPhones={showPhones}
                            />
                        ))}
                    </Col>
                ))}
            </div>
        </div>
    );
};

export default WorkerList;
