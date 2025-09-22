const { SubDepartment } = require("../models/Relations")
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
            const subdepartments = await SubDepartment.findAll();
            res.json({ subdepartments });
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
            const subdepartments = await SubDepartment.findOne({ where: { id: req.params.id } });
            if (!subdepartments) return res.status(404).json({ success: false, message: 'Subdepartamento no encontrado' });
            res.json({ subdepartments });
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
            const subdepartments = await SubDepartment.create(req.body);
            res.status(201).json({ id: subdepartments.id });
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
            const updated = await SubDepartment.update(req.params.id, req.body);
            if (!updated) return res.status(404).json({ error: 'Subdepartamento no encontrado' });
            res.json({ id: updated.id });
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
            const deleted = await SubDepartment.delete(req.params.id);
            if (!deleted) return res.status(404).json({ error: 'Subdepartamento no encontrado' });
            res.json({ id:req.params.id });
        } catch (error) {
            LoggerController.error('Error eliminando subdepartamento: ' + error.message);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = SubDepartmentController;
