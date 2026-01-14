import { Request, Response } from "express";
import { CasoService } from "../services/CasoService";
import { ReporteService } from "../services/ReporteService"; // Importamos el nuevo servicio

const casoService = new CasoService();
const reporteService = new ReporteService();

export class CasoController {
    
    async crear(req: Request, res: Response) {
        try {
            const nuevoCaso = await casoService.crearCaso(req.body);
            res.status(201).json(nuevoCaso);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async listar(req: Request, res: Response) {
        try {
            const casos = await casoService.obtenerTodos();
            res.json(casos);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener los casos" });
        }
    }

    async obtenerPorId(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const caso = await casoService.obtenerCasoPorId(Number(id));
            
            if (!caso) {
                return res.status(404).json({ message: "Expediente no encontrado" });
            }
            
            res.json(caso);
        } catch (error) {
            console.error("Error en CasoController.obtenerPorId:", error);
            res.status(500).json({ message: "Error al obtener el expediente" });
        }
    }

    /**
     * Nuevo método para descargar el reporte PDF
     * GET /api/casos/:id/reporte
     */
    async descargarReporte(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const caso = await casoService.obtenerCasoPorId(Number(id));

            if (!caso) {
                return res.status(404).json({ message: "Expediente no encontrado" });
            }

            const pdfBuffer = await reporteService.generarInformeCaso(caso);

            // Configuramos las cabeceras para que el navegador entienda que es un PDF
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Informe_JurisIA_Caso_${id}.pdf`);
            
            res.send(pdfBuffer);
        } catch (error) {
            console.error("Error generando PDF:", error);
            res.status(500).json({ message: "Error al generar el reporte PDF" });
        }
    }
}