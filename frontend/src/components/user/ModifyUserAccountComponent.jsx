import Swal from "sweetalert2";
//import { getDepartmentsList, getSubDepartmentsList } from "../../services/DepartmentService";

/**
 * Componente que permite modificar a un usuario su propio perfil mediante un modal de SweetAlert2.
 *  
 * @param {Object} props
 * @param {string} props.token - Token de autenticación del usuario actual.
 * @param {Object} [props.profile] - Perfil a modificar.
 * @param {Function} props.onConfirm - Callback que se ejecuta al confirmar los datos, recibe { username, name, extension, number, email, departmentId, subdepartmentId }.
 */
const ModifyProfileComponent = async ({profile, onConfirm }) => {

    // Obtener departamentos y subdepartamentos desde el backend
   /* const depResponse = await getDepartmentsList(token);
    const departments = depResponse.data.departments;

    const subDepResponse = await getSubDepartmentsList(token);
    const subdepartments = subDepResponse.data.subdepartments;


    // Añadir opción vacía al inicio
    departments.unshift({ id: null, name: "-- Seleccionar --" });
    subdepartments.unshift({ id: null, name: "-- Seleccionar --" });


    // HTML para selects de departamentos y subdepartamentos
   /* const departmentOptions = departments.map(d => `<option value="${d.id}" ${profile?.userData.departmentId === d.id ? "selected" : ""}>${d.name}</option>`).join("");

    // Subdepartamentos iniciales según el usuario a modificar
    const initialSubDeps = profile?.userData.departmentId
        ? subdepartments.filter(sd => sd.departmentId === profile.userData.departmentId)
        : subdepartments;
    const subdepartmentOptions = initialSubDeps.map(s => `<option value="${s.id}" ${profile?.userData.subdepartmentId === s.id ? "selected" : ""}>${s.name}</option>`).join("");*/

    // Estilos inline para SweetAlert2
    const rowStyle = 'display:flex; align-items:center; margin-bottom:1rem; font-size:1rem;';
    const labelStyle = 'width:180px; font-weight:bold; text-align:left;';
    const inputStyle = 'flex:1; padding:0.35rem; font-size:1rem; border:1px solid #ccc; border-radius:4px;';

    const stepHtml = `
<div>
  <div style="${rowStyle} margin-top: 5vh">
    <label style="${labelStyle}">Nombre completo <span style="color:red">*</span></label>
    <input id="swal-name" style="${inputStyle}" placeholder="Nombre completo" value="${profile?.userData.name || ""}">
  </div>
  <div style="${rowStyle}">
    <label style="${labelStyle}">Extensión<span style="color:red">*</span></label>
    <input id="swal-extension" style="${inputStyle}" placeholder="Extensión" value="${profile?.userData.extension || ""}">
  </div>
  <div style="${rowStyle}">
    <label style="${labelStyle}">Teléfono<span style="color:red">*</span></label>
    <input id="swal-number" style="${inputStyle}" placeholder="Teléfono" value="${profile?.userData.number || ""}">
  </div>
  <div style="${rowStyle}">
    <label style="${labelStyle}">Email<span style="color:red">*</span></label>
    <input id="swal-email" type="email" style="${inputStyle}" placeholder="Email" value="${profile?.userData.email || ""}">
  </div>
  

  <div style="font-size:0.75rem; color:red; text-align:right;">* Campos obligatorios</div>
</div>
`; /*<div style="${rowStyle} margin-top: 5vh">
    <label style="${labelStyle}">Usuario <span style="color:red">*</span></label>
    <input id="swal-username" style="${inputStyle}" placeholder="Usuario" value="${profile?.username || ""}">
  </div>

<div style="${rowStyle}">
    <label style="${labelStyle}">Departamento</label>
    <select id="swal-department" style="${inputStyle}">${departmentOptions}</select>
  </div>
  <div style="${rowStyle}">
    <label style="${labelStyle}">Subdepartamento</label>
    <select id="swal-subdepartment" style="${inputStyle}">${subdepartmentOptions}</select>
  </div>*/

    const swalStep = await Swal.fire({
        title: "Modificar Perfil",
        html: stepHtml,
        focusConfirm: false,
        width: '600px',
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonText: "Aceptar",
        /*didOpen: () => {
            const departmentSelect = document.getElementById("swal-department");
            const subdepartmentSelect = document.getElementById("swal-subdepartment");

            departmentSelect.addEventListener("change", (e) => {
                const selectedDep = parseInt(e.target.value, 10);
                const filteredSubDeps = subdepartments.filter(sd => sd.departmentId === selectedDep);
                const options = [{ id: null, name: "-- Seleccionar --" }, ...filteredSubDeps];
                subdepartmentSelect.innerHTML = options.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
            });
        },*/
        preConfirm: () => {
            //const username = document.getElementById("swal-username").value.trim();
            const name = document.getElementById("swal-name").value.trim();
            const extension = document.getElementById("swal-extension").value.trim();
            const number = document.getElementById("swal-number").value.trim();
            const email = document.getElementById("swal-email").value.trim();
            /*const departmentIdRaw = document.getElementById("swal-department").value;
            const departmentId = departmentIdRaw === "null" ? null : parseInt(departmentIdRaw, 10);
            const subdepartmentIdRaw = document.getElementById("swal-subdepartment").value;
            const subdepartmentId = subdepartmentIdRaw === "null" ? null : parseInt(subdepartmentIdRaw, 10);*/

            //if (!username) { Swal.showValidationMessage("El nombre de usuario no puede estar vacío"); return false; }
            if (!name) { Swal.showValidationMessage("El nombre completo es obligatorio"); return false; }
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { Swal.showValidationMessage("Debe ser un email válido"); return false; }
            if (extension && !/^\d+$/.test(extension)) { Swal.showValidationMessage("La extensión debe ser un número válido"); return false; }
            if (number && !/^\+?\d{6,15}$/.test(number)) { Swal.showValidationMessage("El número de teléfono debe ser válido"); return false; }

            return { name, extension, number, email }; //departmentId, subdepartmentId, username };
        }
    });

    if (!swalStep.value) return;

    onConfirm(swalStep.value);

};

export default ModifyProfileComponent;
