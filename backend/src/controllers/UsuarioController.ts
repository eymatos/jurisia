import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";

const authService = new AuthService();

export class UsuarioController {
    
    /**
     * POST /api/usuarios/registrar
     */
    async registrar(req: Request, res: Response) {
        try {
            const usuario = await authService.registrar(req.body);
            res.status(201).json(usuario);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * POST /api/usuarios/login
     */
    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: "Email y contraseña requeridos" });
            }

            const resultado = await authService.login(email, password);
            res.json(resultado);
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }
}