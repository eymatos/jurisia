import { Router } from "express";
import { DashboardController } from "../controllers/DashboardController";

const router = Router();
const dashboardController = new DashboardController();

// Ruta: GET http://localhost:3000/api/dashboard/stats
// Esta ruta devolverá los KPIs, el gráfico de estatus, casos recientes y plazos próximos.
router.get("/stats", (req, res) => dashboardController.obtenerEstadisticas(req, res));

export default router;