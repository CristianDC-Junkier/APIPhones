import React, { useState } from "react";
import {
    ListGroup,
    ListGroupItem,
    Tooltip,
    Badge,
    Button
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faEnvelopeOpen, faCheck } from "@fortawesome/free-solid-svg-icons";

/**
 * Props:
 * - tickets: array de tickets
 * - selectedTicket: id actualmente seleccionado (para mostrar visor)
 * - onSelectTicket: (id) => void (al hacer click en la fila)
 * - onMarkTicket: (idOrArray, action) => void (acción global)
 * - sortOrder: "asc" | "desc"
 * - onToggleSort: () => void
 */
export default function TicketListComponent({
    tickets,
    selectedTicket,
    onSelectTicket,
    selectedIds = [],
    onSelectionChange,
}) {
    const [tooltipOpen, setTooltipOpen] = useState({});

    const toggleTooltip = (id) => {
        setTooltipOpen((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleSelectId = (id) => {
        const updated = selectedIds.includes(id)
            ? selectedIds.filter((x) => x !== id)
            : [...selectedIds, id];

        onSelectionChange?.(updated);
    };

    if (!tickets || tickets.length === 0) {
        return (
            <div
                className="d-flex justify-content-center align-items-center text-muted"
                style={{
                    height: "100%",       
                    fontStyle: "italic",
                }}
            >
                No existen tickets
            </div>
        );
    }

    return (
        <div
            className="d-flex flex-column"
            style={{ height: "100%", overflowY: "auto", backgroundColor: "white" }}
        >

            <ListGroup flush>
                {tickets.map((ticket) => {
                    const tooltipId = `tooltip-${ticket.id}`;
                    const isSelected = selectedTicket === ticket.id;
                    const isRead = ticket.status !== "OPEN";
                    const isChecked = selectedIds.includes(ticket.id);

                    return (
                        <ListGroupItem
                            key={ticket.id}
                            active={isSelected}
                            onClick={() => onSelectTicket(ticket.id)}
                            style={{
                                cursor: "pointer",
                                gap: 10,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                backgroundColor: isSelected
                                    ? "#e9f5ff"
                                    : isRead
                                        ? "#f8f9fa"
                                        : "white",
                                borderLeft: isSelected ? "4px solid #0d6efd" : "4px solid transparent",
                                borderTop: isSelected ? "1px solid #0d6efd" : "1px solid transparent",
                                borderRight: isSelected ? "1px solid #0d6efd" : "1px solid transparent",
                                borderBottom: isSelected ? "1px solid #0d6efd" : "1px solid transparent",
                                transition: "background 0.2s, border 0.2s",
                            }}
                        >
                            {/* Texto principal (expande) */}
                            <div
                                id={tooltipId}
                                style={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    flex: 1,
                                    minWidth: 0,
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <FontAwesomeIcon
                                        icon={isRead ? faEnvelopeOpen : faEnvelope}
                                        color={isRead ? "#6c757d" : "#0d6efd"}
                                    />
                                    <strong style={{ color: isRead ? "#6c757d" : "#212529", fontWeight: isRead ? "normal" : "bold" }}>
                                        #{ticket.id} - {ticket.topic}
                                    </strong>
                                </div>
                                <div className="text-muted small">Estado: {ticket.status}</div>
                            </div>

                            <Tooltip
                                placement="top"
                                isOpen={tooltipOpen[tooltipId]}
                                target={tooltipId}
                                toggle={() => toggleTooltip(tooltipId)}
                            >
                                Ticket #{ticket.id} — {ticket.topic}
                            </Tooltip>

                            {/* Fecha y badge */}
                            <div className="text-end ms-2" style={{ minWidth: 50 }}>
                                <div className="text-muted small">{new Date(ticket.createdAt).toLocaleDateString()}</div>
                                {!isRead && <Badge color="primary">Nuevo</Badge>}
                            </div>

                            {/* Botón de selección por ticket */}
                            <Button
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSelectId(ticket.id);
                                }}
                                title={isChecked ? "Deseleccionar" : "Seleccionar"}
                                style={{
                                    width: 16,
                                    height: 16,
                                    padding: 0,
                                    backgroundColor: isChecked ? "#0d6efd" : "#e9ecef",
                                    border: "1px solid #ced4da",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {isChecked && (
                                    <FontAwesomeIcon
                                        icon={faCheck}
                                        style={{ fontSize: "0.65rem", color: "white" }}
                                    />
                                )}
                            </Button>


                        </ListGroupItem>
                    );
                })}
            </ListGroup>
        </div>
    );
}
