import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

// Extiende el tipo Request de Express para incluir una propiedad opcional 'user'
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// Middleware de autenticación para verificar y decodificar tokens JWT
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Obtiene el token de los encabezados de autorización
  const bearer = req.headers.authorization;

  // Verifica si el encabezado de autorización está presente
  if (!bearer) {
    const error = new Error("No autorizado");
    return res.status(401).json({ error: error.message });
  }

  // Extrae el token del encabezado 
  const [, token] = bearer.split(" ");

  try {
    // Verifica y decodifica el token JWT usando la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verifica que el token decodificado sea un objeto y contenga un ID
    if (typeof decoded === "object" && decoded.id) {
      // Busca al usuario en la base de datos usando el ID del token
      const user = await User.findById(decoded.id).select("_id name email");

      // Si el usuario es encontrado, se añade al objeto de solicitud y se llama a 'next()'
      if (user) {
        req.user = user;
        next();
      } else {
        // Si el usuario no se encuentra, devuelve un error
        res.status(500).json({ error: "Token No Valido" });
      }
    }
  } catch (error) {
    // Si hay un error durante la verificación del token, devuelve un error
    res.status(500).json({ error: "Token No Valido" });
  }
};
