const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const { encrypt, decrypt } = require("../utils/Crypto");

/**
 * Modelo Sequelize para Tickets de incidencias.
 * Todos los campos tipo STRING se guardan cifrados para proteger datos sensibles.
 * 
 * Campos:
 * - id               → Identificador único.
 * - topic            → Asunto del ticket (cifrado).
 * - information      → Texto detallado (cifrado).
 * - status           → Estado del ticket (OPEN, READ, WARNED, RESOLVED).
 * - readAt           → Fecha de lectura (null = no leído).
 * - resolvedAt       → Fecha de resolución (null = no resuelto).
 * - warnedAt         → Fecha de aviso (null = sin aviso).
 * 
 * Relaciones:
 * - belongsTo UserAccount (2 veces):
 *   + userRequesterId  → Usuario que crea el ticket.
 *   + userResolverId   → Usuario que lo resolvió.
 * - belongsTo UserData:
 *   + idAffectedData   → Datos de usuario afectados.
 */
const TicketModel = sequelize.define("Ticket", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    idAffectedData: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userRequesterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userResolverId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    topic: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) { this.setDataValue("topic", encrypt(value)); },
        get() {
            const val = this.getDataValue("topic");
            return val ? decrypt(val) : null;
        },
    },
    information: {
        type: DataTypes.TEXT,
        allowNull: false,
        set(value) { this.setDataValue("information", encrypt(value)); },
        get() {
            const val = this.getDataValue("information");
            return val ? decrypt(val) : null;
        },
    },
    readAt: DataTypes.DATE,
    resolvedAt: DataTypes.DATE,
    warnedAt: DataTypes.DATE,
});


module.exports = TicketModel;
