const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const { encrypt, decrypt } = require("../utils/Crypto");

/**
 * Modelo Sequelize para tickets.
 * Todos los campos tipo STRING se guardan cifrados para proteger datos sensibles.
 * 
 * Campos:
 * - id   → Identificador único autoincremental.
 * - topic → Nombre del departamento (cifrado).
 * - text → 
 * - read →
 * - 
 */
const Ticket = sequelize.define("Ticket", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        set(value) { this.setDataValue("name", encrypt(value)); },
        get() {
            const val = this.getDataValue("name");
            return val ? decrypt(val) : null;
        },
    },
});


module.exports = Ticket;