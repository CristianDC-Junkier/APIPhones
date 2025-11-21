import Swal from "sweetalert2";

const AddModifyMailProfileComponent = async ({ profile, onConfirm }) => { 

    // Estilos
    const rowStyle = 'display:flex; align-items:center; margin-bottom:1rem; font-size:1rem;';
    const labelStyle = 'width:180px; font-weight:bold; text-align:left;';
    const inputStyle = 'flex:1; padding:0.35rem; font-size:1rem; border:1px solid #ccc; border-radius:4px;';

    const stepHtml = `
    <div>
        <div style="margin-bottom:1rem; font-size:0.75rem; text-align:left; color:black;">
            Este correo se usará para mandar notificaciones en caso de que se genere un nuevo ticket.
        </div>
        <div style="${rowStyle} margin-top: 5vh">
            <label style="${labelStyle}">Correo Electrónico</label>
            <input id="swal-mail" style="${inputStyle}" placeholder="Email" value="${profile?.mail || ""}">
        </div>
        <div style="margin-bottom:1rem; font-size:0.75rem; color:gray; text-align:right;">
            Deje el espacio vacio en caso de querer quitar el correo
        </div>
    </div>`;

    const swalStep = await Swal.fire({
        title: "Añadir Email",
        html: stepHtml,
        allowOutsideClick: false,
        allowEscapeKey: false,
        width: '600px',
        showCancelButton: false,
        cancelButtonText: "Cancelar",
        confirmButtonText: "Aceptar",
        preConfirm: () => {
            const mail = document.getElementById("swal-mail").value.trim();

            if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) { Swal.showValidationMessage("Debe ser un email válido"); return false; }

            return mail === "" ? null : mail;
        }
    }); 

    onConfirm({ mail: swalStep.value });
}

export default AddModifyMailProfileComponent;