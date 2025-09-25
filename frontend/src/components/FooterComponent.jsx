import React from "react";
import { useLocation } from "react-router-dom"; // Necesario para detectar la página actual
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../assets/ayto_almonte_notext.png";
import "../styles/FooterComponent.css"; // Archivo CSS con efectos

const FooterComponent = () => {
    const location = useLocation(); // Detecta la URL actual

    // Función para saber si un enlace es el activo
    const isActive = (path) => location.pathname === path;

    return (
        <footer className="bg-dark text-white py-2 mt-auto">
            <div className="container-fluid d-flex flex-column flex-md-row align-items-center justify-content-between px-3">

                {/* Izquierda: Logo */}
                <div className="footer-logo">
                    <a href="https://almonte.es/es/" target="_blank" rel="noopener noreferrer">
                        <img src={logo} alt="Ayuntamiento de Almonte" style={{ height: "30px" }} />
                    </a>
                </div>

                {/* Centro: Copyright */}
                <div className="text-center mb-2 mb-md-0">
                    <span className="fs-7">&copy; 2025 Ayuntamiento de Almonte. Todos los derechos reservados.</span>
                </div>

                {/* Derecha: Enlaces */}
                <div className="text-end me-2 ">
                    <small className="fs-7 footer-links">
                        <a
                            href="/listin-telefonico/data-compromise"
                            className={`text-white text-decoration-none ${isActive("/data-compromise") ? "active-link" : ""}`}
                        >
                            Protección de Datos
                        </a>
                        <span className="mx-1">|</span>
                        <a
                            href="/listin-telefonico/privacity-politic"
                            className={`text-white text-decoration-none ${isActive("/privacity-politic") ? "active-link" : ""}`}
                        >
                            Política de Privacidad
                        </a>
                        <span className="mx-1">|</span>
                        <a
                            href="/listin-telefonico/cookies-politic"
                            className={`text-white text-decoration-none ${isActive("/cookies-politic") ? "active-link" : ""}`}
                        >
                            Política de Cookies
                        </a>
                    </small>
                </div>

            </div>
        </footer>
    );
};

export default FooterComponent;
