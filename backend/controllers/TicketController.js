const { Ticket } = require("../models/Relations")

const LoggerController = require("../controllers/LoggerController");
const { Op } = require("sequelize");

class TicketController {

    /**
     * Listar todos los tickets
     */
    static async ticketList(req, res) {
        try {
            const tickets = await Ticket.findAll();
            const formatted = tickets.map(ticket => ({
                id: ticket.id,
                topic: ticket.topic,
                text: ticket.text,
                read: ticket.read,
                solved: ticket.solved
            }));

            res.json({ tickets: formatted });
        } catch (error) {
            LoggerController.error(`Error obteniendo la lista de tickets: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }

    /**
    * Permite crear un Ticket.
    *
    * @param {Object} req - { body: { topic, text } }
    * @param {Object} res
    */
    static async create(req, res) {
        try {
            const id = req.user.id;
            const { topic, text } = req.body;

            const user = await UserAccount.findByPk(id);

            const ticket = await Ticket.create({
                topic,
                text,
                read: false,
                solved: false,
            });

            LoggerController.info(`Ticket creado por el usuario ${user.username} con id ${id}`);
            res.status(201).json({ ticket });
        } catch (error) {
            LoggerController.error(`Error creando Ticket para el usuario ${user.username}: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }

    /**
    * Permite macar o desmarcar un Ticket.
    *
    * @param {Object} req - { body: { id, read, solved } }
    * @param {Object} res
    */
    static async markAs(req, res) {
        try {
            const { id, read, solved } = req.body;

            const ticket = await Ticket.findByPk(id);
            if (!ticket) {
                return res.status(404).json({ error: "Ticket no encontrado" });
            }

            if (solved) {
                ticket.read = true;
                ticket.solved = true;
            } else if (read) {
                ticket.read = true;
                ticket.solved = false;
            } else {
                ticket.read = false;
                ticket.solved = false;
            }

            await ticket.save();

            res.json(ticket);


        } catch (error) {
            LoggerController.error(`Error marcando Ticket: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = TicketController;
