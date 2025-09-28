const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const { encrypt, decrypt } = require("../utils/Crypto");

/**
 * Modelo Sequelize para cuentas de usuario del sistema.
 * 
 * Campos:
 * - id             → Identificador único autoincremental.
 * - username       → Nombre de usuario único y obligatorio.
 * - password       → Contraseña cifrada automáticamente al guardar.
 *                    - Al asignar (set): se cifra usando utilidades de crypto.
 *                    - Al obtener (get): se descifra para su uso interno.
 * - usertype       → Rol del usuario. Valores posibles: 'WORKER' (por defecto), 'DEPARTMENT', 'ADMIN', 'SUPERADMIN'.
 * - version        → Contador de modificaciones del usuario, entero entre 0 y 100.
 *                    Se incrementa automáticamente con cada cambio en este modelo o en UserData asociado.
 */
const UserAccount = sequelize.define("UserAccount", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) { this.setDataValue("password", encrypt(value)); },
        get() {
            const encrypted = this.getDataValue("password");
            return encrypted ? decrypt(encrypted) : null;
        },
    },
    usertype: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "WORKER",
    },
    forcePwdChange: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false, 
    },
    version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0, max: 100 },
    },
});



module.exports = UserAccount;
