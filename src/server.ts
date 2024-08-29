import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './config/db'
import projectRoutes from './routes/projectRoutes'
import { corsConfig } from './config/cors'
import authRoutes from './routes/authRoutes'
import cors from 'cors'
import morgan from 'morgan'


// Carga las variables de entorno desde un archivo .env a process.env
dotenv.config()

// Conecta a la base de datos usando la función connectDB definida en ./config/db
connectDB()

// Crea una instancia de una aplicación Express
const app = express()

app.use(cors(corsConfig))


///Logging
app.use(morgan('dev'))

//Leer valores json en el body
app.use(express.json())

//Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)

// Exporta la instancia de la aplicación para poder usarla en otros archivos
export default app