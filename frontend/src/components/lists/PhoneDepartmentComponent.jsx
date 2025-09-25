import React, { useState } from "react";
import { Table } from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";

/**
 * Componente que renderiza un departamento con sus trabajadores y subdepartamentos en formato tabla.
 *
 * @param {Object} props
 * @param {string} props.nombreDepartamento - Nombre del departamento
 * @param {Trabajador[]} props.trabajadoresDepartamento - Lista de trabajadores del departamento
 * @param {string[]} props.nombresSubdepartamentos - Array con nombres de subdepartamentos
 * @param {Trabajador[][]} props.trabajadoresSubdepartamentos - Array de arrays con trabajadores de cada subdepartamento
 * @returns {JSX.Element}
 */
const DepartamentoComponent = ({
    nombreDepartamento,
    trabajadoresDepartamento,
    nombresSubdepartamentos = [],
    trabajadoresSubdepartamentos = [],
}) => {
    const [openDep, setOpenDep] = useState(true);

    // Inicializar todos los subdepartamentos abiertos
    const initialSubDeps = nombresSubdepartamentos.reduce(
        (acc, _, idx) => ({ ...acc, [idx]: true }),
        {}
    );
    const [openSubDeps, setOpenSubDeps] = useState(initialSubDeps);

    const toggleSubDep = (index) => {
        setOpenSubDeps((prev) => ({ ...prev, [index]: !prev[index] }));
    };

    const toggleDep = () => {
        setOpenDep(!openDep);
    };

    return (
        <div className="border-top border-3 border-dark">
            {/* Cabecera del departamento */}
            <div
                className="p-2 d-flex align-items-center"
                style={{ cursor: "pointer", backgroundColor: "#BABABA" }}
                onClick={toggleDep}
            >
                <FontAwesomeIcon
                    icon={openDep ? faChevronDown : faChevronRight}
                    className="pdf-hide arrow-icon"
                    style={{ fontSize: "0.8rem", marginRight: "6px" }}
                />
                <h6
                    className="m-0 text-uppercase fw-bold flex-grow-1 text-center"
                    style={{ fontSize: "0.9rem", color: "#000" }}
                >
                    {nombreDepartamento}
                </h6>
            </div>

            {openDep && (
                <Table bordered responsive size="sm" className="mb-0 small text-center">
                    <tbody>
                        {/* Trabajadores del departamento */}
                        {trabajadoresDepartamento.map((t, idx) => (
                            <tr key={idx} className="small text-center">
                                <td style={{ width: "15%" }}><strong>{t.numero}</strong></td>
                                <td style={{ width: "15%" }}><strong>{t.extension}</strong></td>
                                <td style={{ width: "30%" }} className="text-uppercase">{t.nombre}</td>
                                <td style={{ width: "40%" }} className="text-uppercase">{t.email}</td>
                            </tr>
                        ))}

                        {/* Subdepartamentos */}
                        {nombresSubdepartamentos.map((subNombre, idx) => (
                            <React.Fragment key={idx}>
                                <tr className="table-secondary">
                                    <td colSpan="4" className="p-1">
                                        <div
                                            className="d-flex align-items-center justify-content-start"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => toggleSubDep(idx)}
                                        >
                                            <FontAwesomeIcon
                                                icon={openDep ? faChevronDown : faChevronRight}
                                                className="pdf-hide arrow-icon"
                                                style={{ fontSize: "0.8rem", marginRight: "6px" }}
                                            />
                                            <strong
                                                className="text-capitalize flex-grow-1"
                                                style={{ fontSize: "0.75rem", textDecoration: "none", color: "#000" }}
                                            >
                                                {subNombre}
                                            </strong>
                                        </div>
                                    </td>
                                </tr>

                                {openSubDeps[idx] &&
                                    trabajadoresSubdepartamentos[idx]?.map((t, tIdx) => (
                                        <tr key={tIdx} className="small text-center">
                                            <td><strong>{t.numero}</strong></td>
                                            <td><strong>{t.extension}</strong></td>
                                            <td className="text-uppercase">{t.nombre}</td>
                                            <td className="text-uppercase">{t.email}</td>
                                        </tr>
                                    ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </Table>
            )}
        </div>
    );
};

export default DepartamentoComponent;
