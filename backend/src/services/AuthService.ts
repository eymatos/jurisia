import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { Usuario } from '../entities/Usuario';
import * as dotenv from 'dotenv';

dotenv.config();

export class AuthService {
    private usuarioRepository = AppDataSource.getRepository(Usuario);
    
    // CORRECCIÓN: Sincronizamos la clave con la del authMiddleware
    private readonly JWT_SECRET = process.env.JWT_SECRET || 'juris_secret_2026';

    /**
     * Registra un nuevo usuario encriptando su contraseña
     */
    async registrar(datos: Partial<Usuario>) {
        if (!datos.password) throw new Error("La contraseña es obligatoria");

        const passwordHasheado = await bcrypt.hash(datos.password, 10);
        
        const nuevoUsuario = this.usuarioRepository.create({
            ...datos,
            password: passwordHasheado
        });

        const usuarioGuardado = await this.usuarioRepository.save(nuevoUsuario);
        
        // Creamos una copia de los datos para la respuesta sin el campo password
        const { password: _, ...usuarioSinPassword } = usuarioGuardado;
        return usuarioSinPassword;
    }

    /**
     * Valida credenciales y genera un token de acceso
     */
    async login(email: string, pass: string) {
        const usuario = await this.usuarioRepository.findOneBy({ email });

        if (!usuario || !usuario.activo) {
            throw new Error("Credenciales inválidas o usuario inactivo");
        }

        const passwordValido = await bcrypt.compare(pass, usuario.password);
        if (!passwordValido) {
            throw new Error("Credenciales inválidas");
        }

        // Generamos el Token con el nombre_completo para el Dashboard
        const token = jwt.sign(
            { 
                id: usuario.id, 
                email: usuario.email, 
                rol: usuario.rol,
                nombre: usuario.nombre_completo // Añadido para el saludo dinámico
            },
            this.JWT_SECRET,
            { expiresIn: '8h' }
        );

        // Actualizamos la fecha de última conexión (Auditoría básica de la Fase 10)
        usuario.ultima_conexion = new Date();
        await this.usuarioRepository.save(usuario);

        // Devolvemos datos del usuario omitiendo explícitamente el password
        const { password: _, ...datosUsuario } = usuario;
        return { usuario: datosUsuario, token };
    }
}