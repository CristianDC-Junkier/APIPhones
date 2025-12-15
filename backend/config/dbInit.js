const { sequelize, UserAccount, Department, SubDepartment } = require("../models/Relations");


const LoggerController = require("../controllers/LoggerController");
const USER_TYPE = ['USER', 'ADMIN', 'SUPERADMIN'];


/**
 * Inicialización de la base de datos y creación de usuarios, departamentos y subdepartamentos por defecto.
 */
async function initDatabase() {
    try {
        // Conectar y sincronizar
        await sequelize.authenticate();
        await sequelize.sync();

        LoggerController.info('✅ Base de datos sincronizada correctamente');

        // Comprobar si ya existen departamentos
        const existingDepartments = await Department.count();
        let departments = [];

        if (existingDepartments === 0) {
            // Crear departamentos de ejemplo
            const departmentsData = [
                { name: 'Ventanilla (SAC)' }, { name: 'Estadística' },
                { name: 'Informática' }, { name: 'Rentas' }, { name: 'Tesorería' },
                { name: 'Intervención' }, { name: 'Patrimonio' }, { name: 'Personal' },
                { name: 'Contratación' }, { name: 'Archivo Municipal' }, { name: 'Secretaría' },
                { name: 'Equipo de Gobierno' }, { name: 'Salud y Consumo' }, { name: 'Servicios Inseccion' },
                { name: 'Servicios Sociales' }, { name: 'Turismo' }, { name: 'Policía Local' },
                { name: 'Concejalía Matalascañas' }, { name: 'Desarrollo Local' }, { name: 'Agricultura' },
                { name: 'Urbanismo' }, { name: 'Concejalía El Rocío' }, { name: 'Alcaldía' },
                { name: 'Ciudad de la Cultura' }, { name: 'Otros' }, { name: 'Moviles Coporativos' },
                { name: 'Escuelas Infatiles' }, { name: 'Part. Ciudadana y Dllo. Comunitario' },
                { name: 'Institutos' }, { name: 'Centro Sociocultural Barrio Obrero' }
            ];

            for (const dep of departmentsData) {
                const created = await Department.create(dep);
                departments.push(created);
            }
            LoggerController.info('✅ Departamentos de ejemplo creados');

            // Crear subdepartamentos de ejemplo
            const subdepartmentsData = [
                //Servicios Sociales
                { name: 'Técnicas y Responsables', departmentId: departments[14].id },
                { name: 'Administración', departmentId: departments[14].id },
                { name: 'CIM', departmentId: departments[14].id },
                { name: 'Educación', departmentId: departments[14].id },
                { name: 'ETF', departmentId: departments[14].id },
                { name: 'Inmigración', departmentId: departments[14].id },
                { name: 'Psícologos', departmentId: departments[14].id },
                { name: 'Trabajadoras Sociales (UTS)', departmentId: departments[14].id },
                { name: 'Trabajadoras Sociales (Dependencia)', departmentId: departments[14].id },
                { name: 'PROMMESSAS', departmentId: departments[14].id },
                //Policía Local
                { name: 'Almonte', departmentId: departments[16].id },
                { name: 'El Rocío', departmentId: departments[16].id },
                { name: 'Matalascañas', departmentId: departments[16].id },
                //Urbanismo
                { name: 'Vivienda', departmentId: departments[20].id },
                { name: 'Dllo Industrial El Tomillar', departmentId: departments[20].id },
                { name: 'Ordenación Territorio', departmentId: departments[20].id },
                { name: 'Obras Municipales', departmentId: departments[20].id },
                { name: 'Licencias de Obras', departmentId: departments[20].id },
                { name: 'Licencias de Aperturas', departmentId: departments[20].id },
                { name: 'Disciplina Urbanistica', departmentId: departments[20].id },
                { name: 'Servicios Júridicos', departmentId: departments[20].id },
                { name: 'Servicios Minicipales', departmentId: departments[20].id },
                //Ciudad de la Cultura
                { name: 'Biblioteca', departmentId: departments[23].id },
                { name: 'Juventud (Iglesia de Baler)', departmentId: departments[23].id },
            ];

            for (const subdep of subdepartmentsData) {
                await SubDepartment.create(subdep);
            }
            LoggerController.info('✅ Subdepartamentos de ejemplo creados');
        } else {
            // Recuperar departamentos existentes
            departments = await Department.findAll();
            LoggerController.info('ℹ️ Departamentos ya existentes, no se crean nuevos');
        }

        // Comprobar si existe el superadmin
        const superAdminType = USER_TYPE[USER_TYPE.length - 1];
        const existingSuperadmin = await UserAccount.findOne({ where: { usertype: superAdminType } });

        if (!existingSuperadmin) {
            await UserAccount.create({
                username: process.env.ADMIN_USER,
                password: process.env.ADMIN_PASS,
                usertype: superAdminType,
                mail: process.env.ADMIN_EMAIL
            });

            LoggerController.info('✅ Superadmin creado correctamente');
        } else {
            LoggerController.info('ℹ️ Superadmin ya existe, no se crea de nuevo');
        }

        LoggerController.info('✅ Inicialización de base de datos completa');
    } catch (err) {
        const message = err instanceof Error ? (err.message || err.stack) : JSON.stringify(err);
        LoggerController.errorCritical('❌ Error inicializando la base de datos:' + message);
        process.exit(1);
    }
}

module.exports = { initDatabase };