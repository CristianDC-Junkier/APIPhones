import React from "react";
import { Container, Row, Col } from "reactstrap";
import { useLocation } from "react-router-dom";
import logo from "../assets/ayto_almonte_notext.png";
import "../styles/FooterComponent.css";

const FooterComponent = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <footer className="bg-dark text-white py-2 mt-auto" >
            <Container fluid className="px-3">
                <Row className="align-items-center text-center text-md-start">
                    {/* Izquierda: Logo */}
                    <Col
                        sm="12"
                        md="1"
                        className="d-flex justify-content-center justify-content-md-start align-items-center mb-2 mb-md-0"
                    >
                        <a
                            href="https://almonte.es/es/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="d-inline-flex align-items-center"
                        >
                            <img
                                src={logo}
                                alt="Ayuntamiento de Almonte"
                                style={{ height: "24px", marginRight: "6px" }}
                            />
                        </a>
                        {/* En móvil el copy va junto al logo */}
                        <span className="d-md-none">&copy; 2025 Ayuntamiento de Almonte</span>
                    </Col>

                    {/* Centro: Copy (solo visible en escritorio) */}
                    <Col
                        md="6"
                        className="d-none d-md-flex justify-content-center align-items-center text-center"
                        style={{ fontSize: "1.0rem" }}
                    >
                        <span>&copy; 2025 Ayuntamiento de Almonte. Todos los derechos reservados</span>
                    </Col>

                    {/* Derecha: Enlaces */}
                    <Col
                        sm="12"
                        md="5"
                        className="d-flex justify-content-center justify-content-md-end align-items-center"
                        style={{ fontSize: "1rem" }}
                    >
                        <small className="footer-links">
                            <a
                                href="/listin-telefonico/data-compromise"
                                className={`text-white text-decoration-none ${isActive("/data-compromise") ? "active-link" : ""
                                    }`}
                            >
                                Protección de Datos
                            </a>
                            <span className="mx-1">|</span>
                            <a
                                href="/listin-telefonico/privacity-politic"
                                className={`text-white text-decoration-none ${isActive("/privacity-politic") ? "active-link" : ""
                                    }`}
                            >
                                Política de Privacidad
                            </a>
                            <span className="mx-1">|</span>
                            <a
                                href="/listin-telefonico/cookies-politic"
                                className={`text-white text-decoration-none ${isActive("/cookies-politic") ? "active-link" : ""
                                    }`}
                            >
                                Política de Cookies
                            </a>
                        </small>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default FooterComponent;
