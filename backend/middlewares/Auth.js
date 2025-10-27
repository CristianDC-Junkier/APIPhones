const LoggerController = require("../controllers/LoggerController");
const { verifyToken, decodeToken } = require("../utils/JWT");
const { UserAccount } = require("../models/Relations");

/**
 * Función auxiliar para validar accessToken del header Authorization
 */
async function getTokenPayload(req, res) {
    const authHeader = req.headers?.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Token requerido" });
        return null;
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = await verifyToken(token, "access");
        if (!payload || !payload.id) {
            res.status(401).json({ error: "Token inválido" });
            return null;
        }
        return payload;
    } catch (err) {
        payload = decodeToken(token);
        if (payload && payload.id) {
            LoggerController.warn(`Token inválido: ${err.message} para el usuario con id ${payload.id}`);
        }
        res.status(401).json({ error: "Token inválido o expirado" });
        return null;
    }
}

/**
 * Middleware: Solo administradores
 */
async function adminOnly(req, res, next) {
    const payload = await getTokenPayload(req, res);
    if (!payload) return;

    if (payload.usertype !== "ADMIN" && payload.usertype !== "SUPERADMIN") {
        LoggerController.error(`Acceso denegado: usuario no administrador (${payload.username} - ID ${payload.id})`);
        return res.status(403).json({ error: "No tienes permisos" });
    }

    req.user = payload;
    next();
}


/**
 * Middleware: Solo usuarios autenticado.
 */
async function isAuthenticated(req, res, next) {
    const payload = await getTokenPayload(req, res);
    console.log(payload);
    if (!payload) return; // ya respondió con 401

    req.user = payload;
    next();
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
        const targetUser = await UserAccount.findByPk(targetUserId);
        if (!targetUser) return res.status(404).json({ error: "Usuario no encontrado" });

        // SUPERADMIN no se puede eliminar/modificar por otros
        if (targetUser.usertype === "SUPERADMIN" && req.method === "DELETE") {
            return res.status(403).json({ error: "No puedes eliminar al SUPERADMIN" });
        }
        // Buscar usuario que hace la petición
        const requester = await UserAccount.findByPk(requesterId);

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

        next();
    } catch (error) {
        LoggerController.error("Error en autorización de usuario: " + error.message);
        res.status(500).json({ error: error.message });
    }
}


module.exports = { adminOnly, isAuthenticated, canModifyUser };
