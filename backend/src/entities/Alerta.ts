import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { Caso } from "./Caso";
import { Documento } from "./Documento";

export enum AlertaPrioridad {
    BAJA = "baja",
    MEDIA = "media",
    ALTA = "alta",
    CRITICA = "critica"
}

@Entity()
export class Alerta {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    titulo!: string; // Ej: "Plazo para contestar demanda"

    @Column({ type: "text", nullable: true })
    descripcion?: string;

    @Column({ type: "timestamp" })
    fechaVencimiento!: Date;

    @Column({
        type: "enum",
        enum: AlertaPrioridad,
        default: AlertaPrioridad.MEDIA
    })
    prioridad!: AlertaPrioridad;

    @Column({ default: false })
    completada!: boolean;

    @Column({ default: false })
    notificada!: boolean; 

    @CreateDateColumn()
    fechaCreacion!: Date;

    // Relación con el Caso (Obligatorio)
    // Usamos el operador ! porque TypeORM se encarga de la asignación
    @ManyToOne(() => Caso, (caso) => (caso as any).alertas, { onDelete: "CASCADE" })
    caso!: Caso;

    // Relación con el Documento (Opcional: el origen de la alerta)
    @ManyToOne(() => Documento, { nullable: true, onDelete: "SET NULL" })
    documentoOrigen?: Documento;
}