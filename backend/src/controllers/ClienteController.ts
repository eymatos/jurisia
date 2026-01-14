import { Request, Response } from "express";
import { ClienteService } from "../services/ClienteService";

const clienteService = new ClienteService();

export class ClienteController {
    
    // POST http://localhost:3000/api/clientes
    async crear(req: Request, res: Response) {
        try {
            const cliente = await clienteService.crearCliente(req.body);
            res.status(201).json(cliente);
        } catch (error: any) {
            res.status(400).json({ 
                message: error.message || "Error al crear el cliente" 
            });
        }
    }

    // GET http://localhost:3000/api/clientes
    async listar(req: Request, res: Response) {
        try {
            const clientes = await clienteService.obtenerClientes();
            res.json(clientes);
        } catch (error: any) {
            res.status(500).json({ 
                message: "Error al obtener clientes", 
                error: error.message 
            });
        }
    }

    // GET http://localhost:3000/api/clientes/:id
    async obtenerUno(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const cliente = await clienteService.obtenerPorId(id);
            if (!cliente) return res.status(404).json({ message: "Cliente no encontrado" });
            res.json(cliente);
        } catch (error: any) {
            res.status(500).json({ message: "Error al obtener el cliente" });
        }
    }
}