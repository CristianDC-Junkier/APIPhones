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
 * 
 * - GET /system               → Obtener métricas del sistema (CPU, memoria, etc.).
 *
 * Middleware:
 * - `adminOnly` → Restringe el acceso únicamente a usuarios con roles de administrador.
 */

router.get("/logs", adminOnly, SystemController.getLogs);
router.get("/logs/:log", adminOnly, SystemController.getLog);
router.get("/logs/:log/download", adminOnly, SystemController.downloadLog);

router.get("/system", adminOnly, SystemController.getSystemMetrics);

module.exports = router;
