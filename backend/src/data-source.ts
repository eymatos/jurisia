import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from 'dotenv';
import { Cliente } from "./entities/Cliente";
import { Caso } from "./entities/Caso";
import { Documento } from "./entities/Documento";
import { Alerta } from "./entities/Alerta"; 
import { Usuario } from "./entities/Usuario"; 

dotenv.config();

// Determinamos si estamos en la nube revisando si DATABASE_URL existe
const dbUrl = process.env.DATABASE_URL;

export const AppDataSource = new DataSource({
    type: "postgres",
    
    // Si hay URL de base de datos (Producción), TypeORM ignora host/port/user/pass
    ...(dbUrl ? {
        url: dbUrl,
        extra: {
            ssl: {
                rejectUnauthorized: false
            }
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