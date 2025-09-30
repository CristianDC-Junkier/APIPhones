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
 * Funci�n auxiliar para actualizar el registro �nico de UpdateModel.
 * - Si existe, incrementa su versi�n y actualiza la fecha.
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
 * - Valida que `extension` contenga solo d�gitos.
 * - Valida que `number` tenga un formato de tel�fono v�lido.
 * - Valida que `email` tenga un formato de correo v�lido.
 * 
 * @throws Error si alguna validación falla.
 */
UserData.beforeValidate((userData) => {
    if (userData.extension && !/^\d+$/.test(userData.extension)) {
        throw new Error("Extension debe ser num�rica");
    }
    if (userData.number && !/^[0-9+\-\s()]*$/.test(userData.number)) {
        throw new Error("Number no v�lido");
    }
    if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        throw new Error("Email no v�lido");
    }
});

/**
* Hook: beforeUpdate
*
* - Este hook se ejecuta **antes de actualizar un RefreshToken**.
* - Si `expireDate` no está definido, se asigna automáticamente
*   una nueva fecha de expiraci�n con +7 días desde el momento actual.
*
*/
RefreshToken.beforeUpdate((token, options) => {
    if (!token.expireDate) {
        token.expireDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 d�as
    }
});

/**
* Hook: afterUpdate
*
* - Este hook se ejecuta **después de actualizar un UserAccount**.
* - Si se modificó `departmentId`, todos los `UserData` asociados al usuario
*   que **no pertenezcan al mismo departamento** serán desasociados
*   (su `userAccountId` se pone en `null`).
* - Evita disparar otros hooks de `UserData` para no generar loops.
*/
UserAccount.afterUpdate(async (user, options) => {
    try {
        // Verificamos si se actualizó departmentId
        if (user.changed('departmentId')) {

            // Obtenemos todos los UserData asociados
            const userDatas = await user.getUserData();

            for (const ud of userDatas) {
                // Si el UserData no pertenece al mismo departamento, desasociarlo
                if (ud.departmentId !== user.departmentId) {
                    ud.userAccountId = null;
                    await ud.save({ hooks: false }); // evitamos disparar hooks adicionales
                }
            }
        }
    } catch (err) {
        console.error(`Error en afterUpdate de UserAccount: ${err.message}`);
    }
});

