const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Modelo Sequelize para el control de actualizaciones globales del sistema.
 *
 * Este modelo siempre tiene un único registro con `id = 1`.
 *
 * Campos:
 * - id      → Identificador único (constante en 1).
 * - date    → Fecha del último update, en formato timestamp (DATE SQL).
 * - version → Contador de modificaciones de las listas, entero entre 0 y 100000.
 *             Se incrementa automáticamente con cada cambio en el UserData asociado.
 */
const UpdateModel = sequelize.define("UpdateModel", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false, 
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0, max: 100000 },
    },
});

module.exports = { UpdateModel };
