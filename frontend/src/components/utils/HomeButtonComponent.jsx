import React from 'react';
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
const HomeButtonComponent = ({ label, icon, onClick }) => (
    <button onClick={onClick} aria-label={label} className="client-button">
        <FontAwesomeIcon icon={icon} size="lg" className="icon" />
        <span className="label">{label}</span>
    </button>
);

export default HomeButtonComponent;


