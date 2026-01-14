import { Router } from "express";
import { ClienteController } from "../controllers/ClienteController";

const router = Router();
const clienteController = new ClienteController();

// Ruta para crear un cliente: POST http://localhost:3000/api/clientes
router.post("/", (req, res) => clienteController.crear(req, res));

// Ruta para obtener todos los clientes: GET http://localhost:3000/api/clientes
router.get("/", (req, res) => clienteController.listar(req, res));

// NUEVA RUTA: Obtener un cliente por ID (Detalles y Casos)
// GET http://localhost:3000/api/clientes/:id
router.get("/:id", (req, res) => clienteController.obtenerUno(req, res));

export default router;