import mongoose, { Schema, Document } from "mongoose";

// Define la interfaz IUser para el documento del usuario en MongoDB
export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  confirmed: boolean;
}

// Define el esquema del usuario
const userSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
});

// Crea el modelo del usuario usando el esquema definido
const User = mongoose.model<IUser>('User', userSchema)

export default User
