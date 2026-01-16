import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from 'dotenv';
import { Cliente } from "./entities/Cliente";
import { Caso } from "./entities/Caso";
import { Documento } from "./entities/Documento";
import { Alerta } from "./entities/Alerta"; 
import { Usuario } from "./entities/Usuario"; 

dotenv.config();

// Verificamos si estamos en producción (Render) o local
const isCloud = process.env.DATABASE_URL ? true : false;

export const AppDataSource = new DataSource({
    type: "postgres",
    
    // Si existe DATABASE_URL (Nube), la usamos. 
    // Si no, usamos los parámetros de localhost.
    ...(isCloud ? {
        url: process.env.DATABASE_URL,
    } : {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        username: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "admin",
        database: process.env.DB_NAME || "jurisia_db",
    }),

    synchronize: true, 
    logging: false,
    entities: [Cliente, Caso, Documento, Alerta, Usuario],
    migrations: [],
    subscribers: [],
    
    // Solo activamos SSL si estamos conectando a la nube (Supabase)
    extra: isCloud ? {
        ssl: {
            rejectUnauthorized: false
        }
    } : {}
});