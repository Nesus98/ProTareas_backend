import type { Request, Response, NextFunction } from "express";
import Project, { IProject } from "../models/Project";

// Extiende el tipo Request de Express para incluir una propiedad 'project'
declare global {
  namespace Express {
    interface Request {
      project: IProject;
    }
  }
}

// Middleware para verificar si un proyecto existe en la base de datos
export async function projectExist(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Extrae el ID del proyecto de los parámetros de la solicitud
    const { projectId } = req.params;

    // Busca el proyecto en la base de datos usando el ID proporcionado
    const project = await Project.findById(projectId);

    // Si no se encuentra el proyecto, responde con un error 404 (no encontrado)
    if (!project) {
      const error = new Error("Proyecto no encontrado");
      return res.status(404).json({ error: error.message });
    }

    // Si el proyecto se encuentra, lo asigna al objeto de solicitud para su uso en otros middleware o rutas
    req.project = project;

    //continuar con la siguiente función en la cadena de middleware
    next();
  } catch (error) {
    // Si ocurre un error durante la búsqueda del proyecto, responde con un error 500 (error interno del servidor)
    res.status(500).json({ error: "Hubo un error" });
  }
}
