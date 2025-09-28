import React, { useRef, useState } from "react";
import { Col, Button, Spinner } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import PhoneDepartmentComponent from "../../components/lists/PhoneDepartmentComponent";
import BackButtonComponent from "../../components/utils/BackButtonComponent";
import { exportPDF } from "./ExportList"; 
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";

// Funciones auxiliares
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomName = () => {
    const firstNames = ["Juan", "María", "Pedro", "Lucía", "Carlos", "Sofía", "Miguel", "Ana", "Luis", "Isabel"];
    const lastNames = ["García", "Rodríguez", "López", "Martínez", "Hernández", "Pérez", "Sánchez", "Ramírez"];
    return `${firstNames[randomInt(0, firstNames.length - 1)]} ${lastNames[randomInt(0, lastNames.length - 1)]}`;
};
const randomDeptName = (idCounter) => {
    const types = ["Administración", "Finanzas", "Servicios", "Recursos Humanos", "Tecnología", "Operaciones"];
    return `${types[randomInt(0, types.length - 1)]} ${idCounter}`;
};

// Función para estimar "altura" de un departamento
const estimateHeight = (dep) =>
    dep.trabajadores.length + dep.subdepartamentos.reduce((acc, sd) => acc + sd.trabajadores.length + 1, 1);

const WorkerList = () => {
    const listRef = useRef();
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const lastUpdate = "25/09/2025";
    let idCounter = 1;

    // Generar departamentos aleatorios
    const departamentos = Array.from({ length: randomInt(15, 25) }, () => ({
        nombre: randomDeptName(idCounter++),
        trabajadores: Array.from({ length: randomInt(1, 5) }, () => ({
            numero: (Math.floor(100000000 + Math.random() * 900000000)).toString(),
            extension: (Math.floor(10000 + Math.random() * 90000)).toString(),
            nombre: randomName(),
            email: `${Math.random().toString(36).substring(2, 8)}@ejemplo.com`,
        })),
        subdepartamentos: Array.from({ length: randomInt(1, 4) }, (_, idx) => ({
            nombre: `Subdep ${idx + 1}`,
            trabajadores: Array.from({ length: randomInt(1, 3) }, () => ({
                numero: (Math.floor(100000000 + Math.random() * 900000000)).toString(),
                extension: (Math.floor(10000 + Math.random() * 90000)).toString(),
                nombre: randomName(),
                email: `${Math.random().toString(36).substring(2, 8)}@ejemplo.com`,
            })),
        })),
    }));

    // Distribución vertical-first
    const colCount = 3;
    const columns = Array.from({ length: colCount }, () => []);
    const heights = Array(colCount).fill(0);
    const totalHeight = departamentos.reduce((sum, d) => sum + estimateHeight(d), 0);
    const targetHeight = totalHeight / colCount;

    [...departamentos].reverse().forEach((dep) => {
        const h = estimateHeight(dep);
        let colIdx = colCount - 1;
        while (colIdx > 0 && heights[colIdx] + h > targetHeight) colIdx--;
        columns[colIdx].push(dep);
        heights[colIdx] += h;
    });

    columns.forEach((col, idx) => columns[idx] = col.reverse());

    // Filtrar columnas según búsqueda
    const filteredColumns = columns.map(col =>
        col.filter(dep => dep.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
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
                {/* Input a la izquierda */}
                <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar departamento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: "200px", marginLeft: "26px", }}
                />

                {/* Botón a la derecha */}
                <Button
                    color="secondary"
                    disabled={loading}
                    style={{ fontWeight: 500, fontSize: "0.9rem", display: "flex", alignItems: "center", marginRight: "28px", gap: "5px" }}
                    onClick={async (e) => {
                        e.preventDefault();

                        setSearchTerm("");

                        const { isConfirmed } = await Swal.fire({
                            title: 'Exportar correos?',
                            text: '¿Deseas incluir los correos en el PDF?',
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonText: 'Sí, incluir correos',
                            cancelButtonText: 'No, excluir correos'
                        });
                        exportPDF({
                            showEmails: isConfirmed,
                            colCount,
                            listRef,
                            lastUpdate,
                            setLoading
                        });
                    }}
                >
                    {loading ? <Spinner size="sm" color="light" /> : <FontAwesomeIcon icon={faFilePdf} />}
                    {loading ? " Generando..." : " Exportar a PDF"}
                </Button>
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
                            />
                        ))}
                    </Col>
                ))}
            </div>
        </div>
    );
};

export default WorkerList;
