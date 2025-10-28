const { UserAccount, Department, SubDepartment, RefreshToken, UpdateModel } = require("../models/Relations");

const LoggerController = require("../controllers/LoggerController");
const { generateAccessToken, generateRefreshToken, verifyToken } = require("../utils/JWT");

/**
 * Controlador de autenticación y gestión de usuarios.
 * 
 * Proporciona métodos estáticos para:
 *  - Login de usuarios
 *  - Listar todos los usuarios
 *  - Crear un usuario
 *  - Modificar un usuario
 *  - Eliminar un usuario
 */
class AuthController {

    /**
    * Inicia sesión con un usuario existente.
    * 
    * @param {Object} req - Objeto de petición de Express, con { body: { username, password, remember } }.
    * @param {Object} res - Objeto de respuesta de Express.
    * @returns {JSON} - JSON con información del usuario y token si es exitoso,
    *                   o mensajes de error en caso de credenciales inválidas o falta de datos.
    */
    static async login(req, res) {
        try {
            const { username, password, remember } = req.body;

            if (!username || !password) {
                return res.status(400).json({ error: "Usuario y contraseña requeridos" });
            }

            // Buscar usuario junto con UserData, Department y Subdepartment
            const user = await UserAccount.findOne({
                where: { username },
                include: [
                    {
                        model: Department,
                        as: 'department',
                        include: [{
                            model: SubDepartment,
                            as: 'subdepartment'
                        }]
                    }
                ]
            });

            if (!user || user.password !== password) {
                return res.status(404).json({ error: "Credenciales incorrectas" });
            }

            // Genera tokens usando utilidades centralizadas
            const accessToken = generateAccessToken({ id: user.id, username: user.username, usertype: user.usertype, department: user.departmentId });
            const refreshToken = await generateRefreshToken(user.id, remember);

            // Envía refreshToken en cookie HTTP-only
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Strict",
                path: "/listin-telefonico/api/auth",
                maxAge: remember ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000,
            });

            LoggerController.info(`Sesión iniciada por ${user.username} (id: ${user.id})`);

            return res.json({
                accessToken,
                user: {
                    id: user.id,
                    username: user.username,
                    usertype: user.usertype,
                    forcePwdChange: user.forcePwdChange,
                    department: user.departmentId,
                    version: user.version,
                }
            });

        } catch (error) {
            LoggerController.error(`Error login - ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }

    /**
    * Cierra la sesión de un usuario eliminando su cookie HttpOnly.
    *
    * @param {Object} req - Objeto de petición de Express, con { cookies: { refreshToken } }.
    * @param {Object} res - Objeto de respuesta de Express.
    * @returns {JSON} - Mensaje de éxito o error.
    */
    static async logout(req, res) {
        try {
            const token = req.cookies?.refreshToken;
            if (!token) return res.status(400).json({ error: "No hay sesión activa" });

            let payload;
            try {
                payload = verifyToken(token, "refresh");
            } catch {
                res.clearCookie("refreshToken", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "Strict",
                    path: "/listin-telefonico/api/auth"
                });
                return res.status(400).json({ error: "Sesión inválida" });
            }

            await RefreshToken.destroy({ where: { uuid: payload.uuid } });
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Strict",
                path: "/listin-telefonico/api/auth"
            });

            LoggerController.info(`Logout exitoso usuario con id ${payload.userId}`);
            return res.json({ message: "Logout exitoso" });
        } catch (error) {
            LoggerController.error(`Error logout - ${error.message}`);
            return res.status(500).json({ error: "Error al cerrar sesión" });
        }
    }

    /**
    * Recoge la fecha y versión del listado de usuarios.
    * 
    * @param {Object} req - Objeto de petición de Express.
    * @param {Object} res - Objeto de respuesta de Express.
    */
    static async getDate(req, res) {
        try {
            const updateRow = await UpdateModel.findByPk(1);

            if (!updateRow) {
                return res.status(404).json({ error: "No se encontró la fecha del listín" });
            }

            const date = new Date(updateRow.date).toLocaleDateString("es-ES");

            return res.json({ date });

        } catch (error) {
            LoggerController.error("Error recuperando la fecha del listín - " + error.message);
            return res.status(500).json({ error: "Error recuperando la fecha del listín" });
        }
    }

    /**
     * Devuelve la información del usuario basada en la cookie HttpOnly y la renueva si es necesario.
     * 
     * @param {Object} req - Objeto de petición de Express, con { cookies: { refreshToken } }.
     * @param {Object} res - Objeto de respuesta de Express.
     * @returns {JSON} - JSON con nuevo accessToken y datos del usuario, o estado 401 si el token es inválido.
     */
    static async refreshToken(req, res) {
        try {
            const token = req.cookies?.refreshToken;
            if (!token) return res.status(200).send("No existen tokens");

            let payload;
            try {
                payload = verifyToken(token, "refresh");
            } catch {
                return res.sendStatus(401);
            }

            // Verifica que el UUID existe en DB
            const tokenDB = await RefreshToken.findOne({ where: { uuid: payload.uuid, userId: payload.userId } });
            if (!tokenDB) return res.sendStatus(401);

            // Verifica que no está caducado
            const now = new Date();
            if (tokenDB.expireDate < now) {
                // Elimina token caducado
                await RefreshToken.destroy({ where: { id: tokenDB.id } });
                return res.sendStatus(401);
            }

            const user = await UserAccount.findByPk(payload.userId);
            if (!user) return res.sendStatus(401);

            // Genera nuevos tokens
            const accessToken = generateAccessToken({ id: user.id, username: user.username, usertype: user.usertype, department: user.departmentId });

            if (payload.remember) {
                await RefreshToken.destroy({ where: { uuid: payload.uuid } });
                const newRefreshToken = await generateRefreshToken(user.id, payload.remember);

                // Cookie con nuevo refreshToken
                res.cookie("refreshToken", newRefreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "Strict",
                    path: "/listin-telefonico/api/auth",
                    maxAge: payload.remember ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000,
                });
            }

            LoggerController.info(`Recarga de access token exitosa para el usuario con id ${user.id}`);
            return res.json({
                accessToken,
                user: {
                    id: user.id,
                    username: user.username,
                    usertype: user.usertype,
                    forcePwdChange: user.forcePwdChange,
                    department: user.departmentId,
                    version: user.version,
                },
            });

        } catch (error) {
            LoggerController.error(`Error refreshToken - ${error.message}`);
            return res.status(500).json({ error: "Error al refrescar token" });
        }
    }
}

module.exports = AuthController;
