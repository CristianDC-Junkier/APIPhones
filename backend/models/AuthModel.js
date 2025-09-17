const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const { encrypt, decrypt } = require("../utils/Crypto");

/**
 * Modelo Sequelize para usuarios del sistema.
 * 
 * Campos:
 * - id        → Identificador único autoincremental.
 * - username  → Nombre de usuario único y obligatorio.
 * - password  → Contraseña cifrada automáticamente al guardar.
 *               - Al asignar (set): se cifra usando utilidades de crypto.
 *               - Al obtener (get): se descifra para su uso interno.
 * - usertype  → Rol del usuario. Valores posibles: 'USER' (por defecto), 'ADMIN', 'SUPERADMIN'.
 */
const User = sequelize.define("User", {
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
        set(value) {
            this.setDataValue("password", encrypt(value));
        },
        get() {
            const encrypted = this.getDataValue("password");
            if (!encrypted) return null;
            return decrypt(encrypted);
        },
    },
    usertype: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "USER",
    },
});

module.exports = User;
