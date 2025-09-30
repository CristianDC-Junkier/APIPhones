const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/AuthController");
const { notWorker, canModifyUser } = require("../middlewares/Auth");

/**
 * Rutas para gestión de usuarios.
 *
 * Endpoints:
 * - POST   /login                  → Iniciar sesión y obtener token JWT.
 * - GET    /logout                 → Cierra sesión y elimina el RefreshToken Asociado.
 * - GET    /date                   → Devuelve la versión del listin.
 * - POST   /                       → Crear un nuevo usuario (solo departamento o superior).
 * - PUT    /:id                    → Actualizar datos de un usuario por ID (solo departamento o superior).
 * - DELETE /:id                    → Eliminar un usuario por ID (solo departamento o superior).
 * - PUT    /:id/forcepwd           → Marcar usuario para forzar cambio de contraseña (solo departamento o superior).
 *
 * Middleware:
 * - `adminOnly`       → Restringe el acceso a usuarios con roles de administrador.
 * - `notWorker`       → Restringe el acceso a los usuarios con el rol basico de trabajador.
 * - `isAuthenticated` → Permite acceso a usuarios logeados.
 * - `canModifyUser`   → Comprueba si el usuario puede ser modificado o borrado.
 */

router.post("/login", AuthController.login);
router.get("/logout", AuthController.logout);

router.get("/date", AuthController.date);

router.post("/", notWorker, AuthController.createWorker);
router.put("/:id", notWorker, canModifyUser, AuthController.update);
router.delete("/:id", notWorker, canModifyUser, AuthController.delete);
router.put("/:id/forcepwd", notWorker, canModifyUser, AuthController.forcePasswordChange);

module.exports = router;
