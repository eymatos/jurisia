import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from 'dotenv';
import { Cliente } from "./entities/Cliente";
import { Caso } from "./entities/Caso";
import { Documento } from "./entities/Documento";
import { Alerta } from "./entities/Alerta"; 
import { Usuario } from "./entities/Usuario"; 

dotenv.config();

const dbUrl = process.env.DATABASE_URL;

export const AppDataSource = new DataSource({
    type: "postgres",
    
    // Configuración para Producción (Render + Supabase Pooler)
    ...(dbUrl ? {
        url: dbUrl,
        ssl: {
            rejectUnauthorized: false
        },
        extra: {
            // Necesario para que el Pooler de Supabase no cierre la conexión
            prepareThreshold: 0 
        }
    } : {
        // Configuración para Desarrollo Local
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        username: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "admin",
        database: process.env.DB_NAME || "jurisia_db",
    }),

    synchronize: true, // Esto creará las tablas en Supabase automáticamente
    logging: false,
    entities: [Cliente, Caso, Documento, Alerta, Usuario],
    migrations: [],
    subscribers: [],
});