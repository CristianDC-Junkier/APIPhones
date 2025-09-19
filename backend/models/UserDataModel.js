const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const { encrypt, decrypt } = require("../utils/Crypto");


/**
 * Modelo Sequelize para almacenar información adicional de usuarios.
 * Todos los campos tipo STRING se guardan cifrados para proteger datos sensibles.
 * 
 * Campos:
 * - id             → Identificador único autoincremental.
 * - name           → Nombre completo del usuario (cifrado).
 * - extension      → Extensión telefónica (cifrada).
 * - number         → Número de teléfono (cifrado).
 * - email          → Correo electrónico (cifrado, validado como email).
 * - departmentId   → Clave foránea a Department.
 * - subdepartmentId→ Clave foránea a Subdepartment.
 * - userAccountId  → Clave foránea a UserAccount (obligatorio).
 * 
 * Relaciones:
 * - belongsTo UserAccount
 * - belongsTo Department
 * - belongsTo Subdepartment
 * 
 * Hooks:
 * - afterCreate / afterUpdate → Incrementa la versión del UserAccount asociado.
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
        unique: true,
        set(value) { this.setDataValue("name", encrypt(value)); },
        get() { const val = this.getDataValue("name"); return val ? decrypt(val) : null; },
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
    }
});

// Relaciones


// Hook para incrementar la version del UserAccount al actualizar UserData
UserData.afterUpdate(async (userdata, options) => {
    const userAccount = await userdata.getUserAccount();
    if (userAccount.version < 100) {
        userAccount.version += 1;
        await userAccount.save({ hooks: false });
    }
});

// Hook para validar campos antes de guardar
UserData.beforeValidate((userData) => {
    if (userData.extension && !/^\d+$/.test(userData.extension)) {
        throw new Error("Extension debe ser numérica");
    }
    if (userData.number && !/^[0-9+\-\s()]*$/.test(userData.number)) {
        throw new Error("Number no válido");
    }
    if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        throw new Error("Email no válido");
    }
});



module.exports = UserData;
