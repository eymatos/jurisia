import { AppDataSource } from "../data-source";
import { Cliente } from "../entities/Cliente";

export class ClienteService {
    private clienteRepository = AppDataSource.getRepository(Cliente);

    // Función para crear un nuevo cliente con validación de duplicados
    async crearCliente(datos: Partial<Cliente>) {
        // Verificar si ya existe un cliente con esa Cédula o RNC
        if (datos.documento_identidad) {
            const existente = await this.clienteRepository.findOneBy({ 
                documento_identidad: datos.documento_identidad 
            });
            if (existente) {
                throw new Error("Ya existe un cliente registrado con este documento de identidad.");
            }
        }

        const nuevoCliente = this.clienteRepository.create(datos);
        return await this.clienteRepository.save(nuevoCliente);
    }

    // Función para obtener todos los clientes incluyendo sus casos relacionados
    async obtenerClientes() {
        return await this.clienteRepository.find({
            relations: ["casos"],
            order: { nombre: "ASC" }
        });
    }

    // Buscar un cliente específico por ID
    async obtenerPorId(id: number) {
        return await this.clienteRepository.findOne({
            where: { id },
            relations: ["casos"]
        });
    }
}