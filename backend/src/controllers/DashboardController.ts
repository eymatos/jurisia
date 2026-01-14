import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Caso } from "../entities/Caso";
import { Alerta, AlertaPrioridad } from "../entities/Alerta"; // Importamos el Enum
import { Cliente } from "../entities/Cliente";
import { Between } from "typeorm";

export class DashboardController {
    async obtenerEstadisticas(req: Request, res: Response) {
        try {
            const casoRepo = AppDataSource.getRepository(Caso);
            const alertaRepo = AppDataSource.getRepository(Alerta);
            const clienteRepo = AppDataSource.getRepository(Cliente);

            // 1. Resumen de KPIs
            const totalCasos = await casoRepo.count();
            const totalClientes = await clienteRepo.count();
            
            const alertasCriticas = await alertaRepo.count({
                where: { 
                    prioridad: AlertaPrioridad.CRITICA, 
                    completada: false 
                }
            });

            // 2. Distribución por Estatus (Para Gráfico de Pastel)
            // CORRECCIÓN: Parseamos el valor a número porque SQL devuelve strings en los COUNT
            const rawStats = await casoRepo
                .createQueryBuilder("caso")
                .select("caso.estatus", "name")
                .addSelect("COUNT(caso.id)", "value")
                .groupBy("caso.estatus")
                .getRawMany();

            const statsEstatus = rawStats.map(stat => ({
                name: stat.name,
                value: Number(stat.value) // Conversión crítica para Recharts
            }));

            // 3. Casos Recientes (Últimos 5)
            const casosRecientes = await casoRepo.find({
                relations: ["cliente"],
                order: { fecha_apertura: "DESC" },
                take: 5
            });

            // 4. Alertas próximas (Próximos 15 días)
            const hoy = new Date();
            const fechaLimite = new Date();
            fechaLimite.setDate(hoy.getDate() + 15);

            const alertasProximas = await alertaRepo.find({
                where: {
                    fechaVencimiento: Between(hoy, fechaLimite),
                    completada: false
                },
                relations: ["caso"],
                order: { fechaVencimiento: "ASC" }
            });

            res.json({
                kpis: {
                    totalCasos,
                    totalClientes,
                    alertasCriticas
                },
                distribucionEstatus: statsEstatus,
                casosRecientes,
                proximosPlazos: alertasProximas
            });

        } catch (error: any) {
            console.error("Error en DashboardController:", error);
            res.status(500).json({ message: "Error al compilar estadísticas" });
        }
    }
}