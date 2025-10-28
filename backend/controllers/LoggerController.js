const fs = require('fs');
const path = require('path');

/**
 * LoggerController
 * ----------------
 * Controlador centralizado para gestionar logs de la aplicación y de acciones sobre tickets.
 * 
 * Funcionalidades:
 *  - Registrar logs generales (info, warn, error, error crítico)
 *  - Registrar acciones de usuario sobre tickets (ticketId, action, userId, timestamp)
 *  - Mantener un máximo de archivos de log diarios (MAX_LOGS)
 *  - Crear carpetas de logs automáticamente si no existen
 * 
 * Nota:
 *  Los logs de tickets se almacenan en `logs/tickets/`.
 *  Los logs generales se almacenan en `logs/`.
 */
class LoggerController {

    /** Número máximo de archivos de log que se mantienen por carpeta */
    static MAX_LOGS = 30;

    /**
     * Inicializa la estructura de carpetas de logs.
     * Crea `logs/` y `logs/tickets/` si no existen.
     */
    static init() {
        this.logsDir = path.join(__dirname, '../logs');
        this.logsTicketDir = path.join(this.logsDir, 'tickets');

        if (!fs.existsSync(this.logsDir)) fs.mkdirSync(this.logsDir, { recursive: true });
        if (!fs.existsSync(this.logsTicketDir)) fs.mkdirSync(this.logsTicketDir, { recursive: true });
    }

    /**
     * Genera un timestamp legible para los logs en formato:
     * YYYY-MM-DD HH:MM:SS
     * @returns {string} Timestamp
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
     * Formatea un mensaje de log con timestamp y nivel
     * @param {string} level - Nivel del log: info, warn, error
     * @param {string} message - Mensaje a registrar
     * @returns {string} Mensaje formateado
     */
    static _format(level, message) {
        const timestamp = this._getTimestamp();
        return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    }

    /**
     * Escribe un mensaje en un archivo específico
     * @param {string} filePath - Ruta del archivo de log
     * @param {string} message - Mensaje a escribir
     * @private
     */
    static _writeToFile(filePath, message) {
        fs.appendFile(filePath, message + '\n', err => {
            if (err) console.error('Error escribiendo el log:', err);
        });
    }

    /**
     * Elimina los archivos más antiguos si se supera MAX_LOGS
     * @param {string} dir - Directorio de logs
     * @private
     */
    static _cleanupOldLogs(dir) {
        const files = fs.readdirSync(dir)
            .filter(f => f.endsWith('.log'))
            .map(f => ({ name: f, time: fs.statSync(path.join(dir, f)).mtime.getTime() }))
            .sort((a, b) => a.time - b.time);

        while (files.length > this.MAX_LOGS) {
            const oldest = files.shift();
            fs.unlink(path.join(dir, oldest.name), err => {
                if (err) console.error('Error eliminando log antiguo:', err);
            });
        }
    }

    // -----------------------------
    // Logs generales de la aplicación
    // -----------------------------

    /**
     * Registra un log de información
     * @param {string} message - Mensaje de información
     */
    static info(message) {
        const filePath = path.join(this.logsDir, `${new Date().toISOString().slice(0, 10)}.log`);
        this._writeToFile(filePath, this._format('info', message));
        this._cleanupOldLogs(this.logsDir);
    }

    /**
     * Registra un log de advertencia
     * @param {string} message - Mensaje de advertencia
     */
    static warn(message) {
        const filePath = path.join(this.logsDir, `${new Date().toISOString().slice(0, 10)}.log`);
        this._writeToFile(filePath, this._format('warn', message));
        this._cleanupOldLogs(this.logsDir);
    }

    /**
     * Registra un log de error
     * @param {string} message - Mensaje de error
     */
    static error(message) {
        const filePath = path.join(this.logsDir, `${new Date().toISOString().slice(0, 10)}.log`);
        this._writeToFile(filePath, this._format('error', message));
        this._cleanupOldLogs(this.logsDir);
    }

    /**
     * Registra un log de error crítico de manera síncrona
     * (se recomienda para errores muy importantes)
     * @param {string} message - Mensaje de error crítico
     */
    static errorCritical(message) {
        const filePath = path.join(this.logsDir, `${new Date().toISOString().slice(0, 10)}.log`);
        fs.appendFileSync(filePath, this._format('error', message) + '\n');
    }

    // -----------------------------
    // Logs de acciones de tickets
    // -----------------------------

    /**
     * Registra una acción sobre un ticket
     * Ejemplo de uso: READ, RESOLVE, WARN
     * @param {Object} params
     * @param {number|string} params.ticketId - ID del ticket
     * @param {string} params.action - Acción realizada
     * @param {number|string} params.userId - ID del usuario que realiza la acción
     */
    static ticketAction({ ticketId, action, userId }) {
        const timestamp = this._getTimestamp();
        const logLine = `${ticketId} | "${action}" | ${userId} | ${timestamp}`;
        const filePath = path.join(this.logsTicketDir, `${new Date().toISOString().slice(0, 10)}.log`);
        this._writeToFile(filePath, logLine);
        this._cleanupOldLogs(this.logsTicketDir);
    }
}

// Inicializa automáticamente el LoggerController al cargar el módulo
LoggerController.init();

module.exports = LoggerController;
