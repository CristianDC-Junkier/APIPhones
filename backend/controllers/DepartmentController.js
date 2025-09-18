const DepartmentModel = require('../models/DepartmentModel');
const LoggerController = require('./LoggerController');

class DepartmentController {

    /**
     * Listar todos los departamentos
     * 
     * @param {Object} req - Objeto de petición de Express
     * @param {Object} res - Objeto de respuesta de Express
     * @returns {JSON} - Lista de departamentos
     */
    static async listAll(req, res) {
        try {
            const departments = await DepartmentModel.listAll();
            res.json({ success: true, data: departments });
        } catch (error) {
            LoggerController.error('Error listando departamentos: ' + error.message);
            res.status(500).json({ success: false, message: 'Error al obtener los departamentos', error: error.message });
        }
    }

    /**
     * Obtener un departamento por ID
     * 
     * @param {Object} req - req.params.id es el ID del departamento
     * @param {Object} res
     * @returns {JSON} - Datos del departamento o error si no existe
     */
    static async getById(req, res) {
        try {
            const department = await DepartmentModel.getById(req.params.id);
            if (!department) return res.status(404).json({ success: false, message: 'Departamento no encontrado' });
            res.json({ success: true, data: department });
        } catch (error) {
            LoggerController.error('Error obteniendo departamento: ' + error.message);
            res.status(500).json({ success: false, message: 'Error al obtener el departamento', error: error.message });
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
            const department = await DepartmentModel.create(req.body);
            res.status(201).json({ success: true, message: 'Departamento creado correctamente', data: department });
        } catch (error) {
            LoggerController.error('Error creando departamento: ' + error.message);
            res.status(500).json({ success: false, message: 'Error al crear el departamento', error: error.message });
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
            const updated = await DepartmentModel.update(req.params.id, req.body);
            if (!updated) return res.status(404).json({ success: false, message: 'Departamento no encontrado' });
            res.json({ success: true, message: 'Departamento actualizado correctamente', data: updated });
        } catch (error) {
            LoggerController.error('Error actualizando departamento: ' + error.message);
            res.status(500).json({ success: false, message: 'Error al actualizar el departamento', error: error.message });
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
            const deleted = await DepartmentModel.delete(req.params.id);
            if (!deleted) return res.status(404).json({ success: false, message: 'Departamento no encontrado' });
            res.json({ success: true, message: 'Departamento eliminado correctamente' });
        } catch (error) {
            LoggerController.error('Error eliminando departamento: ' + error.message);
            res.status(500).json({ success: false, message: 'Error al eliminar el departamento', error: error.message });
        }
    }
}

module.exports = DepartmentController;
