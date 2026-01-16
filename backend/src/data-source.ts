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
            // Ajustes vitales para Supabase Pooler (puerto 6543)
            prepareThreshold: 0,
            max: 10, // Límite de conexiones para no saturar el pooler
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        }
    } : {
        // Configuración para Desarrollo Local
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        username: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "admin",
        database: process.env.DB_NAME || "jurisia_db",
    }),

    // Mantenemos synchronize en true solo si estamos seguros de haber limpiado la DB con el SQL anterior
    synchronize: true, 
    logging: process.env.NODE_ENV === 'development', // Solo loguear en local para no ensuciar los logs de Render
    entities: [Cliente, Caso, Documento, Alerta, Usuario],
    migrations: [],
    subscribers: [],
});