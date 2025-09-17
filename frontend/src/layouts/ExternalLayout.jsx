import React from 'react';
import { Outlet } from 'react-router-dom';
import background from '../../src/assets/background.jpg';

/**
 * Estilos de fondo con imagen para toda la página.
 */
const imageBackground = {
    backgroundImage: `url(${background})`,
    backgroundSize: "cover",        // Ajusta la imagen para cubrir todo el contenedor
    backgroundRepeat: "no-repeat",  // Evita que la imagen se repita
    backgroundPosition: "center",   // Centra la imagen
    minHeight: "100vh",             // Altura mínima igual a la altura de la ventana
    display: "flex",
    flexDirection: "column"
};

/**
 * Layout externo para páginas públicas o de login.
 *
 * Funcionalidades:
 * - Muestra una imagen de fondo que cubre toda la ventana.
 * - Renderiza el contenido interno a través de <Outlet /> de React Router.
 * - Mantiene flexibilidad para que el contenido interno se ajuste al tamaño disponible.
 */
const ExternalLayout = () => (
    <div style={imageBackground}>
        {/* Contenedor principal para el contenido */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Outlet /> {/* Aquí se renderizan las rutas hijas */}
        </div>
    </div>
);

export default ExternalLayout;
