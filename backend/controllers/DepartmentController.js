const { Department, SubDepartment, sequelize } = require("../models/Relations");
const LoggerController = require('./LoggerController');

class DepartmentController {

    /**
     * Listar todos los departamentos
     * 
     * @param {Object} req - Objeto de petición de Express
     * @param {Object} res - Objeto de respuesta de Express
     * @returns {JSON} - Lista de departamentos
     */
    static async list(req, res) {
        try {
            const departments = await Department.findAll({
                include: [
                    {
                        model: SubDepartment,
                        as: "subdepartment",
                        attributes: ['id', 'name']
                    }
                ],
                attributes: ["id", "name"],
                order: [["name", "ASC"]]
            });

            return res.json({ departments });
        } catch (error) {
            LoggerController.error('Error recogiendo los departamentos por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            return res.status(500).json({ error: error.message });
        }
    }

    /**
     * Crear un nuevo departamento
     * 
     * @param {Object} req - req.body contiene los datos del departamento
     * @param {Object} res
     * @returns {JSON} - Departamento creado o error
     */
    static async create(req, res) {
        try {
            const department = await Department.create(req.body);
            LoggerController.info(`Departamento ${department.name} creado`);

            res.status(201).json({ id: department.id });
        } catch (error) {
            LoggerController.error('Error en la creación del departamento por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Actualizar un departamento existente
     * 
     * @param {Object} req - req.params.id es el ID del departamento, req.body contiene los campos a actualizar
     * @param {Object} res
     * @returns {JSON} - Departamento actualizado o error si no existe
     */
    static async update(req, res) {
        try {
            const department = await Department.findOne({ where: { id: req.params.id } });
            if (!department) {
                return res.status(404).json({ error: 'Departamento no encontrado' });
            }

            await department.update(req.body);
            LoggerController.info(`Departamento ${department.name} actualizado`);

            res.json({ id: department.id });
        } catch (error) {
            LoggerController.error('Error en la modificación del departamento por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Eliminar un departamento existente
     * 
     * @param {Object} req - req.params.id es el ID del departamento
     * @param {Object} res
     * @returns {JSON} - Mensaje de éxito o error
     */
    static async delete(req, res) {
        try {
            const deleted = await Department.findOne({ where: { id: req.params.id } });
            if (!deleted) return res.status(404).json({ error: 'Departamento no encontrado' });
            await deleted.destroy();
            LoggerController.info(`Departamento ${deleted.name} eliminado`);
            res.json({ id: req.params.id });
        } catch (error) {
            LoggerController.error('Error en la eliminación del departamento por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = DepartmentController;
