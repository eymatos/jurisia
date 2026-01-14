import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Middleware para validar el acceso al sistema.
 * Verifica que el token JWT sea válido antes de permitir el paso a la ruta.
 */
export const verificarAcceso = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    // 1. Verificar si el encabezado existe
    if (!authHeader) {
        return res.status(401).json({ 
            message: "Acceso denegado. No se encontró un token de sesión." 
        });
    }

    // 2. Extraer el token (formato: "Bearer TOKEN_AQUÍ")
    const token = authHeader.split(" ")[1];

    try {
        // 3. Validar el token con la clave secreta de tu .env
        const secret = process.env.JWT_SECRET || "juris_secret_2026";
        const decoded = jwt.verify(token, secret);
        
        // 4. Inyectar los datos del usuario en la petición para uso posterior
        (req as any).usuario = decoded; 
        
        next(); // Continuar al controlador
    } catch (error) {
        return res.status(401).json({ 
            message: "Tu sesión ha expirado o el token es inválido. Por favor, inicia sesión de nuevo." 
        });
    }
};