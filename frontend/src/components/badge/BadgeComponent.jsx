import React from "react";

/**
 * Muestra una insignia con el nombre de un objeto.
 * @param {Object} props
 * @param {string} props.objName Nombre del objeto.
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

const BadgeComponent = ({ objName }) => {
    const bgColor = stringToColor(objName);
    return (
        <span
            style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: "50px",
                backgroundColor: bgColor,
                color: "#fff",
                fontWeight: 500,
                fontSize: "0.8rem",
                whiteSpace: "nowrap",
            }}
        >
            {objName}
        </span>
    );
};

export default BadgeComponent;
