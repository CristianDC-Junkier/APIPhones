import React, { useState, useEffect } from "react";
import { Container, Row, Col, ButtonGroup, Button } from "reactstrap";
import Swal from "sweetalert2";

import BackButtonComponent from "../../components/utils/BackButtonComponent";
import SpinnerComponent from "../../components/utils/SpinnerComponent";
import TicketListComponent from "../../components/ticket/TicketListComponent";
import TicketViewerComponent from "../../components/ticket/TicketViewerComponent"

import { getTicketList, getTicket } from "../../services/TicketService";

/**
 * Página encargada de mostrar la bandeja de tickets
 * Permite filtrar entre todos, no resueltos y resueltos.
 */
export default function DashboardTickets() {
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [ticketContent, setTicketContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("all"); // all | unresolved | resolved

    // 🔄 Cargar tickets desde el backend
    useEffect(() => {
        const fetchTickets = async () => {
            setLoading(true);
            try {
                const res = await getTicketList();
                if (res.success) setTickets(res.data);
                else
                    Swal.fire("Error", "No se pudieron obtener los tickets.", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    // 📩 Seleccionar ticket
    const handleSelectTicket = (id) => {
        setSelectedTicket(id);

        // Busca el ticket dentro del array local de tickets
        const ticket = tickets.find((t) => t.id === id);

        if (ticket) {
            setTicketContent(ticket);
        } else {
            Swal.fire("Error", "No se encontró el ticket seleccionado.", "error");
        }
    };

    // 🧮 Filtrado
    const filteredTickets = tickets.filter((t) => {
        if (filter === "resolved") return t.status === "RESOLVED" || t.status === "WARNED";
        if (filter === "unresolved") return t.status !== "RESOLVED" || t.status !== "WARNED";
        return true;
    });

    if (loading) return <SpinnerComponent />;

    return (
        <Container className="mt-4 d-flex flex-column" style={{ minHeight: "70vh" }}>
            <h3 className="text-center mb-4">Gestión de Tickets</h3>

            <div className="position-absolute top-0 start-0">
                <BackButtonComponent back="/home" />
            </div>

            {/* 🔍 Filtros */}
            <Row className="mb-3 justify-content-center">
                <Col xs="12" md="6" className="text-center">
                    <ButtonGroup>
                        <Button
                            color={filter === "all" ? "primary" : "secondary"}
                            onClick={() => setFilter("all")}
                        >
                            Todos
                        </Button>
                        <Button
                            color={filter === "unresolved" ? "primary" : "secondary"}
                            onClick={() => setFilter("unresolved")}
                        >
                            No resueltos
                        </Button>
                        <Button
                            color={filter === "resolved" ? "primary" : "secondary"}
                            onClick={() => setFilter("resolved")}
                        >
                            Resueltos
                        </Button>
                    </ButtonGroup>
                </Col>
            </Row>

            {/* 🖥️ Escritorio */}
            <Row
                className="d-none d-lg-flex flex-grow-1"
                style={{
                    display: "flex",
                    flexDirection: "row",
                    flex: 1,
                    height: "auto",
                    overflow: "hidden",
                }}
            >
                <Col
                    lg="4"
                    style={{
                        height: "calc(65vh)",
                        overflowY: "auto",
                        paddingRight: "0.5rem",
                    }}
                >
                    <TicketListComponent
                        tickets={filteredTickets}
                        selectedTicket={selectedTicket}
                        onSelectTicket={handleSelectTicket}
                    />
                </Col>

                <Col
                    lg="8"
                    style={{
                        height: "calc(65vh)",
                        overflowY: "auto",
                        paddingLeft: "1rem",
                    }}
                >
                    <TicketViewerComponent ticket={ticketContent} />
                </Col>
            </Row>

            {/* 📱 Móvil */}
            <Row className="d-flex d-lg-none flex-column">
                <Col
                    xs="12"
                    style={{
                        marginBottom: "0.5rem",
                        maxHeight: "50vh",
                        overflowY: "auto",
                    }}
                >
                    <TicketViewerComponent ticket={ticketContent} />
                </Col>
                <Col xs="12">
                    <hr />
                </Col>
                <Col
                    xs="12"
                    style={{
                        paddingTop: "0.5rem",
                        marginBottom: "1rem",
                        maxHeight: "50vh",
                        overflowY: "auto",
                    }}
                >
                    <TicketListComponent
                        tickets={filteredTickets}
                        selectedTicket={selectedTicket}
                        onSelectTicket={handleSelectTicket}
                    />
                </Col>
            </Row>
        </Container>
    );
}
