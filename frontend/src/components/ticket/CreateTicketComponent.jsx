import Swal from "sweetalert2";

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
        { value: "-- Seleccionar --"},
        { value: "Error en la información del listín"},
        { value: "Solicitud de cambios en la información del listín"},
        { value: "Eliminación de mi información"},
        { value: "Mi información no debería a parecer en el listín"},
        { value: "Otro"}
    ];

    // HTML para selects y opciones
    const optionsHtml = topics.map(t => {
        if (t.value.slice(0, 3) === "-- ") {
            return `<option value="" selected disabled>${t.value}</option>`;
        }
        return `<option value="${t.value}">${t.value}</option>`;
    }).join("");

    // Estilos
    const rowStyle = 'display:flex; align-items:center; margin-bottom:1rem; font-size:1rem;';
    const labelStyle = 'width:180px; font-weight:bold; text-align:left;';
    const selectStyle = 'flex:1; width:100%; padding:0.35rem; font-size:1rem; border:1px solid #ccc; border-radius:4px;';
    const textareaStyle = 'flex:1; width:100%; height:120px; padding:0.35rem; font-size:1rem; border:1px solid #ccc; border-radius:4px;';
    let currentLength = 0;

    const stepHtml = `
    <div>
        <div style="${rowStyle}">
            <label style="${labelStyle}">Asunto<span style="color:red">*</span></label>
            <select id="swal-topic" style="${selectStyle}">${optionsHtml}</select>
        </div>
        <div style="${rowStyle} margin-top: 5vh">
            <label style="${labelStyle}">Mensaje <span style="color:red">*</span></label>
            <textarea id="swal-text" style="${textareaStyle}" placeholder="Detalle el problema aquí"></textarea>
        </div>
        <div style="font-size:0.75rem; text-align:right;"> ${currentLength}/500</div>
        <div style="font-size:0.75rem; color:red; text-align:right;">* Campos obligatorios</div>
    </div>`;
    
    const swalStep = await Swal.fire({
        title: "Ticket",
        html: stepHtml,
        focusConfirm: false,
        width: '600px',
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonText: "Enviar",
        didRender: () => {
            const text = document.getElementById("swal-text").value.trim();
            currentLength = text.length;
        },
        preConfirm: () => {
            const topic = document.getElementById("swal-topic").value;
            const text = document.getElementById("swal-text").value.trim();

            if (!topic) { Swal.showValidationMessage("Debe elegir un asunto"); return false; }
            if (!text) { Swal.showValidationMessage("Detalle cual es el motivo del ticket"); return false; }
            if (text.length > 10) { Swal.showValidationMessage(`Ha superado el límite de carácteres permitido. ${text.length}/500`); return false; }

            return { topic, information: text, idAffectedData: dataItem.id };
        }
    });

    if (!swalStep.value) return;
    const stepValues = swalStep.value;

    onConfirm(stepValues);

};

export default CreateTicketComponent;
