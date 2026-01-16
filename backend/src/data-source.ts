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
    
    // Configuración para la Nube (Render + Supabase con Pooler)
    ...(dbUrl ? {
        url: dbUrl,
        extra: {
            ssl: {
                rejectUnauthorized: false
            },
            // IMPORTANTE PARA EL POOLER: Evita conflictos de sentencias preparadas
            prepareThreshold: 0 
        }
    } : {
        // Desarrollo Local (Tu PC)
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        username: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "admin",
        database: process.env.DB_NAME || "jurisia_db",
    }),

    synchronize: true, // Crea automáticamente las tablas en Supabase al conectar
    logging: false,
    entities: [Cliente, Caso, Documento, Alerta, Usuario],
    migrations: [],
    subscribers: [],
});