import Swal from "sweetalert2";
import { getDepartmentsList, getSubDepartmentsList } from "../../services/DepartmentService";

const AddModifyUserComponent = async ({ token, userItem, currentUser, action, onConfirm }) => {

    const types = [{ label: "Trabajador", value: "WORKER" }];
    if (currentUser.usertype === "ADMIN" || currentUser.usertype === "SUPERADMIN") {
        types.push({ label: "Jefe de Departamento", value: "DEPARTMENT" });
        types.push({ label: "Administrador", value: "ADMIN" });
    }
    if (currentUser.usertype === "SUPERADMIN") {
        types.push({ label: "SuperAdmin", value: "SUPERADMIN" });
    }
    let response = await getDepartmentsList(token);
    const departments = response.data.departments;
    response = await getSubDepartmentsList(token);
    const subdepartments = response.data.subdepartments;

    const optionsHtml = types.map(tipo => `<option value="${tipo.value}" ${userItem?.usertype === tipo.value ? "selected" : ""}>${tipo.label}</option>`).join("");
    const departmentOptions = departments.map(d => `<option value="${d.id}" ${userItem?.departmentId === d.id ? "selected" : ""}>${d.name}</option>`).join("");
    const subdepartmentOptions = subdepartments.map(s => `<option value="${s.id}" ${userItem?.subdepartmentId === s.id ? "selected" : ""}>${s.name}</option>`).join("");

    const rowStyleStep1 = 'display:flex; align-items:center; margin-bottom:1rem; font-size:1rem;';
    const rowStyleStep2 = 'display:flex; align-items:center; margin-bottom:1rem; font-size:1rem;';
    const labelStyle = 'width:180px; font-weight:bold; text-align:left;';
    const inputStyleStep1 = 'flex:1; padding:0.35rem; font-size:1rem; border:1px solid #ccc; border-radius:4px;';
    const inputStyleStep2 = 'flex:1; padding:0.35rem; font-size:1rem; border:1px solid #ccc; border-radius:4px;';

    const step1Html = `
<div>
  <div style="${rowStyleStep1}">
    <label style="${labelStyle}">Usuario <span style="color:red">*</span></label>
    <input id="swal-username" style="${inputStyleStep1}" placeholder="Usuario" value="${userItem?.username || ""}">
  </div>

  <div style="${rowStyleStep1}">
    <label style="${labelStyle}">Contraseña <span style="color:red">*</span></label>
    <input id="swal-password" type="password" style="${inputStyleStep1}" placeholder="Contraseña">
  </div>

  <!-- Mensaje de contraseña debajo de todos los rows -->
  <div style="margin-bottom:1rem; font-size:0.75rem; color:gray; text-align:left;">Se solicitará cambiar al conectarse por primera vez</div>

  <div style="${rowStyleStep1}">
    <label style="${labelStyle}">Tipo de Usuario <span style="color:red">*</span></label>
    <select id="swal-type" style="${inputStyleStep1}">${optionsHtml}</select>
  </div>

  <!-- Mensaje de campos obligatorios alineado a la derecha -->
  <div style="font-size:0.75rem; color:red; text-align:right;">* Campos obligatorios</div>
</div>
`;

    const step2Html = `
<div>
  <div style="${rowStyleStep2}">
    <label style="${labelStyle}">Nombre completo <span style="color:red">*</span></label>
    <input id="swal-name" style="${inputStyleStep2}" placeholder="Nombre completo" value="${userItem?.name || ""}">
  </div>
  <div style="${rowStyleStep2}">
    <label style="${labelStyle}">Extensión</label>
    <input id="swal-extension" style="${inputStyleStep2}" placeholder="Extensión" value="${userItem?.extension || ""}">
  </div>
  <div style="${rowStyleStep2}">
    <label style="${labelStyle}">Teléfono</label>
    <input id="swal-number" style="${inputStyleStep2}" placeholder="Teléfono" value="${userItem?.number || ""}">
  </div>
  <div style="${rowStyleStep2}">
    <label style="${labelStyle}">Email</label>
    <input id="swal-email" type="email" style="${inputStyleStep2}" placeholder="Email" value="${userItem?.email || ""}">
  </div>
  <div style="${rowStyleStep2}">
    <label style="${labelStyle}">Departamento</label>
    <select id="swal-department" style="${inputStyleStep2}">${departmentOptions}</select>
  </div>
  <div style="${rowStyleStep2}">
    <label style="${labelStyle}">Subdepartamento</label>
    <select id="swal-subdepartment" style="${inputStyleStep2}">${subdepartmentOptions}</select>
  </div>
    <!-- Mensaje de campos obligatorios alineado a la derecha -->
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
        confirmButtonText: "Siguiente",
        preConfirm: () => {
            const username = document.getElementById("swal-username").value.trim();
            const password = document.getElementById("swal-password").value.trim();
            const usertype = document.getElementById("swal-type").value;

            if (!username) { Swal.showValidationMessage("El nombre de usuario no puede estar vacío"); return false; }
            if (action === "create" && !password) { Swal.showValidationMessage("La contraseña no puede estar vacía"); return false; }

            return { username, password, usertype };
        }
    });

    if (!swalStep1.value) return; // Cancelado
    step1Values = swalStep1.value;

    // Paso 2: Datos extendidos
    const swalStep2 = await Swal.fire({
        title: "Datos Extendidos",
        html: step2Html,
        focusConfirm: false,
        width: '600px',
        showCancelButton: true,
        confirmButtonText: action === "create" ? "Crear" : "Aceptar",
        preConfirm: () => {
            const name = document.getElementById("swal-name").value.trim();
            const extension = document.getElementById("swal-extension").value.trim();
            const number = document.getElementById("swal-number").value.trim();
            const email = document.getElementById("swal-email").value.trim();
            const departmentId = document.getElementById("swal-department").value;
            const subdepartmentId = document.getElementById("swal-subdepartment").value;

            if (!name) { Swal.showValidationMessage("El nombre completo es obligatorio"); return false; }
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { Swal.showValidationMessage("Debe ser un email válido"); return false; }
            if (extension && !/^\d+$/.test(extension)) { Swal.showValidationMessage("La extensión debe ser un número válido"); return false; }
            if (number && !/^\+?\d{6,15}$/.test(number)) { Swal.showValidationMessage("El número de teléfono debe ser válido"); return false; }

            return { name, extension, number, email, departmentId, subdepartmentId };
        }
    });

    if (!swalStep2.value) return;

    onConfirm({ ...step1Values, ...swalStep2.value, userAccountId: userItem?.userAccountId || null });
};

export default AddModifyUserComponent;
