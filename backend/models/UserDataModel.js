const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const { encrypt, decrypt } = require("../utils/Crypto");
const UserAccount = require("./UserAccount");
const Department = require("./DepartmentModel");
const Subdepartment = require("./SubdepartmentModel");

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
        validate: { isEmail: true },
    },
    departmentId: {
        type: DataTypes.INTEGER,
        references: { model: Department, key: "id" },
        allowNull: true,
    },
    subdepartmentId: {
        type: DataTypes.INTEGER,
        references: { model: Subdepartment, key: "id" },
        allowNull: true,
    },
    userAccountId: {
        type: DataTypes.INTEGER,
        references: { model: UserAccount, key: "id" },
        allowNull: false,
    },
});

// Relaciones
UserData.belongsTo(UserAccount, {
    foreignKey: "userAccountId",
    as: "userAccount",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

UserData.belongsTo(Department, {
    foreignKey: "departmentId",
    as: "department"
});
UserData.belongsTo(Subdepartment, {
    foreignKey: "subdepartmentId",
    as: "subdepartment"
});

// Hook para incrementar la version del UserAccount al actualizar UserData
UserData.afterUpdate(async (userdata, options) => {
    const userAccount = await userdata.getUserAccount();
    if (userAccount.version < 100) {
        userAccount.version += 1;
        await userAccount.save({ hooks: false });
    }
});


module.exports = UserData;
