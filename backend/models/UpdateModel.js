const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const { UserDataModel } = require("../models/Relations");

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

// Función para actualizar el único registro 
async function bumpUpdate() {
    try {
        let updateRow = await UpdateModel.findByPk(1);
        if (updateRow) {
            updateRow.date = new Date();
            updateRow.version = updateRow.version + 1;
            await updateRow.save();
        } else {
            await UpdateModel.create({
                id: 1,
                date: new Date(),
                version: 1,
            });
        }
    } catch (err) {
        console.error("Error al actualizar UpdateModel:", err);
    }
}

// Hooks para versionado
UserDataModel.afterUpdate(async () => {
    await bumpUpdate();
});
UserDataModel.afterCreate(async () => {
    await bumpUpdate();
});

module.exports = UpdateModel;
