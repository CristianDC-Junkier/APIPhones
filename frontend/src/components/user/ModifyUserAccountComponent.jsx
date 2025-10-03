import Swal from "sweetalert2";

/**
 * Componente que permite modificar a un usuario su propio perfil mediante un modal de SweetAlert2.
 *  
 * @param {Object} props
 * @param {Object} [props.profile] - Perfil a modificar.
 * @param {Function} props.onConfirm - Callback que se ejecuta al confirmar los datos, 
 * recibe { username, oldPassword, newPassword, usertype?, department? }.
 */
const ModifyUserAccountComponent = async ({ profile, onConfirm }) => {
    const isAdmin = ["ADMIN", "SUPERADMIN"].includes(profile?.usertype);

    // Estilos inline
    const rowStyle = 'display:flex; align-items:center; margin-bottom:1rem; font-size:1rem;';
    const labelStyle = 'width:180px; font-weight:bold; text-align:left;';
    const inputStyle = 'flex:1; padding:0.35rem; font-size:1rem; border:1px solid #ccc; border-radius:4px;';

    // Opciones dinámicas para el select según usertype actual
    const usertypeOptions = `
        <option value="WORKER">Trabajador</option>
        <option value="DEPARTMENT">Jefe de departamento</option>
        <option value="ADMIN" ${profile?.usertype === "ADMIN" ? "selected" : ""}>Admin</option>
        ${profile?.usertype === "SUPERADMIN"
            ? `<option value="SUPERADMIN" selected>Superadmin</option>`
            : ""
        }
    `;

    // HTML dinámico según tipo de usuario
    const stepHtml = `
<div style="margin-top: 5vh">
  <div style="${rowStyle}">
    <label style="${labelStyle}">Usuario <span style="color:red">*</span></label>
    <input id="swal-username" style="${inputStyle}" placeholder="Usuario" value="${profile?.username || ""}">
  </div>
  <div style="${rowStyle}">
    <label style="${labelStyle}">Contraseña actual <span style="color:red">*</span></label>
    <input id="swal-oldpassword" type="password" style="${inputStyle}" placeholder="Contraseña actual">
  </div>
  <div style="${rowStyle}">
    <label style="${labelStyle}">Nueva contraseña <span style="color:red">*</span></label>
    <input id="swal-newpassword" type="password" style="${inputStyle}" placeholder="Nueva contraseña">
  </div>

  ${isAdmin
            ? `
      <div style="${rowStyle}">
        <label style="${labelStyle}">Tipo de Usuario <span style="color:red">*</span></label>
        <select id="swal-usertype" style="${inputStyle}">
          ${usertypeOptions}
        </select>
      </div>
      <div style="${rowStyle}">
        <label style="${labelStyle}">Departamento <span style="color:red">*</span></label>
        <input id="swal-department" style="${inputStyle}" placeholder="Departamento" value="${profile?.department || ""}">
      </div>
    `
            : ""
        }

  <div style="font-size:0.75rem; color:red; text-align:right;">* Campos obligatorios</div>
</div>
`;

    const swalStep = await Swal.fire({
        title: "Modificar Perfil",
        html: stepHtml,
        focusConfirm: false,
        width: '600px',
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonText: "Aceptar",
        preConfirm: () => {
            const username = document.getElementById("swal-username").value.trim();
            const oldPassword = document.getElementById("swal-oldpassword").value.trim();
            const newPassword = document.getElementById("swal-newpassword").value.trim();

            if (!username) {
                Swal.showValidationMessage("El nombre de usuario es obligatorio");
                return false;
            }
            if (!oldPassword) {
                Swal.showValidationMessage("La contraseña actual es obligatoria");
                return false;
            }
            if (!newPassword) {
                Swal.showValidationMessage("La nueva contraseña es obligatoria");
                return false;
            }

            const result = { username, oldPassword, newPassword };

            if (isAdmin) {
                const usertype = document.getElementById("swal-usertype").value;
                const department = document.getElementById("swal-department").value.trim();

                if (!usertype) {
                    Swal.showValidationMessage("El tipo de usuario es obligatorio");
                    return false;
                }
                if (!department) {
                    Swal.showValidationMessage("El departamento es obligatorio");
                    return false;
                }

                result.usertype = usertype;
                result.department = department;
            }

            return result;
        }
    });

    if (!swalStep.value) return;

    onConfirm(swalStep.value);
};

export default ModifyUserAccountComponent;
