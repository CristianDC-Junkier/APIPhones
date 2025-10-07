const { UserAccount, UserData, Department, SubDepartment, } = require("../models/Relations");

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
 */
class UserAccountController {

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
                    { model: Department, as: "department", attributes: ["id", "name"] },
                    {
                        model: UserData,
                        as: "userData",
                        include: [
                            { model: Department, as: "department", attributes: ["id", "name"] },
                            { model: SubDepartment, as: "subdepartment", attributes: ["id", "name"] }
                        ]
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
                userData: user.userData ? {
                    id: user.userData.id,
                    name: user.userData.name,
                    extension: user.userData.extension,
                    number: user.userData.number,
                    email: user.userData.email,
                    departmentId: user.userData.departmentId,
                    departmentName: user.userData.department?.name || null,
                    subdepartmentId: user.userData.subdepartmentId,
                    subdepartmentName: user.userData.subdepartment?.name || null,
                    show: user.userData.show,
                    version: user.userData.version
                } : null
            }));

            res.json({ users: formatted });

        } catch (error) {
            const requesterId = req.user?.id;
            LoggerController.error(`Error obteniendo la lista de todos los usuarios: ${error.message} por el usuario: ${requesterId}`);
            res.status(500).json({ error: error.message });
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
            const requesterId = req.user.id;
            const requesterDepartmentId = req.user.departmentId;

            if (!requesterDepartmentId) {
                return res.status(400).json({ error: "El usuario no tiene departamento asignado" });
            }

            // Buscar todos los UserAccount del mismo departamento, excluyendo al requester
            const usersInDepartment = await UserAccount.findAll({
                where: {
                    departmentId: requesterDepartmentId,
                    id: { [Op.ne]: requesterId },// Excluye al que hace la petición
                    usertype: { [Op.notIn]: ["ADMIN", "SUPERADMIN"] } // Excluye Admin y Superadmin
                },
                include: [
                    { model: Department, as: "department", attributes: ["id", "name"] },
                    {
                        model: UserData,
                        as: "userData",
                        include: [
                            { model: Department, as: "department", attributes: ["id", "name"] },
                            { model: SubDepartment, as: "subdepartment", attributes: ["id", "name"] }
                        ]
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
                userData: user.userData ? {
                    id: user.userData.id,
                    name: user.userData.name,
                    extension: user.userData.extension,
                    number: user.userData.number,
                    email: user.userData.email,
                    departmentId: user.userData.departmentId,
                    departmentName: user.userData.department?.name || null,
                    subdepartmentId: user.userData.subdepartmentId,
                    subdepartmentName: user.userData.subdepartment?.name || null,
                    show: user.userData.show,
                    version: user.userData.version
                } : null
            }));

            res.json({ users: formatted });

        } catch (error) {
            const requesterId = req.user?.id;
            LoggerController.error(`Error obteniendo la lista por departamento: ${error.message} por el usuario: ${requesterId}`);
            res.status(500).json({ error: error.message });
        }
    }

    /**
    * Recupera los datos completos de un usuario por su ID.
    * 
    * @param {Object} req - req.params.id es el ID del usuario a consultar
    * @param {Object} res
    */
    static async getOne(req, res) {
        try {
            const { id } = req.params;
            const user = await UserAccount.findByPk(id, {
                include: [
                    { model: Department, as: 'department', attributes: ['id', 'name'] },
                    {
                        model: UserData,
                        as: 'userData',
                        attributes: ['id', 'name', 'extension', 'number', 'email', 'departmentId', 'subdepartmentId'],
                        include: [
                            { model: Department, as: 'department', attributes: ['id', 'name'] },
                            { model: SubDepartment, as: 'subdepartment', attributes: ['id', 'name'] }
                        ]
                    }
                ]
            });

            if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

            res.json({
                id: user.id,
                username: user.username,
                usertype: user.usertype,
                forcePwdChange: user.forcePwdChange,
                departmentId: user.departmentId,
                departmentName: user.department?.name || null,
                version: user.version,
                userData: user.userData ? {
                    id: user.userData.id,
                    name: user.userData.name,
                    extension: user.userData.extension,
                    number: user.userData.number,
                    email: user.userData.email,
                    departmentId: user.userData.departmentId,
                    departmentName: user.userData.department?.name || null,
                    subdepartmentId: user.userData.subdepartmentId,
                    subdepartmentName: user.userData.subdepartment?.name || null,
                    show: user.show,
                    version: user.userData.version
                } : null
            });

        } catch (error) {
            LoggerController.error(`Error obteniendo usuario: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }

    
    /**
    * Crea un nuevo usuario junto con su UserData asociado.
    * 
    * @param {Object} req - { body: 
    * { userAccount: { username, password, usertype, departmentId }, 
    *   userData: { name, extension, number, email, departmentId, subdepartmentId } 
    * } }
    * @param {Object} res
    */
    static async create(req, res) {
        try {
            const { userAccount, userData } = req.body;

            if (!userAccount || !userData) {
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

            // Verificar que el username del data no exista
            const existingData = await UserData.findOne({ where: { name: userData.name } });
            if (existingData) {
                return res.status(400).json({ error: "El nombre de los datos de usuario ya está en uso" });
            }

            // Validar que el departamento del UserData y del User son el mismo
            if (userData.departmentId !== userAccount.departmentId) {
                return res.status(400).json({ error: "El Departamento no es el mismo" });
            }

            // Validar que el departamento y subdepartamento existen si se proporcionan
            if (userData.departmentId) {
                const department = await Department.findByPk(userData.departmentId);
                if (!department) {
                    return res.status(400).json({ error: "Departmento no válido" });
                }
            }

            // Validar que si se proporciona subdepartmentId, también se proporciona departmentId
            if (!userData.departmentId && userData.subdepartmentId) {
                return res.status(400).json({ error: "Departmento no válido" });
            }

            // Validar que el subdepartamento pertenece al departamento indicado y que existe
            if (userData.subdepartmentId) {
                const subdepartment = await SubDepartment.findByPk(userData.subdepartmentId);
                if (!subdepartment) {
                    return res.status(400).json({ error: "Subdepartmento no válido" });
                }
                if (userData.departmentId && subdepartment.departmentId != userData.departmentId) {
                    return res.status(400).json({ error: "subdepartmentId no pertenece al departmentId indicado" });
                }
            }

            // Crear UserAccount
            const user = await UserAccount.create({
                username: userAccount.username,
                password: userAccount.password,
                usertype: userAccount.usertype,
                forcePwdChange: true,
                departmentId: userAccount.departmentId
            });

            // Crear UserData 
            await UserData.create({
                ...userData,
                userAccountId: user.id
            });

            LoggerController.info('Nuevo usuario trabajador ' + user.username + ' creado correctamente');
            res.json({ id: user.id });
        } catch (error) {
            LoggerController.error('Error en la creación de usuario: ' + error.message);
            res.status(400).json({ error: error.message });
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
            const { userAccount, userData } = req.body;

            if (!userAccount || !userData) {
                return res.status(400).json({ error: "Los datos se aportaron de forma incompleta" });
            }

            const targetUser = await UserAccount.findByPk(targetUserId);
            if (!targetUser) return res.status(404).json({ error: "Usuario no encontrado" });
            const targetUserData = await UserData.findByPk(userData.id);
            if (!targetUserData) {
                return res.status(404).json({ error: "Datos de Usuario no encontrado" });
            }

            if (targetUser.version != userAccount.version || targetUserData.version != userData.version) return res.status(403).json({ error: "El usuario ha sido modificado anteriormente" });


            // Validar que el nuevo username sea único
            if (userAccount.username && userAccount.username !== targetUser.username) {
                const exists = await UserAccount.findOne({ where: { username: userAccount.username } });
                if (exists) return res.status(400).json({ error: "El nombre de usuario ya existe" });
                targetUser.username = userAccount.username;
            }

              // Verificar que el username del data no exista
            const existingData = await UserData.findOne({ where: { name: userData.name } });
            if (existingData) {
                return res.status(400).json({ error: "El nombre de los datos de usuario ya está en uso" });
            }


            if (userAccount.usertype && req.user.usertype !== "WORKER") {
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

            // Validar que el departamento y subdepartamento existen si se proporcionan
            if (userData.departmentId) {
                const department = await Department.findByPk(userData.departmentId);
                if (!department) {
                    return res.status(400).json({ error: "Departmento no válido" });
                }
            }

            // Validar que si se proporciona subdepartmentId, también se proporciona departmentId
            if (!userData.departmentId && userData.subdepartmentId) {
                return res.status(400).json({ error: "Departmento no válido" });
            }

            // Validar que el subdepartamento pertenece al departamento indicado y que existe
            if (userData.subdepartmentId) {
                const subdepartment = await SubDepartment.findByPk(userData.subdepartmentId);
                if (!subdepartment) {
                    return res.status(400).json({ error: "Subdepartmento no válido" });
                }
                if (userData.departmentId && subdepartment.departmentId != userData.departmentId) {
                    return res.status(400).json({ error: "subdepartmentId no pertenece al departmentId indicado" });
                }
            }

            if (userData.departmentId !== undefined) targetUserData.departmentId = userData.departmentId;
            if (userData.subdepartmentId !== undefined) targetUserData.subdepartmentId = userData.subdepartmentId;

            // Actualizar solo campos permitidos
            if (userData.name !== undefined) targetUserData.name = userData.name;
            if (userData.extension !== undefined) targetUserData.extension = userData.extension;
            if (userData.number !== undefined) targetUserData.number = userData.number;
            if (userData.email !== undefined) targetUserData.email = userData.email;
            if (userData.userId !== undefined) targetUserData.userAccountId = userData.userId;
            if (userData.show !== undefined) targetUserData.show = userData.show;

            await targetUser.save();
            await targetUserData.save();

            LoggerController.info(`Usuario ${targetUser.username} actualizado por ${req.user.username}`);
            res.json({ id: targetUserId });
        } catch (error) {
            LoggerController.error('Error en modificar la cuenta de usuario: ' + error.message);
            res.status(500).json({ error: error.message });
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

            LoggerController.info(`Usuario ${user.username} marcado para cambio de contraseña por ${req.user.username}`);
            res.json({ id });
        } catch (error) {
            LoggerController.error('Error en forzar cambio de contraseña: ' + error.message);
            res.status(500).json({ error: error.message });
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

            const userData = await UserData.findOne({ where: { userAccountId: id } });

            try {
                await userData.destroy();
            } catch (error) {
                LoggerController.error('Error en la eliminación de los datos de usuario, cuando se intenta eliminar la cuenta: ' + error.message);
            }

            await user.destroy();

            LoggerController.info(`Usuario Worker: ${user.username} y sus Datos de usuario, eliminado por ${req.user.username}`);
            res.json({ id });
        } catch (error) {
            LoggerController.error('Error en la eliminación de usuario: ' + error.message);
            res.status(500).json({ error: error.message });
        }
    }

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
                updates.usertype = usertype;
            } else if (currentUser.usertype === "ADMIN" && usertype && usertype !== "SUPERADMIN") {
                updates.usertype = usertype;
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
            } else if (user.usertype === "WORKER") {
                const userData = await UserData.findOne({ where: { userAccountId: id } });
                await userData.destroy();

            }

            const userData = await UserData.findOne({ where: { userAccountId: id } });

            try {
                await userData.destroy();
            } catch (error) {
                LoggerController.error('Error en la eliminación de los datos de usuario, cuando se intenta su perfil: ' + error.message);
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

}

module.exports = UserAccountController;
