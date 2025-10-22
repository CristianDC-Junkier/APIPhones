import React from "react";
import Swal from "sweetalert2";

/**
 * Badge para añadir un objeto (solo para admins/superadmins)
 * @param {Object} props
 * @param {String} props.objType Cadena de texto para aplicar en los menús
 * @param {Array} props.availableObjs Lista de objetos disponibles // departamento -> [{id, name}] - enlace -> [{id, name, web}]
 * @param {Function} props.onAdded Callback que recibe el resultado de la operación
 */
const AddBadgeComponent = ({ objType, availableObjs = [], onAdded }) => {

    const handleAddClick = async () => {
        if (!availableObjs.length) {
            return Swal.fire("Info", `No hay ${objType}s disponibles para añadir`, "info");
        }

        const sortedOptions = [...availableObjs].sort((a, b) =>
            objType === "departamento" ? a.name.localeCompare(b.name) : a.id - b.id
        );

        const { value: selectedId } = await Swal.fire({
            title: `<strong>Asignar ${objType}s</strong>`,
            html: `
        <select id="swal-select" style="
            width: 100%;
            padding: 8px 10px;
            border-radius: 8px;
            border: 1px solid #ccc;
            font-size: 0.9rem;
        ">
            <option value="" disabled selected>Seleccione un ${objType}</option>
            ${sortedOptions.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
        </select>
    `,
            showCancelButton: true,
            confirmButtonText: 'Agregar',
            cancelButtonText: 'Cancelar',
            buttonsStyling: true,
            preConfirm: () => {
                const select = Swal.getPopup().querySelector('#swal-select');
                if (!select.value) {
                    Swal.showValidationMessage(`Debes seleccionar un ${objType}`);
                    return;
                }
                return select.value;
            },
        });



        if (!selectedId) return;

        // Buscar el objeto completo por su id
        const selectedObj = availableObjs.find(d => d.id.toString() === selectedId.toString());

        await onAdded(selectedObj);

    };

    return (
        <span
            onClick={handleAddClick}
            style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: "50px",
                backgroundColor: "#e0e0e0",
                color: "#333",
                fontWeight: 500,
                fontSize: "0.8rem",
                whiteSpace: "nowrap",
                cursor: "pointer",
            }}
        >
            + Añadir
        </span>
    );
};

export default AddBadgeComponent;
