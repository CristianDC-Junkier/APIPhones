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
            const subDepartments = await SubDepartment.listAll();
            res.json({ success: true, subDepartments });
        } catch (error) {
            LoggerController.error('Error listando subdepartamentos: ' + error.message);
            res.status(500).json({ success: false, message: 'Error al obtener subdepartamentos', error: error.message });
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
            const subDepartment = await SubDepartment.getById(req.params.id);
            if (!subDepartment) return res.status(404).json({ success: false, message: 'Subdepartamento no encontrado' });
            res.json({ success: true, subDepartment });
        } catch (error) {
            LoggerController.error('Error obteniendo subdepartamento: ' + error.message);
            res.status(500).json({ success: false, message: 'Error al obtener el subdepartamento', error: error.message });
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
            const subDepartment = await SubDepartment.create(req.body);
            res.status(201).json({ success: true, message: 'Subdepartamento creado correctamente', subDepartment });
        } catch (error) {
            LoggerController.error('Error creando subdepartamento: ' + error.message);
            res.status(500).json({ success: false, message: 'Error al crear el subdepartamento', error: error.message });
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
            if (!updated) return res.status(404).json({ success: false, message: 'Subdepartamento no encontrado' });
            res.json({ success: true, message: 'Subdepartamento actualizado correctamente', subDepartment: updated });
        } catch (error) {
            LoggerController.error('Error actualizando subdepartamento: ' + error.message);
            res.status(500).json({ success: false, message: 'Error al actualizar el subdepartamento', error: error.message });
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
            if (!deleted) return res.status(404).json({ success: false, message: 'Subdepartamento no encontrado' });
            res.json({ success: true, message: 'Subdepartamento eliminado correctamente' });
        } catch (error) {
            LoggerController.error('Error eliminando subdepartamento: ' + error.message);
            res.status(500).json({ success: false, message: 'Error al eliminar el subdepartamento', error: error.message });
        }
    }
}

module.exports = SubDepartmentController;
