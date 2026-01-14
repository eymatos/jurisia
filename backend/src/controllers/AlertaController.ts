import { Request, Response } from "express";
import { AlertaService } from "../services/AlertaService";

const alertaService = new AlertaService();

export class AlertaController {

    // POST http://localhost:3000/api/alertas
    async crear(req: Request, res: Response) {
        try {
            const nuevaAlerta = await alertaService.crearAlerta(req.body);
            res.status(201).json(nuevaAlerta);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    // GET http://localhost:3000/api/alertas/caso/:casoId
    async listarPorCaso(req: Request, res: Response) {
        try {
            const casoId = Number(req.params.casoId);
            if (isNaN(casoId)) {
                return res.status(400).json({ message: "ID de caso inválido" });
            }
            const alertas = await alertaService.obtenerPorCaso(casoId);
            res.json(alertas);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    // PATCH http://localhost:3000/api/alertas/:id/completar
    async completar(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const alerta = await alertaService.marcarComoCompletada(id);
            res.json(alerta);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    // GET http://localhost:3000/api/alertas/urgentes
    async obtenerUrgentes(req: Request, res: Response) {
        try {
            const horas = req.query.horas ? Number(req.query.horas) : 48;
            const alertas = await alertaService.obtenerAlertasUrgentes(horas);
            res.json(alertas);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    // DELETE http://localhost:3000/api/alertas/:id
    async eliminar(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            await alertaService.eliminarAlerta(id);
            res.status(204).send();
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * MÉTODO DE DIAGNÓSTICO
     * Obtiene todas las alertas sin filtros para verificar por qué no aparecen en la vista del caso.
     */
    async debugAlertas(req: Request, res: Response) {
        try {
            console.log("[DEBUG] Consultando el estado global de alertas...");
            const alertas = await alertaService.obtenerTodasDebug();
            res.json({
                total_en_db: alertas.length,
                alertas: alertas
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}