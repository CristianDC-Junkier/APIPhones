const crypto = require("crypto");

const SECRET_KEY = process.env.AES_SECRET;
const IV_LENGTH = 16; // Longitud del vector de inicialización en bytes

/**
 * Cifra un texto usando AES-256-CBC.
 * @param {string} text - Texto plano a cifrar.
 * @returns {string} Texto cifrado en formato "iv:contenidoCifrado".
 */
function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(SECRET_KEY), iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
}

/**
 * Descifra un texto previamente cifrado por `encrypt`.
 * @param {string} text - Texto cifrado en formato "iv:contenidoCifrado".
 * @returns {string} Texto descifrado.
 */
function decrypt(text) {
    const parts = text.split(":");
    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(SECRET_KEY), iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

module.exports = { encrypt, decrypt };
