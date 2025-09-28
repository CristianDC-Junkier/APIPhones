const { UserAccount, UserData, UpdateModel, RefreshToken } = require("./Relations");

/**
 * Hook: antes de actualizar un UserAccount.
 * 
 * - Incrementa el campo `version` del UserAccount siempre que sea < 100.
 */
UserAccount.beforeUpdate((user, options) => {
    if (user.version < 100) {
        user.version += 1;
    }
});

/**
 * Función auxiliar para actualizar el registro único de UpdateModel.
 * - Si existe, incrementa su versión y actualiza la fecha.
 * - Si no existe, crea un registro con id=1.
 */
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

/**
 * Hook: después de actualizar un UserData.
 * 
 * - Actualiza el registro global de UpdateModel.
 */
UserData.afterUpdate(async () => {
    await bumpUpdate();
});

/**
 * Hook: después de crear un UserData.
 * 
 * - Actualiza el registro global de UpdateModel.
 */
UserData.afterCreate(async () => {
    await bumpUpdate();
});

/**
 * Hook: después de actualizar un UserData.
 * 
 * - También actualiza la `version` del UserAccount relacionado,
 *   siempre que sea menor a 100.
 */
UserData.afterUpdate(async (userdata, options) => {
    const userAccount = await userdata.getUserAccount();
    if (userAccount && userAccount.version < 100) {
        userAccount.version += 1;
        await userAccount.save({ hooks: false }); 
    }
});

/**
 * Hook: antes de validar un UserData.
 * 
 * - Valida que `extension` contenga solo dígitos.
 * - Valida que `number` tenga un formato de teléfono válido.
 * - Valida que `email` tenga un formato de correo válido.
 * 
 * @throws Error si alguna validación falla.
 */
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

/**
 * Hook: beforeUpdate
 *
 * - Este hook se ejecuta **antes de actualizar un RefreshToken**.
 * - Si `expireDate` no está definido, se asigna automáticamente
 *   una nueva fecha de expiración con +7 días desde el momento actual.
 *
 * @param {RefreshToken} token - Instancia del token que se está actualizando.
 * @param {object} options - Opciones de la query de Sequelize.
 */
RefreshToken.beforeUpdate((token, options) => {
    if (!token.expireDate) {
        token.expireDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 días
    }
});
