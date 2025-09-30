const { UserAccount, UserData, Department, SubDepartment, RefreshToken, UpdateModel } = require("../models/Relations");

const LoggerController = require("./LoggerController");
const { generateToken, decodeToken } = require("../utils/JWT");

/**
 * Controlador de autenticación y gestión de usuarios.
 * 
 * Proporciona métodos estáticos para:
 *  - Listar todos los usuarios
 *  - Crear un usuario
 *  - Modificar un usuario
 *  - Eliminar un usuario
 */
class AuthController {

    /**
    * Crea un nuevo usuario (Worker) junto con su UserData asociado.
    * 
    * @param {Object} req - { body: 
    * { userAccount: { username, password, usertype, departmentId }, 
     *   userData: { name, extension, number, email, departmentId, subdepartmentId } 
    * } }
    * @param {Object} res
    */
    static async createWorker(req, res) {
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

            // WORKER
            i if (userAccount.usertype !== "WORKER") {
                return res.status(403).json({ error: "Solo se pueden crear trabajadores con esta función" });
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
    * Crea un nuevo usuario (Que no sea Worker)
    * 
    * @param {Object} req - { body: { userAccount }
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

            // Validar que el departamento y subdepartamento existen si se proporcionan
            if (userAccount.departmentId) {
                const department = await Department.findByPk(userAccount.departmentId);
                if (!department) {
                    return res.status(400).json({ error: "Departmento no válido" });
                }
            }

            // Validar SUPERADMIN y WORKER
            if ((userAccount.usertype === "SUPERADMIN") && req.user.usertype !== "SUPERADMIN") {
                return res.status(403).json({ error: "Solo un SUPERADMIN puede crear a otro SUPERADMIN" });
            } else if (userAccount.usertype === "WORKER") {
                return res.status(403).json({ error: "No se pueden crear trabajadores con esta función" });
            }

            // Crear UserAccount
            const user = await UserAccount.create({
                username: userAccount.username,
                password: userAccount.password,
                usertype: userAccount.usertype,
                forcePwdChange: true,
                departmentId: userAccount.departmentId
            });

            LoggerController.info('Nuevo usuario ' + user.username + ' creado correctamente');
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
            const { userAccount } = req.body;

            if (!userAccount) {
                return res.status(400).json({ error: "Los datos se aportaron de forma incompleta" });
            }

            const targetUser = await UserAccount.findByPk(targetUserId);
            if (!targetUser) return res.status(404).json({ error: "Usuario no encontrado" });


            // Validar que el nuevo username sea único
            if (userAccount.username && userAccount.username !== targetUser.username) {
                const exists = await UserAccount.findOne({ where: { username: userAccount.username } });
                if (exists) return res.status(400).json({ error: "El nombre de usuario ya existe" });
                targetUser.username = userAccount.username;
            }

            // Solo ADMIN/SUPERADMIN pueden cambiar usertype
            if (userAccount.usertype && ["ADMIN", "SUPERADMIN"].includes(req.user.usertype)) {
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
    * @param {Object} req - Objeto de petición con { params: { id } }.
    * @param {Object} res 
    */
    static async forcePasswordChange(req, res) {
        try {
            const { id } = req.params;
            const { password } = req.body;

            const user = await UserAccount.findByPk(id);
            if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

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
     * Elimina un usuario (No Worker) existente.
     * 
     * @param {Object} req - Objeto de petición con { params: { id } }.
     * @param {Object} res 
     */
    static async delete(req, res) {
        try {
            const { id } = req.params;

            const user = await UserAccount.findByPk(id);
            if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

            await user.destroy();

            LoggerController.info(`Usuario ${user.username} eliminado por ${req.user.username}`);
            res.json({ id });
        } catch (error) {
            LoggerController.error('Error en la eliminación de usuario: ' + error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Elimina un usuario (Worker) existente.
     * 
     * @param {Object} req - Objeto de petición con { params: { id } }.
     * @param {Object} res 
     */
    static async deleteWorker(req, res) {
        try {
            const { id } = req.params;

            const user = await UserAccount.findByPk(id);
            if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

            const userData = await UserData.findOne({ where: { userAccountId: id } });

            await userData.destroy();
            await user.destroy();

            LoggerController.info(`Usuario Worker: ${user.username} y sus Datos de usuario, eliminado por ${req.user.username}`);
            res.json({ id });
        } catch (error) {
            LoggerController.error('Error en la eliminación de usuario: ' + error.message);
            res.status(500).json({ error: error.message });
        }
    }

}

module.exports = AuthController;
