import type { Request, Response } from "express";
import Task from "../models/Task";

export class TaskController {
  // Método para crear una nueva tarea
  static createTask = async (req: Request, res: Response) => {
    try {
      // Crear una nueva instancia de Task con los datos del cuerpo de la solicitud
      const task = new Task(req.body);
      // Asignar el ID del proyecto a la tarea
      task.project = req.project.id;
      // Agregar la ID de la tarea al array de tareas del proyecto
      req.project.tasks.push(task.id);
      // Guardar tanto la tarea como el proyecto de manera concurrente
      await Promise.allSettled([task.save(), req.project.save()]);
      // Enviar respuesta de éxito
      res.send("Tarea creada correctamente");
    } catch (error) {
      // Manejar errores y enviar respuesta de error
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  // Método para obtener todas las tareas de un proyecto
  static getProjectTasks = async (req: Request, res: Response) => {
    try {
      // Buscar todas las tareas asociadas al proyecto y popular el campo 'project'
      const tasks = await Task.find({ project: req.project.id }).populate(
        "project"
      );
      // Enviar las tareas como respuesta
      res.json(tasks);
    } catch (error) {
      // Manejar errores y enviar respuesta de error
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  // Método para obtener una tarea por su ID
  static getTaskByID = async (req: Request, res: Response) => {
    try {
      const task = await Task.findById(req.task.id).populate({
        path: "completedBy.user",
        select: "id name email",
      });
      // Enviar la tarea como respuesta
      res.json(task);
    } catch (error) {
      // Manejar errores y enviar respuesta de error
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  // Método para actualizar una tarea
  static updateTask = async (req: Request, res: Response) => {
    try {
      // Actualizar los campos de la tarea con los datos del cuerpo de la solicitud
      req.task.name = req.body.name;
      req.task.description = req.body.description;
      // Guardar los cambios en la tarea
      await req.task.save();

      // Enviar respuesta de éxito
      res.send("Tarea Actualizada Correctamente");
    } catch (error) {
      // Manejar errores y enviar respuesta de error
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  // Método para eliminar una tarea
  static deleteTask = async (req: Request, res: Response) => {
    try {
      // Filtrar la tarea eliminada del array de tareas del proyecto
      req.project.tasks = req.project.tasks.filter(
        (task) => task.toString() !== req.task.id.toString()
      );

      // Eliminar la tarea y guardar el proyecto de manera concurrente
      await Promise.allSettled([req.task.deleteOne(), req.project.save()]);

      // Enviar respuesta de éxito
      res.send("Tarea Eliminada Correctamente");
    } catch (error) {
      // Manejar errores y enviar respuesta de error
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  //Metodo para actualizar una tarea
  static updateStatus = async (req: Request, res: Response) => {
    try {
        // Extrae el nuevo estado de la tarea 
        const { status } = req.body;

        // Actualiza el estado de la tarea con el nuevo valor proporcionado
        req.task.status = status;

        // Crea un objeto con la información del usuario y el nuevo estado
        const data = {
            user: req.user.id, // ID del usuario que actualizó la tarea
            status, // Nuevo estado de la tarea
        };

        // Añade la información del usuario y el nuevo estado al historial de cambios de la tarea
        req.task.completedBy.push(data);

        // Guarda los cambios en la tarea en la base de datos
        await req.task.save();

        // Envía una respuesta exitosa al cliente
        res.send("Tarea Actualizada");
    } catch (error) {
        // En caso de error, envía una respuesta de error al cliente
        res.status(500).json({ error: "Hubo un error" });
    }
};

}
