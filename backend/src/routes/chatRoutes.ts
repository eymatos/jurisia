import { Router } from "express";
import { ChatController } from "../controllers/ChatController";

const router = Router();
const chatController = new ChatController();

// Ruta para chat contextual (RAG - basado en documentos de un caso)
router.post("/preguntar", chatController.preguntar);

// NUEVA RUTA: Chat Legal Global (Consultas jurídicas generales)
// POST http://localhost:3000/api/chat/legal-global
router.post("/legal-global", chatController.consultaGlobal);

export default router;