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
const ModifyUserDataComponent = async ({ userItem, action, onConfirm }) => {

    // Obtener departamentos y subdepartamentos
    let departments = [];
    let subdepartments = [];

    const [deptResp, subResp] = await Promise.all([
        getDepartmentsList(),
        getSubDepartmentsList()
    ]);

    if (deptResp.success) {
        departments = deptResp.data.departments ?? [];
        departments.unshift({ id: null, name: "-- Seleccionar --" });
    }

    if (subResp.success) {
        subdepartments = subResp.data.subdepartments ?? [];
        subdepartments.unshift({ id: null, name: "-- Seleccionar --" });
    }


    // HTML para selects y opciones
    const departmentOptions = departments.map(d => `<option value="${d.id}" ${userItem?.departmentId === d.id ? "selected" : ""}>${d.name}</option>`).join("");

    const initialSubDeps = userItem?.departmentId
        ? subdepartments.filter(sd => sd.departmentId === userItem.departmentId)
        : subdepartments;
    const subdepartmentOptions = initialSubDeps.map(s => `<option value="${s.id}" ${userItem?.subdepartmentId === s.id ? "selected" : ""}>${s.name}</option>`).join("");


    // Estilos
    const rowStyle = 'display:flex; align-items:center; margin-bottom:1rem; font-size:1rem;';
    const labelStyle = 'width:180px; font-weight:bold; text-align:left;';
    const inputStyle = 'flex:1; padding:0.35rem; font-size:1rem; border:1px solid #ccc; border-radius:4px;';

    const Html = `
    <div>
        <div style="${rowStyle} margin-top: 5vh">
            <label style="${labelStyle}">Nombre completo <span style="color:red">*</span></label>
            <input id="swal-name" style="${inputStyle}" placeholder="Nombre completo" value="${userItem?.name || ""}">
        </div>
        <div style="${rowStyle}">
            <label style="${labelStyle}">Extensión</label>
            <input id="swal-extension" style="${inputStyle}" placeholder="Extensión" value="${userItem?.extension || ""}">
        </div>
        <div style="${rowStyle}">
            <label style="${labelStyle}">Teléfono</label>
            <input id="swal-number" style="${inputStyle}" placeholder="Teléfono" value="${userItem?.number || ""}">
        </div>
        <div style="${rowStyle}">
            <label style="${labelStyle}">Email</label>
            <input id="swal-email" type="email" style="${inputStyle}" placeholder="Email" value="${userItem?.email || ""}">
        </div>
        <div style="${rowStyle}">
            <label style="${labelStyle}">Departamento</label>
            <select id="swal-department" style="${inputStyle}">${departmentOptions}</select>
        </div>
        <div style="${rowStyle}">
            <label style="${labelStyle}">Subdepartamento</label>
            <select id="swal-subdepartment" style="${inputStyle}">${subdepartmentOptions}</select>
        </div>
         <div style="${rowStyle}">
            <label style="${labelStyle}">Visible</label>
            <input id="swal-show" type="checkbox" ${userItem?.show !== false ? "checked" : ""} style="transform: scale(1.2);">
        </div>
        <div style="font-size:0.75rem; color:red; text-align:right;">* Campos obligatorios</div>
        </div>`;

    const swalStep = await Swal.fire({
        title: "Datos de Usuario",
        html: Html,
        focusConfirm: false,
        width: '600px',
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonText: "Aceptar",
        didOpen: () => {
            const departmentSelect = document.getElementById("swal-department");
            const subdepartmentSelect = document.getElementById("swal-subdepartment");

            departmentSelect.addEventListener("change", (e) => {
                const selectedDep = parseInt(e.target.value, 10);
                const filteredSubDeps = subdepartments.filter(sd => sd.departmentId === selectedDep);
                const options = [{ id: null, name: "-- Seleccionar --" }, ...filteredSubDeps];
                subdepartmentSelect.innerHTML = options.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
            });
        },
        preConfirm: () => {
            const name = document.getElementById("swal-name").value.trim();
            const extension = document.getElementById("swal-extension").value.trim();
            const number = document.getElementById("swal-number").value.trim();
            const email = document.getElementById("swal-email").value.trim();
            const departmentIdRaw = document.getElementById("swal-department").value;
            const departmentId = departmentIdRaw === "null" ? null : parseInt(departmentIdRaw, 10);
            const subdepartmentIdRaw = document.getElementById("swal-subdepartment").value;
            const subdepartmentId = subdepartmentIdRaw === "null" ? null : parseInt(subdepartmentIdRaw, 10);
            const show = document.getElementById("swal-show").checked;

            if (!name) { Swal.showValidationMessage("El nombre completo es obligatorio"); return false; }
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { Swal.showValidationMessage("Debe ser un email válido"); return false; }
            if (extension && !/^\d+$/.test(extension)) { Swal.showValidationMessage("La extensión debe ser un número válido"); return false; }
            if (number && !/^\+?\d{9,9}$/.test(number)) { Swal.showValidationMessage("El número de teléfono debe ser válido"); return false; }

            const data = { name, extension, number, email, show, departmentId, subdepartmentId };
            if (userItem?.id != undefined) data.id = userItem.id;
            if (userItem?.version != undefined) data.version = userItem.version;

            return data;
        }
    });
    if (!swalStep.value) return;
    if (action === "modify") {
        onConfirm({ userData: swalStep.value, userAccountId: userItem?.userAccountId || null });
    } else {
        onConfirm(swalStep.value);
    }
};

export default ModifyUserDataComponent;
