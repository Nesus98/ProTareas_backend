import { transporter } from "../config/nodemailer";
4;
//Tipo de Email
interface IEmail {
  email: string;
  name: string;
  token: number;
}

export class AuthEmail {

    //Envia email para confirmar la cuenta 
  static sendConfirmationEmail = async (user: IEmail) => {
    //Enviar email
    const info = await transporter.sendMail({
      from: "ProTareas <admin@protareas.com>",
      to: user.email,
      subject: "ProTareas - Confirma tu cuenta",
      text: "ProTareas - Confirma tu cuenta",
      html: `<p>Hola ${user.name}, has creado una cuenta en ProTareas, por favor confirma tu cuenta</p>
      <p>Visita el siguiente enlace:</p>
      <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Link para confirmar cuenta</a>
      <p>Ingresa el codigo: <b>${user.token}</b></p>
      <p>El token expirara en 10 minutos</p>`,
    });
    console.log("Mensaje enviado", info.messageId);
  };

  //Envio de token para reestablecer password
  static sendPasswordResetToken = async (user: IEmail) => {
    //Enviar email
    const info = await transporter.sendMail({
      from: "ProTareas <admin@protareas.com>",
      to: user.email,
      subject: "ProTareas - Reestablece tu password",
      text: "ProTareas - Reestablece tu password",
      html: `<p>Hola ${user.name}, has solicitado reestablecer tu password</p>
      <p>Visita el siguiente enlace:</p>
      <a href="${process.env.FRONTEND_URL}/auth/new-password">Reestablecer password</a>
      <p>Ingresa el codigo: <b>${user.token}</b></p>
      <p>El token expirara en 10 minutos</p>`,
    });
    console.log("Mensaje enviado", info.messageId);
  };
}
