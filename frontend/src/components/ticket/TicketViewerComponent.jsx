import React from "react";
import { Card, CardBody, Badge } from "reactstrap";

/**
 * Visualizador del contenido del ticket (similar a un correo abierto)
 *
 * Props:
 * - ticket: { topic, information, status, readAt, createdAt, resolvedAt }
 */
export default function TicketViewerComponent({ ticket }) {
    if (!ticket)
        return (
            <div className="p-4 text-muted" style={{ fontStyle: "italic" }}>
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
            className="d-flex flex-column flex-grow-1"
            style={{
                height: "100%",
                overflowY: "auto",
                borderRadius: "0",
                borderLeft: "1px solid #dee2e6",
            }}
        >
            <CardBody style={{ fontFamily: "system-ui", padding: "1.5rem" }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="mb-0">{ticket.topic}</h5>
                    <Badge color={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                </div>
                <div className="text-muted small mb-3">
                    <strong>Creado:</strong>{" "}
                    {new Date(ticket.createdAt).toLocaleString()}
                    {ticket.readAt && (
                        <>
                            {" | "}
                            <strong>Leído:</strong>{" "}
                            {new Date(ticket.readAt).toLocaleString()}
                        </>
                    )}
                </div>
                <hr />
                <div style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
                    {ticket.information}
                </div>
            </CardBody>
        </Card>
    );
}
