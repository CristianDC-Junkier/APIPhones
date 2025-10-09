import React from "react";
import { Table } from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const DepartamentoComponent = ({
    departmentName,
    departmentWorkers,
    subdepartmentNames = [],
    subdepartmentWorkers = [],
    showPhones = true,
    publicAccess = false,
}) => {
    return (
        <div className="border-top border-2 border-dark mb-0">
            {/* Cabecera del departamento */}
            <div
                className="p-2 d-flex align-items-center"
                style={{ backgroundColor: "#BABABA" }}
            >
                <h6
                    className="m-0 text-uppercase fw-bold flex-grow-1 text-center"
                    style={{ fontSize: "1.00rem", color: "#000" }}
                >
                    {departmentName}
                </h6>
            </div>

            <Table
                bordered
                responsive
                size="sm"
                className="mb-0 text-center border-dark border-2 table-striped table-hover"
                style={{ fontSize: "0.9rem" }}
            >
                <tbody>
                    {/* Trabajadores del departamento */}
                    {departmentWorkers.map((t, idx) => (
                        <tr key={idx} className="text-center">
                            {showPhones ? (
                                <>
                                    {!publicAccess && <td style={{ width: "10%", padding: "0.25rem" }}><strong>{t.number}</strong></td>}
                                    <td style={{ width: publicAccess ? "20%" : "10%", padding: "0.25rem" }}><strong>{t.extension}</strong></td>
                                    <td className="text-uppercase"> {publicAccess ? "-" : t.name} </td>
                                </>
                            ) : (
                                <>
                                    <td colSpan="2" className="text-uppercase">{t.name.split(" ").slice(0, 2).join(" ")}</td>
                                    <td
                                        className="text-uppercase email"
                                        style={{ width: "60%", padding: "0.25rem", wordBreak: "break-word", overflowWrap: "break-word" }}
                                    >
                                        {t.email}
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}

                    {/* Subdepartamentos */}
                    {subdepartmentNames.map((subNombre, idx) => (
                        <React.Fragment key={idx}>
                            <tr className="table-secondary">
                                <td colSpan="4" className="p-1 border-dark border-1">
                                    <strong
                                        className="text-capitalize"
                                        style={{ fontSize: "0.9rem", color: "#000" }}
                                    >
                                        {subNombre}
                                    </strong>
                                </td>
                            </tr>

                            {subdepartmentWorkers[idx]?.map((t, tIdx) => (
                                <tr key={tIdx} className="text-center">
                                    {showPhones ? (
                                        <>
                                            <td style={{ width: "10%", padding: "0.25rem" }}><strong>{t.number}</strong></td>
                                            <td style={{ width: "10%", padding: "0.25rem" }}><strong>{t.extension}</strong></td>
                                            {!publicAccess && <td className="text-uppercase"> {t.name}</td>}
                                        </>
                                    ) : (
                                        <>
                                                <td colSpan="2" className="text-uppercase" >{t.name.split(" ").slice(0, 2).join(" ")}</td>
                                            <td
                                                className="text-uppercase email"
                                                style={{ width: "50%", padding: "0.25rem", wordBreak: "break-word", overflowWrap: "break-word" }}
                                            >
                                                {t.email}
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default DepartamentoComponent;
