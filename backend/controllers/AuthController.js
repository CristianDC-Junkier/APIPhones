const { UserAccount, UserData, Department, SubDepartment } = require("../models/Relations");

const LoggerController = require("../controllers/LoggerController");
const { generateToken } = require("../utils/JWT");

/**
 * Controlador de autenticación y gestión de usuarios.
 * 
 * Proporciona métodos estáticos para:
 *  - Login de usuarios
 *  - Listar todos los usuarios
 *  - Crear un usuario
 *  - Modificar un usuario
 *  - Eliminar un usuario
 */
class AuthController {

    /**
     * Inicia sesión con un usuario existente.
     * 
     * @param {Object} req - Objeto de petición de Express, con { body: { username, password } }.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    static async login(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ success: false, message: "Usuario y contraseña requeridos" });
            }

            // Buscar usuario junto con UserData, Department y Subdepartment
            const user = await UserAccount.findOne({
                where: { username },
                include: [
                    {
                        model: UserData,
                        as: 'userData',
                        include: [
                            { model: Department, as: 'department' },
                            { model: SubDepartment, as: 'subdepartment' }
                        ]
                    }
                ]
            });

            if (!user || user.password !== password) {
                return res.status(401).json({ success: false, message: "Credenciales incorrectas" });
            }

            const token = generateToken({ id: user.id, username: user.username, usertype: user.usertype });

            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    usertype: user.usertype,
                    forcePwdChange: user.forcePwdChange,
                    userData: user.userData ? {
                        id: user.userData.id,
                        name: user.userData.name,
                        extension: user.userData.extension,
                        number: user.userData.number,
                        email: user.userData.email,
                        departmentId: user.userData.departmentId,
                        departmentName: user.userData.department?.name || null,
                        subdepartmentId: user.userData.subdepartmentId,
                        subdepartmentName: user.userData.subdepartment?.name || null
                    } : null
                }
            });

            LoggerController.info('Sesión iniciada por ' + user.username);
        } catch (error) {
            LoggerController.error('Error en el login: ' + error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    }


    /**
     * Lista todos los usuarios existentes.
     * 
     * @param {Object} req - Objeto de petición de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     * @returns {JSON} - Array de usuarios con sus atributos: id, username y usertype.
     */
    static async listAll(req, res) {
        try {
            const users = await UserAccount.findAll({ attributes: ["id", "username", "usertype"] });
            res.json(users);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
    * Crea un nuevo usuario junto con su UserData asociado.
    * 
    * @param {Object} req - { body: 
    * { userAccount: { username, password, usertype }, 
     *   userData: { name, extension, number, email, departmentId, subdepartmentId } 
    * } }
    * @param {Object} res
    */
    static async create(req, res) {
        try {
            const { userAccount, userData } = req.body;

            if (!userAccount || !userData) {
                return res.status(400).json({ success: false, message: "Los datos se aportaron de forma incompleta" });
            }

            if (!userAccount.username || !userAccount.password) {
                return res.status(400).json({ success: false, message: "Usuario y contraseña requeridos" });
            }

            // Verificar que el username no exista
            const existingUser = await UserAccount.findOne({ where: { username: userAccount.username } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: "El nombre de usuario ya está en uso" });
            }

            // Validar que el departamento y subdepartamento existen si se proporcionan
            if (userData.departmentId) {
                const department = await Department.findByPk(userData.departmentId);
                if (!department) {
                    return res.status(400).json({ success: false, message: "Departmento no válido" });
                }
            }

            // Validar que si se proporciona subdepartmentId, también se proporciona departmentId
            if (!userData.departmentId && userData.subdepartmentId) {
                return res.status(400).json({ success: false, message: "Departmento no válido" });
            }

            // Validar que el subdepartamento pertenece al departamento indicado y que existe
            if (userData.subdepartmentId) {
                const subdepartment = await Subdepartment.findByPk(userData.subdepartmentId);
                if (!subdepartment) {
                    return res.status(400).json({ success: false, message: "Subdepartmento no válido" });
                }
                if (userData.departmentId && subdepartment.departmentId !== userData.departmentId) {
                    return res.status(400).json({ success: false, message: "subdepartmentId no pertenece al departmentId indicado" });
                }
            }

            // Validar SUPERADMIN
            if ((userAccount.usertype === "SUPERADMIN") && req.user.usertype !== "SUPERADMIN") {
                return res.status(403).json({ success: false, message: "Solo un SUPERADMIN puede crear a otro SUPERADMIN" });
            }

            const forcePwdChange = (userAccount.usertype === "SUPERADMIN" || userAccount.usertype === "ADMIN");

            // Crear UserAccount
            const user = await UserAccount.create({
                username: userAccount.username,
                password: userAccount.password,
                usertype: userAccount.usertype,
                forcePwdChange
            });

            // Crear UserData 
            await UserData.create({
                ...userData,
                userAccountId: user.id
            });

            res.json({ success: true, message: "Usuario registrado correctamente", id: user.id });
            LoggerController.info('Nuevo usuario ' + username + ' creado correctamente');
        } catch (error) {
            LoggerController.error('Error en la creación de usuario: ' + error.message);
            res.status(400).json({ success: false, error: error.message });
        }
    }

    /**
    * Actualiza los datos de un usuario existente.
    * 
    * @param {Object} req - { params: { id }, body: { username, usertype } }.
    * @param {Object} res 
    * 
    */
    static async update(req, res) {
        try {
            const targetUserId = req.params.id;
            const { username, usertype } = req.body;

            const targetUser = await UserAccount.findByPk(targetUserId);
            if (!targetUser) return res.status(404).json({ success: false, message: "Usuario no encontrado" });

            // Validar que el nuevo username sea único
            if (username && username !== targetUser.username) {
                const exists = await UserAccount.findOne({ where: { username } });
                if (exists) return res.status(400).json({ success: false, message: "El nombre de usuario ya existe" });
                targetUser.username = username;
            }

            // Solo ADMIN/SUPERADMIN pueden cambiar usertype
            if (usertype && ["ADMIN", "SUPERADMIN"].includes(req.user.usertype)) {
                targetUser.usertype = usertype;
            }

            await targetUser.save();

            res.json({ success: true, message: "Cuenta de usuario actualizada correctamente" });
            LoggerController.info(`Usuario ${targetUser.username} actualizado por ${req.user.username}`);
        } catch (error) {
            LoggerController.error('Error en modificar la cuenta de usuario: ' + error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    }


    /**
    * Marca un usuario para que deba cambiar la contraseña en su próximo login.
     * 
    * @param {Object} req - Objeto de petición de Express, con { params: { id } }.
    * @param {Object} res - Objeto de respuesta de Express.
    * @returns {JSON} - Mensaje de éxito o error.
    */
    static async forcePasswordChange(req, res) {
        try {
            const { id } = req.params;

            const user = await UserAccount.findByPk(id);
            if (!user) return res.status(404).json({ success: false, message: "Usuario no encontrado" });

            user.forcePwdChange = true;
            await user.save();

            res.json({ success: true, message: "El usuario deberá cambiar la contraseña en su próximo login" });
            LoggerController.info(`Usuario ${user.username} marcado para cambio de contraseña por ${req.user.username}`);
        } catch (error) {
            LoggerController.error('Error en forzar cambio de contraseña: ' + error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Elimina un usuario existente.
     * 
     * @param {Object} req - Objeto de petición de Express, con { params: { id } }.
     * @param {Object} res - Objeto de respuesta de Express.
     * @returns {JSON} - Mensaje de éxito o error. No se puede eliminar al SUPERADMIN.
     */
    static async delete(req, res) {
        try {
            const { id } = req.params;

            const user = await UserAccount.findByPk(id);
            if (!user) return res.status(404).json({ success: false, message: "Usuario no encontrado" });

            await user.destroy();

            res.json({ success: true, message: "Usuario eliminado correctamente" });
            LoggerController.info(`Usuario ${user.username} eliminado por ${req.user.username}`);
        } catch (error) {
            LoggerController.error('Error en la eliminación de usuario: ' + error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    }

}

module.exports = AuthController;
