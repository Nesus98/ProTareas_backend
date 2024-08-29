import type { Request, Response, NextFunction } from "express";
import Task, { ITask } from "../models/Task";

// Extiende el tipo Request de Express para incluir una propiedad 'task'
declare global {
  namespace Express {
    interface Request {
      task: ITask;
    }
  }
}

// Middleware para verificar si una tarea existe en la base de datos
export async function taskExist(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Extrae el ID de la tarea de los parámetros de la solicitud
    const { taskId } = req.params;

    // Busca la tarea en la base de datos usando el id proporcionado
    const task = await Task.findById(taskId);

    // Si la tarea no se encuentra, responde con un error 404 (no encontrado)
    if (!task) {
      const error = new Error("Tarea no encontrada");
      return res.status(404).json({ error: error.message });
    }

    // Si la tarea se encuentra, la asigna al objeto de solicitud para su uso en otros middleware o rutas
    req.task = task;

    // Lcontinuar con la siguiente función en la cadena de middleware
    next();
  } catch (error) {
    // Si ocurre un error durante la búsqueda de la tarea, responde con un error 500 (error interno del servidor)
    res.status(500).json({ error: "Hubo un error" });
  }
}

// Middleware para verificar si la tarea pertenece al proyecto actual
export function taskBelongsToProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Verifica si el ID del proyecto asociado a la tarea coincide con el id del proyecto actual
  if (req.task.project.toString() !== req.project.id.toString()) {
    // Si la tarea no pertenece al proyecto actual, responde con un error 400 (solicitud incorrecta)
    const error = new Error("Accion no valida");
    return res.status(400).json({ error: error.message });
  }

  // Llama a 'next()' para continuar con la siguiente función en la cadena de middleware
  next();
}

// Middleware para verificar si el usuario tiene autorización para realizar la acción en el proyecto
export function hasAuthorization(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Verifica si el id del usuario que realiza la solicitud coincide con el id del manager del proyecto
  if (req.user.id.toString() !== req.project.manager.toString()) {
    // Si el usuario no tiene autorización, responde con un error 400 (solicitud incorrecta)
    const error = new Error("Accion no valida");
    return res.status(400).json({ error: error.message });
  }

  //continuar con la siguiente función en la cadena de middleware
  next();
}
