import { Router } from "express";
import { UsuarioController } from "../controllers/UsuarioController";
import { verificarAcceso } from "../middleware/authMiddleware";

const router = Router();
const usuarioController = new UsuarioController();

// Rutas públicas para gestión de acceso
router.post("/registrar", (req, res) => usuarioController.registrar(req, res));
router.post("/login", (req, res) => usuarioController.login(req, res));

// Ruta para verificar token (útil para el Frontend)
router.get("/me", verificarAcceso, (req, res) => {
    res.json({ usuario: (req as any).usuario });
});

export default router;