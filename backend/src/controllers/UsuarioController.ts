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
            
            // Log de depuración para ver qué recibe el servidor en Render
            console.log(`[Login Attempt]: Intentando conectar con email: ${email}`);

            if (!email || !password) {
                return res.status(400).json({ message: "Email y contraseña requeridos" });
            }

            const resultado = await authService.login(email, password);
            
            console.log(`[Login Success]: Usuario ${email} autenticado correctamente.`);
            res.json(resultado);
        } catch (error: any) {
            // Log del error real para diagnosticar en los logs de Render
            console.error(`[Login Error] para ${req.body.email}:`, error.message);
            res.status(401).json({ message: error.message });
        }
    }
}