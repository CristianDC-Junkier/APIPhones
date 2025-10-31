const { Ticket, UserAccount } = require("../models/Relations");
const LoggerController = require("../controllers/LoggerController");
const { Op } = require('sequelize');

/**
 * TicketController
 * ----------------
 * Controlador para la gestión de tickets de incidencias.
 * Proporciona métodos para:
 *  - Listar tickets
 *  - Crear tickets
 *  - Marcar tickets como leídos, avisados o resueltos
 */
class TicketController {

    /**
     * Listar todos los tickets
     */
    static async ticketList(req, res) {
        try {
            const tickets = await Ticket.findAll();

            // Formateamos el resultado, descifrando topic e information
            const formatted = tickets.map(ticket => ({
                id: ticket.id,
                topic: ticket.topic,
                information: ticket.information,
                status: ticket.status,
                createdAt: ticket.createdAt,
                readAt: ticket.readAt,
                resolvedAt: ticket.resolvedAt,
                warnedAt: ticket.warnedAt,
                userRequesterId: ticket.userRequesterId,
                userResolverId: ticket.userResolverId,
                idAffectedData: ticket.idAffectedData
            }));

            res.json({ tickets: formatted });
        } catch (error) {
            LoggerController.error(`Error obteniendo la lista de tickets: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Cuenta todos los ticket que no estén resueltos
     */

    static async getUnresolvedTickets(req, res) {
        try {
            const count = await Ticket.count({
                where: {
                    status: {
                        [Op.or]: ['OPEN', 'READ']
                    }
                }
            })

            res.json(count);
        } catch (error) {
            LoggerController.error("Error contando los tickets " + error.message)
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Crear un ticket
     * @param {Object} req.body - { topic, information, idAffectedData }
     */
    static async create(req, res) {
        try {
            const requesterId = req.user.id;
            const { topic, information, idAffectedData } = req.body;

            // Creamos el ticket con status inicial OPEN
            const ticket = await Ticket.create({
                topic,
                information,
                idAffectedData,
                userRequesterId: requesterId,
                status: "OPEN",
                createdAt: new Date(),
                readAt: null,
                resolvedAt: null,
                warnedAt: null
            });

            // Log general + log de ticket
            LoggerController.info(`Ticket creado por el usuario ${requesterId}`);
            LoggerController.ticketAction({
                ticketId: ticket.id,
                action: "CREATE",
                userId: requesterId
            });

            res.status(201).json({ ticket });
        } catch (error) {
            LoggerController.error(`Error creando ticket: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Marcar un ticket (read, warned, resolved)
     * @param {Object} req.body - { id, read, warned, resolved }
     */
    static async markAs(req, res) {
        try {
            const { id, read, warned, resolved } = req.body;
            const userId = req.user.id;

            const ticket = await Ticket.findByPk(id);
            if (!ticket) return res.status(404).json({ error: "Ticket no encontrado" });

            // Actualizamos status y fechas
            if (resolved) {
                ticket.status = "RESOLVED";
                ticket.readAt = new Date();
                ticket.resolvedAt = new Date();
                ticket.userResolverId = userId;
            } else if (warned) {
                ticket.status = "WARNED";
                ticket.warnedAt = new Date();
            } else if (read) {
                ticket.status = "READ";
                ticket.readAt = new Date();
            } else {
                ticket.status = "OPEN";
                ticket.readAt = null;
                ticket.resolvedAt = null;
                ticket.warnedAt = null;
            }

            await ticket.save();

            // Log de ticket
            const action = resolved ? "RESOLVE" : warned ? "WARN" : read ? "READ" : "OPEN";
            LoggerController.ticketAction({
                ticketId: ticket.id,
                action,
                userId
            });

            res.json(ticket);
        } catch (error) {
            LoggerController.error(`Error marcando ticket: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }

}

module.exports = TicketController;
