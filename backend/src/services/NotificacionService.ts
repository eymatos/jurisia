import nodeCron from 'node-cron';
import nodemailer from 'nodemailer';
import { AppDataSource } from '../data-source';
import { Alerta, AlertaPrioridad } from '../entities/Alerta';
import { LessThanOrEqual, MoreThan } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export class NotificacionService {
    private alertaRepository = AppDataSource.getRepository(Alerta);
    private transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_PORT === '465', // true para 465, false para otros
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    /**
     * Inicia la tarea programada (Cron Job)
     * Se ejecuta todos los días a las 8:00 AM
     */
    iniciarCron() {
        console.log('[SISTEMA] Vigilante de Alertas iniciado (Cron Job) ⏰');
        
        // Formato: Minuto Hora DíaMes Mes DíaSemana
        nodeCron.schedule('0 8 * * *', async () => {
            console.log('[CRON] Revisando plazos procesales para el día de hoy...');
            await this.procesarAlertasPendientes();
        });
    }

    async procesarAlertasPendientes() {
        try {
            const tresDiasEnElFuturo = new Date();
            tresDiasEnElFuturo.setDate(tresDiasEnElFuturo.getDate() + 3);

            // Buscamos alertas críticas o altas que venzan pronto y no se hayan notificado
            const alertasVenciendo = await this.alertaRepository.find({
                where: {
                    notificada: false,
                    completada: false,
                    fechaVencimiento: LessThanOrEqual(tresDiasEnElFuturo),
                },
                relations: ['caso']
            });

            if (alertasVenciendo.length === 0) {
                console.log('[CRON] No hay alertas urgentes para notificar hoy.');
                return;
            }

            for (const alerta of alertasVenciendo) {
                await this.enviarEmailAlerta(alerta);
                
                // Marcamos como notificada para no repetir el correo mañana
                await this.alertaRepository.update(alerta.id, { notificada: true });
            }

            console.log(`[CRON] Se enviaron ${alertasVenciendo.length} notificaciones de plazos.`);

        } catch (error) {
            console.error('[CRON - Error]:', error);
        }
    }

    private async enviarEmailAlerta(alerta: Alerta) {
        const mailOptions = {
            from: `"Juris IA - Vigilante Legal" <${process.env.EMAIL_USER}>`,
            to: process.env.ABOGADO_EMAIL, // Email del dueño de la firma
            subject: `⚠️ URGENTE: Plazo Judicial en 72h - ${alerta.titulo}`,
            html: `
                <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden;">
                    <div style="background-color: #0f172a; padding: 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Juris IA</h1>
                    </div>
                    <div style="padding: 40px;">
                        <h2 style="color: #ef4444;">Vencimiento Próximo Detectado</h2>
                        <p>Estimado Licenciado,</p>
                        <p>El sistema de inteligencia artificial ha detectado un plazo procesal que requiere su atención inmediata:</p>
                        <div style="background-color: #f8fafc; padding: 20px; border-radius: 15px; border-left: 5px solid #3b82f6;">
                            <p><strong>Expediente:</strong> ${alerta.caso.titulo}</p>
                            <p><strong>Alerta:</strong> ${alerta.titulo}</p>
                            <p><strong>Descripción:</strong> ${alerta.descripcion || 'Sin descripción adicional'}</p>
                            <p><strong>Fecha Límite:</strong> ${alerta.fechaVencimiento.toLocaleDateString('es-DO')}</p>
                            <p><strong>Prioridad:</strong> <span style="text-transform: uppercase; font-weight: bold; color: #ef4444;">${alerta.prioridad}</span></p>
                        </div>
                        <p style="margin-top: 30px;">Por favor, acceda al portal de Juris IA para gestionar esta acción legal.</p>
                    </div>
                    <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b;">
                        Este es un mensaje automático generado por Juris IA.
                    </div>
                </div>
            `,
        };

        return this.transporter.sendMail(mailOptions);
    }
}