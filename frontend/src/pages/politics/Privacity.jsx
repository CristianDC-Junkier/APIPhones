import React from "react";
import { Container, Row, Col } from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import BackButton from '../../components/utils/BackButtonComponent';

const Privacity = () => {
    return (
        <Container fluid className="my-4 position-relative" style={{ paddingLeft: 0, paddingRight: 0 }}>

            {/* Botón de Back fijo arriba a la izquierda */}
            <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 1000 }}>
                <BackButton back="/home" />
            </div>

            <Row className="justify-content-center">
                <Col md="10">
                    <h1 className="mb-3 text-center mt-4"><strong>Política de Privacidad</strong> - Listín Telefónico</h1>
                    <p className="mb-3">
                        En el <strong>Ayuntamiento de Almonte</strong> valoramos su privacidad. Esta plataforma está destinada únicamente a <strong>trabajadores de la entidad</strong>; los usuarios normales no pueden registrarse ni iniciar sesión.
                    </p>
                </Col>
            </Row>

            <Row className="justify-content-center">
                <Col md="10" className="mb-3">
                    <h4 className="mb-2"><strong>Quiénes somos</strong></h4>
                    <strong>Denominación:</strong> Ayuntamiento de Almonte<br />
                    <strong>CIF/NIF:</strong> P2100500D<br />
                    <strong>Actividad:</strong> Administración pública Ayuntamiento<br />
                    <strong>Dirección:</strong> Plaza Virgen del Rocío 1, 21730 - Almonte (Huelva)<br />
                    <strong>Teléfono:</strong> 959 45 04 19<br />
                    <strong>Email:</strong> <a href="mailto:secretariageneral@aytoalmonte.es">secretariageneral@aytoalmonte.es</a><br />
                    <strong>Web:</strong> <a href="https://www.almonte.es" target="_blank">https://www.almonte.es</a>
                </Col>

                <Col md="10" className="mb-3">
                    <h4 className="mb-2"><strong>Delegado de Protección de Datos</strong></h4>
                    Nuestro delegado de protección de datos es <strong>AUDIDAT 3.0, S.L.</strong>, y puede contactarse a través de
                    <a href="mailto:dpd@audidat.com"> <strong>dpd@audidat.com</strong></a> para dudas, reclamaciones o sugerencias.
                </Col>

                <Col md="10" className="mb-3">
                    <h4 className="mb-2"><strong>Uso de los datos</strong></h4>
                    Sus datos personales se usarán para atender solicitudes relacionadas con el <strong>Listín Telefónico</strong> y sólo el <strong>personal autorizado de la entidad</strong> tendrá acceso.<br />
                    Si necesitamos usar sus datos para otro fin, solicitaremos su <strong>consentimiento explícito</strong>.
                </Col>

                <Col md="10" className="mb-3">
                    <h4 className="mb-2"><strong>Protección y transferencia de datos</strong></h4>
                    Aplicamos <strong>medidas de seguridad eficaces</strong> y auditorías periódicas.<br />
                    No se enviarán datos a <strong>países no seguros</strong> sin su permiso.
                </Col>

                <Col md="10" className="mb-3">
                    <h4 className="mb-2"><strong>Conservación y derechos</strong></h4>
                    Conservamos sus datos <strong>mientras sea necesario y de acuerdo con la ley</strong>.<br />
                    Puede solicitar <strong>acceso, rectificación, supresión, portabilidad o limitación de sus datos</strong>, y retirar su consentimiento en cualquier momento.<br />
                    Para ejercer estos derechos, envíe una solicitud escrita junto con <strong>fotocopia de su DNI</strong> a nuestra dirección de contacto.
                </Col>
            </Row>
        </Container>
    );
};

export default Privacity;
