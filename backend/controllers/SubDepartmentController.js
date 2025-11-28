const { Department, SubDepartment } = require("../models/Relations")
const LoggerController = require('./LoggerController');

class SubDepartmentController {

    /**
     * Listar todos los subdepartamentos
     * 
     * @param {Object} req - Objeto de petición de Express
     * @param {Object} res - Objeto de respuesta de Express
     * @returns {JSON} - Lista de subdepartamentos
     */
    static async listAll(req, res) {
        try {
            const subdepartments = await SubDepartment.findAll({
                include: [
                    {
                        model: Department,
                        as: "department",
                        attributes: ['id', 'name']
                    }
                ],
                attributes: ['id', 'name', 'departmentId'],
                order: [["name", "ASC"]]
            });

            // Formateamos para devolver el nombre del departamento directamente en cada subdepartamento
            const result = subdepartments.map(sd => ({
                id: sd.id,
                name: sd.name,
                departmentId: sd.department.id,
                departmentName: sd.department.name ?? null,
            }));

            return res.json({ subdepartments: result });
        } catch (error) {
            LoggerController.error('Error listando los subdepartamentos por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            return res.status(500).json({ error: error.message });
        }
    }

    /**
    * Obtener todos los subdepartamentos de un departamento
    * 
    * @param {Object} req - req.params.id es el ID del departamento
    * @param {Object} res
    * @returns {JSON} - Datos del subdepartamento o error si no existe
    */
    static async getByDepartment(req, res) {
        try {
            const subdepartments = await SubDepartment.findAll({ where: { departmentId: req.params.id } });
            if (!subdepartments) return res.status(404).json({ error: 'Subdepartamentos no encontrado' });
            return res.json({ subdepartments });
        } catch (error) {
            LoggerController.error('Error listando los subdepartamentos del departamento con id' + req.params.id + ' por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            return res.status(500).json({ error: error.message });
        }
    }

    /**
     * Crear un nuevo subdepartamento
     * 
     * @param {Object} req - req.body contiene los datos del subdepartamento
     * @param {Object} res
     * @returns {JSON} - Subdepartamento creado o error
     */
    static async create(req, res) {
        try {
            const subdepartment = await SubDepartment.create(req.body);
            LoggerController.info(`Subdepartamento ${subdepartment.name} creado`);
            return res.status(201).json({ id: subdepartment.id });
        } catch (error) {
            LoggerController.error('Error en la creación del subdepartamento por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            return res.status(500).json({ error: error.message });
        }
    }

    /**
  * Actualizar un subdepartamento existente
  * 
  * @param {Object} req - req.params.id es el ID del subdepartamento, req.body contiene los campos a actualizar
  * @param {Object} res
  * @returns {JSON} - Subdepartamento actualizado o error si no existe
  */
    static async update(req, res) {
        try {
            const subdepartment = await SubDepartment.findOne({ where: { id: req.params.id } });

            if (!subdepartment) {
                return res.status(404).json({ error: 'Subdepartamento no encontrado' });
            }

            await subdepartment.update(req.body);

            LoggerController.info(`Subdepartamento ${subdepartment.name} actualizado`);

            return res.json({ id: subdepartment.id });
        } catch (error) {
            LoggerController.error('Error en la modificación del subdepartamento con id ' + id + ' por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            return res.status(500).json({ error: error.message });
        }
    }

    /**
     * Eliminar un subdepartamento existente
     * 
     * @param {Object} req - req.params.id es el ID del subdepartamento
     * @param {Object} res
     * @returns {JSON} - Mensaje de éxito o error
     */
    static async delete(req, res) {
        try {
            const subdepartment = await SubDepartment.findOne({ where: { id: req.params.id } });

            if (!subdepartment) {
                return res.status(404).json({ error: 'Subdepartamento no encontrado' });
            }

            await subdepartment.destroy();

            LoggerController.info(`Subdepartamento ${subdepartment.name} eliminado`);

            return res.json({ id: req.params.id });
        } catch (error) {
            LoggerController.error('Error en la eliminación del subdepartamento con id ' + id + ' por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            return res.status(500).json({ error: error.message });
        }
    }

}

module.exports = SubDepartmentController;
