const express = require("express");
const router = express.Router();
const DepartmentController = require('../controllers/DepartmentController');
const { isAuthenticated } = require("../middlewares/Auth");

/**
 * Rutas para la gestión de departamentos
 * 
 * - GET    /               → Obtener todos los departamentos
 * - GET    /:id            → Obtener un departamento por ID
 * - POST   /               → Crear un nuevo departamento
 * - PUT    /:id            → Actualizar un departamento existente
 * - DELETE /:id            → Eliminar un departamento
 * 
 *  * Middleware:
 * - `isAuthenticated` → Permite acceso a usuarios logeados.
 */
router.get('/', DepartmentController.list);
router.get('/:id', isAuthenticated, DepartmentController.getById);
router.post('/', isAuthenticated, DepartmentController.create);
router.put('/:id', isAuthenticated, DepartmentController.update);
router.delete('/:id', isAuthenticated, DepartmentController.delete);



module.exports = router;
