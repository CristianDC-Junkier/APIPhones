const express = require("express");
const router = express.Router();

const UserDataController = require("../controllers/UserDataController");
const { notWorker, isAuthenticated, canModifyUser } = require("../middlewares/Auth");

/**
 * Rutas para la gestión de UserData.
 *
 * Endpoints:
 * - GET    /                  → Listar todos los datos de usuario accesibles.
 * - GET    /list              → Listar todos los datos de usuario usuario logueado.
 * - GET    /list-department   → Listar todos los datos de usuario del mismo departamento que el usuario que hace la petición (solo notWorker: departamento o superior).
 * - GET    /profile           → Obtener el perfil del usuario logueado.
 * - PUT    /profile           → Modificar el perfil del usuario logueado.
 * - PUT    /profile-username  → Modificar el username del usuario logueado.
 * - PUT    /profile-pass      → Modificar la contraseña del usuario logueado.
 * - GET    /:id               → Obtener los datos de usuario por ID (solo notWorker: departamento o superior). //NO SE SI SE USARÁ
 * - PUT    /:id               → Modificar un los datos de usuario por ID (solo notWorker: departamento o superior). //NO SE SI SE USARÁ
 *
 * Middleware:
 * - `adminOnly`       → Restringe el acceso a usuarios con roles de administrador.
 * - `notWorker`       → Restringe el acceso a los usuarios con el rol basico de trabajador.
 * - `isAuthenticated` → Permite acceso a usuarios logeados.
 * - `canModifyUser`   → Comprueba si el usuario puede ser modificado o borrado.
 */


router.get("/", UserDataController.list);
router.get("/list", isAuthenticated, UserDataController.listAll);
router.get("/list-department", notWorker, UserDataController.listByDepartment);

router.get("/profile", isAuthenticated, UserDataController.getProfile);
router.put("/profile-data", isAuthenticated, UserDataController.updateMyProfileData);
router.put("/profile-username", isAuthenticated, UserDataController.updateMyUsername);
router.put("/profile-pass", isAuthenticated, UserDataController.updateMyPassword);
router.put("/profile-pass-PWD", isAuthenticated, UserDataController.forcedPasswordChange);
router.delete("/profile-del", isAuthenticated, UserDataController.deleteSelf);

router.get("/:id", notWorker, UserDataController.getOne);//NO SE SI SE USARÁ
router.put("/:id", isAuthenticated, UserDataController.update);//NO SE SI SE USARÁ

module.exports = router;
