const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const { encrypt, decrypt } = require("../utils/Crypto");


/**
 * Modelo Sequelize para almacenar información de datos de los usuarios.
 * Algnos campos están cifrados para mayor seguridad.
 * 
 * Campos:
 * - id              → Identificador único autoincremental.
 * - name            → Nombre completo del usuario.
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
        allowNull: true,
        unique: true
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
