const jwt = require("jsonwebtoken");
const { RefreshToken } = require("../models/Relations");
const { v4: uuidv4 } = require("uuid");

const JWT_SECRET_ACS = process.env.JWT_SECRET_ACS;
const JWT_SECRET_RFH = process.env.JWT_SECRET_RFH;

/**
* Genera un accessToken JWT
* @param {Object} payload - Datos del usuario {id, username, usertype}
* @param {string|number} [expiresIn='15m']
* @returns {string} accessToken
*/
function generateAccessToken(payload, expiresIn = '15m') {
    return jwt.sign(payload, JWT_SECRET_ACS, { expiresIn });
}

/**
* Genera un refreshToken JWT con UUID y lo guarda en DB
* @param {number} userId 
* @param {boolean} remember 
* @returns {Promise<{ token: string, uuid: string }>} refreshToken + uuid
*/
async function generateRefreshToken(userId, remember = false) {
    const uuid = uuidv4();
    const expiresIn = remember ? '7d' : '1h';

    // Guardar en DB
    const expireDate = remember
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 60 * 60 * 1000);

    await RefreshToken.create({ uuid, userId, expireDate });

    return jwt.sign({ userId, uuid, remember }, JWT_SECRET_RFH, { expiresIn });
}

/**
* Verifica un token de acceso 
* @param {string} token 
* @returns {Object} payload
* @throws Error si inválido o expirado
*/
function verifyToken(token, type = 'access') {
    const secret = type === 'access' ? JWT_SECRET_ACS : JWT_SECRET_RFH;
    return jwt.verify(token, secret);
}


/**
* Decodifica cualquier token sin validar
* @param {string} token 
* @param {'access'|'refresh'} type 
*/
function decodeToken(token, type = 'access') {
    const secret = type === 'access' ? JWT_SECRET_ACS : JWT_SECRET_RFH;
    return jwt.decode(token, secret);
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    decodeToken
};
