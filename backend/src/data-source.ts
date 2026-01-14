import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from 'dotenv';
import { Cliente } from "./entities/Cliente";
import { Caso } from "./entities/Caso";
import { Documento } from "./entities/Documento";
import { Alerta } from "./entities/Alerta"; // Importación de la nueva entidad
import { Usuario } from "./entities/Usuario"; // Importación necesaria para Fase 5

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true, 
    logging: false,
    entities: [Cliente, Caso, Documento, Alerta, Usuario], // Agregamos Usuario a la lista para resolver error de metadatos
    migrations: [],
    subscribers: [],
});