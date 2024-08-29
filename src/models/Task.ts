import mongoose, { Schema, Document, Types } from "mongoose";

const taskStatus = {
  PENDING: "pending",
  ON_HOLD: "onHold",
  IN_PROGRESS: "inProgress",
  UNDER_REVIEW: "underReview",
  COMPLETED: "completed",
} as const;

export type TaskStatus = (typeof taskStatus)[keyof typeof taskStatus];

export interface ITask extends Document {
  name: string;
  description: string;
  project: Types.ObjectId;
  status: TaskStatus;
  completedBy: {
    user: Types.ObjectId;
    status: TaskStatus;
  }[];
}

// Definición del esquema de Mongoose para el modelo Task
export const TaskSchema: Schema = new Schema(
  {
    // Definición de name con sus validaciones
    name: {
      type: String,
      trim: true,
      required: true,
    },
    // Definición de description con sus validaciones
    description: {
      type: String,
      trim: true,
      required: true,
    },
    project: {
      type: Types.ObjectId,
      ref: "Project",
    },
    status: {
      type: String,
      enum: Object.values(taskStatus),
      default: taskStatus.PENDING,
    },
    completedBy: [
      {
        user: {
          type: Types.ObjectId,
          ref: "User",
          default: null,
        },
        status: {
          type: String,
          enum: Object.values(taskStatus),
          default: taskStatus.PENDING,
        },
      },
    ],
  },
  { timestamps: true }
);

// Creación del modelo de Mongoose llamado 'task' basado en el esquema TaskSchema
const Task = mongoose.model<ITask>("Task", TaskSchema);

//Exportar modelo
export default Task;
