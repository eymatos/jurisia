import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Caso } from "./Caso";

@Entity("clientes")
export class Cliente {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 150 })
    nombre!: string;

    @Column({ type: "varchar", length: 50, unique: true })
    documento_identidad!: string; // Cédula o RNC

    @Column({ type: "enum", enum: ["Fisica", "Juridica"], default: "Fisica" })
    tipo_persona!: string;

    @Column({ type: "varchar", length: 100, nullable: true })
    email?: string;

    @Column({ type: "varchar", length: 20, nullable: true })
    telefono?: string;

    @Column({ type: "text", nullable: true })
    direccion?: string;

    // RELACIÓN: Un cliente puede tener múltiples casos (expedientes)
    @OneToMany(() => Caso, (caso) => caso.cliente)
    casos!: Caso[];

    @CreateDateColumn()
    fecha_registro!: Date;

    @UpdateDateColumn()
    ultima_actualizacion!: Date;
}