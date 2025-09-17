const { Sequelize } = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const MODE = process.env.NODE_ENV || 'development';

let sequelize;


/**
 * Configuración e inicialización de Sequelize ORM.
 *
 * Este módulo configura la conexión a la base de datos en función del entorno:
 *
 * - En producción: utiliza MariaDB, leyendo las credenciales desde variables de entorno.
 * - En desarrollo: utiliza una base de datos SQLite almacenada en el directorio /backend/database.
 *
 * Parámetros de entrada (variables de entorno):
 * - NODE_ENV   : Define el modo de ejecución ("development" o "production").
 * - DB_NAME    : Nombre de la base de datos (solo producción).
 * - DB_USER    : Usuario de la base de datos (solo producción).
 * - DB_PASSWORD: Contraseña de la base de datos (solo producción).
 * - DB_HOST    : Host de la base de datos (solo producción).
 *
 * Exporta:
 * - sequelize : Instancia configurada de Sequelize lista para ser utilizada
 *               en la definición de modelos y servicios.
 */

if (MODE === 'production') {
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            dialect: 'mariadb',
            logging: false,
        }
    );
} else {
    const baseDir = process.cwd().endsWith('backend') ? process.cwd() : path.join(process.cwd(), 'backend');
    const dbDir = path.join(baseDir, 'database');
    const dbPath = path.join(dbDir, 'data.db');

    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: dbPath,
        logging: false,
    });
}

module.exports = sequelize;
