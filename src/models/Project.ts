import mongoose, { Schema, Document, PopulatedDoc, Types } from "mongoose";
import Task, { ITask, TaskSchema } from "./Task"; // Asegúrate de importar TaskSchema también
import { IUser } from "./User";

// Define la interfaz IProject para el documento del proyecto en MongoDB
export interface IProject extends Document {
  projectName: string;
  clientName: string;
  description: string;
  tasks: PopulatedDoc<ITask & Document>[];
  manager: PopulatedDoc<IUser & Document>;
  team: PopulatedDoc<IUser & Document>[];
}

// Define el esquema del proyecto
export const ProjectSchema: Schema = new Schema(
  {
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    tasks: [
      {
        type: Types.ObjectId,
        ref: "Task",
      },
    ],
    manager: {
      type: Types.ObjectId,
      ref: "User",
    },
    team: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

//Middleware
ProjectSchema.pre("deleteOne", { document: true }, async function () {
  //Obtiene el id del proyecto a eliminar
  const projectId = this._id;

  if (!projectId) return;
  // Encuentra todas las tareas asociadas con el proyecto
  const tasks = await Task.find({ project: projectId });

  // Elimina todas las tareas asociadas con el proyecto
  await Task.deleteMany({ project: projectId });
});

// Crea el modelo del proyecto usando el esquema definido
const Project = mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
