const express = require("express");
const router = express.Router();

const UserAccountController = require("../controllers/UserAccountController");
const { notWorker, isAuthenticated, canModifyUser } = require("../middlewares/Auth");

/**
 * - GET    /list               → Listar todos los datos de usuario usuario logueado.
 * - GET    /list-department    → Listar todos los datos de usuario del mismo departamento que el usuario que hace la petición (solo notWorker: departamento o superior).
 * - GET    /:id                → Obtener los datos de usuario por ID (solo notWorker: departamento o superior). 
 * 
 * - POST   /                   → Crear un nuevo usuario (solo departamento o superior).
 * - PUT    /:id                → Actualizar datos de un usuario por ID (solo departamento o superior).
 * - DELETE /:id                → Eliminar un usuario por ID (solo departamento o superior).
 * - PUT    /:id/forcepwd       → Marcar usuario para forzar cambio de contraseña (solo departamento o superior).
 *
 * - POST   /worker/            → Crea un nuevo usuario (Worker) junto con su UserData asociado.
 * - DELETE /worker/:id         → Elimina un usuario (Worker) existente.
 * 
 * - PUT    /profile-update     → Modificar el perfil del usuario logueado.
 * - DELETE /profile-del        → Elimina el perfil del usuario logueado.
 * - PUT    /profile-PWD        → Cambiar contraseña para el usuario logueado tras ser marcado.
 *
 * Middleware:
 * - `adminOnly`       → Restringe el acceso a usuarios con roles de administrador.
 * - `notWorker`       → Restringe el acceso a los usuarios con el rol basico de trabajador.
 * - `isAuthenticated` → Permite acceso a usuarios logeados.
 * - `canModifyUser`   → Comprueba si el usuario puede ser modificado o borrado.
 */

router.get("/list", isAuthenticated, UserAccountController.listUsers);
router.get("/list-department", isAuthenticated, notWorker, UserAccountController.listUsersByDepartment);
router.get("/:id", notWorker, UserAccountController.getOne);

router.post("/worker/", notWorker, UserAccountController.createWorker);
router.delete("/worker/:id", notWorker, canModifyUser, UserAccountController.deleteWorker);

router.put("/profile-update", isAuthenticated, UserAccountController.updateMyAccount);
router.delete("/profile-del", isAuthenticated, UserAccountController.deleteMyAccount);
router.put("/profile-PWD", isAuthenticated, UserAccountController.forcedPasswordChange);

router.post("/", notWorker, UserAccountController.create);
router.put("/:id", notWorker, canModifyUser, UserAccountController.update);
router.put("/:id/forcepwd", notWorker, canModifyUser, UserAccountController.forcePasswordChange);
router.delete("/:id", notWorker, canModifyUser, UserAccountController.delete);




module.exports = router;