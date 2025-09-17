const express = require("express");
const router = express.Router();

const SystemController = require("../controllers/SystemController");
const { adminOnly } = require("../middlewares/Auth");

/**
 * Rutas para administración y monitoreo del sistema.
 *
 * Endpoints:
 * - GET /logs                 → Listar todos los logs disponibles (solo ADMIN o SUPERADMIN).
 * - GET /logs/:log            → Obtener el contenido de un archivo de log específico.
 * - GET /logs/:log/download   → Descargar un archivo de log.
 * - GET /system               → Obtener métricas del sistema (CPU, memoria, etc.).
 *
 * Middleware:
 * - `adminOnly` → Restringe el acceso únicamente a usuarios con roles de administrador.
 */

// Listar logs del sistema
router.get("/logs", adminOnly, SystemController.getLogs);

// Obtener contenido de un log específico
router.get("/logs/:log", adminOnly, SystemController.getLog);

// Descargar un archivo log
router.get("/logs/:log/download", adminOnly, SystemController.downloadLog);

// Obtener métricas generales del sistema
router.get("/system", adminOnly, SystemController.getSystemMetrics);

module.exports = router;
