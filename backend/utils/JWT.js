const jwt = require("jsonwebtoken");
const { RefreshToken } = require("../models/Relations");


const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Genera un token JWT.
 * 
 * @param {Object} payload - Datos a incluir en el token.
 * @param {string|number} [expiresIn="1h"] - Tiempo de expiración.
 * @returns {string} Token JWT firmado.
 */
async function generateToken(payload) {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    if (payload.remember) {
        await RefreshToken.create({ token, userId: payload.id })
    };
    return token;
}

/**
 * Verifica un token JWT y retorna su contenido.
 * 
 * @param {string} token - Token JWT a verificar.
 * @returns {Object} Payload del token.
 * @throws {Error} Si el token es inválido o expiró.
 */
async function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            // Si expiró, buscamos el refresh token en BD
            const refresh = await RefreshToken.findOne({ where: { token } });
            if (!refresh) {
                throw new Error("Token expirado y no existe refresh token");
            }

            // Comprobar si el refresh token está caducado
            const now = new Date();
            if (refresh.expireDate && refresh.expireDate < now) {
                await RefreshToken.destroy({ where: { id: refresh.id } });
                throw new Error("Refresh token caducado");
            } else {
                token = jwt.sign(jwt.decode(token), JWT_SECRET, { expiresIn: '1h' });
                await RefreshToken.update(
                    { token: token },
                    { where: { id: refresh.id } });
                return jwt.verify(token, JWT_SECRET);
            }
        } else {
            throw err;
        }
    }
}

/**
 * Retorna el contenido de un token JWT.
 * 
 * @param {string} token - Token JWT a decodificar.
 * @returns {Object} Payload del token.
 * @throws {Error} Si el token es inválido.
 */
async function decodeToken(token) {
    try {
        return jwt.decode(token, JWT_SECRET);
    } catch (err) {
        throw err;
    }

}

module.exports = { generateToken, verifyToken, decodeToken };
