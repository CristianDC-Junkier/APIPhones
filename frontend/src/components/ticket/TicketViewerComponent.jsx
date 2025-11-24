import React from "react";
import { Card, CardBody, Badge, Row, Col } from "reactstrap";
import TicketDropdownMenuComponent from "./TicketDropdownMenuComponent";

export default function TicketViewerComponent({ ticket, onMarkTicket }) {
    if (!ticket)
        return (
            <div
                className="d-flex justify-content-center align-items-center text-muted"
                style={{ height: "75vh", fontStyle: "italic" }}
            >
                Selecciona un ticket para ver su contenido
            </div>
        );

    const getStatusColor = (status) => {
        switch (status) {
            case "OPEN":
                return "primary";
            case "READ":
                return "info";
            case "WARNED":
                return "warning";
            case "RESOLVED":
                return "success";
            default:
                return "secondary";
        }
    };

    return (
        <Card
            className="shadow-sm border-0 flex-grow-1"
            style={{
                display: "flex",
                flexDirection: "column",
                overflow: "auto",
                borderLeft: "1px solid #dee2e6",
                borderRadius: "0.5rem",
            }}
        >
            <CardBody className="d-flex flex-column flex-grow-1 p-4">
                {/* CABECERA */}
                <div className="d-flex justify-content-between align-items-start mb-4 border-bottom pb-3">
                    <div>
                        <h5 className="fw-bold text-dark mb-1">
                            Ticket #{ticket.id} — {ticket.topic}
                        </h5>
                        <div className="text-muted small">
                            Creado el {new Date(ticket.createdAt).toLocaleString()}
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <Badge color={getStatusColor(ticket.status)} className="text-uppercase">
                            {ticket.status}
                        </Badge>
                        <TicketDropdownMenuComponent
                            selectedIds={[ticket.id]}
                            onMarkTicket={onMarkTicket}
                        />
                    </div>
                </div>

                {/* INFORMACIÓN GENERAL */}
                <section className="mb-4">
                    <h6 className="text-secondary text-uppercase fw-semibold mb-2">
                        Información general
                    </h6>
                    <Row className="g-3 small">
                        {/* Usamos md=6 para que en PC sean 2 por fila, xs=12 para móvil 1 por fila */}
                        <Col xs="6" md="6">
                            <span className="text-muted d-block">Usuario solicitante</span>
                            <span className="fw-semibold">
                                {ticket.userRequesterName || `ID #${ticket.userRequesterId}`}
                            </span>
                        </Col>
                        <Col xs="6" md="6">
                            <span className="text-muted d-block">Información asociada a</span>
                            <span className="fw-semibold">
                                {ticket.nameAffectedData || `ID #${ticket.idAffectedData}`}
                            </span>
                        </Col>
                        <Col xs="6" md="6">
                            <span className="text-muted d-block">Departamento</span>
                            <span className="fw-semibold">
                                {ticket.affectedDepartment || <em>No asignado</em>}
                            </span>
                        </Col>
                        <Col xs="6" md="6">
                            <span className="text-muted d-block">Subdepartamento</span>
                            <span className="fw-semibold">
                                {ticket.affectedSubDepartment || <em>No asignado</em>}
                            </span>
                        </Col>
                        <Col xs="6" md="6">
                            <span className="text-muted d-block">Resuelto por</span>
                            <span className="fw-semibold">
                                {
                                    ticket.userResolverName
                                        ? ticket.userResolverName
                                        : ticket.userResolverId != null
                                            ? `ID #${ticket.userResolverId}`
                                            : <em>Aún no resuelto</em>
                                }
                            </span>
                        </Col>
                    </Row>
                </section>

                {/* FECHAS */}
                <section className="mb-4">
                    <h6 className="text-secondary text-uppercase fw-semibold mb-2">
                        Seguimiento temporal
                    </h6>
                    <Row className="g-3 small">
                        <Col xs="6" md="4">
                            <span className="text-muted d-block">Leído</span>
                            <span className="fw-semibold">
                                {ticket.readAt
                                    ? new Date(ticket.readAt).toLocaleString()
                                    : <em>No leído</em>}
                            </span>
                        </Col>
                        <Col xs="6" md="4">
                            <span className="text-muted d-block">Resuelto</span>
                            <span className="fw-semibold">
                                {ticket.resolvedAt
                                    ? new Date(ticket.resolvedAt).toLocaleString()
                                    : <em>Aún no resuelto</em>}
                            </span>
                        </Col>
                        <Col xs="6" md="4">
                            <span className="text-muted d-block">Avisado</span>
                            <span className="fw-semibold">
                                {ticket.warnedAt
                                    ? new Date(ticket.warnedAt).toLocaleString()
                                    : <em>Aún no avisado</em>}
                            </span>
                        </Col>
                    </Row>
                </section>

                {/* DESCRIPCIÓN DEL TICKET */}
                <section className="d-flex flex-column flex-grow-1">
                    <h6 className="text-secondary text-uppercase fw-semibold mb-3">
                        Descripción del ticket
                    </h6>
                    <div
                        className="flex-grow-1 overflow-auto p-3 rounded"
                        style={{
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #e9ecef",
                            whiteSpace: "pre-wrap",
                            fontFamily: "monospace",
                            fontSize: "0.95rem",
                            lineHeight: "1.6",
                            color: "#212529",
                            display: "flex",
                            flexDirection: "column", 
                        }}
                    >
                        {ticket.information || <em>Sin descripción</em>}
                    </div>
                </section>
            </CardBody>
        </Card>
    );
}
