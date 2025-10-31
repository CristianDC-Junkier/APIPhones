import React, { useState, useMemo } from "react";
import { ListGroup, ListGroupItem, Tooltip, Badge, ButtonGroup, Button, } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faEnvelopeOpen, faSortAmountDown, faSortAmountUp, } from "@fortawesome/free-solid-svg-icons";

/**
 * Lista de tickets con apariencia de bandeja de correo.
 *
 * Props:
 * - tickets: Array de objetos TicketModel (con topic, information, status, readAt, createdAt).
 * - selectedTicket: ID del ticket seleccionado.
 * - onSelectTicket: Función que se llama al hacer clic en un ticket.
 */
export default function TicketListComponent({
    tickets,
    selectedTicket,
    onSelectTicket,
}) {
    const [tooltipOpen, setTooltipOpen] = useState({});
    const [sortOrder, setSortOrder] = useState("desc"); // asc | desc
    const [filter, setFilter] = useState("all"); // all | read | unread
    let isEmpty = false;

    const toggleTooltip = (id) => {
        setTooltipOpen((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // Filtro + ordenamiento
    const filteredTickets = useMemo(() => {
        let result = [...tickets];
        if (filter === "read") result = result.filter((t) => t.status !== "OPEN");
        if (filter === "unread") result = result.filter((t) => t.status === "OPEN");

        result.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.readAt || 0);
            const dateB = new Date(b.createdAt || b.readAt || 0);
            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });

        return result;
    }, [tickets, sortOrder, filter]);

    if (filteredTickets.length === 0)
        isEmpty = true;

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Controles de filtro y orden */}
            <div
                className="d-flex justify-content-between align-items-center p-2 border-bottom bg-light"
                style={{ flexShrink: 0 }}
            >
                <ButtonGroup size="sm">
                    <Button
                        color={filter === "all" ? "primary" : "secondary"}
                        onClick={() => setFilter("all")}
                    >
                        Todos
                    </Button>
                    <Button
                        color={filter === "unread" ? "primary" : "secondary"}
                        onClick={() => setFilter("unread")}
                    >
                        No leídos
                    </Button>
                    <Button
                        color={filter === "read" ? "primary" : "secondary"}
                        onClick={() => setFilter("read")}
                    >
                        Leídos
                    </Button>
                </ButtonGroup>

                <Button
                    size="sm"
                    color="link"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    title="Ordenar por fecha"
                >
                    <FontAwesomeIcon
                        icon={sortOrder === "asc" ? faSortAmountUp : faSortAmountDown}
                    />
                </Button>
            </div>

            {/* Lista de tickets */}
                <ListGroup
                    flush
                    style={{ overflowY: "auto", flex: 1, backgroundColor: "white" }}
                >
                    {!isEmpty ? (filteredTickets.map((ticket) => {
                        const tooltipId = `tooltip-${ticket.id}`;
                        const isSelected = selectedTicket === ticket.id;
                        const isRead = ticket.status !== "OPEN";
                        return (
                            <ListGroupItem
                                key={ticket.id}
                                action
                                active={isSelected}
                                onClick={() => onSelectTicket(ticket.id)}
                                style={{
                                    cursor: "pointer",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "0.75rem 1rem",
                                    backgroundColor: isSelected
                                        ? "#e9f5ff"
                                        : isRead
                                            ? "#f8f9fa"
                                            : "white",
                                    borderLeft: isSelected ? "4px solid #0d6efd" : "4px solid transparent",
                                    transition: "background 0.2s",
                                }}
                            >
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
                                    <FontAwesomeIcon
                                        icon={isRead ? faEnvelopeOpen : faEnvelope}
                                        className="me-2"
                                        color={isRead ? "#6c757d" : "#0d6efd"}
                                    />
                                    <strong
                                        style={{
                                            color: isRead ? "#6c757d" : "#212529",
                                            fontWeight: isRead ? "normal" : "bold",
                                        }}
                                    >
                                        {ticket.topic}
                                    </strong>
                                    <div className="text-muted small">
                                        Estado: {ticket.status}
                                    </div>
                                </div>

                                <Tooltip
                                    placement="top"
                                    isOpen={tooltipOpen[tooltipId]}
                                    target={tooltipId}
                                    toggle={() => toggleTooltip(tooltipId)}
                                >
                                    {ticket.topic}
                                </Tooltip>
                                <div className="text-end ms-2">
                                    <div className="text-muted small">
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </div>
                                    {!isRead && <Badge color="primary">Nuevo</Badge>}
                                </div>
                            </ListGroupItem>
                        );
                    })) : (<p className="p-3 text-muted">No hay tickets disponibles</p>)}
                </ListGroup>
            
        </div>
    );
}
