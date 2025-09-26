const sequelize = require("../config/db");

// Importar modelos
const UserAccount = require("./AuthModel");
const UserData = require("./UserDataModel");
const Department = require("./DepartmentModel");
const SubDepartment = require("./SubDepartmentModel");
const RefreshToken = require("./RefreshTokenModel");
const UpdateModel = require("./UpdateModel");

// Relaciones Department ↔ UserData
Department.hasMany(UserData, {
    foreignKey: "departmentId",
    as: "users"
});
UserData.belongsTo(Department, {
    foreignKey: "departmentId",
    as: "department",
    onDelete: "SET NULL",
    onUpdate: "CASCADE"
});

// Relaciones Department ↔ SubDepartment
Department.hasMany(SubDepartment, {
    foreignKey: "departmentId",
    as: "subdepartments"
});
SubDepartment.belongsTo(Department, {
    foreignKey: "departmentId",
    as: "department",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relaciones SubDepartment ↔ UserData
SubDepartment.hasMany(UserData, {
    foreignKey: "subdepartmentId",
    as: "users"
});
UserData.belongsTo(SubDepartment, {
    foreignKey: "subdepartmentId",
    as: "subdepartment",
    onDelete: "SET NULL",
    onUpdate: "CASCADE"
});

// Relaciones UserAccount ↔ UserData
UserAccount.hasOne(UserData, {
    foreignKey: "userAccountId",
    as: "userData",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});
UserData.belongsTo(UserAccount, {
    foreignKey: "userAccountId",
    as: "userAccount",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relación 1:N con UserAccount
UserAccount.hasMany(RefreshToken, {
    foreignKey: "userId",
    as: "refreshTokens"
});
RefreshToken.belongsTo(UserAccount, {
    foreignKey: "userId",
    as: "user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Exportar
module.exports = {
    sequelize,
    UserAccount,
    UserData,
    Department,
    SubDepartment,
    RefreshToken,
    UpdateModel
};
