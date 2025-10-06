import React, { useEffect } from "react";
import Swal from "sweetalert2";
import { changePasswordPWD } from "../../services/UserService";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const PWDChangeComponent = ({ user, token }) => {
    const { update, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const askPassword = async () => {
            const rowStyle = "display:flex; align-items:center; margin-bottom:1rem; font-size:1rem;";
            const labelStyle = "width:150px; font-weight:bold; text-align:left;";
            const inputStyle = "flex:1; padding:0.35rem; font-size:1rem; border:1px solid #ccc; border-radius:4px;";

            const { value: password } = await Swal.fire({
                title: "Cambio de contraseña",
                html: `
                    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
                    <p style="margin-bottom:1rem;">Ingrese la nueva contraseña para <strong>${user.username}</strong>:</p>
                    <div style="${rowStyle}">
                        <label style="${labelStyle}">Contraseña</label>
                        <div style="flex:1; display:flex; align-items:center;">
                            <input id="swal-password" type="password" style="${inputStyle}" placeholder="Nueva contraseña" />
                            <button id="toggle-pass" type="button" style="margin-left:4px; border:none; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; width:32px; height:32px;">
                                <i id="icon-pass" class="fas fa-eye-slash" style="font-size:1rem;"></i>
                            </button>
                        </div>
                    </div>
                `,
                showCancelButton: false, 
                confirmButtonText: "Confirmar",
                width: 500,
                focusConfirm: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: true,
                showCloseButton: false,
                preConfirm: () => {
                    const input = document.getElementById("swal-password");
                    const value = input.value.trim();
                    if (!value) Swal.showValidationMessage("La contraseña no puede estar vacía");
                    return value || false;
                },
                didOpen: () => {
                    const input = document.getElementById("swal-password");
                    const toggle = document.getElementById("toggle-pass");
                    const icon = document.getElementById("icon-pass");
                    toggle.addEventListener("click", () => {
                        console.log("Click");
                        const isHidden = input.type === "password";
                        input.type = isHidden ? "text" : "password";
                        icon.className = isHidden ? "fas fa-eye" : "fas fa-eye-slash";
                    });
                    input.focus();
                },
            });

            if (password) {
                const res = await changePasswordPWD({ newPassword: password }, token);

                if (res.success) {
                    update({ ...user, forcePwdChange: false });
                    await Swal.fire("¡Éxito!", "Contraseña actualizada correctamente", "success");
                } else {
                    await Swal.fire("Error", res.error || "No se pudo cambiar la contraseña", "error");
                    await logout();
                    navigate("/login", { replace: true });
                }
            }
        };

        askPassword();
    }, [user, token, update, logout, navigate]);

    return null; // No renderiza nada
};

export default PWDChangeComponent;
