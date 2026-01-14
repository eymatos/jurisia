import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { Caso } from "./Caso";

@Entity("documentos")
export class Documento {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 255 })
    nombre_archivo!: string;

    @Column({ type: "varchar", length: 500 })
    ruta_url!: string;

    @Column({ type: "varchar", length: 50 })
    tipo_mimetype!: string;

    @Column({ type: "text", nullable: true })
    contenido_texto?: string;

    @Column({ type: "text", nullable: true })
    resumen_ia?: string;

    // Columna necesaria para vincular con Pinecone
    @Column({ type: "varchar", length: 255, nullable: true })
    pinecone_id?: string;

    @CreateDateColumn()
    fecha_subida!: Date;

    @ManyToOne(() => Caso, (caso) => caso.documentos, { onDelete: 'CASCADE' })
    caso!: Caso;
}