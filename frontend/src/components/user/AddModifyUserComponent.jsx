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
 * @param {string} props.token - Token de autenticación del usuario actual.
 * @param {Object} [props.userItem] - Usuario a modificar (si action === "modify").
 * @param {Object} props.currentUser - Usuario que está realizando la acción.
 * @param {string} props.action - "create" o "modify".
 * @param {Function} props.onConfirm - Callback que se ejecuta al confirmar los datos, recibe { userAccount, userData, userAccountId? }.
 */
const AddModifyUserComponent = async ({ token, userItem, currentUser, action, onConfirm }) => {

    // Tipos de usuario disponibles según permisos del usuario actual
    const types = [{ label: "Trabajador", value: "WORKER" }];
    if (currentUser.usertype === "ADMIN" || currentUser.usertype === "SUPERADMIN") {
        types.push({ label: "Jefe de Departamento", value: "DEPARTMENT" });
        types.push({ label: "Administrador", value: "ADMIN" });
    }
    if (currentUser.usertype === "SUPERADMIN") {
        types.push({ label: "SuperAdmin", value: "SUPERADMIN" });
    }

    // Obtener departamentos y subdepartamentos desde el backend
    const depResponse = await getDepartmentsList(token);
    const departments = depResponse.data.departments;

    const subDepResponse = await getSubDepartmentsList(token);
    const subdepartments = subDepResponse.data.subdepartments;

    // Filtrado de departamentos y subdepartamentos según permisos del usuario actual
    if (currentUser.usertype === "DEPARTMENT") {
        const userDepId = currentUser.departmentId;
        if (userDepId) {
            const userDep = departments.find(d => d.id === userDepId);
            if (userDep) {
                departments.splice(0, departments.length, userDep);
                const relatedSubDeps = subdepartments.filter(sd => sd.departmentId === userDepId);
                subdepartments.splice(0, subdepartments.length, ...relatedSubDeps);
            } else {
                // Usuario DEPARTMENT sin departamento asignado
                departments.splice(0, departments.length, { id: null, name: "-- Seleccionar --" });
                subdepartments.splice(0, subdepartments.length, { id: null, name: "-- Seleccionar --" });
            }
        } else {
            // Usuario DEPARTMENT sin departamento asignado
            departments.splice(0, departments.length, { id: null, name: "-- Seleccionar --" });
            subdepartments.splice(0, subdepartments.length, { id: null, name: "-- Seleccionar --" });
        }
    } else {
        // Para todos los demás usuarios, añadir opción vacía al inicio
        departments.unshift({ id: null, name: "-- Seleccionar --" });
        subdepartments.unshift({ id: null, name: "-- Seleccionar --" });
    }

    // HTML para selects de tipo de usuario, departamentos y subdepartamentos
    const optionsHtml = types.map(tipo => `<option value="${tipo.value}" ${userItem?.usertype === tipo.value ? "selected" : ""}>${tipo.label}</option>`).join("");
    const departmentOptions = departments.map(d => `<option value="${d.id}" ${userItem?.departmentId === d.id ? "selected" : ""}>${d.name}</option>`).join("");

    // Subdepartamentos iniciales según el usuario a modificar
    const initialSubDeps = userItem?.departmentId
        ? subdepartments.filter(sd => sd.departmentId === userItem.departmentId)
        : subdepartments;
    const subdepartmentOptions = initialSubDeps.map(s => `<option value="${s.id}" ${userItem?.subdepartmentId === s.id ? "selected" : ""}>${s.name}</option>`).join("");

    // Estilos inline para SweetAlert2
    const rowStyle = 'display:flex; align-items:center; margin-bottom:1rem; font-size:1rem;';
    const labelStyle = 'width:180px; font-weight:bold; text-align:left;';
    const inputStyle = 'flex:1; padding:0.35rem; font-size:1rem; border:1px solid #ccc; border-radius:4px;';

    const step1Html = `
<div>
  <div style="${rowStyle} margin-top: 5vh">
    <label style="${labelStyle}">Usuario <span style="color:red">*</span></label>
    <input id="swal-username" style="${inputStyle}" placeholder="Usuario" value="${userItem?.username || ""}">
  </div>

  <div style="${rowStyle}">
    <label style="${labelStyle}">Contraseña <span style="color:red">*</span></label>
    <input id="swal-password" type="password" style="${inputStyle}" placeholder="Contraseña">
  </div>

  <div style="margin-bottom:1rem; font-size:0.75rem; color:gray; text-align:left;">
    Se solicitará cambiar al conectarse por primera vez
  </div>

  <div style="${rowStyle}">
    <label style="${labelStyle}">Tipo de Usuario <span style="color:red">*</span></label>
    <select id="swal-type" style="${inputStyle}">${optionsHtml}</select>
  </div>

  <div style="font-size:0.75rem; color:red; text-align:right;">* Campos obligatorios</div>
</div>
`;

    const step2Html = `
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

  <div style="font-size:0.75rem; color:red; text-align:right;">* Campos obligatorios</div>
</div>
`;

    let step1Values = null;

    // Paso 1: Cuenta
    const swalStep1 = await Swal.fire({
        title: "Cuenta de Usuario",
        html: step1Html,
        focusConfirm: false,
        width: '600px',
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonText: "Siguiente",
        preConfirm: () => {
            const username = document.getElementById("swal-username").value.trim();
            const password = document.getElementById("swal-password").value.trim();
            const usertype = document.getElementById("swal-type").value;

            if (!username) { Swal.showValidationMessage("El nombre de usuario no puede estar vacío"); return false; }
            if (!password) { Swal.showValidationMessage("La contraseña no puede estar vacía"); return false; }

            return { username, password, usertype };
        }
    });

    if (!swalStep1.value) return;
    step1Values = swalStep1.value;

    // Paso 2: Datos extendidos
    const swalStep2 = await Swal.fire({
        title: "Datos Extendidos",
        html: step2Html,
        focusConfirm: false,
        width: '600px',
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonText: action === "create" ? "Crear" : "Aceptar",
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

            if (!name) { Swal.showValidationMessage("El nombre completo es obligatorio"); return false; }
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { Swal.showValidationMessage("Debe ser un email válido"); return false; }
            if (extension && !/^\d+$/.test(extension)) { Swal.showValidationMessage("La extensión debe ser un número válido"); return false; }
            if (number && !/^\+?\d{6,15}$/.test(number)) { Swal.showValidationMessage("El número de teléfono debe ser válido"); return false; }

            return { name, extension, number, email, departmentId, subdepartmentId };
        }
    });

    if (!swalStep2.value) return;

    if (action === "modify" && !step1Values.password) {
        onConfirm({ userAccount: step1Values, userData: swalStep2.value, userAccountId: userItem?.userAccountId || null });
    } else {
        onConfirm({ userAccount: step1Values, userData: swalStep2.value });
    }
};

export default AddModifyUserComponent;
