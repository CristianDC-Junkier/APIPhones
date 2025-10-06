import React, { useMemo } from "react";
import { Table, Button } from "reactstrap";
import { createRoot } from "react-dom/client";
import Swal from "sweetalert2";
import { modifyUser, deleteUser, deleteWorker, markPWDCUser } from "../../services/UserService";
import CaptchaSlider from '../utils/CaptchaSliderComponent';
import AddModifyUser from "./AddModifyUserComponent";
import Pagination from "../PaginationComponent";
import PWDAsk from "./PWDAskComponent";

const TableUserAccountComponent = ({
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
        () => users.filter(u => u.username.toLowerCase().includes(search.toLowerCase())),
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
        //console.log(userItem);
        await AddModifyUser({
            token,
            userItem,
            currentUser,
            action: "modify",
            onConfirm: async (formValues) => {
                const result = await modifyUser(userItem.id, formValues, token);
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
        try { await showCaptcha(userItem.id); }
        catch { Swal.fire('Atención', 'Captcha no completado', 'warning'); return; }
        const result = await deleteUser(userItem.id, token, userItem.version);
        if (result.success) {
            Swal.fire('Éxito', 'Usuario eliminado correctamente', 'success');
            await refreshData();
            if (userItem.id === currentUser.id) window.location.href = "/listin-telefonico/login";
        } else {
            alert(result.error);
            Swal.fire('Error', result.error || 'No se pudo eliminar el usuario', 'error');
        }
    };

    const handlePWDC = async (userItem) => {
        try {
            const password = await PWDAsk({ userItem });
            if (!password) return;

            const result = await markPWDCUser(userItem.id, { password }, token, userItem.version);
            if (result.success) {
                await Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Contraseña reiniciada correctamente',
                    confirmButtonColor: '#3085d6',
                });
                await refreshData();
            } else {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.error || 'No se pudo reiniciar la contraseña al usuario',
                    confirmButtonColor: '#d33',
                });
            }
        } catch (err) {
            Swal.fire("Error", err.message || "No se pudo marcar contraseña temporal", "error");
        }
    };

    const tipoLabels = {
        ADMIN: "Administrador",
        SUPERADMIN: "Superadministrador",
        WORKER: "Trabajador",
        DEPARTMENT: "Jefe de Departamento"
    };

    return (
        <>
            <Table striped hover responsive className="shadow-sm rounded flex-grow-1">
                <thead className="table-primary">
                    <tr>
                        <th className="text-center">ID</th>
                        <th className="text-center">Usuario</th>
                        <th className="text-center">Tipo</th>
                        <th className="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {currentUsers.map((userItem, idx) => {
                        if (currentUser.id !== userItem.id) {

                            let canModify = false;
                            let canDelete = false;
                            let canPWDC = false;

                            switch (userItem.usertype) {
                                case "SUPERADMIN":
                                    canModify = currentUser.usertype === "SUPERADMIN";
                                    break;
                                case "ADMIN":
                                case "DEPARTMENT":
                                    canModify = ["ADMIN", "SUPERADMIN"].includes(currentUser.usertype);
                                    canDelete = ["ADMIN", "SUPERADMIN"].includes(currentUser.usertype);
                                    canPWDC = ["ADMIN", "SUPERADMIN"].includes(currentUser.usertype);
                                    break;
                                case "WORKER":
                                    canModify = currentUser.usertype !== "WORKER";
                                    canDelete = currentUser.usertype !== "WORKER";
                                    canPWDC = currentUser.usertype !== "WORKER";
                                    break;
                                default:
                                    break;
                            }

                            return (
                                <tr key={idx} >
                                    <td className="text-center"> {userItem.id}</td>
                                    <td className="text-center"> {userItem.username}</td>
                                    <td className="text-center"> {tipoLabels[userItem.usertype]}</td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center flex-wrap">
                                            {canPWDC && <Button color="info" size="sm" className="me-1 mb-1" onClick={() => handlePWDC(userItem)}>🔑</Button>}
                                            {canModify && <Button color="warning" size="sm" className="me-1 mb-1" onClick={() => handleModify(userItem)}>✏️</Button>}
                                            {canDelete && <Button color="danger" size="sm" className="me-1 mb-1" onClick={() => handleDelete(userItem)}>🗑️</Button>}
                                        </div>
                                    </td>
                                </tr>
                            )
                        };
                    })}

                    {rowsPerPage - currentUsers.length > 0 &&
                        [...Array(rowsPerPage - currentUsers.length)].map((_, idx) => (
                            <tr key={`empty-${idx}`} style={{ height: '50px' }}>
                                <td colSpan={4}></td>
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

export default TableUserAccountComponent;
