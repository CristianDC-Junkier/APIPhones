const express = require("express");
const router = express.Router();
const SubdepartmentController = require('../controllers/SubDepartmentController');
const { isAuthenticated } = require("../middlewares/Auth");

/**
 * Rutas para la gestión de subdepartamentos
 * 
 * - GET    /       → Obtener todos los subdepartamentos
 * - GET    /:id    → Obtener un subdepartamento por ID
 * - POST   /       → Crear un nuevo subdepartamento
 * - PUT    /:id    → Actualizar un subdepartamento existente
 * - DELETE /:id    → Eliminar un subdepartamento
 */
router.get('/', isAuthenticated, SubdepartmentController.listAll);
router.get('/:id', isAuthenticated, SubdepartmentController.getById);
router.post('/', isAuthenticated, SubdepartmentController.create);
router.put('/:id', isAuthenticated, SubdepartmentController.update);
router.delete('/:id', isAuthenticated, SubdepartmentController.delete);

module.exports = router;