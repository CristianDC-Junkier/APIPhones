import React, { useRef, useState, useEffect } from "react";
import { Col, Button, Spinner } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import PhoneDepartmentComponent from "../../components/lists/PhoneDepartmentComponent";
import BackButtonComponent from "../../components/utils/BackButtonComponent";
import { exportPDF } from "./ExportList";
import { useAuth } from '../../hooks/UseAuth';
import { getUsersList } from "../../services/UserService";

//import { generateMockUsers } from "./generate";


const WorkerList = () => {
    const listRef = useRef();
    const [loading, setLoading] = useState(false);
    const [searchUser, setSearchUser] = useState("");
    const [searchDepartment, setSearchDepartment] = useState("");
    const [users, setUsers] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [showPhones, setShowPhones] = useState(true);
    const { date, token } = useAuth();

    useEffect(() => {
        const fetchDate = async () => {
            if (loading || !token) return;
            const result = await date();
            setLastUpdate(result);
        };

        fetchDate();
    }, [date, loading, token]);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            //const mockData = generateMockUsers(100); // genera 100 empleados
            //setUsers(mockData);
            if (!token) return;
            const result = await getUsersList(token);
            if (result.success) {
              setUsers(result.data.users);
            }
            setLoading(false);
        };
        fetchUsers();
    }, [token]);

    // Construir departamentos a partir de users
    const departamentosArray = Object.values(
        users
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
            }, {})
    )
        .map(dep => {
            // Ordenar trabajadores del departamento principal
            const sortedTrabajadores = dep.trabajadores.sort((a, b) =>
                a.name.localeCompare(b.name)
            );

            // Convertir subdepartamentos a array y ordenar
            const sortedSubdeps = Object.values(dep.subdepartamentos)
                .map(sub => ({
                    ...sub,
                    trabajadores: sub.trabajadores.sort((a, b) =>
                        a.name.localeCompare(b.name)
                    )
                }))
                .sort((a, b) => a.nombre.localeCompare(b.nombre));

            return {
                ...dep,
                trabajadores: sortedTrabajadores,
                subdepartamentos: sortedSubdeps
            };
        })
        // Finalmente ordenar departamentos
        .sort((a, b) => a.nombre.localeCompare(b.nombre));

    // Filtrar departamentos según búsqueda
    const filteredDepartamentos = departamentosArray.filter(dep => {
        // Si searchDepartment tiene texto, comprobar coincidencia
        const matchDept = searchDepartment
            ? dep.nombre.toLowerCase().includes(searchDepartment.toLowerCase())
            : true;

        // Si searchUser tiene texto, comprobar coincidencia
        let matchMain;
        if (dep.trabajadores.length > 0) {
            matchMain = searchUser
                ? dep.trabajadores.some(t =>
                    t.name.toLowerCase().includes(searchUser.toLowerCase())
                )
                : true;
        } else {
            for (var i = 0; i < dep.subdepartamentos.length; i++) {
                matchMain = searchUser
                    ? dep.subdepartamentos[i].trabajadores.some(t =>
                        t.name.toLowerCase().includes(searchUser.toLowerCase())
                    )
                    : true;
                if (matchMain) break;
            }
        }
        // Un departamento entra si cumple ambos filtros activos
        return matchDept && matchMain;
    });


    // Distribución vertical-first sobre los filtrados
    const colCount = 3;
    const columns = Array.from({ length: colCount }, () => []);
    const perColumn = Math.ceil(filteredDepartamentos.length / colCount);

    for (let i = 0; i < colCount; i++) {
        const start = i * perColumn;
        const end = start + perColumn;
        columns[i] = filteredDepartamentos.slice(start, end);
    }

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
                {columns.map((col, colIdx) => (
                    <Col
                        key={colIdx}
                        xs="12"
                        md="4"
                        className={colIdx < colCount - 1 ? "pe-1" : ""}
                    >
                        {col.map((dep, depIdx) => (
                            <PhoneDepartmentComponent
                                key={depIdx}
                                departmentName={dep.nombre}
                                departmentWorkers={dep.trabajadores}
                                subdepartmentNames={dep.subdepartamentos.map(sd => sd.nombre)}
                                subdepartmentWorkers={dep.subdepartamentos.map(sd => sd.trabajadores)}
                                showPhones={showPhones}
                                publicAccess={false}
                            />
                        ))}
                    </Col>
                ))}
            </div>
        </div>
    );
};

export default WorkerList;
