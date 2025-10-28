const { UserAccount, UserData, Department, SubDepartment } = require("../models/Relations")

const LoggerController = require("../controllers/LoggerController");
const { Op } = require("sequelize");


/**
 * Controlador para la gestión de UserData.
 * 
 * Proporciona métodos estáticos para:
 * - Listar UserData para usuarios no autenticados
 * - Listar UserData para usuarios autenticados
 * - Crear nuevos UserData
 * - Actualizar UserData existentes
 * - Eliminar UserData
 * - Obtener perfil del usuario autenticado
 */
class UserDataController {

    //#region Métodos recuperación de datos de usuarios (trabajadores)
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

            return res.json({ users: formatted });
        } catch (error) {
            LoggerController.error('Error recogiendo la lista pública por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            return res.status(500).json({ error: error.message });
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
                    { model: SubDepartment, as: "subdepartment" }
                ]
            });
            const formatted = allData.map(user => ({
                id: user.id,
                name: user.name,
                extension: user.extension,
                number: user.number,
                email: user.email,
                departmentId: user.departmentId,
                departmentName: user.department?.name || null,
                subdepartmentId: user.subdepartmentId,
                subdepartmentName: user.subdepartment?.name || null,
                show: user.show,
                version: user.version
            })
            );

            return res.json({ users: formatted });
        } catch (error) {
            LoggerController.error('Error recogiendo la lista de trabajadores por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            return res.status(500).json({ error: error.message });
        }
    }

    /**
    * Listar todos los UserData para el usuario autenticado, con todos los datos
    * por un departamento específico (el del usuario autenticado).
    */
    static async workerListByDepartment(req, res) {
        try {
            const requesterId = req.user.id;
            const depID = req.params.depID;
            
            if (!depID) {
                return res.status(400).json({ error: "El usuario no tiene departamento asignado" });
            }

            const allData = await UserData.findAll({
                where: {
                    departmentId: depID
                },
                include: [
                    { model: Department, as: "department" },
                    { model: SubDepartment, as: "subdepartment" },
                ]
            });
            const formatted = allData.map(user => ({
                id: user.id,
                name: user.name,
                extension: user.extension,
                number: user.number,
                email: user.email,
                departmentId: user.departmentId,
                departmentName: user.department?.name || null,
                subdepartmentId: user.subdepartmentId,
                subdepartmentName: user.subdepartment?.name || null,
                show: user.show,
                version: user.version
            })
            );

            return res.json({ users: formatted });
        } catch (error) {
            LoggerController.error('Error recogiendo la lista de trabajadores por el departamento con id ' + req.params.depID + ' por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            return res.status(500).json({ error: error.message });
        }
    }
    //#endregion

    //#region Metódos CRUD de datos de usuarios (trabajadores)
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

            LoggerController.info('Datosd de usuario con id ' + userdata.id + ' creado correctamente por el usuario con id ' + req.user.id);
            return res.json({ user: userdata });

        } catch (error) {
            LoggerController.error('Error creando datos de usuario por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            return res.status(400).json({ error: error.message });
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
            const { id, name, extension, number, email, userId, departmentId, subdepartmentId, show, version } = req.body;

            // Recuperar UserData a modificar
            const userdata = await UserData.findByPk(id);
            if (!userdata) {
                return res.status(404).json({ error: "Datos de Usuario no encontrado" });
            }

            if (userdata.version != version) return res.status(403).json({ error: "Los datos de usuario ha sido modificado por otro proceso" });

            // Verificar que el usuario no es DEPARTMENT
            if (req.user.usertype !== "USER") {
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

            // Actualizar solo campos permitidos
            if (name !== undefined) userdata.name = name;
            if (extension !== undefined) userdata.extension = extension;
            if (number !== undefined) userdata.number = number;
            if (email !== undefined) userdata.email = email;
            if (userId !== undefined) userdata.userAccountId = userId;
            if (show != undefined) userdata.show = show;

            await userdata.save();

            LoggerController.info('Datos de usuario con id ' + user.id + ' actualizado correctamente por el usuario con id ' + req.user.id);

            return res.json({
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


        } catch (error) {
            LoggerController.error('Error modificando al usuario con id ' + user.id + ' por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            return res.status(500).json({ error: error.message });
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

            LoggerController.info('Datos de usuario con id ' + user.id + ' eliminado por el usuario con id ' + req.user.id);
            return res.json({ id });

        } catch (error) {
            LoggerController.error('Error eliminando los datos de usuario con id ' + id + ' por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            return res.status(500).json({ error: error.message });
        }
    }

    //#endregion

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
                    {
                        model: Department,
                        as: 'department',
                        include: [
                            { model: SubDepartment, as: 'subdepartment', attributes: ['id', 'name'] }
                        ],
                        attributes: ['id', 'name']
                    }
                ]
            });

            if (user.version != version) return res.status(409).json({ error: "Su perfil ha sido modificado anteriormente" });
            if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

            return res.json({
                id: user.id,
                username: user.username,
                usertype: user.usertype,
                forcePwdChange: user.forcePwdChange,
                departmentId: user.departmentId,
                departmentName: user.department?.name || null,
                version: user.version,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                
            });

        } catch (error) {
            LoggerController.error('Error recuperando el perfil del usuario con id ' + id);
            LoggerController.error(`Error obteniendo perfil: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = UserDataController;
