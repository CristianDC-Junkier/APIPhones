const LoggerController = require("../controllers/LoggerController");
const { verifyToken } = require("../utils/JWT");


/**
 * Middleware que restringe el acceso únicamente a usuarios con rol de administrador.
 * 
 * Verifica el token JWT en la cabecera `Authorization`:
 *  - Si no existe o es inválido → responde con 401 (no autorizado).
 *  - Si el usuario no tiene rol `ADMIN` o `SUPERADMIN` → responde con 401 (sin permisos).
 *  - Si el token es válido y el rol es correcto → añade los datos del usuario a `req.user`
 *    y continúa con el siguiente middleware/controlador.
 * 
 * @param {Object} req - Objeto de petición de Express, con cabecera Authorization.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
function adminOnly(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader) return res.status(401).json({ success: false, message: "Token requerido" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "Token requerido" });

    try {
        const payload = verifyToken(token);

        if (payload.usertype !== "ADMIN" && payload.usertype !== "SUPERADMIN") {
            LoggerController.error('Token inválido del usuario: ' + payload.username);
            return res.status(401).json({ success: false, message: "No tienes permisos" });
        }

        req.user = payload; 
        next();
    } catch (err) {
        LoggerController.warn('Token inválido: ' + err.message);
        return res.status(401).json({ success: false, message: "Token inválido" });
    }
}

module.exports = { adminOnly };
