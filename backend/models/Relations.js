const sequelize = require("../config/db");

// Importar modelos
const UserAccount = require("./AuthModel");
const UserData = require("./UserDataModel");
const Department = require("./DepartmentModel");
const SubDepartment = require("./SubDepartmentModel");
const RefreshToken = require("./RefreshTokenModel");
const UpdateModel = require("./UpdateModel");

// ----------- DEFINIR RELACIONES -----------


// Relaciones Department 1 ↔ 0..* UserData
Department.hasMany(UserData, {
    foreignKey: "departmentId",
    as: "users"
});
UserData.belongsTo(Department, {
    foreignKey: "departmentId",
    as: "department",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relaciones Department 1 ↔ 0..* SubDepartment
Department.hasMany(SubDepartment, {
    foreignKey: "departmentId",
    as: "subdepartment"
});
SubDepartment.belongsTo(Department, {
    foreignKey: "departmentId",
    as: "department",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relaciones Department 1 ↔ 0..* UserAccount
Department.hasMany(UserAccount, {
    foreignKey: "departmentId",
    as: "account"
});
UserAccount.belongsTo(Department, {
    foreignKey: "departmentId",
    as: "department",
    onDelete: "SET NULL",
    onUpdate: "CASCADE"
});

// Relaciones SubDepartment 1 ↔ 0..* UserData
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

// Relaciones UserAccount (1 si es Worker) 0 ↔ 0..* (1 si es Worker) UserData
UserAccount.hasMany(UserData, {
    foreignKey: "userAccountId",
    as: "userData",
});
UserData.belongsTo(UserAccount, {
    foreignKey: "userAccountId",
    as: "userAccount",
    onDelete: "SET NULL",
    onUpdate: "CASCADE"
});

// Relaciones UserAccount 1 ↔ 0..* RefreshToken
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

// ----------- EXPORTAR MODELOS -----------
module.exports = {
    sequelize,
    UserAccount,
    UserData,
    Department,
    SubDepartment,
    RefreshToken,
    UpdateModel
};

// ----------- REGISTRAR HOOKS -----------
require("./Hooks");

