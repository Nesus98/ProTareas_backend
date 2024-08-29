import { Request, Response } from "express";
import User from "../models/User";
import Project from "../models/Project";

export class TeamMemberController {
  //Buscar miembro de equipo por su email
  static findMemberByEmail = async (req: Request, res: Response) => {
    const { email } = req.body;

    //Busca al usuario
    const user = await User.findOne({ email }).select("id email name");
    if (!user) {
      const error = new Error("Usuario no encontrado");
      return res.status(404).json({ error: error.message });
    }

    res.json(user);
  };

  //Buscar equipo del proyecto
  static getProjectTeam = async (req: Request, res: Response) => {
    const project = await Project.findById(req.project.id).populate({
      path: "team",
      select: "id email name",
    });

    res.json(project.team);
  };

  //Agregar miembro al equipo con su id
  static addMemberById = async (req: Request, res: Response) => {
    // Extrae el ID del usuario a agregar
    const { id } = req.body;

    try {
      // Busca al usuario en la base de datos por su id
      const user = await User.findById(id).select("id");

      // Si el usuario no se encuentra, responde con un error 404
      if (!user) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({ error: error.message });
      }

      // Verifica si el usuario ya está en el equipo del proyecto
      if (
        req.project.team.some((team) => team.toString() === user.id.toString())
      ) {
        const error = new Error("El usuario ya esta agregado");
        return res.status(409).json({ error: error.message });
      }

      // Agrega el id del usuario al equipo del proyecto
      req.project.team.push(user.id);

      // Guarda los cambios en el proyecto en la base de datos
      await req.project.save();

      // Envía una respuesta exitosa indicando que el usuario fue agregado correctamente
      res.send("Usuario agregado correctamente");
    } catch (error) {
      // En caso de error, responde con un mensaje de error 500
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  //Elimina miembro del equipo
  static removeMemberById = async (req: Request, res: Response) => {
    // Extrae el ID del usuario a eliminar
    const { userId } = req.params;

    try {
      // Verifica si el usuario está en el equipo del proyecto
      if (!req.project.team.some((team) => team.toString() === userId)) {
        const error = new Error("El usuario no existe en el proyecto");
        return res.status(409).json({ error: error.message });
      }

      // Filtra el equipo del proyecto para eliminar al usuario especificado
      req.project.team = req.project.team.filter(
        (teamMember) => teamMember.toString() !== userId
      );

      // Guarda los cambios en el proyecto en la base de datos
      await req.project.save();

      // Envía una respuesta exitosa indicando que el usuario fue eliminado correctamente
      res.send("Usuario eliminado correctamente");
    } catch (error) {
      // En caso de error, responde con un mensaje de error 500
      res.status(500).json({ error: "Hubo un error" });
    }
  };
}
