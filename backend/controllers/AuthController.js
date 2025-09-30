const { UserAccount, UserData, Department, SubDepartment, RefreshToken, UpdateModel } = require("../models/Relations");

const LoggerController = require("../controllers/LoggerController");
const { generateToken, decodeToken } = require("../utils/JWT");

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
     * @param {Object} req - Objeto de petición de Express, con { body: { username, password } }.
     * @param {Object} res - Objeto de respuesta de Express.
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
                        model: UserData,
                        as: 'userData',
                        include: [
                            { model: Department, as: 'department' },
                            { model: SubDepartment, as: 'subdepartment' }
                        ]
                    }
                ]
            });

            if (!user || user.password !== password) {
                return res.status(401).json({ error: "Credenciales incorrectas" });
            }

            const token = await generateToken({ id: user.id, username: user.username, usertype: user.usertype }, remember);

            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    usertype: user.usertype,
                    forcePwdChange: user.forcePwdChange,
                    userData: user.userData ? {
                        id: user.userData.id,
                        name: user.userData.name,
                        extension: user.userData.extension,
                        number: user.userData.number,
                        email: user.userData.email,
                        departmentId: user.userData.departmentId,
                        departmentName: user.userData.department?.name || null,
                        subdepartmentId: user.userData.subdepartmentId,
                        subdepartmentName: user.userData.subdepartment?.name || null
                    } : null
                }
            });

            LoggerController.info('Sesión iniciada por ' + user.username);
        } catch (error) {
            LoggerController.error('Error en el login: ' + error.message);
            res.status(500).json({ error: error.message });
        }
    }

    /**
    * Cierra la sesión de un usuario eliminando su refresh token.
    * 
    * El access token (JWT de 1h) no se elimina explícitamente, ya que expira
    * automáticamente. El refresh token asociado al usuario se borra de la base
    * de datos para evitar que se puedan generar nuevos access tokens.
    *
    * @param {Object} req - Objeto de petición de Express.
    *   - Debe contener la cabecera "Authorization: Bearer <token>".
    * @param {Object} res - Objeto de respuesta de Express.
    */
    static async logout(req, res) {
        try {
            const authHeader = req.headers["authorization"];
            if (!authHeader) return res.status(401).json({ error: "Token requerido" });

            const token = authHeader.split(" ")[1];
            if (!token) return res.status(401).json({ error: "Token requerido" });

            // Decodificar JWT para obtener el userId
            const payload = await decodeToken(token);

            const userId = payload.id;
            const userName = payload.username;

            // Buscar todos los refresh tokens del usuario
            const userTokens = await RefreshToken.findAll({ where: { userId } });

            // Buscar el token exacto comparando desencriptado
            const tokenToDelete = userTokens.find(t => t.token === token);

            LoggerController.info("Sesión cerrada correctamente por " + userName);

            if (tokenToDelete) {
                // Eliminar el token correspondiente
                await RefreshToken.destroy({ where: { id: tokenToDelete.id } });
                return res.json({ message: "Logout exitoso" });
            } else {
                // No existe token de refresco asociado (no "recordar sesión")
                return res.json({ message: "Logout exitoso" });
            }
        } catch (error) {
            LoggerController.error("Error en el logout: " + error.message);
            res.status(500).json({ error: "Error al cerrar sesión" });
        }
    }

    /**
    * Recoge la fecha y versión del listado de usuarios.
    * 
    * @param {Object} req - Objeto de petición de Express.
    * @param {Object} res - Objeto de respuesta de Express.
    */
    static async date(req, res) {
        try {
            const updateRow = await UpdateModel.findByPk(1);

            if (!updateRow) {
                return res.status(404).json({ error: "No se encontró la fecha del listín" });
            }

            const date = new Date(updateRow.date).toLocaleDateString("es-ES");

            return res.json({date});

        } catch (error) {
            LoggerController.error("Error recuperando la fecha del listín: " + error.message);
            res.status(500).json({ error: "Error recuperando la fecha del listín" });
        }
    }

}

module.exports = AuthController;
