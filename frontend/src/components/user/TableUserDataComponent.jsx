import React, { useMemo } from "react";
import { Table, Button } from "reactstrap";
import { createRoot } from "react-dom/client";
import Swal from "sweetalert2";
import { modifyUserData, deleteUserData } from "../../services/UserService";
import CaptchaSlider from '../utils/CaptchaSliderComponent';
import ModifyUserData from "./ModifyUserDataComponent";
import Pagination from "../PaginationComponent";

const TableUserDataComponent = ({
    users,
    search,
    rowsPerPage,
    currentPage,
    setCurrentPage,
    currentUser,
    refreshData,
    token
}) => {
    const filteredUsers = useMemo(
        () => users.filter(u => u.name.toLowerCase().includes(search.toLowerCase())),
        [users, search]
    );

    const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
    const currentUsers = filteredUsers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const showCaptcha = id => new Promise((resolve, reject) => {
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
            title: `Eliminar ${id === currentUser.id ? 'su Usuario' : 'el Usuario'}`,
            html: container,
            showConfirmButton: true,
            confirmButtonText: 'Continuar',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            allowOutsideClick: false,
            preConfirm: () => {
                if (!completed) Swal.showValidationMessage('Debes completar el captcha');
            }
        }).then(() => {
            if (!completed) reject(new Error('Captcha no completado'));
        });
    });

    const handleModify = async (userItem) => {
        await ModifyUserData({
            token,
            userItem,
            currentUser,
            onConfirm: async (formValues) => {
                const result = await modifyUserData(userItem.id, formValues, token);
                if (result.success) {
                    Swal.fire("Éxito", "Usuario modificado correctamente", "success");
                    await refreshData();
                    if (userItem.id === currentUser.id) window.location.href = "/listin-telefonico/login";
                } else {
                    Swal.fire("Error", result.error || "No se pudo modificar el usuario", "error");
                }
            }
        });
    };

    const handleDelete = async (userItem) => {
        console.log(userItem.id);
        try { await showCaptcha(userItem.id); }
        catch { Swal.fire('Atención', 'Captcha no completado', 'warning'); return; }

        const result = await deleteUserData(userItem.id, token, userItem.version);
        if (result.success) {
            Swal.fire('Éxito', 'Usuario eliminado correctamente', 'success');
            await refreshData();
            if (userItem.id === currentUser.id) window.location.href = "/listin-telefonico/login";
        } else {
            Swal.fire('Error', result.error || 'No se pudo eliminar el usuario', 'error');
        }
    };

    return (
        <>
            <Table striped hover responsive className="shadow-sm rounded flex-grow-1">
                <thead className="table-primary">
                    <tr>
                        <th className="text-center">ID</th>
                        <th className="text-center">Nombre</th>
                        <th className="text-center">Teléfono</th>
                        <th className="text-center">Extensión</th>
                        <th className="text-center">Email</th>
                        <th className="text-center">Usuario</th>
                        <th className="text-center">Departamento</th>
                        <th className="text-center">Subdepartamento</th>
                        <th className="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {currentUsers.map((userItem, idx) => {
                        return (
                            <tr key={idx}>
                                <td className="text-center"> {userItem.id === undefined ? "-" : userItem.id}</td>
                                <td className="text-center"> {userItem.name === undefined ? "-" : userItem.name }</td>
                                <td className="text-center"> {userItem.number === undefined ? "-" : userItem.number}</td>
                                <td className="text-center"> {userItem.extension === undefined ? "-" : userItem.extension}</td>
                                <td className="text-center"> {userItem.email === undefined ? "-" : userItem.email}</td>
                                <td className="text-center"> {userItem.user === undefined ? "-" : userItem.user}</td>
                                <td className="text-center"> {(userItem.departmentName === undefined || userItem.departmentName == null) ? "-" : userItem.departmentName}</td>
                                <td className="text-center"> {(userItem.subdepartmentName === undefined || userItem.subdepartmentName == null) ? "-" : userItem.subdepartmentName}</td>
                                <td className="text-center">
                                    <div className="d-flex justify-content-center flex-wrap">
                                        <Button color="info" size="sm" className="me-1 mb-1">🔑</Button>
                                        <Button color="warning" size="sm" className="me-1 mb-1" onClick={() => handleModify(userItem)}>✏️</Button>
                                        <Button color="danger" size="sm" className="me-1 mb-1" onClick={() => handleDelete(userItem)}>🗑️</Button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}

                    {rowsPerPage - currentUsers.length > 0 &&
                        [...Array(rowsPerPage - currentUsers.length)].map((_, idx) => (
                            <tr key={`empty-${idx}`} style={{ height: '50px' }}>
                                <td colSpan={9}></td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>

            {totalPages > 1 && (
                <div className="mt-auto" style={{ minHeight: '40px' }}>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            )}
        </>
    );
};

export default TableUserDataComponent;
