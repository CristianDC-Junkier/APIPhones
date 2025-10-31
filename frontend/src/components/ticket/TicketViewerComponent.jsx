import React from "react";
import { Card, CardBody, Badge, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

import { markTicket } from "../../services/TicketService";

/**
 * Visualizador del contenido del ticket (similar a un correo abierto)
 *
 * Props:
 * - ticket: { topic, information, status, readAt, createdAt, resolvedAt }
 */
export default function TicketViewerComponent({ ticket, updateTickets }) {
    if (!ticket)
        return (
            <div className="p-4 text-muted" style={{ fontStyle: "italic" }}>
                Selecciona un ticket para ver su contenido
            </div>
        );

    const handleMenu = async (action) => {
        if (action === "NotRead") {
            const response = await markTicket({ id: ticket.id, read: false, warned: false, resolved: false });
            if (response.success) {
                console.log(action + " Successful");
                updateTickets();
            }
        } else if (action === "Resolved") {
            const response = await markTicket({ id: ticket.id, read: false, warned: false, resolved: true });
            if (response.success) {
                console.log(action + " Successful");
                updateTickets();
            }
        }
    }

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
                    <UncontrolledDropdown direction="start">
                        <DropdownToggle color="none">
                            <FontAwesomeIcon icon={faEllipsisVertical} />
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem onClick={() => handleMenu("NotRead")}>
                                Marcar como No Leído
                            </DropdownItem>
                            <DropdownItem onClick={() => handleMenu("Resolved")}>
                                Marcar como Resuelto
                            </DropdownItem>
                        </DropdownMenu>
                    </UncontrolledDropdown>
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
                    <Badge className="position-absolute end-0 me-4" color={getStatusColor(ticket.status)}>{ticket.status}</Badge>

                </div>
                <hr />
                <div style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
                    {ticket.information}
                </div>
            </CardBody>
        </Card>
    );
}
