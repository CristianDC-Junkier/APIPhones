/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Container, Row, Col, Input, Button, Badge } from "reactstrap";
import { faEnvelope, faEnvelopeOpen, faCheckCircle, faExclamationTriangle, faSortAmountUp, faSortAmountDown, faSearch, faSyncAlt} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaArrowLeft } from 'react-icons/fa';

import BackButtonComponent from "../../components/utils/BackButtonComponent";
import SpinnerComponent from "../../components/utils/SpinnerComponent";
import TicketListComponent from "../../components/ticket/TicketListComponent";
import TicketViewerComponent from "../../components/ticket/TicketViewerComponent";
import TicketDropdownMenuComponent from "../../components/ticket/TicketDropdownMenuComponent";
import { getTicketList, markTicket } from "../../services/TicketService";

export default function DashboardTickets() {
    const [tickets, setTickets] = useState([]);
    const [ticketsResolved, setTicketsResolved] = useState([]);
    const [ticketsWarned, setTicketsWarned] = useState([]);
    const [ticketsRead, setTicketsRead] = useState([]);
    const [ticketsUnread, setTicketsUnread] = useState([]);

    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [ticketContent, setTicketContent] = useState(null);

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [currentView, setCurrentView] = useState("open");
    const [sortOrder, setSortOrder] = useState("desc");
    const [searchTerm, setSearchTerm] = useState("");
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 992);

    // Detectar tamaño de pantalla
    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth < 992);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        document.title = "Panel de control de Reportes - Listín telefónico - Ayuntamiento de Almonte";
    }, []);

    useEffect(() => {
        fetchTickets(true);
    }, []);

    const fetchTickets = async (init = false) => {
        if (init) setLoading(true);
        else setRefreshing(true);

        try {
            const res = await getTicketList();
            if (res.success) {
                const list = res.data.tickets;
                setTickets(list);
                setTicketsResolved(list.filter((t) => t.status === "RESOLVED"));
                setTicketsWarned(list.filter((t) => t.status === "WARNED"));
                setTicketsRead(list.filter((t) => t.status === "READ"));
                setTicketsUnread(list.filter((t) => t.status === "OPEN"));
                return list;
            }
        } finally {
            if (init) setLoading(false);
            setRefreshing(false);
        }
    };

    const handleMarkTicket = async (idList, newStatus) => {
        let read = false, resolved = false, currentview = "open";
        if (newStatus === "OPEN") {
            currentview = "open";
            read = false;
            resolved = false;
        }
        if (newStatus === "READ") {
            currentview = "read";
            read = true;
            resolved = false;
        }
        if (newStatus === "RESOLVED") {
            currentview = "resolved";
            read = true;
            resolved = true;
        }

        const response = await markTicket({
            idList,
            read,
            resolved,
            warned: false,
        });

        if (response.success) {
            const updatedList = await fetchTickets();
            setCurrentView(currentview);
            if (newStatus === "READ") {
                const updated = updatedList.find((t) => t.id === idList);
                setSelectedTicket(idList);
                setTicketContent(updated);
            } else {
                setSelectedTicket(null);
                setTicketContent(null);
            }
            setSelectedIds([]);
        }
    };

    const handleSelectTicket = async (id) => {
        const ticket = tickets.find((t) => t.id === id);
        if (ticket.status === "OPEN") {
            await handleMarkTicket(id, "READ");
        } else {
            setSelectedTicket(id);
            setTicketContent(ticket);
        }
    };

    const handleChangeView = (view) => {
        setCurrentView(view);
        setSelectedIds([]);
    };

    const filteredTickets = (() => {
        let base =
            currentView === "resolved"
                ? ticketsResolved
                : currentView === "warned"
                    ? ticketsWarned
                    : currentView === "read"
                        ? ticketsRead
                        : ticketsUnread;

        if (searchTerm) {
            base = base.filter((t) =>
                (`#${t.id} - ${t.topic}`).toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return base.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });
    })();

    if (loading) return <SpinnerComponent />;

    // ================= MOBILE VIEW =================
    if (isMobileView) {
        return (
            <div className="d-flex flex-column flex-lg-row ">


                {!ticketContent ? (
                    <Container
                        fluid
                        className="d-flex flex-column bg-light"
                        style={{
                            marginTop: "3.5rem",
                            marginBottom: "1rem",
                            minHeight: "78vh",
                        }}
                    >
                        {/*  Botón fijo de volver al home */}
                        <div className="position-absolute top-0 start-0">
                            <BackButtonComponent back="/home" />
                        </div>
                        {/* ====== Encabezado ====== */}
                        <Row className="bg-white border-bottom align-items-center p-2">
                            <Col xs="8">
                                <h5 className="mb-0 fw-bold text-primary">Tickets</h5>
                            </Col>
                            <Col xs="4" className="text-end">
                                <Button
                                    color="link"
                                    size="sm"
                                    onClick={() => fetchTickets(false)}
                                    title="Actualizar"
                                    disabled={refreshing}
                                >
                                    <FontAwesomeIcon icon={faSyncAlt} spin={refreshing} />
                                </Button>
                            </Col>
                        </Row>

                        {/* ====== Buscador + orden ====== */}
                        <Row className="bg-light align-items-center gx-1 gy-0 p-2">
                            {/* Buscador */}
                            <Col xs={selectedIds.length === 0 ? "11" : "10"} className="position-relative">
                                <div className="position-relative w-100">
                                    <Input
                                        bsSize="sm"
                                        type="text"
                                        placeholder="Buscar ticket..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-100 pe-4"
                                        style={{ height: "32px" }}
                                    />
                                    <FontAwesomeIcon
                                        icon={faSearch}
                                        className="position-absolute top-50 end-0 translate-middle-y text-muted me-2 fa-sm"
                                    />
                                </div>
                            </Col>

                            {/* Botón de orden */}
                            <Col xs={selectedIds.length === 0 ? "1" : "1"} className="text-end p-0">
                                <Button
                                    size="sm"
                                    color="light"
                                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                                    style={{ height: "32px", width: "32px", padding: 0 }}
                                >
                                    <FontAwesomeIcon
                                        icon={sortOrder === "asc" ? faSortAmountUp : faSortAmountDown}
                                    />
                                </Button>
                            </Col>

                            {/* Menú de acciones */}
                            <Col xs="1" className="text-end p-0">
                                <TicketDropdownMenuComponent
                                    selectedIds={selectedIds}
                                    onMarkTicket={handleMarkTicket}
                                    disabled={selectedIds.length === 0}
                                />
                            </Col>
                        </Row>


                        {/* ====== Filtros por estado ====== */}
                        <Row className="bg-white border-top border-bottom mt-1 p-2 g-2 text-center">
                            {[
                                { key: "open", icon: faEnvelope, label: "Nuevos", color: "primary", count: ticketsUnread.length },
                                { key: "read", icon: faEnvelopeOpen, label: "Leídos", color: "info", count: ticketsRead.length },
                                { key: "resolved", icon: faCheckCircle, label: "Contestados", color: "success", count: ticketsResolved.length },
                                { key: "warned", icon: faExclamationTriangle, label: "Avisados", color: "warning", count: ticketsWarned.length },
                            ].map((item) => (
                                <Col xs="6" key={item.key}>
                                    <Button
                                        color="white"
                                        outline={currentView !== item.key}
                                        size="sm"
                                        className={`w-100 d-flex justify-content-between align-items-center ${currentView === item.key ? "btn-outline-primary" : "btn-light"}`}
                                        onClick={() => handleChangeView(item.key)}
                                    >
                                        <span className="d-flex align-items-center">
                                            <FontAwesomeIcon icon={item.icon} className="me-1" />
                                            {item.label}
                                        </span>
                                        <Badge style={{ "--bs-badge-padding-x": "0.75em" }} color={item.color}>{item.count}</Badge>
                                    </Button>
                                </Col>
                            ))}
                        </Row>


                        {/* ====== Lista de tickets ====== */}
                        <Row className="flex-grow-1">
                            <Col className="p-0">
                                <div style={{ height: "100%" }}>
                                    <TicketListComponent
                                        tickets={filteredTickets}
                                        selectedTicket={selectedTicket}
                                        onSelectTicket={handleSelectTicket}
                                        selectedIds={selectedIds}
                                        onSelectionChange={setSelectedIds}
                                    />
                                </div>
                            </Col>
                        </Row>
                    </Container>
                ) : (
                    // ======== Vista del ticket en móvil ========
                    <Container
                        fluid
                        className="d-flex flex-column"
                        style={{
                            marginTop: "3.5rem",
                            minHeight: "80vh",
                        }}
                    >
                        {/*  Botón fijo de volver al home */}
                        <div className="position-absolute top-0 start-0">
                            <Button
                                onClick={() => {
                                    setSelectedTicket(null);
                                    setTicketContent(null);
                                }}
                                style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    boxShadow: 'none',
                                    fontSize: '1.5rem',
                                    color: 'inherit',
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.color = '#999')}
                                onMouseOut={(e) => (e.currentTarget.style.color = 'inherit')}
                            >
                                <FaArrowLeft size={32} />
                            </Button>
                        </div>

                        <Row className="m-0 mb-2">
                            <Col xs="12" className="flex-grow-1 overflow-auto p-0 mb-2">
                                <div style={{ maxHeight: "100%", overflowY: "auto" }}>
                                    <TicketViewerComponent
                                        ticket={ticketContent}
                                        onMarkTicket={handleMarkTicket}
                                    />
                                </div>
                            </Col>
                        </Row>
                    </Container>
                )}

            </div>
        );
    }


    // ================= DESKTOP VIEW =================
    return (
        <div className="d-flex flex-column flex-lg-row bg-light rounded shadow-sm" style={{ minHeight: "80vh", maxHeight: "80vh" }}>
            <div className="position-absolute top-0 start-0">
                <BackButtonComponent back="/home" />
            </div>

            {/* Panel lateral */}
            <div className="bg-white border-end d-flex flex-column" style={{ width: "100%", maxWidth: "300px" }}>
                <div className="d-flex justify-content-between align-items-center border-bottom p-2 bg-light">
                    <h5 className="mb-0 fw-bold text-primary">Tickets</h5>
                    <Button
                        color="link"
                        size="sm"
                        onClick={() => fetchTickets(false)}
                        title="Actualizar"
                        disabled={refreshing}
                    >
                        <FontAwesomeIcon icon={faSyncAlt} spin={refreshing} />
                    </Button>
                </div>

                <div className="d-flex flex-column border-bottom p-2">
                    {[
                        { key: "open", icon: faEnvelope, label: "Nuevos", color: "primary", count: ticketsUnread.length },
                        { key: "read", icon: faEnvelopeOpen, label: "Leídos", color: "info", count: ticketsRead.length },
                        { key: "resolved", icon: faCheckCircle, label: "Contestados", color: "success", count: ticketsResolved.length },
                        { key: "warned", icon: faExclamationTriangle, label: "Avisados", color: "warning", count: ticketsWarned.length },
                    ].map((item) => (
                        <button
                            key={item.key}
                            className={`btn btn-sm text-start d-flex align-items-center justify-content-between mb-1 ${currentView === item.key ? "btn-outline-primary" : "btn-light"}`}
                            onClick={() => handleChangeView(item.key)}
                        >
                            <span>
                                <FontAwesomeIcon icon={item.icon} className="me-2" /> {item.label}
                            </span>
                            <Badge style={{ "--bs-badge-padding-x": "0.75em" }} color={item.color}>{item.count}</Badge>
                        </button>
                    ))}
                </div>

                <div className="d-flex align-items-center p-2 border-bottom bg-light">
                    <div className="position-relative flex-grow-1 me-2">
                        <Input
                            bsSize="sm"
                            type="text"
                            placeholder="Buscar ticket..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingRight: "28px", height: "32px" }}
                        />
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="position-absolute top-50 end-0 translate-middle-y text-muted me-2 fa-sm"
                        />
                    </div>

                    <Button
                        size="sm"
                        color="light"
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                        style={{ height: "32px", width: "32px", padding: 0 }}
                    >
                        <FontAwesomeIcon icon={sortOrder === "asc" ? faSortAmountUp : faSortAmountDown} />
                    </Button>

                    <TicketDropdownMenuComponent
                        selectedIds={selectedIds}
                        onMarkTicket={handleMarkTicket}
                        disabled={selectedIds.length === 0}
                    />
                </div>

                <div className="flex-grow-1 overflow-auto">
                    <TicketListComponent
                        tickets={filteredTickets}
                        selectedTicket={selectedTicket}
                        onSelectTicket={handleSelectTicket}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                    />
                </div>
            </div>

            {/* Panel de lectura */}
            <div className="flex-grow-1 bg-white overflow-auto">
                <div style={{ maxHeight: "100%", overflowY: "auto" }}>
                    <TicketViewerComponent
                        ticket={ticketContent}
                        onMarkTicket={handleMarkTicket}
                    />
                </div>
            </div>
        </div>
    );
}
