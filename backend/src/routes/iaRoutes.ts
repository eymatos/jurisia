import { Router } from "express";
import { IAController } from "../controllers/IAController";

const router = Router();
const iaController = new IAController();

// Ruta: POST http://localhost:3000/api/ia/preguntar
// Ahora apunta correctamente al método 'preguntar' del IAController
router.post("/preguntar", iaController.preguntar);
router.post("/generar-escrito", (req, res) => iaController.generarEscrito(req, res));
router.post("/consultar-global", (req, res) => iaController.consultarGlobal(req, res));

export default router;