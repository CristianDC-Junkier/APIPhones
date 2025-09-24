const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const { UserAccount } = require("../models/Relations")
const { encrypt, decrypt } = require("../utils/crypto");

const RefreshToken = sequelize.define("RefreshToken", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
            this.setDataValue("token", encrypt(value));
        },
        get() {
            const encrypted = this.getDataValue("token");
            return encrypted ? decrypt(encrypted) : null;
        },
    },
    expireDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 días
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: UserAccount, key: "id" },
        onDelete: "CASCADE",
    },
});

// Hook para incrementar tiempo de expiración en cada actualización directa
RefreshToken.beforeUpdate((token, options) => {
    if (!token.expireDate) {
        token.expireDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 días
    }
});

module.exports = RefreshToken;
