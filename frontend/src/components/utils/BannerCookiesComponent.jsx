import React, { useState, useEffect } from "react";
import { Button, Container, Row, Col } from "reactstrap";
import logo from "../../assets/ayto_almonte_notext.png";

/**
 * Componente de aviso de Cookies
 */

const CookieBanner = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const accepted = localStorage.getItem("cookiesAccepted");
        if (!accepted) {
            setVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookiesAccepted", "true");
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div
            className="cookie-banner bg-dark text-white p-3"
            style={{
                position: "fixed",
                bottom: 20,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1050,
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                borderRadius: "10px",
                maxWidth: "900px",
                width: "90%",
                transition: "all 0.4s ease",
            }}
        >
            <Container>
                <Row className="align-items-center">
                    {/* Imagen a la izquierda */}
                    <Col xs="auto">
                        <img
                            src={logo}
                            alt="Cookies"
                            style={{ width: "50px", height: "50px", marginRight: "10px" }}
                        />
                    </Col>

                    {/* Texto */}
                    <Col>
                        <p className="mb-0" style={{ fontSize: "14px" }}>
                            🍪 Usamos cookies únicamente para mejorar tu experiencia:
                            <strong> recordar tu cuenta de usuario</strong> y asegurar
                            <strong> el correcto funcionamiento de la página</strong>.
                        </p>
                        <p className="mb-0" style={{ fontSize: "14px" }}>
                            Al hacer clic en "Aceptar", usted consiente el uso de cookies
                            de acuerdo con nuestra política de privacidad.
                        </p>
                    </Col>

                    {/* Botón */}
                    <Col xs="auto">
                        <Button
                            color="success"
                            onClick={handleAccept}
                            style={{
                                borderRadius: "5px",
                                padding: "8px 8px",
                                fontWeight: "bold",
                                transition: "all 0.3s ease"
                            }}
                            onMouseOver={e => (e.currentTarget.style.backgroundColor = "#45a049")}
                            onMouseOut={e => (e.currentTarget.style.backgroundColor = "#28a745")}
                        >
                            Aceptar
                        </Button>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default CookieBanner;
