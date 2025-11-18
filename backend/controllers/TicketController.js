const { Ticket, UserAccount, UserData, Department, SubDepartment  } = require("../models/Relations");
const LoggerController = require("../controllers/LoggerController");
const MailerController = require("./MailerController");
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
            const tickets = await Ticket.findAll({
                include: [
                    // Usuario que creó el ticket
                    {
                        model: UserAccount,
                        as: "requester",
                        attributes: ["username"],
                    },
                    // Usuario que resolvió el ticket
                    {
                        model: UserAccount,
                        as: "resolver",
                        attributes: ["username"],
                    },
                    // Datos afectados
                    {
                        model: UserData,
                        as: "affectedData",
                        include: [
                            {
                                model: SubDepartment,
                                as: "subdepartment",
                                attributes: ["id", "name"]
                            },
                            {
                                model: Department,
                                as: "department",
                                attributes: ["id", "name"],
                            }
                        ],
                    },
                ],
                order: [["createdAt", "DESC"]],
            });

            // Formateo del resultado
            const formatted = tickets.map((ticket) => ({
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
                idAffectedData: ticket.idAffectedData,
                affectedDepartment: ticket.affectedData?.department?.name,
                affectedSubDepartment: ticket.affectedData?.subdepartment?.name,
                userRequesterName: ticket.requester?.username || null,
                userResolverName: ticket.resolver?.username || null,
            }));

            return res.json({ success: true, tickets: formatted });
        } catch (error) {
            LoggerController.error('Error recogiendo los tickets por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            return res.status(500).json({ error: error.message });
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
            LoggerController.error('Error contando los tickets por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            return res.status(500).json({ error: error.message });
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

            // Envio de notificaciones
            await MailerController.sendNotif(ticket);

            res.status(201).json({ ticket });
        } catch (error) {
            LoggerController.error('Error creando un ticket por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            return res.status(500).json({ error: error.message });
        }
    }

    /**
     * Marcar tickets (read, warned, resolved)
     * idList puede ser uno o varios
     * @param {Object} req.body - { idList, read, warned, resolved }
     */
    static async markAs(req, res) {
        try {
            const { idList, read, warned, resolved } = req.body;
            const userId = req.user.id;

            if (idList.length === 0)
                return res.status(400).json({ error: "Debe especificar al menos un id o lista de ids" });

            const tickets = await Ticket.findAll({
                where: { id: idList },
            });

            if (!tickets.length)
                return res.status(404).json({ error: "Ningún ticket encontrado" });

            const updatedTickets = [];

            for (const ticket of tickets) {
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

                const action = resolved
                    ? "RESOLVE"
                    : warned
                        ? "WARN"
                        : read
                            ? "READ"
                            : "OPEN";

                LoggerController.ticketAction({
                    ticketId: ticket.id,
                    action,
                    userId,
                });

                updatedTickets.push(ticket);
            }

            res.json({ count: updatedTickets.length });
        } catch (error) {
            LoggerController.error('Error modificado un ticket por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            return res.status(500).json({ error: error.message });
        }
    }

}

module.exports = TicketController;
