import Swal from "sweetalert2";

/**
 * Función invocable para pedir la contraseña temporal de un usuario.
 * Devuelve la contraseña ingresada o null si se cancela.
 *
 * @param {Object} options
 * @param {Object} options.userItem - Usuario al que pedir la contraseña
 * @returns {Promise<string|null>} - Contraseña ingresada o null si se cancela
 */
const PWDAskComponent = async ({ userItem }) => {
    // Estilos inline similares a tu modal original
    const rowStyle = "display:flex; align-items:center; margin-top:1rem; margin-bottom:1rem; font-size:1rem;";
    const labelStyle = "width:150px; font-weight:bold; text-align:left;";
    const inputStyle = "flex:1; padding:0.35rem; font-size:1rem; border:1px solid #ccc; border-radius:4px;";

    const { value: password } = await Swal.fire({
        title: "Contraseña temporal",
        html: `
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" rel="stylesheet"/>
            <p style="margin-bottom:20px;">
                Ingrese la contraseña temporal para <strong>${userItem?.username}</strong>:
            </p>
            <div style="${rowStyle}">
               <label style="${labelStyle}">Contraseña</label>
                <div style="flex:1; display:flex; align-items:center;">
                    <input id="swal-password" type="password" style="${inputStyle}" placeholder="Contraseña temporal" />
                    <button id="toggle-pass" type="button" style="margin-left:4px; border:none; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; width:32px; height:32px;">
                        <i id="icon-pass" class="fas fa-eye-slash" style="font-size:1rem;"></i>
                    </button>
                </div>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonText: "Confirmar",
        width: 500,
        didOpen: () => {
            const pwdInput = document.getElementById("swal-password");
            const toggleBtn = document.getElementById("toggle-pass");
            const icon = document.getElementById("icon-pass");

            toggleBtn.addEventListener("click", () => {
                const isHidden = pwdInput.type === "password";
                pwdInput.type = isHidden ? "text" : "password";
                icon.className = isHidden ? "fas fa-eye" : "fas fa-eye-slash";
            });
        },
        preConfirm: () => {
            const pwd = document.getElementById("swal-password").value.trim();
            if (!pwd) {
                Swal.showValidationMessage("La contraseña no puede estar vacía");
                return false;
            }
            return pwd;
        }
    });

    return password || null;
};

export default PWDAskComponent;
