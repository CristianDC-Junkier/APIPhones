const express = require("express");
const router = express.Router();

const UserAccountController = require("../controllers/UserAccountController");
const { adminOnly, isAuthenticated, canModifyUser } = require("../middlewares/Auth");

/**
 * - GET    /list               → Listar todos los datos de usuario usuario logueado.
 * - GET    /list-department    → Listar todos los datos de usuario del mismo departamento que el usuario que hace la petición (solo notWorker: departamento o superior).
 * - GET    /:id                → Obtener los datos de usuario por ID (solo notWorker: departamento o superior). 
 * 
 * - PUT    /profile-update     → Modificar el perfil del usuario logueado.
 * - DELETE /profile-del        → Elimina el perfil del usuario logueado.
 * - PUT    /profile-PWD        → Cambiar contraseña para el usuario logueado tras ser marcado.
 * 
 * - POST   /                   → Crear un nuevo usuario (solo departamento o superior).
 * - PUT    /:id                → Actualizar datos de un usuario por ID (solo departamento o superior).
 * - PUT    /:id/forcepwd       → Marcar usuario para forzar cambio de contraseña (solo departamento o superior).
 * - DELETE /:id                → Eliminar un usuario por ID (solo departamento o superior).
 *
 * Middleware:
 * - `adminOnly`       → Restringe el acceso a usuarios con roles de administrador.
 * - `notWorker`       → Restringe el acceso a los usuarios con el rol basico de trabajador.
 * - `isAuthenticated` → Permite acceso a usuarios logeados.
 * - `canModifyUser`   → Comprueba si el usuario puede ser modificado o borrado.
 */

router.get("/list", isAuthenticated, UserAccountController.listUsers);
router.get("/list-department", adminOnly, isAuthenticated, UserAccountController.listUsersByDepartment);
router.get("/:id", adminOnly, UserAccountController.getOne);

router.put("/profile-update", isAuthenticated, UserAccountController.updateMyAccount);
router.delete("/profile-del", isAuthenticated, UserAccountController.deleteMyAccount);
router.patch("/profile-PWD", isAuthenticated, UserAccountController.forcedPasswordChange);

router.post("/", adminOnly, UserAccountController.create);
router.put("/:id", adminOnly, canModifyUser, UserAccountController.update);
router.patch("/:id/forcepwd", adminOnly, canModifyUser, UserAccountController.forcePasswordChange);
router.delete("/:id", adminOnly, canModifyUser, UserAccountController.delete);

module.exports = router;