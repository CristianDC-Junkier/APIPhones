import React, { useMemo, useState, useEffect } from "react";
import { Table, Button } from "reactstrap";
import { createRoot } from "react-dom/client";
import Swal from "sweetalert2";
import CaptchaSlider from '../utils/CaptchaSliderComponent';
import { modifyDepartment, deleteDepartment } from "../../services/DepartmentService";

import AddModifyDepartmentComponent from "./AddModifyDepartmentComponent";
import PaginationComponent from "../../components/PaginationComponent";
import BadgeComponent from "../../components/badge/BadgeComponent";
import ShowMoreBadgeComponent from "../../components/badge/ShowMoreBadgeComponent";


/**
 * Componente para mostrar la tabla de departamentos
 * @param {Object} props
 * @param {Array} props.departments - Lista de departamentos
 * @param {String} props.search - Filtro de búsqueda por nombre
 * @param {Number} props.rowsPerPage - Número de filas por página
 * @param {Number} props.currentPage - Página actual
 * @param {Function} props.setCurrentPage - Función para cambiar la página
 * @param {Function} props.refreshData - Función para recargar los datos
 */
const TableDepartmentComponent = ({ departments, search, rowsPerPage, currentPage, setCurrentPage, refreshData }) => {

    // Hook para detectar pantalla pequeña
    const useIsSmallScreen = (breakpoint = 500) => {
        const [isSmall, setIsSmall] = useState(window.innerWidth < breakpoint);

        useEffect(() => {
            const handleResize = () => setIsSmall(window.innerWidth < breakpoint);
            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }, [breakpoint]);

        return isSmall;
    };

    const filteredDepartments = useMemo(
        () => departments.filter(d => d.name.toLowerCase().includes(search.toLowerCase())),
        [departments, search]
    );

    const totalPages = Math.ceil(filteredDepartments.length / rowsPerPage);
    const currentDepartments = filteredDepartments.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const showCaptcha = () => new Promise((resolve) => {
        const container = document.createElement('div');
        const reactRoot = createRoot(container);
        let completed = false;

        reactRoot.render(
            <CaptchaSlider onSuccess={() => {
                completed = true;
                Swal.close();
                resolve(true);
                setTimeout(() => reactRoot.unmount(), 0);
            }} />
        );

        Swal.fire({
            title: `Eliminar Departamento`,
            html: container,
            showConfirmButton: true,
            confirmButtonText: 'Continuar',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            allowOutsideClick: false,
            preConfirm: () => {
                if (!completed) {
                    Swal.showValidationMessage('Debes completar el captcha');
                    return false;
                }
            }
        });
    });

    const handleModify = async (dept) => {
        await AddModifyDepartmentComponent({
            department: dept,
            action: "modify",
            onConfirm: async (formValues) => {
                const result = await modifyDepartment({ id: dept.id, name: formValues.name });
                if (result.success) {
                    Swal.fire("Éxito", "Departamento modificado correctamente", "success");
                    await refreshData();
                } else {
                    Swal.fire("Error", result.error || "No se pudo modificar el departamento", "error");
                }
            }
        });
    };

    const handleDelete = async (dept) => {
        await showCaptcha(dept.id);
        const result = await deleteDepartment(dept.id);
        if (result.success) {
            Swal.fire('Éxito', 'Departamento eliminado correctamente', 'success');
            await refreshData();
            const remainingUsers = filteredDepartments.length;
            const totalPagesAfterDelete = Math.ceil(remainingUsers / rowsPerPage);

            if (currentPage > totalPagesAfterDelete && totalPagesAfterDelete > 0) {
                setCurrentPage(totalPagesAfterDelete);
            }
        } else {
            Swal.fire('Error', result.error || 'No se pudo eliminar el departamento', 'error');
        }
    };

    const isSmallScreen = useIsSmallScreen(770);

    return (
        <>
            <Table striped hover responsive className="shadow-sm rounded flex-grow-1 mb-3">
                <thead className="table-primary">
                    <tr>
                        <th>ID</th>
                        <th className="text-center">Nombre</th>
                        <th className="text-center"
                            style={{ width: isSmallScreen ? "15%" : "55%" }}> Subdepartamentos</th>
                        <th className="text-center"
                            style={{ width: isSmallScreen ? "55%" : "15%" }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {currentDepartments.map((dept, idx) => (
                        <tr key={idx}>     
                            <td>{dept.id}</td>
                            <td className="text-center">{dept.name}</td>
                            <td className="text-center">
                                {isSmallScreen ? (
                                    // Pantalla pequeña: solo mostrar botón "Mostrar más" o "+ Añadir"
                                    dept.subdepartment && dept.subdepartment.length > 0 ? (

                                        <ShowMoreBadgeComponent
                                            user={dept}
                                            objList={dept.subdepartment}
                                            objType="subdepartamento"
                                        />
                                    ) : "0"
                                ) : (
                                    // Pantalla normal: mostrar badges + "Mostrar más" o "+ Añadir"
                                    <>
                                        {/* Mostrar los primeros dos departamentos */}

                                        {dept.subdepartment && dept.subdepartment.length > 0 && dept.subdepartment.slice(0, 3).map(subD => (
                                            <BadgeComponent
                                                key={subD.id}
                                                objName={subD.name}
                                            />
                                        ))}

                                        {/* Si hay más de 2 departamentos, mostramos el botón "Mostrar más" */}
                                        {dept.subdepartment.length > 3 ? (
                                            <ShowMoreBadgeComponent
                                                user={dept}
                                                objList={dept.subdepartment}
                                                objType="subdepartamento"
                                            />
                                            ) : (dept.subdepartment.length > 0 ? null : "Sin Subdepartamentos")
                                        }
                                    </>
                                )}</td>
                            <td className="text-center">
                                <div className="d-flex justify-content-center flex-wrap">
                                    <Button color="warning" size="sm" className="me-1 mb-1" onClick={() => handleModify(dept)}>✏️</Button>
                                    <Button color="danger" size="sm" className="me-1 mb-1" onClick={() => handleDelete(dept)}>🗑️</Button>
                                </div>
                            </td>
                        </tr>
                    ))}

                    {/* Filas vacías */}
                    {rowsPerPage - currentDepartments.length > 0 &&
                        [...Array(rowsPerPage - currentDepartments.length)].map((_, idx) => (
                            <tr key={`empty-${idx}`} style={{ height: '50px' }}>
                                <td colSpan={4}></td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>

            <div className="mt-auto" style={{ minHeight: '40px' }}>
                {totalPages > 1 ? (
                    <PaginationComponent currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                ) : (
                    <div style={{ height: '40px' }}></div>
                )}
            </div>
        </>
    );
};

export default TableDepartmentComponent;
