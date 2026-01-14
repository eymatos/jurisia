import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { Cliente } from "./Cliente";
import { Alerta } from "./Alerta";
import { Documento } from "./Documento";

@Entity("casos")
export class Caso {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 100 })
    titulo!: string;

    @Column({ type: "text", nullable: true })
    descripcion?: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    numero_expediente?: string; 

    @Column({ type: "varchar", length: 100, nullable: true })
    tribunales?: string;

    @Column({ type: "enum", enum: ["Abierto", "Cerrado", "En Espera", "Sentencia"], default: "Abierto" })
    estatus!: string;

    @CreateDateColumn()
    fecha_apertura!: Date;

    @UpdateDateColumn()
    ultima_actualizacion!: Date;

    // Relación corregida: Muchos casos pertenecen a un Cliente
    @ManyToOne(() => Cliente, (cliente) => cliente.casos, { onDelete: 'CASCADE' })
    cliente!: Cliente;

    // Un caso puede tener muchos documentos
    @OneToMany(() => Documento, (documento) => documento.caso)
    documentos?: Documento[];

    // Un caso puede tener muchas alertas
    @OneToMany(() => Alerta, (alerta) => alerta.caso)
    alertas?: Alerta[];
}