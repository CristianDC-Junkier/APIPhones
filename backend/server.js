const express = require("express");
const cors = require("cors");
const LoggerController = require("./controllers/LoggerController");
const path = require("path");
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env') });
const basePath = '/listin-telefonico';

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
const UserDataRoutes = require('./routes/UserDataRoutes');
const UserAccountRoutes = require('./routes/UserAccountRoutes');
const DepartmentRoutes = require('./routes/DepartmentRoutes');
const SubDepartmentRoutes = require('./routes/SubDepartmentRoutes');

app.use(`${basePath}/api`, AuthRoutes);
app.use(`${basePath}/api`, SystemRoutes);
app.use(`${basePath}/api/data`, UserDataRoutes);
app.use(`${basePath}/api/acc`, UserAccountRoutes);
app.use(`${basePath}/api/department`, DepartmentRoutes);
app.use(`${basePath}/api/subdepartment`, SubDepartmentRoutes);


// --------------------------------
//            FRONTEND
// --------------------------------
//app.use(basePath, express.static(path.join(__dirname, "./dist")));
//app.use(basePath, (req, res) => {
//    res.sendFile(path.join(__dirname, "./dist/index.html"));
//})

app.get(`${basePath}/api`, (req, res) => {
    res.redirect(`${basePath}/`); 
});


app.use('/', (req, res) => {
    res.redirect(`${basePath}/`);
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