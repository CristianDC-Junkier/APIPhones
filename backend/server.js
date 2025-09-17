const express = require("express");
const cors = require("cors");
const LoggerController = require("./controllers/LoggerController");
const path = require("path");
const dotenv = require('dotenv');


dotenv.config({ path: path.resolve(__dirname, '.env') });

// --------------------------------
//  DATABASE (Solo en Desarrollo)
// --------------------------------
const { initDatabase } = require("./config/dbInit");


const app = express();

app.use(cors());
app.use(express.json());

// --------------------------------
//            BACKEND
// --------------------------------
const AuthRoutes = require('./routes/AuthRoutes');
const SystemRoutes = require('./routes/SystemRoutes');
app.use('/api', AuthRoutes);
app.use('/api', SystemRoutes);


// --------------------------------
//            FRONTEND
// --------------------------------
app.use(express.static(path.join(__dirname, "../frontend/dist")));x

app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    } else {
        next();
    }
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Ruta de API no encontrada" });
});


async function start() {
    try {
        await initDatabase();
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            LoggerController.info(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (err) {
        LoggerController.error('Error inicializando la base de datos:', err.message);
        process.exit(1);
    }
}

start();