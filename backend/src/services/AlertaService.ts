import { AppDataSource } from "../data-source";
import { Alerta, AlertaPrioridad } from "../entities/Alerta";
import { Caso } from "../entities/Caso";
import { LessThanOrEqual } from "typeorm";

export class AlertaService {
    private alertaRepository = AppDataSource.getRepository(Alerta);
    private casoRepository = AppDataSource.getRepository(Caso);

    /**
     * Crea una nueva alerta vinculada a un caso.
     */
    async crearAlerta(datos: {
        titulo: string;
        descripcion?: string;
        fechaVencimiento: Date;
        prioridad?: AlertaPrioridad;
        casoId: number;
        documentoId?: number;
    }) {
        const caso = await this.casoRepository.findOneBy({ id: datos.casoId });
        if (!caso) {
            throw new Error("El caso especificado no existe");
        }

        const nuevaAlerta = this.alertaRepository.create({
            titulo: datos.titulo,
            descripcion: datos.descripcion,
            fechaVencimiento: datos.fechaVencimiento,
            prioridad: datos.prioridad || AlertaPrioridad.MEDIA,
            caso: caso,
            documentoOrigen: datos.documentoId ? { id: datos.documentoId } as any : null
        });

        return await this.alertaRepository.save(nuevaAlerta);
    }

    /**
     * Obtiene todas las alertas de un caso específico.
     */
    async obtenerPorCaso(casoId: number) {
        return await this.alertaRepository.find({
            where: { caso: { id: casoId } },
            relations: ["documentoOrigen"],
            order: { fechaVencimiento: "ASC" }
        });
    }

    /**
     * Marca una alerta como completada.
     */
    async marcarComoCompletada(alertaId: number) {
        const alerta = await this.alertaRepository.findOneBy({ id: alertaId });
        if (!alerta) throw new Error("Alerta no encontrada");

        alerta.completada = true;
        return await this.alertaRepository.save(alerta);
    }

    /**
     * Busca alertas que vencen en las próximas X horas (Urgentes)
     * Útil para el dashboard principal.
     */
    async obtenerAlertasUrgentes(horas: number = 48) {
        const fechaLimite = new Date();
        fechaLimite.setHours(fechaLimite.getHours() + horas);

        return await this.alertaRepository.find({
            where: {
                fechaVencimiento: LessThanOrEqual(fechaLimite),
                completada: false
            },
            relations: ["caso"],
            order: { prioridad: "DESC", fechaVencimiento: "ASC" }
        });
    }

    /**
     * Eliminar una alerta.
     */
    async eliminarAlerta(id: number) {
        return await this.alertaRepository.delete(id);
    }

    /**
     * MÉTODO DE DIAGNÓSTICO:
     * Recupera todos los registros para auditoría técnica.
     */
    async obtenerTodasDebug() {
        return await this.alertaRepository.find({
            relations: ["caso", "documentoOrigen"],
            order: { id: "DESC" }
        });
    }
}