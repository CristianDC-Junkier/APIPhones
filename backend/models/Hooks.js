const { UserAccount, UserData, UpdateModel, RefreshToken } = require("./Relations");

/**
 * Hook: antes de actualizar un UserAccount.
 * 
 * - Incrementa el campo `version` del UserAccount siempre que sea < 100000.
 */
UserAccount.beforeUpdate((user, options) => {
    if (user.version < 100000) {
        user.version += 1;
    } else {
        user.version = 0;
    }
});

/**
 * Hook: después de actualizar un UserAccount.
 * 
 * - Destruir todos los refresh tokens asociados al usuario modificado
 */
UserAccount.afterUpdate(async (user, options) => {
    await RefreshToken.destroy({
        where: { userId: user.id }
    });
});


/**
 * Función auxiliar para actualizar el registro �nico de UpdateModel.
 * - Si existe, incrementa su versión y actualiza la fecha.
 * - Si no existe, crea un registro con id=1.
 */
async function bumpUpdate() {
    try {
        let updateRow = await UpdateModel.findByPk(1);
        if (updateRow) {
            if (updateRow.version < 100000) {
                updateRow.version += 1;
            } else {
                updateRow.version = 0;
            }
            updateRow.date = new Date();
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
 * Hook: antes de actualizar un UserData.
 * 
 * - Incrementa el campo `version` del UserAccount siempre que sea < 100000.
 */
UserData.beforeUpdate((userdata, options) => {
    if (userdata.version < 100000) {
        userdata.version += 1;
    } else {
        userdata.version = 0;
    }
});

/**
 * Hook: antes de validar un UserData.
 * 
 * - Valida que `extension` contenga solo d�gitos.
 * - Valida que `number` tenga un formato de tel�fono v�lido.
 * - Valida que `email` tenga un formato de correo v�lido.
 * 
 * @throws Error si alguna validación falla.
 */
UserData.beforeValidate((userData) => {
    if (userData.extension && !/^\d+$/.test(userData.extension)) {
        throw new Error("Extensión debe ser numérica");
    }
    if (userData.number && !/^[0-9+\-\s()]*$/.test(userData.number)) {
        throw new Error("Teléfono no válido");
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
*/
RefreshToken.beforeUpdate((token, options) => {
    if (!token.expireDate) {
        token.expireDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 días
    }
});

