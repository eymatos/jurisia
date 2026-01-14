import { AppDataSource } from "../data-source";
import { Caso } from "../entities/Caso";
import { Cliente } from "../entities/Cliente";

export class CasoService {
    private casoRepository = AppDataSource.getRepository(Caso);
    private clienteRepository = AppDataSource.getRepository(Cliente);

    async crearCaso(datos: any) {
        // Buscamos si el cliente existe antes de asignarle un caso
        const cliente = await this.clienteRepository.findOneBy({ id: datos.clienteId });
        
        if (!cliente) {
            throw new Error("El cliente especificado no existe");
        }

        const nuevoCaso = this.casoRepository.create({
            ...datos,
            cliente: cliente
        });

        return await this.casoRepository.save(nuevoCaso);
    }

    async obtenerTodos() {
        // 'relations' permite que al pedir los casos, también nos traiga la info del cliente
        return await this.casoRepository.find({ relations: ["cliente"] });
    }

    // Método actualizado para incluir la relación de alertas detectadas por la IA
    async obtenerCasoPorId(id: number) {
        return await this.casoRepository.findOne({
            where: { id },
            relations: ["cliente", "documentos", "alertas"] 
        });
    }
}