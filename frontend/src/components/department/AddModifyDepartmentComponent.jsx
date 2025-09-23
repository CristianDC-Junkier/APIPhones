import Swal from "sweetalert2";

/**
 * Componente para crear o modificar un departamento
 * @param {Object} props
 * @param {Object} props.department - Departamento a modificar (undefined si crear)
 * @param {"create"|"modify"} [props.action="create"] - Acción a realizar
 * @param {Function} props.onConfirm - Callback con los datos del formulario al confirmar
 */
const AddModifyDepartmentComponent = async ({ department, action = "create", onConfirm }) => {

    const rowStyle = 'display:flex; align-items:center; margin-bottom:1rem; font-size:1rem; width:100%;';
    const labelStyle = 'width:150px; font-weight:bold; text-align:left; margin-right:1rem;';
    const inputStyle = 'flex:1; padding:0.5rem; font-size:1rem; border:1px solid #ccc; border-radius:4px;';

    const html = `
    <div style="width:100%; max-width:600px;">
        <div style="${rowStyle} margin-top: 5vh">
            <label style="${labelStyle}">Nombre <span style="color:red">*</span></label>
            <input id="swal-name" style="${inputStyle}" value="${department?.name || ""}" placeholder="Nombre del departamento">
        </div>
        <div style="font-size:0.75rem; color:red; text-align:right;">* Campo obligatorio</div>
    </div>
    `;

    const result = await Swal.fire({
        title: action === "create" ? "Crear Departamento" : "Modificar Departamento",
        html,
        focusConfirm: false,
        width: '600px',
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonText: action === "create" ? "Crear" : "Aceptar",
        preConfirm: () => {
            const name = document.getElementById("swal-name").value.trim();
            if (!name) {
                Swal.showValidationMessage("El nombre es obligatorio");
                return false;
            }
            return { name };
        }
    });

    if (!result.value) return;

    onConfirm({ id: department?.id || null, ...result.value });
};

export default AddModifyDepartmentComponent;
