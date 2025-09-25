import React from 'react';
import { Container } from 'reactstrap';
import { Outlet } from 'react-router-dom';
import Footer from '../components/FooterComponent';
import BannerCookies from '../components/utils/BannerCookiesComponent';
import background from '../../src/assets/background.jpg';

/**
 * Estilos de fondo con imagen para toda la página.
 */
const imageBackground = {
    backgroundImage: `url(${background})`,
    backgroundSize: "cover",        // Ajusta la imagen para cubrir todo el contenedor
    backgroundRepeat: "no-repeat",  // Evita que la imagen se repita
    backgroundPosition: "center",   // Centra la imagen
    minHeight: '100vh',             // Altura mínima igual a la ventana
    display: 'flex',
    flexDirection: 'column'
};

/**
 * Layout principal de la aplicación.
 *
 * Funcionalidades:
 * - Muestra una imagen de fondo que cubre toda la ventana.
 * - Contenedor principal centrado verticalmente para el contenido de las rutas hijas.
 * - Incluye footer fijo al final de la página.
 * - Utiliza <Outlet /> de React Router para renderizar las rutas hijas.
 */
const MainLayout = () => (
    <div style={imageBackground}>
        {/* Contenedor principal centrado verticalmente */}
        <Container
            tag="main"
            className="flex-grow-1 d-flex flex-column"
            style={{ justifyContent: 'center' }}
        >
            <Outlet /> {/* Aquí se renderizan las rutas hijas */}
        </Container>

        {/* Footer de la página */}
        <Footer />
        {/* Banner de cookies */}
        <BannerCookies />
    </div>
);

export default MainLayout;
