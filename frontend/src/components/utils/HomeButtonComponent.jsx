import React from 'react';
import { Badge } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../../styles/user/UserComponents.css';

/**
 * Botón personalizado para los botones del Home.
 *
 * Props:
 * - label: Texto que se mostrará en el botón y como aria-label para accesibilidad.
 * - icon: Icono de FontAwesome a mostrar.
 * - onClick: Función que se ejecuta al hacer clic en el botón.
 *
 */
const HomeButtonComponent = ({ label, icon, onClick, count }) => (
    <button onClick={onClick} aria-label={label} className="client-button">
        <FontAwesomeIcon icon={icon} size="lg" className="icon" />
        <span className="label">{label}</span>

        {/*Burbuja encima del botón de tickets*/}
        {count > 0 && label.includes("Tickets") &&
            <div className="position-absolute top-0 end-0">
                <Badge color="danger" pill style={{ width: "40px", height: "35px", fontSize: "large" }} className="d-flex align-items-center justify-content-center">
                    {count}
                </Badge>
            </div>}
    </button>
);

export default HomeButtonComponent;


