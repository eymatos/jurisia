import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { Usuario } from '../entities/Usuario';
import * as dotenv from 'dotenv';

dotenv.config();

export class AuthService {
    private usuarioRepository = AppDataSource.getRepository(Usuario);
    
    // Priorizamos la variable de entorno de Render
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
     */
    async login(email: string, pass: string) {
        // Log de diagnóstico para consola de Render
        console.log(`[AuthService]: Buscando usuario con email: ${email}`);

        const usuario = await this.usuarioRepository.findOneBy({ email });

        if (!usuario) {
            console.error(`[AuthService]: Usuario no encontrado: ${email}`);
            throw new Error("Credenciales inválidas");
        }

        // REPARACIÓN: Si 'activo' es null (por el insert manual), lo tratamos como true 
        // para no bloquear el acceso inicial.
        if (usuario.activo === false) {
            console.error(`[AuthService]: Usuario encontrado pero está INACTIVO: ${email}`);
            throw new Error("Usuario inactivo. Contacte al administrador.");
        }

        const passwordValido = await bcrypt.compare(pass, usuario.password);
        if (!passwordValido) {
            console.error(`[AuthService]: Contraseña incorrecta para: ${email}`);
            throw new Error("Credenciales inválidas");
        }

        // Generamos el Token
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