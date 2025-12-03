import React, { useMemo, useState, useEffect } from "react";
import { Table, Button } from "reactstrap";
import { createRoot } from "react-dom/client";
import Swal from "sweetalert2";
import CaptchaSlider from '../utils/CaptchaSliderComponent';
import AddModifySubdepartmentComponent from "./AddModifySubdepartmentComponent";
import { modifySubDepartment, deleteSubDepartment } from "../../services/DepartmentService";
import Pagination from "../../components/PaginationComponent";

/**
 * Componente para mostrar la tabla de subdepartamentos
 * @param {Object} props
 * @param {Array} props.data - Lista de subdepartamentos
 * @param {String} props.search - Filtro de búsqueda por nombre
 * @param {Number} props.rowsPerPage - Número de filas por página
 * @param {Number} props.currentPage - Página actual
 * @param {Function} props.setCurrentPage - Función para cambiar la página
 * @param {Function} props.refreshData - Función para recargar los datos
 */
const TableSubDepartmentComponent = ({ departments, subdepartments, selectedDepartment, search, rowsPerPage, currentPage, setCurrentPage, refreshData }) => {
    const filteredSubdepartments = useMemo(() => {
        return subdepartments.filter(sub => {
            const matchesName = sub.name.toLowerCase().includes(search.toLowerCase());
            const matchesDept = selectedDepartment ? sub.departmentId === selectedDepartment : true;
            return matchesName && matchesDept;
        });
    }, [subdepartments, search, selectedDepartment]);


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

    const totalPages = Math.ceil(filteredSubdepartments.length / rowsPerPage);
    const currentSubdepartments = filteredSubdepartments.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

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
            title: `Eliminar Subdepartamento`,
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

    const handleModify = async (sub) => {
        await AddModifySubdepartmentComponent({
            departments,
            subdepartment: sub,
            action: "modify",
            onConfirm: async (formValues) => {
                const result = await modifySubDepartment({ id: sub.id, name: formValues.name, departmentId: formValues.departmentId });
                if (result.success) {
                    Swal.fire("Éxito", "Subdepartamento modificado correctamente", "success");
                    await refreshData();
                } else {
                    Swal.fire("Error", result.error || "No se pudo modificar el subdepartamento", "error");
                }
            }
        });
    };

    const handleDelete = async (sub) => {
        await showCaptcha(sub.id); 
        const result = await deleteSubDepartment(sub.id);

        if (result.success) {
            Swal.fire('Éxito', 'Subdepartamento eliminado correctamente', 'success');
            await refreshData();

            const remainingUsers = filteredSubdepartments.length;
            const totalPagesAfterDelete = Math.ceil(remainingUsers / rowsPerPage);

            if (currentPage > totalPagesAfterDelete && totalPagesAfterDelete > 0) {
                setCurrentPage(totalPagesAfterDelete);
            }

        } else {
            Swal.fire('Error', result.error || 'No se pudo eliminar el subdepartamento', 'error');
        }
    };

    const isSmallScreen = useIsSmallScreen(770);


    return (
        <>
            <Table striped hover responsive className="shadow-sm rounded flex-grow-1 mb-3">
                <thead className="table-primary">
                    <tr>
                        <th className="text-center">ID</th>
                        <th className="text-center">Nombre</th>
                        <th className="text-center"
                            style={{ width: isSmallScreen ? "15%" : "45%" }}> Departamento </th>
                        <th className="text-center"
                            style={{ width: isSmallScreen ? "55%" : "15%" }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {currentSubdepartments.map((sub, idx) => {
                        // Buscar el nombre del departamento
                        const departmentName = departments.find(d => d.id === sub.departmentId)?.name || "-";

                        return (
                            <tr key={idx}>
                                <td className="text-center">{sub.id}</td>
                                <td className="text-center">{sub.name}</td>
                                <td className="text-center">{departmentName}</td>
                                <td className="text-center">
                                    <div className="d-flex justify-content-center flex-wrap">
                                        <Button color="warning" size="sm" className="me-1 mb-1" onClick={() => handleModify(sub)}>✏️</Button>
                                        <Button color="danger" size="sm" className="me-1 mb-1" onClick={() => handleDelete(sub)}>🗑️</Button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}

                    {/* Filas vacías */}
                    {rowsPerPage - currentSubdepartments.length > 0 &&
                        [...Array(rowsPerPage - currentSubdepartments.length)].map((_, idx) => (
                            <tr key={`empty-${idx}`} style={{ height: '50px' }}>
                                <td colSpan={4}></td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>

            <div className="mt-auto" style={{ minHeight: '40px' }}>
                {totalPages > 1 ? (
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                ) : (
                    <div style={{ height: '40px' }}></div>
                )}
            </div>
        </>
    );
};

export default TableSubDepartmentComponent;
