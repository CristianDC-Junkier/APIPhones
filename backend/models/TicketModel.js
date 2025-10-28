const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const { encrypt, decrypt } = require("../utils/Crypto");

/**
 * Modelo Sequelize para tickets.
 * Todos los campos tipo STRING se guardan cifrados para proteger datos sensibles.
 * 
 * Campos:
 * - id     → Identificador único autoincremental.
 * - topic  → Asunto del ticket (cifrado).
 * - text   → Texto del ticket (cifrado).
 * - read   → Booleano que indica si el ticket ha sido leido
 * - solved → Booleano que indica si el ticket ha sido resuelto
 */
const Ticket = sequelize.define("Ticket", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    topic: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
        set(value) { this.setDataValue("topic", encrypt(value)); },
        get() {
            const val = this.getDataValue("topic");
            return val ? decrypt(val) : null;
        },
    },
    text: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
        set(value) { this.setDataValue("text", encrypt(value)); },
        get() {
            const val = this.getDataValue("text");
            return val ? decrypt(val) : null;
        },
    },
    read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    solved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
});


module.exports = Ticket;