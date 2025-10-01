const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/AuthController");
const { isAuthenticated } = require("../middlewares/Auth");

/**
 * Rutas para gestión de usuarios.
 *
 * Endpoints:
 * - POST   /login                  → Iniciar sesión y obtener token JWT.
 * - GET    /logout                 → Cierra sesión y elimina el RefreshToken Asociado.
 * - GET    /date                   → Devuelve la fecha del listin.
 * - GET    /version                   → Devuelve la versión del usuario.
 */

router.post("/login", AuthController.login);
router.get("/logout", AuthController.logout);

router.get("/date", isAuthenticated, AuthController.getDate);
router.get("/version", isAuthenticated, AuthController.getVersion);


module.exports = router;
