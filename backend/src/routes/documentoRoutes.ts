import { Router } from "express";
import { DocumentoController } from "../controllers/DocumentoController";
import { upload } from "../config/multer";

const router = Router();
const documentoController = new DocumentoController();

// Ruta para subir un documento: POST http://localhost:3000/api/documentos/subir
router.post("/subir", upload.single("archivo"), documentoController.subir);

// Ruta para listar documentos de un caso específico: GET http://localhost:3000/api/documentos/caso/1
router.get("/caso/:casoId", documentoController.listarPorCaso);

// Fase 2: Búsqueda tradicional (Palabras exactas)
// Ejemplo: GET http://localhost:3000/api/documentos/buscar/1?q=Lara
router.get("/buscar/:casoId", documentoController.buscar);

// FASE 3: Búsqueda Semántica con IA (Conceptos y Contexto)
// Ejemplo: GET http://localhost:3000/api/documentos/IA/buscar/1?q=problemas con el pago
router.get("/IA/buscar/:casoId", documentoController.buscarSemantico);

export default router;