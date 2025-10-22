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
                where: { departmentId: { [Op.ne]: null }, show : true }
            });

            const formatted = allData.map(user => ({
                number: user.number,
                extension: user.extension,
                departmentId: user.departmentId,
                departmentName: user.department?.name || null,
                subdepartmentId: user.subdepartmentId,
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
                userId: user.userAccount?.id,
                user: user.userAccount?.username,
                userVersion: user.userAccount?.version,
                departmentId: user.departmentId,
                departmentName: user.department?.name || null,
                subdepartmentId: user.subdepartmentId,
                subdepartmentName: user.subdepartment?.name || null,
                show: user.show,
                version: user.version
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
                    departmentId: requesterDepartmentId
                },
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
                userId: user.userAccount?.id,
                user: user.userAccount?.username,
                userVersion: user.userAccount?.version,
                departmentId: user.departmentId,
                departmentName: user.department?.name || null,
                subdepartmentId: user.subdepartmentId,
                subdepartmentName: user.subdepartment?.name || null,
                show: user.show,
                version: user.version
            })
            );

            res.json({ users: formatted });
        } catch (error) {
            LoggerController.error(`Error obteniendo la lista de usuarios: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }

    /**
    * Permite crear un UserData sin usuario asignado.
    *
    * @param {Object} req - { body: { name, extension, number, email, departmentId, subdepartmentId } }
    * @param {Object} res
    */
    static async create(req, res) {
        try {
            const id = req.user.id;
            const { name, extension, number, email, departmentId, subdepartmentId, show } = req.body;

            const user = await UserAccount.findByPk(id);

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
                departmentId: departmentId || null,
                subdepartmentId: subdepartmentId || null,
                show,
            });

            LoggerController.info(`UserData creado por el usuario ${user.username} con id ${id}`);
            res.status(201).json({ user: userdata });

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
            const { id, name, extension, number, email, userId, departmentId, subdepartmentId, show, version } = req.body;

            // Recuperar UserData a modificar
            const userdata = await UserData.findByPk(id);
            if (!userdata) {
                return res.status(404).json({ error: "Datos de Usuario no encontrado" });
            }

            if (userdata.version != version) return res.status(403).json({ error: "Los datos de usuario ha sido modificado por otro proceso" });

            // Verificar que el usuario no es DEPARTMENT
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
                if (subdepartmentId) {
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
            if (show != undefined) userdata.show = show;

            await userdata.save();

            res.json({
                user: {
                    id: userdata.id,
                    name: userdata.name,
                    extension: userdata.extension,
                    number: userdata.number,
                    email: userdata.email,
                    show: userdata.show,
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
            const userDataId = req.params.id;
            const { version } = req.query;

            const data = await UserData.findByPk(userDataId);
            if (!data) return res.status(404).json({ error: "Datos de Usuario no encontrado" });

            if (data.version != version) return res.status(403).json({ error: "El usuario ha sido modificado anteriormente" });

            await data.destroy();

            LoggerController.info(`Datos de Usuario ${userDataId} eliminado correctamente`);
            res.json({ success: true, message: "Datos eliminados correctamente" });

        } catch (error) {
            LoggerController.error(`Error eliminando datos de usuario ${req.user.id}: ${error.message}`);
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
                userData: user.userData ? {
                    id: user.userData.id,
                    name: user.userData.name,
                    extension: user.userData.extension,
                    number: user.userData.number,
                    email: user.userData.email,
                    show: user.userData.show,
                    departmentId: user.userData.departmentId,
                    departmentName: user.userData.department?.name || null,
                    subdepartmentId: user.userData.subdepartmentId,
                    subdepartmentName: user.userData.subdepartment?.name || null,
                    version: user.userData.version
                }: null
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
            const { id, name, extension, number, email, version, show } = req.body;

            // Recuperar UserData del usuario
            const userdata = await UserData.findOne({ where: { id: id, userAccountId: userId } });

            if (!userdata) {
                return res.status(404).json({ error: "Datos de Usuario no encontrado" });
            }

            if (userdata.version != version) return res.status(409).json({ error: "Los datos de usuario ha sido modificados anteriormente" }); //ESTO NO ESTA BIEN

            // Actualizar solo campos permitidos
            if (name !== undefined) userdata.name = name;
            if (extension !== undefined) userdata.extension = extension;
            if (number !== undefined) userdata.number = number;
            if (email !== undefined) userdata.email = email;
            if (show !== undefined) userdata.show = show;

            await userdata.save();

            res.json({
                user: {
                    name: userdata.name,
                    extension: userdata.extension,
                    number: userdata.number,
                    email: userdata.email,
                    show: userdata.show,
                }
            });

            LoggerController.info(`Datos del usuario ${userId} actualizados`);
        } catch (error) {
            consola.
            LoggerController.error(`Error actualizando los Datos de Usuario: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }

}

module.exports = UserDataController;
