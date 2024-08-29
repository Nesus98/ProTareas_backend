import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import Token from "../models/Token";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";

export class AuthController {
  //Crear cuenta
  static createAccount = async (req: Request, res: Response) => {
    try {
      const { password, email } = req.body;

      //Prevenir duplicados
      const userExists = await User.findOne({ email });
      if (userExists) {
        const error = new Error("El usuario ya esta registrado");
        return res.status(409).json({ error: error.message });
      }

      //Crea un usuario
      const user = new User(req.body);

      //Hashear password
      user.password = await hashPassword(password);

      //Generar el token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      //Eviar Email
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });
      //Guardamos los datos de usuario y el token
      await Promise.allSettled([user.save(), token.save()]);

      //Enviamos una respuesta satisfactoria
      res.send("Cuenta creada, revisa tu email para confirmarla");
    } catch (error) {
      //En caso de error
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  //Confirmar cuenta
  static confirmAccount = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;

      // Buscamos el token en la base de datos
      const tokenExist = await Token.findOne({ token });

      // Si el token no existe, devolvemos un error 404
      if (!tokenExist) {
        const error = new Error("Token no válido");
        return res.status(404).json({ error: error.message });
      }

      // Si el token es válido, buscamos el usuario asociado a ese token
      const user = await User.findById(tokenExist.user);

      // Marcamos al usuario como confirmado
      user.confirmed = true;

      // Guardamos el estado confirmado del usuario y eliminamos el token
      // Usamos Promise.allSettled para manejar ambas operaciones de forma concurrente
      await Promise.allSettled([user.save(), tokenExist.deleteOne()]);

      // Enviamos una respuesta de éxito al cliente
      res.send("Cuenta confirmada correctamente");
    } catch (error) {
      // En caso de cualquier error inesperado, devolvemos un error 500
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  //Iniciar sesion
  static login = async (req: Request, res: Response) => {
    try {
      // Extraemos el email y password del cuerpo de la solicitud
      const { email, password } = req.body;

      // Buscamos al usuario en la base de datos por su email
      const user = await User.findOne({ email });

      // Si el usuario no existe, devolvemos un error 404 indicando que no se encontró
      if (!user) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({ error: error.message });
      }

      // Si la cuenta del usuario no ha sido confirmada, generamos un nuevo token
      if (!user.confirmed) {
        const token = new Token();
        token.user = user.id;
        token.token = generateToken(); // Generamos un nuevo token
        await token.save(); // Guardamos el token en la base de datos

        // Enviamos un correo electrónico de confirmación
        AuthEmail.sendConfirmationEmail({
          email: user.email,
          name: user.name,
          token: token.token,
        });

        // Devolvemos un error 401 indicando que la cuenta no está confirmada
        const error = new Error(
          "La cuenta no ha sido confirmada, hemos enviado un e-mail de confirmación"
        );
        return res.status(401).json({ error: error.message });
      }

      // Verificamos si la contraseña ingresada es correcta
      const isPasswordCorrect = await checkPassword(password, user.password);
      if (!isPasswordCorrect) {
        const error = new Error("Password incorrecto");
        return res.status(401).json({ error: error.message });
      }

      // Si la contraseña es correcta, generamos un token JWT
      const token = generateJWT({ id: user.id });

      // Enviamos el token JWT como respuesta
      res.send(token);
    } catch (error) {
      // En caso de cualquier error inesperado, devolvemos un error 500
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  //Enviar token para confirmar cuenta
  static requestConfirmationCode = async (req: Request, res: Response) => {
    try {
      const { email } = req.body; // Extraemos el email

      // Verificamos si el usuario existe en la base de datos
      const user = await User.findOne({ email });

      // Si el usuario no está registrado, devolvemos un error 409 (conflicto)
      if (!user) {
        const error = new Error("El usuario no está registrado");
        return res.status(409).json({ error: error.message });
      }

      // Si el usuario ya ha confirmado su cuenta, devolvemos un error 403 (prohibido)
      if (user.confirmed) {
        const error = new Error("El usuario ya está confirmado");
        return res.status(403).json({ error: error.message });
      }

      // Si el usuario existe pero no ha confirmado su cuenta, generamos un nuevo token de confirmación
      const token = new Token();
      token.token = generateToken(); // Generamos un nuevo token único
      token.user = user.id; // Asociamos el token con el ID del usuario

      // Enviamos un correo electrónico con el nuevo token de confirmación
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      // Guardamos los cambios en la base de datos
      await Promise.allSettled([user.save(), token.save()]);

      // Enviamos una respuesta indicando que se ha enviado un nuevo token al email del usuario
      res.send("Se envió un nuevo token a tu email");
    } catch (error) {
      // En caso de un error inesperado, devolvemos un error 500 (error interno del servidor)
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  //Olvido password
  static forgotPassword = async (req: Request, res: Response) => {
    try {
      // Extraemos el email
      const { email } = req.body;

      //Usuario existe
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("El usuario no esta registrado");
        return res.status(409).json({ error: error.message });
      }

      //Generar el token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;
      await token.save();

      //Eviar Email
      AuthEmail.sendPasswordResetToken({
        email: user.email,
        name: user.name,
        token: token.token,
      });
      //Aviso al usuario que se le envio un email con el token
      res.send("Revisa tu email para instrucciones");
    } catch (error) {
      //Mensaje de error
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  //Validar token
  static validateToken = async (req: Request, res: Response) => {
    try {
      // Extraer el token
      const { token } = req.body;

      // Buscar el token en la base de datos
      const tokenExist = await Token.findOne({ token });

      // Si el token no existe, devolver un error
      if (!tokenExist) {
        const error = new Error("Token no válido");
        return res.status(404).json({ error: error.message });
      }

      // Si el token es válido, enviar un mensaje de éxito
      res.send("Token válido, define tu nuevo password");
    } catch (error) {
      // Capturar cualquier error y devolver una respuesta de error
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  //Cambiar password olvidada con token
  static updatePasswordWithToken = async (req: Request, res: Response) => {
    try {
      // Extraer el token
      const { token } = req.params;

      // Buscar el token en la base de datos
      const tokenExist = await Token.findOne({ token });

      // Si el token no existe, devolver un error
      if (!tokenExist) {
        const error = new Error("Token no válido");
        return res.status(404).json({ error: error.message });
      }

      // Buscar al usuario asociado con el token
      const user = await User.findById(tokenExist.user);

      // Actualizar la contraseña del usuario con la nueva contraseña proporcionada
      user.password = await hashPassword(req.body.password);

      // Guardar los cambios en el usuario y eliminar el token utilizado
      await Promise.allSettled([user.save(), tokenExist.deleteOne()]);

      // Enviar una respuesta de éxito al cliente
      res.send("La contraseña se modificó correctamente");
    } catch (error) {
      // Capturar cualquier error y devolver una respuesta de error
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  //Devuelve informacion del usuario
  static user = async (req: Request, res: Response) => {
    return res.json(req.user);
  };

  //Actualizar perfil (email y nombre)
  static updateProfile = async (req: Request, res: Response) => {
    // Extrae el nombre y el email del cuerpo de la solicitud
    const { name, email } = req.body;

    try {
      // Verifica si ya existe un usuario con el mismo email
      const userExists = await User.findOne({ email });

      // Si existe un usuario con el mismo email y no es el usuario actual
      if (userExists && userExists.id.toString() !== req.user.id.toString()) {
        // Si el email ya está registrado por otro usuario, devuelve un error
        const error = new Error("Ese email ya esta registrado");
        return res.status(409).json({ error: error.message });
      }

      // Actualiza el nombre y el email del usuario autenticado
      req.user.name = name;
      req.user.email = email;

      // Guarda los cambios en la base de datos
      await req.user.save();

      // Envía una respuesta de éxito
      res.send("Perfil actualizado correctamente");
    } catch (error) {
      // Maneja errores y envía una respuesta de error
      res.status(500).send("Hubo un error");
    }
  };

  //Cambiar password
  static updateCurrentUserPassword = async (req: Request, res: Response) => {
    // Extrae las contraseñas actual y nueva del cuerpo de la solicitud
    const { current_password, password } = req.body;

    try {
      // Encuentra al usuario actual en la base de datos con el id
      const user = await User.findById(req.user.id);

      // Verifica si la contraseña actual proporcionada es correcta
      const isPasswordCorrect = await checkPassword(
        current_password,
        user.password
      );

      // Si la contraseña actual no es correcta devuelve un error de autorización
      if (!isPasswordCorrect) {
        const error = new Error("El Password actual es incorrecto");
        return res.status(401).json({ error: error.message });
      }

      // Si la contraseña actual es correcta, actualiza la contraseña del usuario
      user.password = await hashPassword(password);
      await user.save();

      // Envía una respuesta de éxito
      res.send("El password se modifico correctamente");
    } catch (error) {
      // Mensaje de error
      res.status(500).send("Hubo un error");
    }
  };

    //Verificar contraseña
  static checkPassword = async (req: Request, res: Response) => {
    // Extrae la contraseña
    const { password } = req.body;

    try {
      // Encuentra al usuario actual en la base de datos usando el id
      const user = await User.findById(req.user.id);

      // Verifica si la contraseña proporcionada coincide con la contraseña almacenada en la base de datos
      const isPasswordCorrect = await checkPassword(password, user.password);

      // Si la contraseña proporcionada es incorrecta, devuelve un error de autorización
      if (!isPasswordCorrect) {
        const error = new Error("El Password es incorrecto");
        return res.status(401).json({ error: error.message });
      }

      // Si la contraseña es correcta, envía una respuesta de éxito
      res.send("Password correcto");
    } catch (error) {
      // Maneja cualquier error que ocurra durante el proceso
      res.status(500).json({ error: "Hubo un error" });
    }
  };
}
