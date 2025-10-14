const LoggerController = require("../controllers/LoggerController");
const { verifyToken } = require("../utils/JWT");
const { UserAccount, UserData } = require("../models/Relations");

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
async function adminOnly(req, res, next) {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader) return res.status(401).json({ success: false, message: "Token requerido" });

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Token requerido" });
        }

        const payload = await verifyToken(token);
        if (!payload || !payload.usertype) {
            return res.status(401).json({ success: false, message: "Token inválido" });
        }

        if (payload.usertype !== "ADMIN" && payload.usertype !== "SUPERADMIN") {
            LoggerController.error('Token inválido del usuario: ' + payload.username);
            return res.status(401).json({ success: false, message: "No tienes permisos" });
        }

        req.user = payload;
        next();
    } catch (err) {
        LoggerController.warn('Token inválido: ' + err.message);
        return res.status(401).json({ error: "Token inválido" });
    }
}

/**
 * Middleware que restringe el acceso a usuarios que no sean 'WORKER'.
 * 
 * Verifica el token JWT en la cabecera `Authorization`:
 *  - Si no existe o es inválido → responde con 401 (no autorizado).
 *  - Si el usuario tiene rol 'WORKER' → responde con 401 (sin permisos).
 *  - Si el token es válido y el rol es correcto → añade los datos del usuario a `req.user`
 *    y continúa con el siguiente middleware/controlador.
 * 
 * @param {Object} req - Objeto de petición de Express, con cabecera Authorization.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
async function notWorker(req, res, next) {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            return res.status(401).json({ error: "Token requerido" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Token requerido" });
        }

        const payload = await verifyToken(token);
        if (!payload || !payload.usertype) {
            return res.status(401).json({ error: "Token inválido" });
        }

        if (payload.usertype === "WORKER") {
            LoggerController.warn(`Acceso denegado para usuario: ${payload.username}`);
            return res.status(401).json({ error: "No tienes permisos" });
        }

        req.user = payload;
        next();
    } catch (err) {
        LoggerController.warn(`Token inválido: ${err.message}`);
        return res.status(401).json({ error: "Token inválido" });
    }
}

/**
 * Middleware que verifica si un usuario está logueado.
 * 
 * Verifica el token JWT en la cabecera `Authorization`:
 *  - Si no existe o es inválido → responde con 401 (no autorizado).
 *  - Si el token es válido → añade los datos del usuario a `req.user` y continúa.
 * 
 * @param {Object} req - Objeto de petición de Express, con cabecera Authorization.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
async function isAuthenticated(req, res, next) {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader) return res.status(401).json({ error: "Token requerido" });

        const token = authHeader.split(" ")[1];
        if (!token) return res.status(401).json({ error: "Token requerido" });

        const payload = await verifyToken(token);
        if (!payload || !payload.id) {
            return res.status(401).json({ error: "Token inválido" });
        }
        req.user = payload;
        next();
    } catch (err) {
        LoggerController.warn(`Token inválido: ${err.message}`);
        return res.status(401).json({ error: "Token inválido" });
    }
}

/**
 * Middleware para verificar si el usuario puede modificar/eliminar otro usuario.
 * 
 * - Los SUPERADMIN pueden todo.
 * - Los ADMIN pueden todo excepto modificar/eliminar SUPERADMIN.
 * - Los demás usuarios solo pueden operar sobre usuarios de su mismo departamento.
 * 
 * Requiere que req.params.id sea el ID del usuario objetivo.
 */
async function canModifyUser(req, res, next) {
    try {
        const targetUserId = req.params.id;   // Usuario sobre el que se opera
        const requesterId = req.user.id;      // Usuario que hace la petición

        // Buscar usuario objetivo
        const targetUser = await UserAccount.findByPk(targetUserId, {
            include: [{ model: UserData, as: "userData" }]
        });
        if (!targetUser) return res.status(404).json({ error: "Usuario no encontrado" });

        // SUPERADMIN no se puede eliminar/modificar por otros
        if (targetUser.usertype === "SUPERADMIN" && req.method === "DELETE") {
            return res.status(403).json({ error: "No puedes eliminar al SUPERADMIN" });
        }
        // Buscar usuario que hace la petición
        const requester = await UserAccount.findByPk(requesterId, {
            include: [{ model: UserData, as: "userData" }]
        });

        if (targetUserId === 1 && requesterId !== 1) {
            return res.status(403).json({ error: "No puedes modificar/eliminar al SUPERADMIN por defecto" });
        }
        
        if (!requester) return res.status(403).json({ error: "Usuario que hace la petición no encontrado" });

        // Validación de permisos
        if (requester.usertype === "SUPERADMIN") {
            // SUPERADMIN puede hacer todo
            return next();
        }
        if (requester.usertype === "ADMIN") {
            // ADMIN no puede modificar/eliminar SUPERADMIN
            if (targetUser.usertype === "SUPERADMIN") {
                return res.status(403).json({ error: "No puedes modificar/eliminar al SUPERADMIN" });
            }
            return next();
        }

        // Usuarios normales: solo pueden modificar/eliminar dentro de su mismo departamento
        if (!requester.userData?.departmentId ||
            !targetUser.userData?.departmentId ||
            requester.userData.departmentId !== targetUser.userData.departmentId) {
            return res.status(403).json({ error: "Solo puede operar sobre usuarios de su mismo departamento" });
        }

        next();
    } catch (error) {
        LoggerController.error("Error en autorización de usuario: " + error.message);
        res.status(500).json({ error: error.message });
    }
}


module.exports = { adminOnly, notWorker, isAuthenticated, canModifyUser };
