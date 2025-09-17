const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Genera un token JWT.
 * 
 * @param {Object} payload - Datos a incluir en el token.
 * @param {string|number} [expiresIn="1h"] - Tiempo de expiración.
 * @returns {string} Token JWT firmado.
 */
function generateToken(payload, expiresIn = "1h") {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verifica un token JWT y retorna su contenido.
 * 
 * @param {string} token - Token JWT a verificar.
 * @returns {Object} Payload del token.
 * @throws {Error} Si el token es inválido o expiró.
 */
function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

module.exports = { generateToken, verifyToken };
