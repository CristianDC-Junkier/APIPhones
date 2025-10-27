import React, { useRef, useState, useEffect } from "react";
import { Col, Button, Spinner, Input, Row } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";


import { exportPDF } from "./ExportList";
import { useAuth } from '../../hooks/UseAuth';
import { getWorkerDataList } from "../../services/UserService";
import { getDepartmentsList } from "../../services/DepartmentService";

import PhoneDepartmentComponent from "../../components/lists/PhoneDepartmentComponent";
import BackButtonComponent from "../../components/utils/BackButtonComponent";

//import { generateMockUsers } from "./generate";


const WorkerList = () => {
    const listRef = useRef();
    const [loading, setLoading] = useState(false);
    const [searchUser, setSearchUser] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [departments, setDepartments] = useState([]);
    const [users, setUsers] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [showPhones, setShowPhones] = useState(true);
    const { date } = useAuth();

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
            //const mockData = generateMockUsers(100); // genera 100 empleados
            //setUsers(mockData);
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
    )
        .map(dep => {
            // Ordenar trabajadores del departamento principal
            const sortedWorkers = dep.workers.sort((a, b) =>
                a.name.localeCompare(b.name)
            );

            // Convertir subdepartamentos a array y ordenar
            const sortedSubdeps = Object.values(dep.subdepartments)
                .map(sub => ({
                    ...sub,
                    workers: sub.workers.sort((a, b) =>
                        a.name.localeCompare(b.name)
                    )
                }))
                .sort((a, b) => a.name.localeCompare(b.name));

            return {
                ...dep,
                workers: sortedWorkers,
                subdepartments: sortedSubdeps
            };
        })
        // Finalmente ordenar departamentos
        .sort((a, b) => a.name.localeCompare(b.name));

    // Filtrar departamentos según búsqueda
    const filteredDepartments = departmentsArray.filter(dep => {
        // Si searchDepartment tiene texto, comprobar coincidencia
        const matchDept = selectedDepartment ? dep.id === selectedDepartment : true;

        // Si searchUser tiene texto, comprobar coincidencia
        let matchMain;
        if (dep.workers.length > 0) {
            matchMain = searchUser
                ? dep.workers.some(t =>
                    t.name.toLowerCase().includes(searchUser.toLowerCase())
                )
                : true;
        } else {
            for (var i = 0; i < dep.subdepartments.length; i++) {
                matchMain = searchUser
                    ? dep.subdepartments[i].workers.some(t =>
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
    const perColumn = Math.ceil(filteredDepartments.length / colCount);

    for (let i = 0; i < colCount; i++) {
        const start = i * perColumn;
        const end = start + perColumn;
        columns[i] = filteredDepartments.slice(start, end);
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
            <Row className="d-flex justify-content-between mb-2">

                <Col xs="11" md="5" className="d-flex gap-2" style={{ marginLeft: "20px", marginBottom: "10px"  }}>
                    {/* Departamento */}
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
                    {/* Usuario */}
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar usuario..."
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                    />
                </Col>
                <Col xs="11" md="4" className="d-flex gap-2 justify-content-end" style={{ marginLeft: "10px", marginRight: "20px", marginBottom: "9px" }}>
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
                </Col>
            </Row>


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
        </div>
    );
};

export default WorkerList;
