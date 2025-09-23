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
                attributes: ['id', 'name', 'departmentId']
            });

            // Formateamos para devolver el nombre del departamento directamente en cada subdepartamento
            const result = subdepartments.map(sd => ({
                id: sd.id,
                name: sd.name,
                departmentId: sd.department.id,
                departmentName: sd.department.name ?? null,
            }));

            res.json({ subdepartments: result });
        } catch (error) {
            LoggerController.error('Error listando subdepartamentos: ' + error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Obtener un subdepartamento por ID
     * 
     * @param {Object} req - req.params.id es el ID del subdepartamento
     * @param {Object} res
     * @returns {JSON} - Datos del subdepartamento o error si no existe
     */
    static async getById(req, res) {
        try {
            const subdepartment = await SubDepartment.findOne({ where: { id: req.params.id } });
            if (!subdepartment) return res.status(404).json({ success: false, message: 'Subdepartamento no encontrado' });
            res.json({ subdepartment });
        } catch (error) {
            LoggerController.error('Error obteniendo subdepartamento: ' + error.message);
            res.status(500).json({ error: error.message });
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
            res.status(201).json({ id: subdepartment.id });
        } catch (error) {
            LoggerController.error('Error creando subdepartamento: ' + error.message);
            res.status(500).json({ error: error.message });
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

            res.json({ id: subdepartment.id });
        } catch (error) {
            LoggerController.error('Error actualizando subdepartamento: ' + error.message);
            res.status(500).json({ error: error.message });
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

            res.json({ id: req.params.id });
        } catch (error) {
            LoggerController.error('Error eliminando subdepartamento: ' + error.message);
            res.status(500).json({ error: error.message });
        }
    }

}

module.exports = SubDepartmentController;
