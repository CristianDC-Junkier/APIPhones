const nodemailer = require("nodemailer");

const { UserAccount, Department } = require("../models/Relations");

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
     * @param {Object} ticket - Objeto con la información del ticket sobre el que se quiere avisar
     */
    static async sendNotif(ticket) {
        try {
            //Verifica que el transporter se puede conectar
            await transporter.verify();

            //Encuentra las cuentas con correo
            const users = await UserAccount.findAll({
                where: { mail: { [Op.ne]: null } }
            });
            const mails = users.map(user => (
                user.mail
            ));

            const ticketU = await UserAccount.findByPk(ticket.userRequesterId);
            const depU = await Department.findByPk(ticketU.departmentId);

            const reminderStyle = 'color:gray; margin-top:20px; font-size:0.75rem;';

            const htmlMailBody = `
            <div>
                <div>Un nuevo ticket ha sido generado en la página del Listín Telefónico del Ayuntamiento de Almonte a fecha: ${ticket.createdAt} por el usuario del departamento <strong>${depU.name}</strong>.</div>
                <div> 
                    <strong>Asunto:&nbsp;</strong>${ticket.topic}
                </div>
                <div style="${reminderStyle}">
                    Este mensaje ha sido enviado de forma automática y cualquier respuesta al mismo será ignorada. <br>
                    En caso de recibir esta notificación sin su consentimiento, por favor, pongase en contacto con informaticaalcaldia@aytoalmonte.es.
                </div>
            </div>`;

            //Manda la notificación
            const notification = await transporter.sendMail({
                from: 'No Reply <informaticaalcaldia@aytoalmonte.es>', // Dirección del emisor
                to: mails.join(", "), //Lista de los receptores
                subject: "Nuevo Ticket en Listin Telefonico", //Asunto
                html: htmlMailBody, //Cuerpo del mensaje en HTML
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