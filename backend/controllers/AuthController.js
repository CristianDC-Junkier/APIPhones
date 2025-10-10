const { UserAccount, UserData, Department, SubDepartment, RefreshToken, UpdateModel } = require("../models/Relations");

const LoggerController = require("../controllers/LoggerController");
const { generateToken } = require("../utils/JWT");

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
                return res.status(404).json({ error: "Credenciales incorrectas" });
            }

            const token = await generateToken({ id: user.id, username: user.username, usertype: user.usertype, departmentId: user.departmentId, remember: remember });

            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    usertype: user.usertype,
                    forcePwdChange: user.forcePwdChange,
                    departmentId: user.departmentId,
                    show: user.show,
                    version: user.version,
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
            const userId = req.user.id;
            const userName = req.user.username;

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
    static async getDate(req, res) {
        try {
            const updateRow = await UpdateModel.findByPk(1);

            if (!updateRow) {
                return res.status(404).json({ error: "No se encontró la fecha del listín" });
            }

            const date = new Date(updateRow.date).toLocaleDateString("es-ES");

            return res.json({ date });

        } catch (error) {
            LoggerController.error("Error recuperando la fecha del listín: " + error.message);
            res.status(500).json({ error: "Error recuperando la fecha del listín" });
        }
    }

    /**
    * Recoge la versión del usuario.
    * 
    * @param {Object} req - Objeto de petición de Express.
    * @param {Object} res - Objeto de respuesta de Express.
    */
    static async getVersion(req, res) {
        try {
            const userVersion = await UserAccount.findByPk(req.user.id, {
                attributes: ['version']
            });

            const version = userVersion?.version;

            return res.json({ version });

        } catch (error) {
            LoggerController.error("Error recuperando la versión del usuario: " + error.message);
            res.status(500).json({ error: "Error recuperando la fecha del listín" });
        }
    }

}

module.exports = AuthController;
