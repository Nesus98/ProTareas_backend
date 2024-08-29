import mongoose from "mongoose";
import colors from "colors";
import { exit } from "node:process";

//Conectar a la Base de datos
export const connectDB = async () => {
  try {
    // Intenta conectar a MongoDB usando la URL de conexión de las variables de entorno
    const { connection } = await mongoose.connect(process.env.DATABASE_URL);
    const url = `${connection.host}:${connection.port}`;
    // Imprime un mensaje en la consola indicando que la conexión fue exitosa
    console.log(colors.magenta.bold(`MongoDB Conectado en : ${url}`));
  } catch (error) {
    // Si ocurre un error, imprime un mensaje de error en la consola y cierra el proceso
    console.log(colors.red.bold("Error al conectar a MongoDB"));
    exit(1);
  }
};
