import { Router } from "express";
import { AlertaController } from "../controllers/AlertaController";

const router = Router();
const alertaController = new AlertaController();

// Prefijo base: /api/alertas

// Crear una nueva alerta (plazo procesal)
router.post("/", (req, res) => alertaController.crear(req, res));

// Obtener todas las alertas de un caso específico
router.get("/caso/:casoId", (req, res) => alertaController.listarPorCaso(req, res));

// Obtener alertas urgentes (dashboard)
router.get("/urgentes", (req, res) => alertaController.obtenerUrgentes(req, res));

// Marcar una alerta como completada
router.patch("/:id/completar", (req, res) => alertaController.completar(req, res));

// Eliminar una alerta
router.delete("/:id", (req, res) => alertaController.eliminar(req, res));

// RUTA DE DIAGNÓSTICO: Obtener absolutamente todas las alertas para verificar inconsistencias
// Acceso: GET http://localhost:3000/api/alertas/debug/ver-todo
router.get("/debug/ver-todo", (req, res) => alertaController.debugAlertas(req, res));

export default router;