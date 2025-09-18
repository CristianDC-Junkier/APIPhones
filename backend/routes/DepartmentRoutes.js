const express = require("express");
const router = express.Router();
const DepartmentController = require('../controllers/DepartmentController');
const SubdepartmentController = require('../controllers/SubDepartmentController');
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
router.get('/', isAuthenticated, DepartmentController.listAll);
router.get('/:id', isAuthenticated, DepartmentController.getById);
router.post('/', isAuthenticated, DepartmentController.create);
router.put('/:id', isAuthenticated, DepartmentController.update);
router.delete('/:id', isAuthenticated, DepartmentController.delete);

/**
 * Rutas para la gestión de subdepartamentos
 * 
 * - GET    /subdepartment/       → Obtener todos los subdepartamentos
 * - GET    /subdepartment/:id    → Obtener un subdepartamento por ID
 * - POST   /subdepartment/       → Crear un nuevo subdepartamento
 * - PUT    /subdepartment/:id    → Actualizar un subdepartamento existente
 * - DELETE /subdepartment/:id    → Eliminar un subdepartamento
 */
router.get('/subdepartment/', isAuthenticated, SubdepartmentController.listAll);
router.get('/subdepartment/:id', isAuthenticated, SubdepartmentController.getById);
router.post('/subdepartment/', isAuthenticated, SubdepartmentController.create);
router.put('/subdepartment/:id', isAuthenticated, SubdepartmentController.update);
router.delete('/subdepartment/:id', isAuthenticated, SubdepartmentController.delete);

module.exports = router;
