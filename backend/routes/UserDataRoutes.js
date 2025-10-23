const express = require("express");
const router = express.Router();

const UserDataController = require("../controllers/UserDataController");
const { notWorker, isAuthenticated, canModifyUser } = require("../middlewares/Auth");

/**
 * Rutas para la gestión de UserData.
 *
 * Endpoints:
 * - GET    /                   → Listar todos los UserData públicos.
 * - GET    /worker             → Listar todos los UserData para el usuario autenticado
 * - GET    /worker-department  → Listar todos los UserData adscritos al departamento del usuario
 * 
 * - GET    /profile            → Obtener el perfil del usuario logueado.
 * 
 * - POST   /                   → Crear un UserData asin asignación.
 * - PUT    /:id                → Modificar un los datos de usuario por ID (solo notWorker: departamento o superior).
 * - delete /:id                → Eliminar los datos de un usuario por ID (solo notWorker: departamento o superior).
 *
 * Middleware:
 * - `adminOnly`       → Restringe el acceso a usuarios con roles de administrador.
 * - `notWorker`       → Restringe el acceso a los usuarios con el rol basico de trabajador.
 * - `isAuthenticated` → Permite acceso a usuarios logeados.
 * - `canModifyUser`   → Comprueba si el usuario puede ser modificado o borrado.
 */


router.get("/", UserDataController.publicList);
router.get("/worker", isAuthenticated, UserDataController.workerList);
router.get("/worker-department", isAuthenticated, UserDataController.workerListByDepartment);

router.get("/profile", isAuthenticated, UserDataController.getProfile);

router.post("/", notWorker, UserDataController.create);
router.put("/:id", notWorker, canModifyUser, UserDataController.update);
router.delete("/:id", notWorker, UserDataController.delete);



module.exports = router;
