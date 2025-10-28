const { UserAccount, Department, SubDepartment } = require("../models/Relations");

const LoggerController = require("./LoggerController");
const { generateToken } = require("../utils/JWT");
const { Op } = require("sequelize");


/**
 * Controlador de autenticación y gestión de usuarios.
 * 
 * Proporciona métodos estáticos para:
 *  - Listar todos los usuarios
 *  - Crear un usuario
 *  - Modificar un usuario
 *  - Eliminar un usuario
 *  - Actualizar propia cuenta de usuario
 *  - Eliminar propia cuenta de usuario
 *  - Forzar cambio de contraseña de otro usuario
 *  - Cambiar contraseña propia tras ser marcado
 */
class UserAccountController {

    //#region Métodos recuperación de usuarios
    /**
    * Listar todos los usuarios con su UserData y relaciones.
    * 
    * @param {Object} req - req.user viene del middleware isAuthenticated
    * @param {Object} res
    */
    static async listUsers(req, res) {
        try {
            // Traer todos los usuarios
            const users = await UserAccount.findAll({
                include: [
                    {
                        model: Department,
                        as: "department",
                        include: [
                            {
                                model: SubDepartment,
                                as: "subdepartment",
                                attributes: ["id", "name"]
                            }
                        ],
                        attributes: ["id", "name"]
                    }
                ]
            });

            const formatted = users.map(user => ({
                id: user.id,
                username: user.username,
                usertype: user.usertype,
                forcePwdChange: user.forcePwdChange,
                departmentId: user.departmentId,
                departmentName: user.department?.name || null,
                version: user.version,
            }));

            return res.json({ users: formatted });

        } catch (error) {
            LoggerController.error('Error recogiendo los usuarios por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            return res.status(500).json({ error: error.message });
        }
    }

    /**
    * Listar Users de todos los usuarios del mismo departamento que el que hace la petición.
    * No se devuelve a si mismo, ni a los usuarios Admin o Superadmin.
    * 
    * @param {Object} req - req.user viene del middleware isAuthenticated
    * @param {Object} res
    */
    static async listUsersByDepartment(req, res) {
        try {
            const requesterDepartmentId = req.user.departmentId;

            if (!requesterDepartmentId) {
                return res.status(400).json({ error: "El usuario no tiene departamento asignado" });
            }

            // Buscar todos los UserAccount del mismo departamento, excluyendo al requester
            const usersInDepartment = await UserAccount.findAll({
                where: {
                    departmentId: requesterDepartmentId,
                    '$userAccount.usertype$': { [Op.notIn]: ["ADMIN", "SUPERADMIN"] }
                },
                include: [
                    {
                        model: Department,
                        as: "department",
                        include: [
                            {
                                model: SubDepartment,
                                as: "subdepartment",
                                attributes: ["id", "name"]
                            }
                        ],
                        attributes: ["id", "name"]
                    }
                ]
            });

            const formatted = usersInDepartment.map(user => ({
                id: user.id,
                username: user.username,
                usertype: user.usertype,
                forcePwdChange: user.forcePwdChange,
                departmentId: user.departmentId,
                departmentName: user.department?.name || null,
                version: user.version,
                
            }));

            return res.json({ users: formatted });

        } catch (error) {
            LoggerController.error('Error recogiendo los usuarios de el departamento' + req.user.departmentId + ' por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            return res.status(500).json({ error: error.message });
        }
    }
    //#endregion

    //#region Métodos CRUD de usuarios
    /**
    * Crea una nueva cuenta de usuario.
    * 
    * @param {Object} req - { body: 
    * { userAccount: { username, password, usertype, departmentId } } }
    * @param {Object} res
    */
    static async create(req, res) {
        try {
            const { userAccount } = req.body;

            if (!userAccount) {
                return res.status(400).json({ error: "Los datos se aportaron de forma incompleta" });
            }

            if (!userAccount.username || !userAccount.password) {
                return res.status(400).json({ error: "Usuario y contraseña requeridos" });
            }

            // Verificar que el username no exista
            const existingUser = await UserAccount.findOne({ where: { username: userAccount.username } });
            if (existingUser) {
                return res.status(400).json({ error: "El nombre de usuario ya está en uso" });
            }

            // Crear UserAccount
            const user = await UserAccount.create({
                username: userAccount.username,
                password: userAccount.password,
                usertype: userAccount.usertype,
                forcePwdChange: userAccount.usertype === "USER" ? false : true,
                departmentId: userAccount.departmentId
            });

            LoggerController.info('Usuario con id ' + user.id + ' creado correctamente por el usuario con id ' + req.user.id);
            return res.json({ id: user.id });
        } catch (error) {
            LoggerController.error('Error creando un usuario por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            return res.status(400).json({ error: error.message });
        }
    }

    /**
    * Actualiza los datos de un usuario existente.
    * 
    * @param {Object} req - { params: { id }, body: { userAccount } }.
    * @param {Object} res 
    * 
    */
    static async update(req, res) {

        try {

            const targetUserId = req.params.id;
            const { userAccount } = req.body;

            if (!userAccount) {
                return res.status(400).json({ error: "Los datos se aportaron de forma incompleta" });
            }

            const targetUser = await UserAccount.findByPk(targetUserId);
            if (!targetUser) return res.status(404).json({ error: "Usuario no encontrado" });

            if (targetUser.version != userAccount.version) return res.status(403).json({ error: "El usuario ha sido modificado anteriormente" });


            // Validar que el nuevo username sea único
            if (userAccount.username && userAccount.username !== targetUser.username) {
                const exists = await UserAccount.findOne({ where: { username: userAccount.username } });
                if (exists) return res.status(400).json({ error: "El nombre de usuario ya existe" });
                targetUser.username = userAccount.username;
            }

            if (userAccount.usertype && req.user.usertype !== "USER") {
                targetUser.departmentId = userAccount.departmentId;
            }
            // Solo ADMIN/SUPERADMIN pueden cambiar usertype
            if (["ADMIN", "SUPERADMIN"].includes(req.user.usertype)) {
                targetUser.usertype = userAccount.usertype;
            }

            //Comprobar si se a escrito una nueva contraseña
            if (userAccount.password && userAccount.password !== "") {
                targetUser.password = userAccount.password;
                targetUser.forcePwdChange = false;
            } else {
                return res.status(400).json({ error: "Debe introducir una contraseña válida" });
            }

            await targetUser.save();

            LoggerController.info('Usuario con id ' + user.id + ' actualizado correctamente por el usuario con id ' + req.user.id);
            return res.json({ id: targetUserId });
        } catch (error) {
            LoggerController.error('Error modificando al usuario con id ' + user.id + ' por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            return res.status(500).json({ error: error.message });
        }
    }

    /**
    * Marca un usuario para que deba cambiar la contraseña en su próximo login.
     * 
    * @param {Object} req - Objeto de petición con { params: { id }, body: { password, version } }.
    * @param {Object} res 
    */
    static async forcePasswordChange(req, res) {
        try {
            const { id } = req.params;
            const { version } = req.query;
            const { password } = req.body;

            const user = await UserAccount.findByPk(id);
            if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

            if (user.version != version) return res.status(403).json({ error: "El usuario ha sido modificado anteriormente" });

            user.forcePwdChange = true;
            user.password = password;
            await user.save();

            LoggerController.info('Usuario con id ' + user.id + ' marcado para cambio de contraseña por el usuario con id ' + req.user.id);
            res.json({ id });
        } catch (error) {
            LoggerController.error('Error forzando la recuperación de contraseña del un usuario con id ' + id + ' por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            return res.status(500).json({ error: error.message });
        }
    }

    /**
    * Elimina un usuario  existente.
    * 
    * @param {Object} req - Objeto de petición con { params: { id }, body: { version } }.
    * @param {Object} res 
    */
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const { version } = req.query;

            const user = await UserAccount.findByPk(id);
            if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

            if (user.version != version) return res.status(403).json({ error: "El usuario ha sido modificado anteriormente" });

           await user.destroy();

            LoggerController.info('Usuario con id ' + user.id + ' eliminado por el usuario con id ' + req.user.id);
            return res.json({ id });
        } catch (error) {
            LoggerController.error('Error eliminando un usuario con id ' + id + ' por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            return res.status(500).json({ error: error.message });
        }
    }
    //#endregion

    //#region Métodos de gestión de la propia cuenta
    /**
    * Permite al usuario autenticado modificar su propia cuenta.
    * 
    * @param {Object} req - Objeto de petición con { params: { user }, body: { username, usertype, department, oldPassword, newPassword, version } }.
    * @param {Object} res.
    */
    static async updateMyAccount(req, res) {
        try {
            const currentUser = req.user;
            const { username, usertype, department, oldPassword, newPassword } = req.body;
            const { version } = req.query;

            const user = await UserAccount.findByPk(currentUser.id);
            if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
            if (user.version != version) return res.status(409).json({ error: "Su usuario ha sido modificado anteriormente" });

            const updates = {};

            // --- Contraseña ---
            if (!oldPassword || !newPassword) {
                return res.status(400).json({ error: "Ambas contraseñas son requeridas para actualizarla" });
            }
            if (oldPassword === newPassword) {
                return res.status(400).json({ error: "La contraseña nueva debe ser diferente a la actual" });
            }
            if (user.password !== oldPassword) {
                return res.status(400).json({ error: "La contraseña actual no es correcta" });
            }

            updates.password = newPassword;
            updates.forcePwdChange = false;


            // --- Username ---
            if (!username) return res.status(400).json({ error: "El nombre de usuario es obligatorio" });

            const exists = await UserAccount.findOne({
                where: { username, id: { [Op.ne]: currentUser.id } }
            });
            if (exists) return res.status(400).json({ error: "El nombre de usuario ya existe" });

            updates.username = username;

            // --- Department (solo ADMIN/SUPERADMIN) ---
            if (["ADMIN", "SUPERADMIN"].includes(currentUser.usertype)) {
                updates.departmentId = department;
            }

            // --- Usertype ---
            if (currentUser.usertype === "SUPERADMIN") {
                if (!usertype) return res.status(400).json({ error: "El tipo de usuario es obligatorio" });
                if (currentUser.id !== 1) {
                    updates.usertype = usertype;
                }
            } else if (currentUser.usertype === "ADMIN") {
                if (!usertype) return res.status(400).json({ error: "El tipo de usuario es obligatorio" });
                if (usertype !== "SUPERADMIN") {
                    updates.usertype = usertype;
                }
            }

            // Aplicar cambios
            await user.update(updates);

            const token = await generateToken({
                id: user.id,
                username: user.username,
                usertype: user.usertype,
                departmentId: user.departmentId,
                remember: currentUser.remember || false
            });

            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    usertype: user.usertype,
                    forcePwdChange: user.forcePwdChange,
                    departmentId: user.departmentId,
                    version: user.version,
                }
            });

            LoggerController.info(`Usuario ${currentUser.id} actualizó su perfil`);

        } catch (error) {
            LoggerController.error(`Error actualizando perfil: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }

    /**
    * Permite al usuario autenticado eliminar su propia cuenta.
    * 
    * @param {Object} req - Objeto de petición con { params: { id }, body: { version } }.
    * @param {Object} res.
    */
    static async deleteMyAccount(req, res) {
        try {
            const { id } = req.user;
            const { version } = req.query;

            const user = await UserAccount.findByPk(id);
            if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

            if (user.version != version) return res.status(409).json({ error: "Su usuario ha sido modificado anteriormente" });

            if (user.usertype === "SUPERADMIN") {
                return res.status(403).json({ error: "Un SUPERADMIN no puede eliminarse" });
            }

            await user.destroy();

            LoggerController.info(`Usuario ${req.user.username} se elimino a si mismo`);
            res.json({ id: id });
        } catch (error) {
            LoggerController.error('Error en la eliminación de usuario: ' + error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
    * Permite al usuario autenticado cambiar su contraseña tras ser marcado.
    * 
    * @param {Object} req - Objeto de petición con { params: { id }, body: { newPassword } }.
    * @param {Object} res
    */
    static async forcedPasswordChange(req, res) {
        try {
            const userId = req.user.id;
            const { newPassword } = req.body;

            if (!newPassword) {
                return res.status(400).json({ error: "Nueva contraseña requerida" });
            }

            const user = await UserAccount.findByPk(userId);

            // Actualizar contraseña
            user.password = newPassword;
            user.forcePwdChange = false;
            await user.save();

            res.json({ id: userId });
            LoggerController.info(`Usuario ${userId} cambió su contraseña`);
        } catch (error) {
            LoggerController.error(`Error actualizando contraseña: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }
    //#endregion

}

module.exports = UserAccountController;
