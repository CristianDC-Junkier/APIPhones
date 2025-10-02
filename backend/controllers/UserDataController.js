const { UserAccount, UserData, Department, SubDepartment } = require("../models/Relations")

const LoggerController = require("../controllers/LoggerController");
const { Op } = require("sequelize");


class UserDataController {

    /**
    * Listar UserData para el usuario no autenticado (solo extensión y departamento).
    */
    static async publicList(req, res) {
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
    static async workerList(req, res) {
        try {
            const allData = await UserData.findAll({
                include: [
                    { model: Department, as: "department" },
                    { model: SubDepartment, as: "subdepartment" },
                    { model: UserAccount, as: "userAccount" }
                ]
            });
            const formatted = allData.map(user => ({
                id: user.id,
                name: user.name,
                extension: user.extension,
                number: user.number,
                email: user.email,
                user: user.userAccount?.username,
                departmentId: user.departmentId,
                departmentName: user.department?.name || null,
                subdepartmentId: user.subdepartmentId,
                subdepartmentName: user.subdepartment?.name || null,
            })
            );

            res.json({ users: formatted });
        } catch (error) {
            LoggerController.error(`Error obteniendo la lista de usuarios: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }

    /**
    * Listar todos los UserData para el usuario autenticado, con todos los datos.
    */
    static async workerListByDepartment(req, res) {
        try {
            const requesterId = req.user.id;
            const requesterDepartmentId = req.user.departmentId;

            if (!requesterDepartmentId) {
                return res.status(400).json({ error: "El usuario no tiene departamento asignado" });
            }

            const allData = await UserData.findAll({
                where: {
                    departmentId: requesterDepartmentId,
                    id: { [Op.ne]: requesterId },// Excluye al que hace la petición
                    usertype: { [Op.notIn]: ["ADMIN", "SUPERADMIN"] } // Excluye Admin y Superadmin
                },
                include: [
                    { model: Department, as: "department" },
                    { model: SubDepartment, as: "subdepartment" }
                ]
            });

            const formatted = allData.map(user => ({
                name: user.userData.name,
                extension: user.userData.extension,
                number: user.userData.number,
                email: user.userData.email,
                departmentId: user.userData.departmentId,
                departmentName: user.userData.department?.name || null,
                subdepartmentId: user.userData.subdepartmentId,
                subdepartmentName: user.userData.subdepartment?.name || null,
            })
            );

            res.json({ users: formatted });
        } catch (error) {
            LoggerController.error(`Error obteniendo la lista de usuarios: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }

    /**
    * Permite crear un UserData asignado directamente al usuario autenticado.
    *
    * @param {Object} req - { body: { name, extension, number, email, departmentId, subdepartmentId } }
    * @param {Object} res
    */
    static async create(req, res) {
        try {
            const id = req.user.id;
            const { name, extension, number, email, departmentId, subdepartmentId, userId } = req.body;

            const user = await UserAccount.findByPk(id);
            let userToAssign = userId;

            // Configurar tu id, si eres DEPARTMENT
            if (user.usertype === "DEPARTMENT") {
                userToAssign = id;
            }

            // Validar si el departamento es el tuyo si eres DEPARTMENT
            if (user.usertype === "DEPARTMENT" && departmentId !== user.departmentId) {
                return res.status(403).json({ error: "No puedes asignar UserData a un departamento distinto al tuyo" });
            }

            // Validar el subdepartamento
            let subdepartment = null;
            if (subdepartmentId) {
                subdepartment = await SubDepartment.findByPk(subdepartmentId);
                if (!subdepartment) return res.status(400).json({ error: "Subdepartmento no válido" });
                if (departmentId && subdepartment.departmentId != departmentId) {
                    return res.status(400).json({ error: "subdepartmentId no pertenece al departmentId indicado" });
                }
            }

            const userdata = await UserData.create({
                name,
                extension,
                number,
                email,
                userAccountId: userToAssign,
                departmentId: departmentId || req.user.departmentId,
                subdepartmentId: subdepartmentId || null
            });

            res.status(201).json({ user: userdata });
            LoggerController.info(`UserData creado para el usuario ${userId} con id ${userdata.id}`);

        } catch (error) {
            LoggerController.error(`Error creando UserData para el usuario: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }

    /**
    * Permite actualizar un UserData según permisos del usuario autenticado.
    * 
    * Reglas:
    * - Usuarios que no son WORKER pueden actualizar cualquier UserData.
    * - Usuarios DEPARTMENT solo pueden actualizar UserData de su mismo departamento.
    * 
    * @param {Object} req - Objeto de petición { params: { id }, body: {id, name, extension, number, email, userId, departmentId, subdepartmentId, version} }
    * @param {Object} res 
    */
    static async update(req, res) {
        try {
            const currentUserId = req.user.id;
            const { id, name, extension, number, email, userId, departmentId, subdepartmentId, version } = req.body;

            // Recuperar UserData a modificar
            const userdata = await UserData.findByPk(id);
            if (!userdata) {
                return res.status(404).json({ error: "Datos de Usuario no encontrado" });
            }

            if (userdata.version != version) return res.status(409).json({ error: "Los datos de usuario ha sido modificado por otro proceso" });

            // Verificar que el usuario es DEPARTMENT
            if (req.user.usertype !== "DEPARTMENT") {
                // Validar que el departamento y subdepartamento existen si se proporcionan
                if (departmentId) {
                    const department = await Department.findByPk(departmentId);
                    if (!department) {
                        return res.status(400).json({ error: "Departmento no válido" });
                    }
                }

                // Validar que si se proporciona subdepartmentId, también se proporciona departmentId
                if (!departmentId && subdepartmentId) {
                    return res.status(400).json({ error: "Departmento no válido" });
                }

                // Validar que el subdepartamento pertenece al departamento indicado y que existe
                if (departmentId) {
                    const subdepartment = await SubDepartment.findByPk(subdepartmentId);
                    if (!subdepartment) {
                        return res.status(400).json({ error: "Subdepartmento no válido" });
                    }
                    if (departmentId && subdepartment.departmentId != departmentId) {
                        return res.status(400).json({ error: "subdepartmentId no pertenece al departmentId indicado" });
                    }
                }

                if (departmentId !== undefined) userdata.departmentId = departmentId;
                if (subdepartmentId !== undefined) userdata.subdepartmentId = subdepartmentId;
            }

            // Validar que el userAccountId (userId) pertenece al mismo departamento
            if (userId !== undefined) {
                const userAccount = await UserAccount.findByPk(userId);
                if (!userAccount) {
                    return res.status(400).json({ error: "Usuario no válido" });
                }
                if (userdata.departmentId && userAccount.departmentId !== userdata.departmentId) {
                    return res.status(400).json({ error: "El usuario asignado no pertenece al mismo departamento que el UserData" });
                }
            }

            // Actualizar solo campos permitidos
            if (name !== undefined) userdata.name = name;
            if (extension !== undefined) userdata.extension = extension;
            if (number !== undefined) userdata.number = number;
            if (email !== undefined) userdata.email = email;
            if (userId !== undefined) userdata.userAccountId = userId;

            await userdata.save();

            res.json({
                user: {
                    id: userdata.id,
                    name: userdata.name,
                    extension: userdata.extension,
                    number: userdata.number,
                    email: userdata.email,
                    departmentId: userdata.departmentId,
                    subdepartmentId: userdata.subdepartmentId,
                    userId: userdata.userAccountId
                }
            });

            LoggerController.info(`Usuario ${currentUserId} actualizó UserData ${userdata.id}`);

        } catch (error) {
            LoggerController.error(`Error actualizando UserData: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }


    /**
    * Permite al usuario autenticado eliminar datos asociados.
    * 
    * @param {Object} req - Objeto de petición { param: { user }, query: { version }}
    * @param {Object} res
    */
    static async delete(req, res) {
        try {
            const userId = req.user.id;

            const { version } = req.query;

            // Primero eliminamos los UserData asociados
            await UserData.destroy({ where: { userAccountId: userId } });

            // Luego eliminamos el usuario
            const deleted = await UserAccount.destroy({ where: { id: userId } });

            if (!deleted) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            LoggerController.info(`Usuario ${userId} eliminado correctamente`);
            res.json({ success: true, message: "Cuenta eliminada correctamente" });

        } catch (error) {
            LoggerController.error(`Error eliminando usuario ${req.user.id}: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }

    /**
    * Recupera los datos completos del usuario usando solo el token.
    * 
    * @param {Object} req - Objeto de petición con {params: {id} query: {version}}.
    * @param {Object} res 
    */
    static async getProfile(req, res) {
        try {
            const { version } = req.query;

            const user = await UserAccount.findByPk(req.user.id, {
                include: [
                    { model: Department, as: 'department', attributes: ['id', 'name'] },
                    {
                        model: UserData,
                        as: 'userData',
                        include: [
                            { model: Department, as: 'department', attributes: ['id', 'name'] },
                            { model: SubDepartment, as: 'subdepartment', attributes: ['id', 'name'] }
                        ]
                    }
                ]
            });

            if (user.version != version) return res.status(409).json({ error: "Su perfil ha sido modificado anteriormente" });

            if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

            res.json({
                id: user.id,
                username: user.username,
                usertype: user.usertype,
                forcePwdChange: user.forcePwdChange,
                departmentId: user.departmentId,
                departmentName: user.department?.name || null,
                version: user.version,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                userData: user.userData?.map(ud => ({
                    id: ud.id,
                    name: ud.name,
                    extension: ud.extension,
                    number: ud.number,
                    email: ud.email,
                    departmentId: ud.departmentId,
                    departmentName: ud.department?.name || null,
                    subdepartmentId: ud.subdepartmentId,
                    subdepartmentName: ud.subdepartment?.name || null,
                    version: ud.version
                })) || [] // si no tiene userData, devuelve un array vacío
            });

        } catch (error) {
            LoggerController.error(`Error obteniendo perfil: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }

    /**
    * Permite al usuario autenticado actualizar sus propios datos de UserData.
    * 
    * @param {Object} req - Objeto de petición { param: { user }, query: { version }, body: {id, name, extension, number, email}}
    * @param {Object} res 
    */
    static async updateMyProfile(req, res) {
        try {
            const userId = req.user.id;
            const { version } = req.query;
            const { id, name, extension, number, email } = req.body;

            // Recuperar UserData del usuario
            const userdata = await UserData.findOne({ where: { id: id, userAccountId: userId } });

            if (!userdata) {
                return res.status(404).json({ error: "Datos de Usuario no encontrado" });
            }

            if (userdata.version != version) return res.status(409).json({ error: "Los datos de usuario ha sido modificados anteriormente" });

            // Actualizar solo campos permitidos
            if (name !== undefined) userdata.name = name;
            if (extension !== undefined) userdata.extension = extension;
            if (number !== undefined) userdata.number = number;
            if (email !== undefined) userdata.email = email;

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
    * Permite al usuario autenticado eliminar datos asociados.
    * 
    * @param {Object} req - Objeto de petición { param: { user }, query: { version }}
    * @param {Object} res
    */
    static async deleteMyProfile(req, res) {
        try {
            const userId = req.user.id;

            const { version } = req.query;

            // Primero eliminamos los UserData asociados
            await UserData.destroy({ where: { userAccountId: userId } });

            // Luego eliminamos el usuario
            const deleted = await UserAccount.destroy({ where: { id: userId } });

            if (!deleted) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            LoggerController.info(`Usuario ${userId} eliminado correctamente`);
            res.json({ success: true, message: "Cuenta eliminada correctamente" });

        } catch (error) {
            LoggerController.error(`Error eliminando usuario ${req.user.id}: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }


}

module.exports = UserDataController;
