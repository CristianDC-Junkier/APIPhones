import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, CardBody, CardTitle, CardText } from "reactstrap";
import Swal from "sweetalert2";

import BackButtonComponent from "../../components/utils/BackButtonComponent";
import SpinnerComponent from "../../components/utils/SpinnerComponent";
import TicketListComponent from "../../components/ticket/TicketListComponent";
import TicketViewerComponent from "../../components/ticket/TicketViewerComponent"

import { getTicketList } from "../../services/TicketService";

/**
 * Página encargada de mostrar la bandeja de tickets
 * Permite filtrar entre todos, no resueltos y resueltos.
 */
export default function DashboardTickets() {
    const [tickets, setTickets] = useState([]);
    const [ticketsResolved, setTicketsResolved] = useState([]);
    const [ticketsUnresolved, setTicketsUnresolved] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [ticketContent, setTicketContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentView, setCurrentView] = useState("tickets"); // all | unresolved | resolved

    // 🔄 Cargar tickets desde el backend
    useEffect(() => {
        const fetchTickets = async () => {
            setLoading(true);
            try {
                const res = await getTicketList();
                if (res.success) {
                    setTickets(res.data.tickets);
                    setTicketsResolved(tickets.filter((t) => { t.status === "RESOLVED" || t.status === "WARNED" }));
                    setTicketsUnresolved(tickets.filter((t) => { t.status !== "RESOLVED" || t.status !== "WARNED" }));
                }
                else
                    Swal.fire("Error", "No se pudieron obtener los tickets.", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    // Seleccionar ticket
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

    // Filtrado
    const filteredTickets =
        currentView === "resolved"
            ? ticketsResolved
            : currentView === "unresolved"
                ? ticketsUnresolved
                : tickets;

    if (loading) return <SpinnerComponent />;

    return (
        <Container className="mt-4 d-flex flex-column" style={{ minHeight: "70vh" }}>

            {/* Botón Volver */}
            <div className="position-absolute top-0 start-0">
                <BackButtonComponent back="/home" />
            </div>


            {/* Tarjetas para cambiar de vista solo para ADMIN/SUPERADMIN */}
            <Row className="mb-3 mt-4 justify-content-center g-3">
                <Col xs={6} sm={6} md={4} l={3} xl={3}>
                    <Card
                        className={`shadow-lg mb-2 border-2 ${currentView === "tickets" ? "border-primary" : ""}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setCurrentView("tickets")}
                    >
                        <CardBody className="text-center pt-3">
                            <CardTitle tag="h6">Todos</CardTitle>
                            <CardText className="fs-4 fw-bold">{tickets.length}</CardText>
                        </CardBody>
                    </Card>
                </Col>
                <Col xs={6} sm={6} md={4} l={3} xl={3}>
                    <Card
                        className={`shadow-lg mb-2 border-2 ${currentView === "unresolved" ? "border-primary" : ""}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setCurrentView("unresolved")}
                    >
                        <CardBody className="text-center pt-3">
                            <CardTitle tag="h6">No Resueltos</CardTitle>
                            <CardText className="fs-4 fw-bold">{ticketsUnresolved.length}</CardText>
                        </CardBody>
                    </Card>
                </Col>
                <Col xs={6} sm={6} md={4} l={3} xl={3}>
                    <Card
                        className={`shadow-lg mb-2 border-2 ${currentView === "resolved" ? "border-primary" : ""}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setCurrentView("resolved")}
                    >
                        <CardBody className="text-center pt-3">
                            <CardTitle tag="h6">Resueltos</CardTitle>
                            <CardText className="fs-4 fw-bold">{ticketsResolved.length}</CardText>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* 🖥️ Escritorio */}
            <Row className="d-none d-lg-flex flex-grow-1" style={{ display: "flex", flexDirection: "row", flex: 1, height: "auto", overflow: "hidden", }}>
                <Col lg="4" style={{height: "calc(65vh)", overflowY: "auto", paddingRight: "0.5rem",}}>
                    <TicketListComponent
                        tickets={filteredTickets}
                        selectedTicket={selectedTicket}
                        onSelectTicket={handleSelectTicket}
                    />
                </Col>

                <Col lg="8" style={{ height: "calc(65vh)", overflowY: "auto", paddingLeft: "1rem", }}>
                    <TicketViewerComponent ticket={ticketContent} />
                </Col>
            </Row>

            {/* Móvil */}
            <Row className="d-flex d-lg-none flex-column">
                <Col xs="12" style={{marginBottom: "0.5rem", maxHeight: "50vh", overflowY: "auto", }}>
                    <TicketViewerComponent ticket={ticketContent} />
                </Col>
                <Col xs="12">
                    <hr />
                </Col>
                <Col xs="12" style={{paddingTop: "0.5rem", marginBottom: "1rem", maxHeight: "50vh", overflowY: "auto",}}>
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
