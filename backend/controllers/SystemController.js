const fs = require("fs");
const path = require("path");
const os = require("os");

const LoggerController = require('./LoggerController');

const logBasePath = path.join(__dirname, '../logs');


/**
 * Controlador para la gestión del sistema y logs de la aplicación.
 * 
 * Proporciona métodos para:
 *  - Listar archivos de logs.
 *  - Obtener contenido de un log específico.
 *  - Descargar logs.
 *  - Obtener métricas del sistema (CPU, memoria, hilos, uptime).
 * 
 */
const SystemController = {

    /**
     * Listar todos los archivos de log disponibles
     * 
     * @param {Object} req Objeto de petición Express
     * @param {Object} res Objeto de respuesta Express
     * @returns {Array<string>} Lista de nombres de archivos de log, ordenados por fecha descendente
     */
    getLogs: (req, res) => {
        try {
            const logs = fs
                .readdirSync(logBasePath, { withFileTypes: true })
                .filter((dirent) => dirent.isFile())
                .map((dirent) => dirent.name)
                .sort((a, b) => b.localeCompare(a));

            res.json(logs);
        } catch (error) {
            LoggerController.error('Error recogiendo los logs por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            res.status(500).json({ error: "No se pudo leer el archivo log" });
        }
    },

    /**
    * Obtener contenido de un archivo log específico
    * 
    * @param {Object} req Objeto de petición Express con { params: { log } }
    * @param {Object} res Objeto de respuesta Express
    * @returns {string} Contenido del log en texto plano o un mensaje de error.
    */
    getLog: (req, res) => {
        try {
            const { log } = req.params;
            const logPath = path.resolve(logBasePath, log);

            if (!fs.existsSync(logPath)) {
                return res.status(404).json({ error: "Archivo log no encontrado" });
            }
            const content = fs.readFileSync(logPath, "utf-8");
            res.type("text/plain").send(content);

        } catch (error) {
            LoggerController.error('Error al leer el archivo de log ' + log + ' por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Descargar un archivo de log
     * 
     * @param {Object} req Objeto de petición Express con { params: { log } }
     * @param {Object} res Objeto de respuesta Express
     * @returns {void} Envía el archivo como descarga (`res.download`) o un mensaje de error.
     */
    downloadLog: (req, res) => {
        try {
            const { log } = req.params;
            const logPath = path.resolve(logBasePath, log);

            if (!fs.existsSync(logPath)) {
                return res.status(404).json({ error: "Archivo log no encontrado" });
            }

            res.download(logPath, log);

        } catch (error) {
            LoggerController.error('Error al descargar el archivo de log ' + log + ' por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Obtener métricas del sistema
     * 
     * @param {Object} req Objeto de petición Express
     * @param {Object} res Objeto de respuesta Express
     * @returns {JSON} Métricas del sistema:
     *  - CpuUsagePercent {number} Porcentaje de uso de CPU
     *  - MemoryUsedMB {number} Memoria usada en MB
     *  - ThreadsCount {number} Número de hilos de CPU
     *  - UptimeSeconds {number} Tiempo de actividad del proceso en segundos
     * o un mensaje de error.
     */
    getSystemMetrics: async (req, res) => {
        try {
            const memoryUsedMB = Math.round((process.memoryUsage().rss / 1024 / 1024) * 100) / 100;
            const uptimeSeconds = Math.floor(process.uptime());
            const threadsCount = os.cpus().length;

            const cpuUsagePercent = await getCpuUsagePercent(100);

            res.json({
                CpuUsagePercent: cpuUsagePercent,
                MemoryUsedMB: memoryUsedMB,
                ThreadsCount: threadsCount,
                UptimeSeconds: uptimeSeconds
            });
        } catch (error) {
            LoggerController.error('Error al obtener las métricas del sistema por el usuario con id ' + req.user.id);
            LoggerController.error('Error - ' + error.message);
            res.status(500).json({ error: error.message });
        }
    },
};

/**
 * Calcula el porcentaje de uso de CPU en un intervalo dado.
 * 
 * @param {number} interval Intervalo de muestreo en ms (default: 100)
 * @returns {Promise<number>} Porcentaje de CPU usado, redondeado a dos decimales
 */
function getCpuUsagePercent(interval = 100) {
    return new Promise((resolve) => {
        const startMeasure = os.cpus();

        setTimeout(() => {
            const endMeasure = os.cpus();

            let idleDiff = 0;
            let totalDiff = 0;

            for (let i = 0; i < startMeasure.length; i++) {
                const startCpu = startMeasure[i].times;
                const endCpu = endMeasure[i].times;

                const idle = endCpu.idle - startCpu.idle;
                const total = (endCpu.user - startCpu.user) +
                    (endCpu.nice - startCpu.nice) +
                    (endCpu.sys - startCpu.sys) +
                    (endCpu.irq - startCpu.irq) +
                    idle;

                idleDiff += idle;
                totalDiff += total;
            }
            const usagePercent = 100 - (idleDiff / totalDiff) * 100;
            resolve(Math.round(usagePercent * 100) / 100);
        }, interval);
    });
}

module.exports = SystemController;

