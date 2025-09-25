import React from "react";
import { Container, Row, Col } from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import BackButton from '../../components/utils/BackButtonComponent';

const Compromise = () => {
    return (
        <Container fluid className="my-4 position-relative" style={{ paddingLeft: 0, paddingRight: 0 }}>

            {/* Botón de Back fijo arriba a la izquierda */}
            <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 1000 }}>
                <BackButton back="/home" />
            </div>

            <Row className="justify-content-center">
                <Col md="10">
                    <h1 className="mb-3 text-center mt-4"><strong>Compromiso con la Protección de Datos</strong></h1>
                    <p className="mb-3">
                        La <strong>Dirección / Órgano de Gobierno del Ayuntamiento de Almonte</strong>, responsable del <strong>Listín Telefónico</strong>,
                        asume la máxima responsabilidad y compromiso con la <strong>protección de datos personales</strong>, garantizando el cumplimiento
                        del <strong>Reglamento (UE) 2016/679</strong> y de la <strong>normativa española</strong> en materia de protección de datos.
                    </p>
                </Col>
            </Row>

            <Row className="justify-content-center">
                <Col md="10" className="mb-3">
                    <h4 className="mb-2"><strong>Principios y Compromiso</strong></h4>
                    La política de protección de datos del <strong>Ayuntamiento de Almonte</strong> descansa en el principio de <strong>responsabilidad proactiva</strong>.<br />
                    Todo el personal que trate datos personales debe <strong>conocerla, aplicarla y aportar mejoras</strong> para garantizar la excelencia
                    en el cumplimiento de la normativa.
                </Col>

                <Col md="10" className="mb-3">
                    <h4 className="mb-2"><strong>Principios de tratamiento de datos</strong></h4>
                    <ul className="mb-1">
                        <li><strong>Protección desde el diseño:</strong> medidas técnicas y organizativas desde el inicio para garantizar los principios de protección de datos.</li>
                        <li><strong>Protección por defecto:</strong> solo se tratan los datos necesarios para cada finalidad específica.</li>
                        <li><strong>Ciclo de vida de la información:</strong> protección durante toda la vida de la información.</li>
                        <li><strong>Licitud, lealtad y transparencia:</strong> tratamiento lícito, leal y transparente con relación al interesado.</li>
                        <li><strong>Limitación de la finalidad:</strong> los datos se recogen con fines determinados, explícitos y legítimos.</li>
                        <li><strong>Minimización de datos:</strong> solo los datos necesarios se recogen.</li>
                        <li><strong>Exactitud:</strong> los datos se mantienen correctos y actualizados.</li>
                        <li><strong>Limitación del plazo de conservación:</strong> se conservan solo mientras sea necesario.</li>
                        <li><strong>Integridad y confidencialidad:</strong> medidas para proteger los datos frente a accesos no autorizados, pérdidas o daños.</li>
                        <li><strong>Información y formación:</strong> el personal autorizado recibe <strong>formación continua</strong> sobre protección de datos.</li>
                    </ul>
                </Col>

                <Col md="10" className="mb-3">
                    <h4 className="mb-2"><strong>Comunicación y revisión</strong></h4>
                    La política de protección de datos se comunica a todos los <strong>trabajadores con acceso al Listín Telefónico</strong>
                    y se pone a disposición de las partes interesadas.<br />
                    Cada miembro del personal es responsable de <strong>aplicarla y de identificar oportunidades de mejora</strong>.<br />
                    Esta política será revisada periódicamente por la <strong>Dirección / Órgano de Gobierno del Ayuntamiento de Almonte</strong>
                    para adecuarse en todo momento a la normativa vigente.
                </Col>
            </Row>
        </Container>
    );
};

export default Compromise;
