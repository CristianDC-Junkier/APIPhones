const express = require("express");
const router = express.Router();
const SubdepartmentController = require('../controllers/SubDepartmentController');
const { isAuthenticated } = require("../middlewares/Auth");

/**
 * Rutas para la gestión de subdepartamentos
 * 
 * - GET    /              → Obtener todos los subdepartamentos
 * - GET    /father/:id    → Obtener todos los subdepartamentos de un departamento
 * - POST   /              → Crear un nuevo subdepartamento
 * - PUT    /:id           → Actualizar un subdepartamento existente
 * - DELETE /:id           → Eliminar un subdepartamento
 * 
 * Middleware:
 * - `isAuthenticated` → Permite acceso a usuarios logeados.
 */
router.get('/', isAuthenticated, SubdepartmentController.listAll);
router.get('/father/:id', isAuthenticated, SubdepartmentController.getByDepartment);

router.post('/', isAuthenticated, SubdepartmentController.create);
router.put('/:id', isAuthenticated, SubdepartmentController.update);
router.delete('/:id', isAuthenticated, SubdepartmentController.delete);

module.exports = router;