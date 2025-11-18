const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const { encrypt, decrypt, hash } = require("../utils/Crypto");

/**
 * Modelo Sequelize para departamentos.
 * Todos los campos tipo STRING se guardan cifrados para proteger datos sensibles.
 * 
 * Campos:
 * - id   → Identificador único autoincremental.
 * - name → Nombre del departamento (cifrado).
 * - name_hash → Hash del nombre para búsquedas rápidas y únicas.
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
        set(value) {
            this.setDataValue("name", encrypt(value));
            this.setDataValue("name_hash", hash(value));
        },
        get() {
            const val = this.getDataValue("name");
            return val ? decrypt(val) : null;
        },
    },
    name_hash: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: {
            name: 'unique_departmentname',
            msg: 'Nombre del departamento ya existente'
        },
    },
});


module.exports = Department;
