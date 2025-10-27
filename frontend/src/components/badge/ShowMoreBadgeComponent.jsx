import React from "react";
import ReactDOM from "react-dom/client";
import Swal from "sweetalert2";

import BadgeComponent from "./BadgeComponent";

/**
* Badge para mostrar "Mostrar más" 
* @param {Object} currentUser usuario actual
* @param {Object} user usuario al que se le muestran los departamentos
* @param {boolean} canModify Indica si el usuario puede modificar
* @param {String} objType Cadena para aplicar en los menús
* @param {Array} objList Lista completa de objetos // departamento -> [{id, name}] || enlace -> [{id, name, web}]
* @param {Array} userObjects Lista de objetos del usuario // departamento -> [{id, name}] || enlace -> [{id, name, web}]
* @param {Function} onAdded Callback cuando se agrega un departamento
* @param {Function} onDeleted Callback cuando se elimina un departamento
*/
const ShowMoreDepartmentBadgeComponent = ({
    user,
    objType,
    objList = [],
}) => {

    const handleShowMore = () => {
        Swal.fire({
            title: objType === "subdepartamento" ? `<strong>Departamentos de ${user.name}</strong>` : `<strong>Subdepartamentos de ${user.name}</strong>`,
            html: `<div id="departments-container"></div>`,
            didOpen: () => {
                const container = document.getElementById('departments-container');
                if (container) {
                    const root = ReactDOM.createRoot(container);
                    root.render(
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '4px',
                                maxHeight: '300px',
                                overflowY: 'auto',
                                minHeight: '200px',
                                padding: '12px',
                                borderRadius: '12px',
                                backgroundColor: '#f9f9f9',
                                alignItems: 'flex-start',
                                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)',
                            }}
                        >
                            {objList.map(obj => (
                                <BadgeComponent key={obj.id} objName={obj.name} />
                            ))}
                        </div>
                    );
                }
            },
            showConfirmButton: true,
            confirmButtonText: 'Cerrar',
            width: '600px',
            buttonsStyling: true,
        });
    };


    return (
        <span
            onClick={handleShowMore}
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
            + Mostrar más
        </span>
    );
};

export default ShowMoreDepartmentBadgeComponent;
