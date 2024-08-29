import mongoose, { Schema, Document, Types } from "mongoose";

// Define la interfaz IToken para el documento del token en MongoDB
export interface IToken extends Document {
  token: number;
  user: Types.ObjectId;
  createdAt: Date;
}

// Define el esquema del token
const tokenSchema: Schema = new Schema({
  token: {
    type: String,
    required: true,
  },
  user: {
    type: Types.ObjectId,
    ref: "User",
  },
  expiresAt: {
    type: Date,
    default: Date.now(),
    expires: "10min",
  },
});

// Crea el modelo del token usando el esquema definido
const Token = mongoose.model<IToken>("Token", tokenSchema);

export default Token;
