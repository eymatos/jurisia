import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { Caso } from "./Caso";

@Entity("documentos")
export class Documento {
    @PrimaryGeneratedColumn()
    id!: number;

    // Ampliado a 255 para soportar nombres de archivos legales muy descriptivos
    @Column({ type: "varchar", length: 255 })
    nombre_archivo!: string;

    // Mantenemos 500 para URLs largas de Supabase Storage
    @Column({ type: "varchar", length: 500 })
    ruta_url!: string;

    // REPARACIÓN CRUCIAL: Ampliado de 50 a 100 para evitar el error "value too long"
    // Algunos mimetypes de Office o archivos temporales pueden ser extensos.
    @Column({ type: "varchar", length: 100 })
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