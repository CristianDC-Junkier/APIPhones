const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const { encrypt, decrypt } = require("../utils/Crypto");

/**
 * Modelo Sequelize para departamentos de la empresa.
 * Todos los campos tipo STRING se guardan cifrados para proteger datos sensibles.
 * 
 * Campos:
 * - id   → Identificador único autoincremental.
 * - name → Nombre del departamento (cifrado).
 */
const Department = sequelize.define("Department", {
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


module.exports = Department;
