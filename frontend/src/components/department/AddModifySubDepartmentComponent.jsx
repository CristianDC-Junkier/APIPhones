import Swal from "sweetalert2";

/**
 * Componente para crear o modificar un subdepartamento
 * @param {Object} props
 * @param {Array} props.departments - Departamentos disponibles para asignar
 * @param {Object} props.subdepartment - Subdepartamento a modificar (undefined si crear)
 * @param {"create"|"modify"} [props.action="create"] - Acción a realizar
 * @param {Function} props.onConfirm - Callback con los datos del formulario al confirmar
 */
const AddModifySubdepartmentComponent = async ({ departments, subdepartment, action = "create", onConfirm }) => {

    const departmentOptions = departments
        .map(d => {
            const selected = departments.length === 1 || subdepartment?.departmentId === d.id ? "selected" : "";
            return `<option value="${d.id}" ${selected}>${d.name}</option>`;
        })
        .join("");

    // Determinar si el select debe estar deshabilitado
    const isDisabled = departments.length === 1;

    const rowStyle = 'display:flex; flex-direction:row; align-items:center; margin-bottom:1rem; font-size:1rem; width:100%;';
    const labelStyle = 'width:150px; font-weight:bold; text-align:left; margin-right:1rem;';
    const inputStyle = 'flex:1; padding:0.5rem; font-size:1rem; border:1px solid #ccc; border-radius:4px;';

    const html = `
<div style="width:100%; max-width:600px;">
  <div style="${rowStyle} margin-top: 5vh">
    <label style="${labelStyle}">Nombre <span style="color:red">*</span></label>
    <input id="swal-name" style="${inputStyle}" placeholder="Nombre del subdepartamento" value="${subdepartment?.name || ""}">
  </div>
  <div style="${rowStyle}">
    <label style="${labelStyle}">Departamento <span style="color:red">*</span></label>
    <select id="swal-department" style="${inputStyle}" ${isDisabled ? "disabled" : ""}>
      ${departmentOptions}
    </select>
  </div>
  <div style="font-size:0.75rem; color:red; text-align:right;">* Campos obligatorios</div>
</div>
`;

    const result = await Swal.fire({
        title: action === "create" ? "Crear Subdepartamento" : "Modificar Subdepartamento",
        html,
        focusConfirm: false,
        width: '600px',
        innerHeight: '400px',
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonText: action === "create" ? "Crear" : "Aceptar",
        customClass: {
            popup: 'swal-wide' 
        },
        preConfirm: () => {
            const name = document.getElementById("swal-name").value.trim();
            // Si hay solo un departamento, tomar el primero directamente
            const departmentId = document.getElementById("swal-department").value;

            if (!name) { Swal.showValidationMessage("El nombre es obligatorio"); return false; }
            if (!departmentId) { Swal.showValidationMessage("Debe seleccionar un departamento"); return false; }

            return { name, departmentId };
        }
    });

    if (!result.value) return;

    onConfirm({ id: subdepartment?.id || null, ...result.value });
};

export default AddModifySubdepartmentComponent;
