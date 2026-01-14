import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export enum UsuarioRol {
    ADMIN = "admin",
    ABOGADO = "abogado",
    ASISTENTE = "asistente"
}

@Entity("usuarios")
export class Usuario {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 150 })
    nombre_completo!: string;

    @Column({ type: "varchar", length: 100, unique: true })
    email!: string;

    @Column({ type: "varchar", length: 255 })
    password!: string; // Aquí guardaremos la clave encriptada

    @Column({
        type: "enum",
        enum: UsuarioRol,
        default: UsuarioRol.ABOGADO
    })
    rol!: UsuarioRol;

    @Column({ default: true })
    activo!: boolean;

    @CreateDateColumn()
    fecha_creacion!: Date;

    @UpdateDateColumn()
    ultima_conexion!: Date;
}