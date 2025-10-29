const express = require("express");
const router = express.Router();

const TicketController = require("../controllers/TicketController");
const { adminOnly, isAuthenticated, canModifyUser } = require("../middlewares/Auth");

/**
 * Rutas para la gestión de Tickets
 * 
 * Endpoints:
 * - GET    /           → Listar todos los Tickets
 * - POST   /           → Crear un Ticket
 * - PATCH  /mark       → Marcar un ticket si ha sido leido o resuelto
 */


router.get("/", adminOnly, TicketController.ticketList);
router.get("/count", adminOnly, TicketController.getUnresolvedTickets);

router.post("/", isAuthenticated, TicketController.create);
router.patch("/mark", adminOnly, TicketController.markAs);

module.exports = router;