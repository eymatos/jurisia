import { Router } from "express";
import { CasoController } from "../controllers/CasoController";

const router = Router();
const casoController = new CasoController();

// Ruta: POST http://localhost:3000/api/casos
router.post("/", casoController.crear);

// Ruta: GET http://localhost:3000/api/casos
router.get("/", casoController.listar);

// Nueva ruta para obtener un expediente específico por su ID
// Ruta: GET http://localhost:3000/api/casos/:id
router.get("/:id", casoController.obtenerPorId);
router.get("/:id/reporte", (req, res) => casoController.descargarReporte(req, res));

export default router;