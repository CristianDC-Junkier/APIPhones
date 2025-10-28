const sequelize = require("../config/db");

// Importar modelos
const UserAccountModel = require("./AuthModel");
const UserDataModel = require("./UserDataModel");
const DepartmentModel = require("./DepartmentModel");
const SubDepartmentModel = require("./SubDepartmentModel");
const RefreshTokenModel = require("./RefreshTokenModel");
const UpdateModel = require("./UpdateModel");
const TicketModel = require("./TicketModel");

// ----------- DEFINIR RELACIONES -----------

//#region Departamentos
// Relacion Department 1 ↔ 0..* UserData
DepartmentModel.hasMany(UserDataModel, {
    foreignKey: "departmentId",
    as: "users"
});
UserDataModel.belongsTo(DepartmentModel, {
    foreignKey: "departmentId",
    as: "department",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relacion Department 1 ↔ 0..* SubDepartment
DepartmentModel.hasMany(SubDepartmentModel, {
    foreignKey: "departmentId",
    as: "subdepartment"
});
SubDepartmentModel.belongsTo(DepartmentModel, {
    foreignKey: "departmentId",
    as: "department",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relaciones Department 1 ↔ 0..* UserAccount
DepartmentModel.hasMany(UserAccountModel, {
    foreignKey: "departmentId",
    as: "account"
});
UserAccountModel.belongsTo(DepartmentModel, {
    foreignKey: "departmentId",
    as: "department",
    onDelete: "SET NULL",
    onUpdate: "CASCADE"
});

//#endregion

// Relaciones SubDepartment 1 ↔ 0..* UserData
SubDepartmentModel.hasMany(UserDataModel, {
    foreignKey: "subdepartmentId",
    as: "users"
});
UserDataModel.belongsTo(SubDepartmentModel, {
    foreignKey: "subdepartmentId",
    as: "subdepartment",
    onDelete: "SET NULL",
    onUpdate: "CASCADE"
});

//#region UserAccount 
// Relaciones UserAccount 1 ↔ 0..* RefreshToken
UserAccountModel.hasMany(RefreshTokenModel, {
    foreignKey: "userId",
    as: "refreshTokens"
});
RefreshTokenModel.belongsTo(UserAccountModel, {
    foreignKey: "userId",
    as: "user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Relaciones UserAccount 1 ↔ 0..* Ticket (como requester)
UserAccountModel.hasMany(TicketModel, {
    foreignKey: "userRequesterId",
    as: "ticketsRequested",
    constraints: false,
});
TicketModel.belongsTo(UserAccountModel, {
    foreignKey: "userRequesterId",
    as: "requester",
    constraints: false,
});

// Relaciones UserAccount 1 ↔ 0..* Ticket (como resolver)
UserAccountModel.hasMany(TicketModel, {
    foreignKey: "userResolverId",
    as: "ticketsResolved",
    constraints: false,
});
TicketModel.belongsTo(UserAccountModel, {
    foreignKey: "userResolverId",
    as: "resolver",
    constraints: false,
});

//#endregion

// Relaciones UserData 1 ↔ 0..* Ticket (como datos afectados)
UserDataModel.hasMany(TicketModel, {
    foreignKey: "idAffectedData",
    as: "ticketsAffected",
    constraints: false,
});
TicketModel.belongsTo(UserDataModel, {
    foreignKey: "idAffectedData",
    as: "affectedData",
    constraints: false,
});

// ----------- EXPORTAR MODELOS -----------
module.exports = {
    sequelize,
    UserAccount: UserAccountModel,
    UserData: UserDataModel,
    Department: DepartmentModel,
    SubDepartment: SubDepartmentModel,
    RefreshToken: RefreshTokenModel,
    Ticket: TicketModel,
    UpdateModel,
};

// ----------- REGISTRAR HOOKS -----------
require("./Hooks");

