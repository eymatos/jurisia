import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from 'dotenv';
import { Cliente } from "./entities/Cliente";
import { Caso } from "./entities/Caso";
import { Documento } from "./entities/Documento";
import { Alerta } from "./entities/Alerta"; 
import { Usuario } from "./entities/Usuario"; 

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    // Priorizamos la URL de conexión completa (ideal para Supabase/Render)
    url: process.env.DATABASE_URL,
    // Si la URL no existe, usamos los parámetros individuales por defecto
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true, 
    logging: false,
    entities: [Cliente, Caso, Documento, Alerta, Usuario],
    migrations: [],
    subscribers: [],
    // CONFIGURACIÓN OBLIGATORIA PARA LA NUBE
    extra: {
        ssl: {
            rejectUnauthorized: false
        }
    }
});