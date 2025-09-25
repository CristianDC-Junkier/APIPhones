import React from "react";
import { Container, Row, Col } from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import BackButton from '../../components/utils/BackButtonComponent';

const Cookies = () => {
    return (
        <Container fluid className="my-4 position-relative" style={{ paddingLeft: 0, paddingRight: 0 }}>

            {/* Botón de Back completamente a la izquierda arriba */}
            <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 1000 }}>
                <BackButton back="/home" />
            </div>

            <Row className="justify-content-center">
                <Col md="10">
                    <h1 className="mb-3 text-center mt-4">
                        <strong>Política de Cookies</strong> - <strong>Listín Telefónico</strong>
                    </h1>
                    <p className="mb-3">
                        A través de esta plataforma del <strong>Listín Telefónico</strong> no se recogen datos de carácter personal
                        de los usuarios sin su conocimiento ni se ceden a terceros.
                    </p>
                </Col>
            </Row>

            <Row className="justify-content-center">
                <Col md="10" className="mb-3">
                    <h4 className="mb-2"><strong>Información Recogida</strong></h4>
                    <p className="mb-1">
                        La información registrada en la plataforma se limita a datos de <strong>uso estadístico</strong>, como el número de accesos
                        a cada sección, la frecuencia de utilización de la plataforma y las interacciones con los diferentes <strong>módulos</strong>.
                    </p>
                    <p className="mb-1">
                        Esta información tiene únicamente fines <strong>internos</strong>, con la intención de <strong>mejorar el servicio</strong> y la experiencia de los usuarios.
                    </p>
                </Col>

                <Col md="10" className="mb-3">
                    <h4 className="mb-2"><strong>Uso de Cookies</strong></h4>
                    <p className="mb-1">
                        El <strong>Ayuntamiento de Almonte</strong> no utiliza cookies para recoger <strong>información personal</strong> de los usuarios
                        ni registra las <strong>direcciones IP</strong> de acceso.
                    </p>
                    <p className="mb-1">
                        Únicamente se emplean <strong>cookies propias de sesión</strong> con finalidad <strong>técnica</strong>, es decir,
                        aquellas que permiten la correcta <strong>navegación</strong> dentro del <strong>Listín Telefónico</strong> y el acceso a las
                        <strong>funcionalidades disponibles</strong> según el perfil del usuario autorizado.
                    </p>
                </Col>

                <Col md="10" className="mb-3">
                    <h4 className="mb-2"><strong>Enlaces a terceros</strong></h4>
                    <p className="mb-1">
                        La plataforma puede contener enlaces a <strong>recursos externos</strong> o <strong>servicios de terceros</strong>,
                        cuyas <strong>políticas de privacidad</strong> y <strong>cookies</strong> son ajenas a esta aplicación.
                    </p>
                    <p className="mb-1">
                        Al acceder a dichos recursos, el usuario puede decidir si acepta sus <strong>condiciones</strong>.
                        De manera general, si utiliza <strong>internet</strong> desde su navegador, puede aceptar o rechazar <strong>cookies de terceros</strong>
                        mediante las <strong>opciones de configuración</strong> del mismo.
                    </p>
                </Col>
            </Row>
        </Container>
    );
};

export default Cookies;
