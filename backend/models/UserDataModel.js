const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const { encrypt, decrypt, hash } = require("../utils/Crypto");


/**
 * Modelo Sequelize para almacenar información de datos de los usuarios.
 * Algnos campos están cifrados para mayor seguridad.
 * 
 * Campos:
 * - id              → Identificador único autoincremental.
 * - name            → Nombre completo del usuario (cifrado).
 * - name_hash       → Hash del nombre para búsquedas rápidas y únicas.
 * - extension       → Extensión telefónica (cifrada, validado como número).
 * - number          → Número de teléfono (cifrado, validado con teléfono).
 * - email           → Correo electrónico (cifrado, validado como email).
 * - show            → Mostrar en los listados públicos (true/false)
 * - departmentId    → Clave foránea a Department (obligatorio).
 * - subdepartmentId → Clave foránea a Subdepartment.
 * - userAccountId   → Clave foránea a UserAccount.
 * - version         → Versión del objeto (obligatorio).
 * 
 * Relaciones:
 * - belongsTo UserAccount
 * - belongsTo Department
 * - belongsTo Subdepartment
 * 
 * Hooks:
 * - afterCreate / afterUpdate → Incrementa la fecha del UpdateModel.
 * - beforeUpdate              → Incrementa el campo `version` automáticamente.
 */
const UserData = sequelize.define("UserData", {
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
        allowNull: true,
        unique: {
            name: 'unique_userdataname',
            msg: 'Nombre del trabajador ya existente'
        },
    },
    extension: {
        type: DataTypes.STRING,
        allowNull: true,
        set(value) { this.setDataValue("extension", encrypt(value)); },
        get() { const val = this.getDataValue("extension"); return val ? decrypt(val) : null; },
    },
    number: {
        type: DataTypes.STRING,
        allowNull: true,
        set(value) { this.setDataValue("number", encrypt(value)); },
        get() { const val = this.getDataValue("number"); return val ? decrypt(val) : null; },
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        set(value) { this.setDataValue("email", encrypt(value)); },
        get() { const val = this.getDataValue("email"); return val ? decrypt(val) : null; },
    },
    show: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: { min: 1, max: 100000 },
    },
});



module.exports = UserData;
