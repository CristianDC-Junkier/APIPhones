import React, { useState } from "react";
import Swal from "sweetalert2";
import { FaTrash } from "react-icons/fa";

/**
 * Badge con la función de eliminar
 * @param {String} objType - Determina el tipo de objeto en los menús // "departamento" o "enlace"
 * @param {String} objName - Nombre del objeto
 * @param {Function} onDelete - Función encargada de gestionar la eliminación
 * @returns
 */

// Función encargada de determinar el color de fonde del badge
function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        color += ("00" + value.toString(16)).substr(-2);
    }
    return color;
}

const RemovableBadgeComponent = ({ objType, objName, onDelete }) => {
    const bgColor = stringToColor(objName);
    const [hover, setHover] = useState(false);

    const handleDeleteClick = async (e) => {
        e.stopPropagation(); // evita que se propague el clic al badge
        const result = await Swal.fire({
            title: `Desasignar ${objType}`,
            text: `¿Quieres desasignar el ${objType} "${objName}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });
        if (result.isConfirmed) onDelete();
    };

    return (
        <span
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                position: "relative",
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: "50px",
                backgroundColor: bgColor,
                color: "#fff",
                fontWeight: 500,
                fontSize: "0.8rem",
                whiteSpace: "nowrap",
                cursor: "default",
                userSelect: "none",

            }}
        >
            {objName}
            {hover && (
                <FaTrash
                    onClick={handleDeleteClick}
                    style={{
                        position: "absolute",
                        top: "-6px",
                        right: "-6px",
                        backgroundColor: "#ff4d4f",
                        borderRadius: "50%",
                        padding: "3px",
                        color: "#fff",
                        width: "16px",
                        height: "16px",
                        fontSize: "10px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000
                    }}
                />
            )}
        </span>
    );
};

export default RemovableBadgeComponent;
