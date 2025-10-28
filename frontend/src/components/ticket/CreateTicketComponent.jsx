import Swal from "sweetalert2";
import { getDepartmentsList, getSubDepartmentsList } from "../../services/DepartmentService";

/**
 * Componente que permite crear o modificar un usuario mediante un modal de SweetAlert2.
 * 
 * Filtra departamentos y subdepartamentos según permisos del usuario actual:
 * - Los usuarios tipo DEPARTMENT solo pueden ver su departamento y sus subdepartamentos.
 * - Para otros usuarios, se añade opción vacía "-- Seleccionar --".
 * - Todos los usuarios tienen opción vacía en subdepartamento al crear nuevo usuario.
 * 
 * @param {Object} props
 * @param {Object} [props.userItem] - Usuario a modificar (si action === "modify").
 * @param {Object} props.currentUser - Usuario que está realizando la acción.
 * @param {string} props.action - "create" o "modify".
 * @param {Function} props.onConfirm - Callback que se ejecuta al confirmar los datos, recibe { userAccount, userData, userAccountId? }.
 */
const CreateTicketComponent = async ({ dataItem, onConfirm }) => {

    // Tipos de usuario disponibles según permisos del usuario actual
    const topics = [
        { label: "-- Seleccionar --", value: null },
        { label: "Error en la información del listín", value: "Error" },
        { label: "Solicitud de cambios en la información del listín", value: "Change" },
        { label: "Eliminación de mi información", value: "Delete" },
        { label: "Mi información no debería a parecer en el listín", value: "NotVisible" },
        { label: "Otro", value: "Other" }
    ];

    // HTML para selects y opciones
    const optionsHtml = topics.map(t => `<option value="${t.value}">${t.label}</option>`).join("");

    // Estilos
    const rowStyle = 'display:flex; align-items:center; margin-bottom:1rem; font-size:1rem;';
    const labelStyle = 'width:180px; font-weight:bold; text-align:left;';
    const inputStyle = 'flex:1; padding:0.35rem; font-size:1rem; border:1px solid #ccc; border-radius:4px;';

    const stepHtml = `
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
    <div>
        <div style="${rowStyle}">
            <label style="${labelStyle}">Asunto<span style="color:red">*</span></label>
            <select id="swal-topic" style="${inputStyle}">${optionsHtml}</select>
        </div>
        <div style="${rowStyle} margin-top: 5vh">
            <label style="${labelStyle}">Mensaje <span style="color:red">*</span></label>
            <textarea id="swal-text" style="${inputStyle}" placeholder="Detalle el problema aquí"></textarea>
        </div>
        <div style="font-size:0.75rem; color:red; text-align:right;">* Campos obligatorios</div>
    </div>`;

    const swalStep1 = await Swal.fire({
        title: "Ticket",
        html: stepHtml,
        focusConfirm: false,
        width: '600px',
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonText: "Enviar",
        preConfirm: () => {
            const topic = document.getElementById("swal-topic").value;
            const text = document.getElementById("swal-text").value.trim();

            if (!topic) { Swal.showValidationMessage("Debe elegir un asunto"); return false; }
            if (!text) { Swal.showValidationMessage("Detalle cual es el motivo del ticket"); return false; }

            return { topic, text };
        }
    });

    if (!swalStep1.value) return;
    const stepValues = swalStep1.value;

    onConfirm(stepValues);

};

export default CreateTicketComponent;
