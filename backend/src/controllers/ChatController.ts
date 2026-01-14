import { Request, Response } from "express";
import { ChatService } from "../services/ChatService";

const chatService = new ChatService();

export class ChatController {
    
    /**
     * Endpoint para realizar consultas inteligentes sobre un caso específico.
     * POST http://localhost:3000/api/chat/preguntar
     */
    async preguntar(req: Request, res: Response) {
        try {
            const { casoId, pregunta } = req.body;

            if (!casoId || !pregunta) {
                return res.status(400).json({ 
                    message: "Faltan datos obligatorios: casoId y pregunta." 
                });
            }

            console.log(`[ChatController] Nueva pregunta para Caso ID: ${casoId}`);
            
            const respuesta = await chatService.responderPreguntaSobreCaso(Number(casoId), pregunta);

            res.json({
                pregunta,
                respuesta
            });
        } catch (error: any) {
            console.error("[ChatController Error]:", error.message);
            res.status(500).json({ 
                message: "Hubo un error al procesar tu consulta legal con la IA." 
            });
        }
    }

    /**
     * NUEVO: Endpoint para consultas jurídicas generales (Chat Global).
     * POST http://localhost:3000/api/chat/legal-global
     */
    async consultaGlobal(req: Request, res: Response) {
        try {
            const { pregunta } = req.body;

            if (!pregunta) {
                return res.status(400).json({ message: "La pregunta es obligatoria." });
            }

            console.log(`[ChatController] Iniciando consulta legal global...`);
            
            const respuesta = await chatService.responderConsultaGeneral(pregunta);

            res.json({
                pregunta,
                respuesta
            });
        } catch (error: any) {
            console.error("[ChatController Global Error]:", error.message);
            res.status(500).json({ 
                message: "No se pudo obtener una respuesta del consultor global." 
            });
        }
    }
}