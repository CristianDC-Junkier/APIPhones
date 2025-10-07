import React, { useMemo } from "react";
import { Table, Button } from "reactstrap";
import { createRoot } from "react-dom/client";
import Swal from "sweetalert2";
import { modifyUserData, deleteUserData, deleteUser } from "../../services/UserService";
import CaptchaSliderComponent from '../utils/CaptchaSliderComponent';
import AddModifyUserDataCommponent from "./AddModifyUserDataComponent";
import PaginationComponent from "../PaginationComponent";

const TableUserDataComponent = ({
    users,
    search,
    selectedDepartment,
    rowsPerPage,
    currentPage,
    setCurrentPage,
    currentUser,
    refreshData,
    token
}) => {

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesName = u.name.toLowerCase().includes(search.toLowerCase());
            const matchesDept = selectedDepartment ? u.departmentId === selectedDepartment : true;
            return matchesName && matchesDept;
        });
    }, [users, search, selectedDepartment]);

    const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
    const currentUsers = filteredUsers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const showCaptcha = user => new Promise((resolve, reject) => {
        const container = document.createElement('div');
        const reactRoot = createRoot(container);
        let completed = false;

        reactRoot.render(
            <CaptchaSliderComponent onSuccess={() => {
                completed = true;
                Swal.close();
                resolve(true);
                setTimeout(() => reactRoot.unmount(), 0);
            }} />
        );

        Swal.fire({
            title: `${user === undefined ? 'Eliminar los datos de usuario' : 'Eliminar el Usuario'}`,
            html: container,
            showConfirmButton: true,
            confirmButtonText: 'Continuar',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            allowOutsideClick: false,
            preConfirm: () => {
                if (!completed) Swal.showValidationMessage('Debes completar el captcha');
            }
        });
    });

    const handleModify = async (userItem) => {
        await AddModifyUserDataCommponent({
            token,
            userItem,
            currentUser,
            action: "modify",
            onConfirm: async (formValues) => {
                const result = await modifyUserData(userItem.id, formValues, token);
                if (result.success) {
                    Swal.fire("Éxito", "Usuario modificado correctamente", "success");
                } else {
                    Swal.fire("Error", result.error || "No se pudo modificar el usuario", "error");
                }
                await refreshData();
            }
        });
    };

    const handleDelete = async (userItem) => {
        try { await showCaptcha(userItem.user); }
        catch { Swal.fire('Atención', 'Captcha no completado', 'warning'); return; }
        let result;
        if (userItem.user === undefined) {
            result = await deleteUserData(userItem.id, token, userItem.version);
            if (result.success) {
                Swal.fire('Éxito', 'Datos de usuario eliminados correctamente', 'success');
            } else {
                Swal.fire('Error', result.error || 'No se pudo eliminar los datos del usuario', 'error');
            }
        } else {
            result = await deleteUser(userItem.userId, token, userItem.userVersion);
            if (result.success) {
                Swal.fire('Éxito', 'Usuario eliminado correctamente', 'success');
            } else {
                Swal.fire('Error', result.error || 'No se pudo eliminar el usuario', 'error');
            }
        }
        await refreshData();
    };

    return (
        <>
            <Table striped hover responsive className="shadow-sm rounded flex-grow-1 mb-0">
                <thead className="table-primary">
                    <tr>
                        <th className="text-center">ID</th>
                        <th className="text-center">Nombre</th>
                        <th className="text-center">Teléfono</th>
                        <th className="text-center">Extensión</th>
                        <th className="text-center">Email</th>
                        <th className="text-center">Usuario</th>
                        <th className="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {currentUsers.map((userItem, idx) => {
                            return (
                                <tr key={idx}>
                                    <td className="text-center"> {userItem.id === undefined ? "-" : userItem.id}</td>
                                    <td className="text-center"> {userItem.name === undefined ? "-" : userItem.name}</td>
                                    <td className="text-center"> {userItem.number === undefined ? "-" : userItem.number}</td>
                                    <td className="text-center"> {userItem.extension === undefined ? "-" : userItem.extension}</td>
                                    <td className="text-center"> {userItem.email === undefined ? "-" : userItem.email}</td>
                                    <td className="text-center"> {userItem.user === undefined ? "No" : "Si"}</td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center flex-wrap">
                                            {currentUser.id !== userItem.id && <Button color="warning" size="sm" className="me-1 mb-1" onClick={() => handleModify(userItem)}>✏️</Button>}
                                            {currentUser.id !== userItem.id && <Button color="danger" size="sm" className="me-1 mb-1" onClick={() => handleDelete(userItem)}>🗑️</Button>}
                                        </div>
                                    </td>
                                </tr>
                            )
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
                    <PaginationComponent currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            )}
        </>
    );
};

export default TableUserDataComponent;
