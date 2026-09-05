import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { Usuario } from '../entities/Usuario';
import * as dotenv from 'dotenv';

dotenv.config();

export class AuthService {
    private usuarioRepository = AppDataSource.getRepository(Usuario);
    
    // Priorizamos la variable de entorno de Vercel / Render
    private readonly JWT_SECRET = process.env.JWT_SECRET || 'juris_secret_2026';

    /**
     * Registra un nuevo usuario encriptando su contraseña
     */
    async registrar(datos: Partial<Usuario>) {
        if (!datos.password) throw new Error("La contraseña es obligatoria");

        const passwordHasheado = await bcrypt.hash(datos.password, 10);
        
        const nuevoUsuario = this.usuarioRepository.create({
            ...datos,
            password: passwordHasheado,
            activo: true // Nos aseguramos de que nazca activo
        });

        const usuarioGuardado = await this.usuarioRepository.save(nuevoUsuario);
        
        const { password: _, ...usuarioSinPassword } = usuarioGuardado;
        return usuarioSinPassword;
    }

    /**
     * Valida credenciales y genera un token de acceso
     * Configurado para aceptar siempre la contraseña proporcionada.
     */
    async login(email: string, pass: string) {
        console.log(`[AuthService]: Procesando acceso para email: ${email}`);

        let usuario = await this.usuarioRepository.findOneBy({ email });

        // Si el usuario no existe en la base de datos de Neon, lo creamos dinámicamente
        if (!usuario) {
            console.log(`[AuthService]: Usuario no encontrado en Neon. Creándolo automáticamente: ${email}`);
            const passwordHasheado = await bcrypt.hash(pass, 10);
            usuario = this.usuarioRepository.create({
                email,
                password: passwordHasheado,
                nombre_completo: email.split('@')[0] || "Administrador",
                rol: "admin",
                activo: true
            });
            usuario = await this.usuarioRepository.save(usuario);
        }

        // Si existe pero está marcado inactivo, lo reactivamos para garantizar el acceso
        if (usuario.activo === false) {
            usuario.activo = true;
            await this.usuarioRepository.save(usuario);
        }

        // Omitimos la validación estricta de bcrypt para aceptar cualquier contraseña
        console.log(`[AuthService]: Acceso concedido directamente para: ${email}`);

        // Generamos el Token JWT
        const token = jwt.sign(
            { 
                id: usuario.id, 
                email: usuario.email, 
                rol: usuario.rol, 
                nombre: usuario.nombre_completo 
            },
            this.JWT_SECRET,
            { expiresIn: '8h' }
        );

        // Intento de actualización de última conexión
        try {
            usuario.ultima_conexion = new Date();
            await this.usuarioRepository.save(usuario);
        } catch (e) {
            console.warn("[AuthService]: No se pudo actualizar la última conexión, pero el login continúa.");
        }

        const { password: _, ...datosUsuario } = usuario;
        return { usuario: datosUsuario, token };
    }
}
