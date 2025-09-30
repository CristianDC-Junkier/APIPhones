const express = require("express");
const router = express.Router();

const UserAccountController = require("../controllers/UserAccountController");
const { notWorker, isAuthenticated, canModifyUser } = require("../middlewares/Auth");

/**
 * - POST   /                       → Crear un nuevo usuario (solo departamento o superior).
 * - PUT    /:id                    → Actualizar datos de un usuario por ID (solo departamento o superior).
 * - DELETE /:id                    → Eliminar un usuario por ID (solo departamento o superior).
 * - PUT    /:id/forcepwd           → Marcar usuario para forzar cambio de contraseña (solo departamento o superior).
 *
 * - POST   /worker/                → Crea un nuevo usuario (Worker) junto con su UserData asociado.
 * - DELETE /worker/:id             → Elimina un usuario (Worker) existente.
 *
 * Middleware:
 * - `adminOnly`       → Restringe el acceso a usuarios con roles de administrador.
 * - `notWorker`       → Restringe el acceso a los usuarios con el rol basico de trabajador.
 * - `isAuthenticated` → Permite acceso a usuarios logeados.
 * - `canModifyUser`   → Comprueba si el usuario puede ser modificado o borrado.
 */

router.post("/", notWorker, UserAccountController.create);
router.put("/:id", notWorker, canModifyUser, UserAccountController.update);
router.put("/:id/forcepwd", notWorker, canModifyUser, UserAccountController.forcePasswordChange);
router.delete("/:id", notWorker, canModifyUser, UserAccountController.delete);

router.post("/worker/", notWorker, UserAccountController.createWorker);
router.delete("/worker/:id", notWorker, canModifyUser, UserAccountController.deleteWorker);

module.exports = router;