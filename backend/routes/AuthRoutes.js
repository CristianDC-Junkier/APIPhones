
const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/AuthController");
const { adminOnly } = require("../middlewares/auth");

/**
 * Rutas para gestión de usuarios.
 *
 * Endpoints:
 * - POST   /login      → Iniciar sesión y obtener token JWT.
 * - GET    /           → Listar todos los usuarios (solo ADMIN o SUPERADMIN).
 * - POST   /           → Crear un nuevo usuario (solo ADMIN o SUPERADMIN).
 * - PUT    /:id        → Actualizar datos de un usuario por ID (solo ADMIN o SUPERADMIN).
 * - DELETE /:id        → Eliminar un usuario por ID (solo ADMIN o SUPERADMIN).
 *
 * Middleware:
 * - `adminOnly` → Restringe el acceso a usuarios con roles de administrador.
 */


// Loguear usuario (acceso público)
router.post("/login", AuthController.login);

// Obtener todos los usuarios (solo admins)
router.get("/", adminOnly, AuthController.listAll);

// Crear un nuevo usuario (solo admins)
router.post("/", adminOnly, AuthController.create);

// Modificar un usuario existente (solo admins)
router.put("/:id", adminOnly, AuthController.update);

// Eliminar un usuario (solo admins)
router.delete("/:id", adminOnly, AuthController.delete);

module.exports = router;
