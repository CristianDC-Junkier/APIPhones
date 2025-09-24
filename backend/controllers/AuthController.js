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
            const { username, password, remember } = req.body;

            if (!username || !password) {
                return res.status(400).json({ error: "Usuario y contraseña requeridos" });
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
                return res.status(401).json({ error: "Credenciales incorrectas" });
            }

            const token = await generateToken({ id: user.id, username: user.username, usertype: user.usertype }, remember);

            res.json({
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
            res.status(500).json({ error: error.message });
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

            // Validar SUPERADMIN
            if ((userAccount.usertype === "SUPERADMIN") && req.user.usertype !== "SUPERADMIN") {
                return res.status(403).json({ error: "Solo un SUPERADMIN puede crear a otro SUPERADMIN" });
            }

            // Crear UserAccount
            const user = await UserAccount.create({
                username: userAccount.username,
                password: userAccount.password,
                usertype: userAccount.usertype,
                forcePwdChange : true
            });

            // Crear UserData 
            await UserData.create({
                ...userData,
                userAccountId: user.id
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
    * @param {Object} req - { params: { id }, body: { username, usertype } }.
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
                targetUser.forcePwdChange = true;
            } else {
                return res.status(400).json({ error: "Debe introducir una contraseña válida" });
            }

            const targetUserData = await UserData.findOne({ where: { userAccountId: targetUserId } });

            if (userData.name && userData.name !== "") targetUserData.name = userData.name;
            if (userData.extension && userData.extension !== "") targetUserData.extension = userData.extension;
            if (userData.number && userData.number !== "") targetUserData.number = userData.number;
            if (userData.email && userData.email !== "") targetUserData.email = userData.email;
            if (userData.departmentId && userData.departmentId !== "") targetUserData.departmentId = userData.departmentId;
            if (userData.subdepartmentId && userData.subdepartmentId !== "") targetUserData.subdepartmentId = userData.subdepartmentId;

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
    * @param {Object} req - Objeto de petición de Express, con { params: { id } }.
    * @param {Object} res - Objeto de respuesta de Express.
    * @returns {JSON} - Mensaje de éxito o error.
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
            if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

            await user.destroy();

            LoggerController.info(`Usuario ${user.username} eliminado por ${req.user.username}`);
            res.json({id} );
        } catch (error) {
            LoggerController.error('Error en la eliminación de usuario: ' + error.message);
            res.status(500).json({ error: error.message });
        }
    }

}

module.exports = AuthController;
