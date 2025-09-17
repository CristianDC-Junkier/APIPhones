const { Sequelize } = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const MODE = process.env.NODE_ENV || 'development';
let sequelize;

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
