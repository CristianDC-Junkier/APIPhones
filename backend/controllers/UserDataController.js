const { UserAccount, UserData, Department, SubDepartment } = require("../models/Relations")

const LoggerController = require("../controllers/LoggerController");
const { Op } = require("sequelize");


class UserDataController {

    /**
    * Listar UserData para el usuario no autenticado (solo extensión y departamento).
    */
    static async list(req, res) {
        try {
            const allData = await UserData.findAll({
                include: ["department", "subdepartment"],
                where: { departmentId: { [Op.ne]: null } }
            });

            const formatted = allData.map(user => ({
                extension: user.extension,
                departmentName: user.department?.name || null,
                subdepartmentName: user.subdepartment?.name || null
            }));

            res.json({ users: formatted });
        } catch (error) {
            LoggerController.error(`Error obteniendo la lista pública: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }

    /**
    * Listar todos los UserData para el usuario autenticado, con todos los datos.
    */
    static async listAll(req, res) {
        try {
            const allData = await UserAccount.findAll({
                include: [
                    {
                        model: UserData,
                        as: "userData",
                        include: [
                            { model: Department, as: "department" },
                            { model: SubDepartment, as: "subdepartment" }
                        ]
                    }
                ]
            });

            const formatted = allData.map(user => ({
                id: user.id,
                username: user.username,
                usertype: user.usertype,
                forcePwdChange: user.forcePwdChange,
                userData: user.userData
                    ? {
                        id: user.userData.id,
                        name: user.userData.name,
                        extension: user.userData.extension,
                        number: user.userData.number,
                        email: user.userData.email,
                        departmentId: user.userData.departmentId,
                        departmentName: user.userData.department?.name || null,
                        subdepartmentId: user.userData.subdepartmentId,
                        subdepartmentName: user.userData.subdepartment?.name || null
                    }
                    : null
            }));

            res.json({ users: formatted });
        } catch (error) {
            LoggerController.error(`Error obteniendo la lista de usuarios: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }

    /**
    * Listar UserData de todos los usuarios del mismo departamento que el que hace la petición.
    * Solo devuelve usuarios que tengan departmentId asignado.
    * 
    * @param {Object} req - req.user viene del middleware isAuthenticated
    * @param {Object} res
     */
    static async listByDepartment(req, res) {
        try {
            const { departmentId, requesterId } = req.params;

            // Buscar usuarios por departamento, excluyendo al requester
            const usersInDepartment = await UserAccount.findAll({
                include: [
                    {
                        model: UserData,
                        as: "userData",
                        where: {
                            departmentId,
                            //id: { [Op.ne]: requesterId } // Excluye al que hace la petición
                        },
                        include: [
                            { model: Department, as: "department" },
                            { model: SubDepartment, as: "subdepartment" }
                        ]
                    }
                ]
            });

            const formatted = usersInDepartment.map(user => ({
                id: user.id,
                username: user.username,
                usertype: user.usertype,
                forcePwdChange: user.forcePwdChange,
                userData: user.userData
                    ? {
                        id: user.userData.id,
                        name: user.userData.name,
                        extension: user.userData.extension,
                        number: user.userData.number,
                        email: user.userData.email,
                        departmentId: user.userData.departmentId,
                        departmentName: user.userData.department?.name || null,
                        subdepartmentId: user.userData.subdepartmentId,
                        subdepartmentName: user.userData.subdepartment?.name || null
                    }
                    : null
            }));

            res.json({ users: formatted });
        } catch (error) {
            LoggerController.error(`Error obteniendo la lista por departamento: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Recupera los datos completos del usuario usando solo el token.
     * 
     * @param {Object} req - Objeto de petición de Express, con `req.user` proveniente del middleware de autenticación.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    static async getProfile(req, res) {
        try {
            const user = await UserAccount.findByPk(req.user.id, {
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

            if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

            res.json({
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

        } catch (error) {
            LoggerController.error(`Error obteniendo perfil: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Permite al usuario autenticado actualizar sus propios datos de UserData.
     * 
     * @param {Object} req - Objeto de petición de Express, con `req.user` del middleware de autenticación.
     * @param {Object} res - Objeto de respuesta de Express.
     * @returns {JSON} - Datos actualizados o error.
     */
    static async updateMyProfileData(req, res) {
        try {
            const userId = req.user.id;
            const { name, extension, number, email } = req.body;

            // Recuperar UserData del usuario
            const userdata = await UserData.findOne({ where: { userAccountId: userId } });

            if (!userdata) {
                return res.status(404).json({ error: "Datos de Usuario no encontrado" });
            }

            // Actualizar solo campos permitidos
            if (name) userdata.name = name;
            if (extension) userdata.extension = extension;
            if (number) userdata.number = number;
            if (email) userdata.email = email;

            await userdata.save();

            res.json({
                user: {
                    name: userdata.name,
                    extension: userdata.extension,
                    number: userdata.number,
                    email: userdata.email
                }
            });

            LoggerController.info(`Datos del usuario ${userId} actualizados`);
        } catch (error) {
            LoggerController.error(`Error actualizando los Datos de Usuario: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }

    /**
    * Permite al usuario autenticado cambiar su nombre de usuario.
    * 
    * @param {Object} req - req.user contiene el usuario autenticado.
    * @param {Object} res
    */
    static async updateMyUsername(req, res) {
        try {
            const userId = req.user.id;
            const { username } = req.body;

            if (!username) {
                return res.status(400).json({ error: "El nuevo nombre de usuario es requerido" });
            }

            // Verificar que el username no exista ya
            const exists = await UserAccount.findOne({ where: { username } });
            if (exists) return res.status(400).json({ error: "El nombre de usuario ya existe" });

            // Actualizar username
            const user = await UserAccount.findByPk(userId);
            user.username = username;
            await user.save();

            res.json({ username:user.username });
            LoggerController.info(`Usuario ${userId} cambió su username a ${username}`);
        } catch (error) {
            LoggerController.error(`Error actualizando username: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }

    /**
    * Permite al usuario autenticado cambiar su contraseña.
    * 
    * @param {Object} req - req.user contiene el usuario autenticado.
    * @param {Object} res
    */
    static async updateMyPassword(req, res) {
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

            res.json({ id:userId });
            LoggerController.info(`Usuario ${userId} cambió su contraseña`);
        } catch (error) {
            LoggerController.error(`Error actualizando contraseña: ${error.message}`);
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
                    {
                        model: UserData,
                        as: 'userData',
                        include: [
                            { model: Department, as: 'department' },
                            { model: Subdepartment, as: 'subdepartment' }
                        ]
                    }
                ]
            });

            if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

            res.json({
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
        } catch (error) {
            LoggerController.error(`Error obteniendo usuario: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Modifica todos los valores de UserData que se le pasen.
     * 
     * @param {Object} req - req.params.id es el ID del usuario cuyo UserData se va a modificar
     * @param {Object} req.body - Objeto con los campos a actualizar en UserData
     * @param {Object} res
     */
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { name, extension, number, email, departmentId, subdepartmentId } = req.body;

            const userData = await UserData.findOne({ where: { userAccountId: id } });
            if (!userData) return res.status(404).json({ error: "UserData no encontrado" });

            const requester = req.user; // viene del middleware de autenticación

            // Campos que se pueden actualizar según el tipo de usuario
            let updateFields = { name, extension, number, email };

            if (["ADMIN", "SUPERADMIN"].includes(requester.usertype)) {
                // ADMIN/SUPERADMIN pueden actualizar departamento y subdepartamento
                if (departmentId !== undefined) updateFields.departmentId = departmentId;
                if (subdepartmentId !== undefined) updateFields.subdepartmentId = subdepartmentId;
            } else {
                // Usuarios normales solo pueden actualizar subdepartamento, no departamento
                if (subdepartmentId !== undefined) updateFields.subdepartmentId = subdepartmentId;
            }

            await userData.update(updateFields);

            res.json({ id });
            LoggerController.info(`UserData de usuarioId ${id} actualizado por ${requester.username}`);
        } catch (error) {
            LoggerController.error(`Error actualizando UserData: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }



}

module.exports = UserDataController;
