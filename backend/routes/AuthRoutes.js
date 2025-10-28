const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/AuthController");

/**
 * Rutas para gestión de usuarios.
 *
 * Endpoints:
 * - POST   /login      → Iniciar sesión y obtener token JWT.
 * - GET    /logout     → Cierra sesión.
 * 
 * - GET    /date       → Devuelve la fecha del listin.
 * - GET    /version    → Devuelve la versión del usuario.
 * 
 * - GET    /refresh    → Recoger y renovar el refreshtoken (Usuarios Autentificados).
 */

router.post("/login", AuthController.login);
router.get("/logout", AuthController.logout);

router.get("/date", AuthController.getDate);

router.get("/refresh", AuthController.refreshToken);

module.exports = router;
