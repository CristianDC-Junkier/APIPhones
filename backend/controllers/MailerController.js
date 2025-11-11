const nodemailer = require("nodemailer");

const { UserAccount } = require("../models/Relations");

const LoggerController = require("./LoggerController");
const { Op } = require("sequelize");

/**
 * Controlador de envio de notificaciones via Mail
 * 
 * Proporciona metodo estáticos para:
 * - Mandar Notificación de nuevo Ticket generado
 */

// Crear un transportador para SMTP
let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        type: "OAuth2",
        clientId: process.env.SMTP_CLIENTID,
        clientSecret: process.env.SMTP_CLIENTSECRET,
    },
});

class MailerController {

    /**
     * Mandar notificación de Ticket nuevo a las cuentas Admin y SuperAdmin que tengan correo
     */
    static async sendNotif() {
        try {
            //Verifica que el transporter se puede conectar
            await transporter.verify();

            //Encuentra las cuentas con correo
            const users = await UserAccount.findAll({
                where: { mail: { [Op.ne]: null } }
            });
            const formatted = users.map(user => (
                user.mail
            ));

            //Manda la notificación
            const notification = await transporter.sendMail({
                from: 'informaticaalcaldia@aytoalmonte.es', // Dirección del emisor
                to: formatted.join(", "), //Lista de los receptores
                subject: "Nuevo Ticket en Listin Telefonico", //Asunto
                html: "Un nuevo ticket ha sido generado en la página del Listín Telefónico del ayuntamiento de Almonte.", //Cuerpo del mensaje en HTML
                auth: { //Credenciales
                    user: process.env.SMTP_USER,
                    refreshToken: process.env.SMTP_REFRESHTOKEN,
                    accessToken: process.env.SMPT_ACCESSTOKEN,
                    expire: 1762761847
                }
            });

            LoggerController.info('Correos de notificación mandados correctamente.')
        } catch (err) {
            LoggerController.error('No se pudo mandar las notificaciones. ' + err)
        }
    }
}

module.exports = MailerController;