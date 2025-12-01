const { UserAccount, UserData, Department, SubDepartment, Ticket } = require("../models/Relations")

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
                where: { departmentId: { [Op.ne]: null }, show: true }
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
                ],
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
            }));

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
            const departmentId = req.user.department;

            if (!departmentId) {
                return res.status(400).json({ error: "El usuario no tiene departamento asignado" });
            }

            const allData = await UserData.findAll({
                where: {
                    departmentId: departmentId
                },
                include: [
                    { model: Department, as: "department" },
                    { model: SubDepartment, as: "subdepartment" },
                    {
                        model: Ticket,
                        as: "ticketsAffected",
                        attributes: ["status"],
                        where: {
                            [Op.or]: [
                                { status: "OPEN" },
                                { status: "READ" }
                            ]
                        },
                        required: false
                    }
                ],
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
                version: user.version,
                ticket: user.ticketsAffected && user.ticketsAffected.length > 0 ? true : false
            }));

            return res.json({ datalist: formatted });
        } catch (error) {
            LoggerController.error('Error recogiendo la lista de trabajadores por el departamento con id ' + req.user.department + ' por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            return res.status(500).json({ error: error.message });
        }
    }
    //#endregion

    //#region Metódos CRUD de datos de usuarios (trabajadores)
    /**
    * Permite crear un UserData.
    *
    * @param {Object} req - { body: { name, extension, number, email, departmentId, subdepartmentId } }
    * @param {Object} res
    */
    static async create(req, res) {
        try {
            const id = req.user.id;
            const { name, extension, number, email, departmentId, subdepartmentId, show } = req.body;

            const user = await UserAccount.findByPk(id);

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
            LoggerController.info('Datos de usuario con id ' + userdata.id + ' creado correctamente por el usuario con id ' + req.user.id);
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

            // Actualizar solo campos permitidos
            if (name !== undefined) userdata.name = name;
            if (extension !== undefined) userdata.extension = extension;
            if (number !== undefined) userdata.number = number;
            if (email !== undefined) userdata.email = email;
            if (show != undefined) userdata.show = show;

            await userdata.save();

            LoggerController.info('Datos de usuario con id ' + id + ' actualizado correctamente por el usuario con id ' + req.user.id);

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
            LoggerController.error('Error modificando los datos con id ' + req.body.id + ' por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            return res.status(500).json({ error: error.message });
        }
    }

    /**
    * Permite al usuario autenticado eliminar datos.
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

            LoggerController.info('Datos de usuario con id ' + userDataId + ' eliminado por el usuario con id ' + req.user.id);
            return res.json({ userDataId });

        } catch (error) {
            LoggerController.error('Error eliminando los datos de usuario con id ' + userDataId + ' por el usuario con id ' + req.user.id);
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
                    },
                    {
                        model: Ticket,
                        as: 'ticketsRequested',      
                        attributes: ['id', 'status'],
                        where: { status: 'RESOLVED' }, 
                        required: false               
                    }
                ]
            });

            if (!user) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            // Actualizar tickets a WARNED y loguear
            await Promise.all(
                user.ticketsRequested.map(async (ticket) => {
                    await ticket.update({ status: 'WARNED', warnedAt: new Date() });
                    LoggerController.ticketAction({
                        ticketId: ticket.id,
                        action: 'WARNED',
                        userId: user.id
                    });
                })
            );

            // Verificar versión
            if (user.version != version) {
                return res.status(409).json({
                    error: "Su usuario ha sido modificado anteriormente",
                    latestUser: {
                        id: user.id,
                        username: user.username,
                        usertype: user.usertype,
                        forcePwdChange: user.forcePwdChange,
                        department: user.departmentId,
                        version: user.version,
                    },
                });
            }

            return res.json({
                id: user.id,
                username: user.username,
                usertype: user.usertype,
                forcePwdChange: user.forcePwdChange,
                mail: user.mail,
                departmentId: user.departmentId,
                departmentName: user.department?.name || null,
                version: user.version,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                ticketsResolvedCount: user.ticketsRequested.length, 
            });

        } catch (error) {
            LoggerController.error('Error recuperando el perfil del usuario con id ' + req.user.id);
            LoggerController.error(`Error obteniendo perfil: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
    }
    //#endregion
}

module.exports = UserDataController;
