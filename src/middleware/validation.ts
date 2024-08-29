import type { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const handleInputErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Verifica los resultados de la validación en la solicitud (req)

  let errors = validationResult(req);

  // Si hay errores de validación, responde con un estado 400 y una lista de errores

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Si no hay errores, pasa al siguiente middleware o ruta
  next();
};
