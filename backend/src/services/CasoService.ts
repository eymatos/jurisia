import { AppDataSource } from "../data-source";
import { Caso } from "../entities/Caso";
import { Cliente } from "../entities/Cliente";

export class CasoService {
    private casoRepository = AppDataSource.getRepository(Caso);
    private clienteRepository = AppDataSource.getRepository(Cliente);

    async crearCaso(datos: any) {
        // 1. Buscamos si el cliente existe
        const cliente = await this.clienteRepository.findOneBy({ id: datos.clienteId });
        
        if (!cliente) {
            throw new Error("El cliente especificado no existe");
        }

        // 2. Creamos la instancia inicial sin el número de expediente aún
        const nuevoCaso = this.casoRepository.create({
            titulo: datos.titulo,
            tribunales: datos.tribunales,
            descripcion: datos.descripcion,
            cliente: cliente
        });

        // 3. Guardamos para generar el ID autoincremental
        const casoGuardado = await this.casoRepository.save(nuevoCaso);

        // 4. Generamos el número de expediente único: EXP-AÑO-ID (rellenado con ceros)
        // Ejemplo: EXP-2026-0001
        const anioActual = new Date().getFullYear();
        const correlativo = casoGuardado.id.toString().padStart(4, '0');
        casoGuardado.numero_expediente = `EXP-${anioActual}-${correlativo}`;

        // 5. Actualizamos el registro con su nuevo número oficial
        return await this.casoRepository.save(casoGuardado);
    }

    async obtenerTodos() {
        return await this.casoRepository.find({ 
            relations: ["cliente"],
            order: { fecha_apertura: "DESC" } 
        });
    }

    async obtenerCasoPorId(id: number) {
        return await this.casoRepository.findOne({
            where: { id },
            relations: ["cliente", "documentos", "alertas"] 
        });
    }
}