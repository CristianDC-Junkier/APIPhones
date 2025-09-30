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
 */

router.post("/login", AuthController.login);
router.get("/logout", AuthController.logout);

router.get("/date", AuthController.date);

module.exports = router;
