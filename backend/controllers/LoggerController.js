const fs = require('fs');
const path = require('path');

/**
 * Controlador para la gestión de logs de la aplicación.
 * Permite registrar mensajes de información, advertencia y error.
 * 
 * Proporciona métodos estáticos para:
 *  - info(message): Registrar un mensaje de información.
 *  - warn(message): Registrar un mensaje de advertencia.
 *  - error(message): Registrar un mensaje de error.
 * 
 */
class LoggerController {

    /** Número máximo de archivos de log que se mantienen */
    static MAX_LOGS = 30;

    /**
     * Inicializa el LoggerController.
     * Crea la carpeta de logs si no existe.
     */
    static init() {
        const baseDir = process.cwd().endsWith('backend') ? process.cwd() : path.join(process.cwd(), 'backend');
        this.logsDir = path.join(baseDir, 'logs');

        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir, { recursive: true });
        }
    }

    /**
     * Obtiene un timestamp formateado para los logs.
     * 
     * @returns {string} Timestamp en formato YYYY-MM-DD HH:MM:SS
     * @private
     */
    static _getTimestamp() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    /**
     * Formatea un mensaje de log con timestamp y nivel.
     * 
     * @param {string} level - Nivel del log (info, warn, error)
     * @param {string} message - Mensaje a registrar
     * @returns {string} Mensaje formateado
     * @private
     */
    static _format(level, message) {
        const timestamp = this._getTimestamp();
        return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    }

    /**
     * Escribe un mensaje de log en el archivo correspondiente al día actual.
     * También ejecuta la limpieza de logs antiguos.
     * 
     * @param {string} message - Mensaje ya formateado
     * @private
     */
    static _writeToFile(message) {
        const filePath = path.join(this.logsDir, `${new Date().toISOString().slice(0, 10)}.log`);
        fs.appendFile(filePath, message + '\n', err => {
            if (err) console.error('Error escribiendo el log:', err);
        });

        this._cleanupOldLogs();
    }

    /**
     * Elimina los archivos de log más antiguos si se supera MAX_LOGS.
     * @private
     */
    static _cleanupOldLogs() {
        const files = fs.readdirSync(this.logsDir)
            .filter(f => f.endsWith('.log'))
            .map(f => ({
                name: f,
                time: fs.statSync(path.join(this.logsDir, f)).mtime.getTime()
            }))
            .sort((a, b) => a.time - b.time);

        while (files.length > this.MAX_LOGS) {
            const oldest = files.shift();
            fs.unlink(path.join(this.logsDir, oldest.name), err => {
                if (err) console.error('Error eliminando log antiguo:', err);
            });
        }
    }

    /**
     * Registra un mensaje de información.
     * 
     * @param {string} message - Mensaje a registrar
     */
    static info(message) {
        const formatted = this._format('info', message);
        this._writeToFile(formatted);
    }

    /**
     * Registra un mensaje de advertencia.
     * 
     * @param {string} message - Mensaje a registrar
     */
    static warn(message) {
        const formatted = this._format('warn', message);
        this._writeToFile(formatted);
    }

    /**
     * Registra un mensaje de error.
     * 
     * @param {string} message - Mensaje a registrar
     */
    static error(message) {
        const formatted = this._format('error', message);
        this._writeToFile(formatted);
    }
}

// Inicializa el LoggerController al cargar el módulo
LoggerController.init();

module.exports = LoggerController;
