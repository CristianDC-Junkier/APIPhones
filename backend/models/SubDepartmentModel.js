const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const { encrypt, decrypt } = require("../utils/Crypto");

/**
 * Modelo Sequelize para subdepartamentos de la empresa.
 * Todos los campos tipo STRING se guardan cifrados para proteger datos sensibles.
 * 
 * Campos:
 * - id           → Identificador único autoincremental.
 * - name         → Nombre del subdepartamento (cifrado, único por departamento).
 * - departmentId → Clave foránea a Department (obligatorio).
 * 
 * Relaciones:
 * - belongsTo Department
 * 
 * Índices:
 * - name + departmentId → índice único para que cada departamento no tenga subdepartamentos repetidos.
 */
const SubDepartment = sequelize.define(
    "SubDepartment",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            set(value) { this.setDataValue("name", encrypt(value)); },
            get() {
                const val = this.getDataValue("name");
                return val ? decrypt(val) : null;
            },
        },
        departmentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        indexes: [
            {
                unique: true,
                name: "unique_name_per_department",
                fields: ["name", "departmentId"]
            }
        ]
    }
);





module.exports = SubDepartment;
