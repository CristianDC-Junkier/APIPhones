import Swal from "sweetalert2";
import { getDepartmentsList, getDepartmentById, getSubDepartmentsList } from "../../services/DepartmentService";

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

    // Obtener departamentos y subdepartamentos
    let departments = [];
    let subdepartments = [];
    let isDepartmentDisabled = false;
    if (currentUser.usertype === "DEPARTMENT") {
        // Solo su departamento y sus subdepartamentos
        const deptResp = await getDepartmentById(token, currentUser.department);
        const subResp = await getSubDepartmentsList(token, currentUser.department);

        if (deptResp.success) {
            departments = [deptResp.data?.department].filter(Boolean);
            isDepartmentDisabled = true;
        }

        if (subResp.success) {
            subdepartments = subResp.data.subdepartments ?? [];
            subdepartments.unshift({ id: null, name: "-- Seleccionar --" });
        }
    } else {
        // Admin / superadmin: listas completas
        const [deptResp, subResp] = await Promise.all([
            getDepartmentsList(token),
            getSubDepartmentsList(token)
        ]);

        if (deptResp.success) {
            departments = deptResp.data.departments ?? [];
            departments.unshift({ id: null, name: "-- Seleccionar --" });
        }

        if (subResp.success) {
            subdepartments = subResp.data.subdepartments ?? [];
            subdepartments.unshift({ id: null, name: "-- Seleccionar --" });
        }
    }

    // HTML para selects y opciones
    const optionsHtml = types.map(t => `<option value="${t.value}" ${userItem?.usertype === t.value ? "selected" : ""}>${t.label}</option>`).join("");
    const departmentOptions = departments.map(d => `<option value="${d.id}" ${userItem?.departmentId === d.id ? "selected" : ""}>${d.name}</option>`).join("");

    const initialSubDeps = userItem?.departmentId
        ? subdepartments.filter(sd => sd.departmentId === userItem.departmentId)
        : subdepartments;
    const subdepartmentOptions = initialSubDeps.map(s => `<option value="${s.id}" ${userItem?.userData?.subdepartmentId === s.id ? "selected" : ""}>${s.name}</option>`).join("");

    // Estilos
    const rowStyle = 'display:flex; align-items:center; margin-bottom:1rem; font-size:1rem;';
    const labelStyle = 'width:180px; font-weight:bold; text-align:left;';
    const inputStyle = 'flex:1; padding:0.35rem; font-size:1rem; border:1px solid #ccc; border-radius:4px;';

    const step1Html = `
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
    <div>
        <div style="${rowStyle} margin-top: 5vh">
            <label style="${labelStyle}">Usuario <span style="color:red">*</span></label>
            <input id="swal-username" style="${inputStyle}" placeholder="Usuario" value="${userItem?.username || ""}">
        </div>
        <div style="${rowStyle}">
            <label style="${labelStyle}">Contraseña <span style="color:red">*</span></label>
            <div style="flex:1; display:flex; align-items:center;">
                <input id="swal-password" type="password" style="${inputStyle}" placeholder="Contraseña">
                <button type="button" id="toggle-pass" style="margin-left:4px; border:none; background:transparent; cursor:pointer; width:36px; display:flex; justify-content:center; align-items:center;">
                    <i id="icon-pass" class="fas fa-eye-slash"></i>
                </button>
            </div>
        </div>
        <div style="margin-bottom:1rem; font-size:0.75rem; color:gray; text-align:left;">
            Se solicitará cambiar al conectarse por primera vez
        </div>
        <div style="${rowStyle}">
            <label style="${labelStyle}">Tipo de Usuario <span style="color:red">*</span></label>
            <select id="swal-type" style="${inputStyle}">${optionsHtml}</select>
        </div>
        <div style="${rowStyle}">
            <label style="${labelStyle}">Departamento</label>
            <select id="swal-department" style="${inputStyle}" ${isDepartmentDisabled ? "disabled" : ""}>${departmentOptions}</select>
        </div>
        <div style="font-size:0.75rem; color:red; text-align:right;">* Campos obligatorios</div>
    </div>`;

    const step2Html = `
    <div>
        <div style="${rowStyle} margin-top: 5vh">
            <label style="${labelStyle}">Nombre completo <span style="color:red">*</span></label>
            <input id="swal-name" style="${inputStyle}" placeholder="Nombre completo" value="${userItem?.userData?.name || ""}">
        </div>
        <div style="${rowStyle}">
            <label style="${labelStyle}">Extensión</label>
            <input id="swal-extension" style="${inputStyle}" placeholder="Extensión" value="${userItem?.userData?.extension || ""}">
        </div>
        <div style="${rowStyle}">
            <label style="${labelStyle}">Teléfono</label>
            <input id="swal-number" style="${inputStyle}" placeholder="Teléfono" value="${userItem?.userData?.number || ""}">
        </div>
        <div style="${rowStyle}">
            <label style="${labelStyle}">Email</label>
            <input id="swal-email" type="email" style="${inputStyle}" placeholder="Email" value="${userItem?.userData?.email || ""}">
        </div>
        <div style="${rowStyle}">
            <label style="${labelStyle}">Subdepartamento</label>
            <select id="swal-subdepartment" style="${inputStyle}">${subdepartmentOptions}</select>
        </div>
         <div style="${rowStyle}">
            <label style="${labelStyle}">Visible</label>
            <input id="swal-show" type="checkbox" ${userItem?.show ? "checked" : ""} style="transform: scale(1.2);">
        </div>
        <div style="font-size:0.75rem; color:red; text-align:right;">* Campos obligatorios</div>
    </div>`;

    // Paso 1
    const swalStep1 = await Swal.fire({
        title: "Cuenta de Usuario",
        html: step1Html,
        focusConfirm: false,
        width: '600px',
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonText: "Siguiente",
        didOpen: () => {
            const PwdInput = document.getElementById("swal-password");
            const PwdToggle = document.getElementById("toggle-pass");
            const PwdIcon = document.getElementById("icon-pass");

            PwdToggle.addEventListener("click", () => {
                const isHidden = PwdInput.type === "password";
                PwdInput.type = isHidden ? "text" : "password";
                PwdIcon.className = isHidden ? "fas fa-eye" : "fas fa-eye-slash";
            });
        },
        preConfirm: () => {
            const username = document.getElementById("swal-username").value.trim();
            const password = document.getElementById("swal-password").value.trim();
            const usertype = document.getElementById("swal-type").value;
            const departmentIdRaw = document.getElementById("swal-department").value;
            const departmentId = departmentIdRaw === "null" ? null : parseInt(departmentIdRaw, 10);

            if (!username) { Swal.showValidationMessage("El nombre de usuario no puede estar vacío"); return false; }
            if (!password) { Swal.showValidationMessage("La contraseña no puede estar vacía"); return false; }

            return { username, password, usertype, departmentId, version: userItem?.version ? userItem.version : 0 };
        }
    });

    if (!swalStep1.value) return;
    const step1Values = swalStep1.value;

    // Paso 2
    const swalStep2 = await Swal.fire({
        title: "Datos Extendidos",
        html: step2Html,
        focusConfirm: false,
        width: '600px',
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonText: action === "create" ? "Crear" : "Aceptar",
        didOpen: () => {
            const subdepartmentSelect = document.getElementById("swal-subdepartment");
            const filteredSubDeps = subdepartments.filter(sd => sd.departmentId === step1Values.departmentId);
            const options = [{ id: null, name: "-- Seleccionar --" }, ...filteredSubDeps];
            subdepartmentSelect.innerHTML = options.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
        },
        preConfirm: () => {
            const name = document.getElementById("swal-name").value.trim();
            const extension = document.getElementById("swal-extension").value.trim();
            const number = document.getElementById("swal-number").value.trim();
            const email = document.getElementById("swal-email").value.trim();
            const subdepartmentIdRaw = document.getElementById("swal-subdepartment").value;
            const subdepartmentId = subdepartmentIdRaw === "null" ? null : parseInt(subdepartmentIdRaw, 10);
            const show = document.getElementById("swal-show").checked;

            if (!name) { Swal.showValidationMessage("El nombre completo es obligatorio"); return false; }
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { Swal.showValidationMessage("Debe ser un email válido"); return false; }
            if (extension && !/^\d+$/.test(extension)) { Swal.showValidationMessage("La extensión debe ser un número válido"); return false; }
            if (number && !/^\+?\d{9,9}$/.test(number)) { Swal.showValidationMessage("El número de teléfono debe ser válido"); return false; }


            const data = { name, extension, number, email, show, subdepartmentId };

            if (userItem?.departmentId != undefined) data.departmentId = userItem?.userData.departmentId;
            if (userItem?.userData.id != undefined) data.id = userItem?.userData.id;
            if (userItem?.userData.version != undefined) data.version = userItem?.userData.version;

            return data;
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
