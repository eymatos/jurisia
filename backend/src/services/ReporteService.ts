import PDFDocument from 'pdfkit';
import { Caso } from '../entities/Caso';

export class ReporteService {
    /**
     * Genera un PDF profesional con el resumen del expediente
     */
    async generarInformeCaso(caso: Caso): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
            const chunks: any[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err) => reject(err));

            // --- ENCABEZADO PROFESIONAL ---
            doc.fillColor('#0f172a').fontSize(24).font('Helvetica-Bold').text('JURIS IA', { align: 'right' });
            doc.fontSize(10).font('Helvetica').text('SISTEMA DE INTELIGENCIA LEGAL', { align: 'right' });
            doc.moveDown(2);

            // Título del Reporte
            doc.fillColor('#1e293b').fontSize(18).font('Helvetica-Bold').text('INFORME DE ANÁLISIS TÉCNICO-LEGAL');
            doc.fontSize(10).font('Helvetica').text(`Generado el: ${new Date().toLocaleDateString('es-DO')}`);
            doc.rect(50, doc.y + 5, 512, 2).fill('#3b82f6');
            doc.moveDown(2);

            // --- SECCIÓN: DATOS DEL EXPEDIENTE ---
            doc.fillColor('#3b82f6').fontSize(12).font('Helvetica-Bold').text('1. INFORMACIÓN DEL CASO');
            doc.moveDown(0.5);
            doc.fillColor('#1e293b').fontSize(11).font('Helvetica');
            // ... dentro de ReporteService.ts ...
            doc.text(`Título: ${caso.titulo}`);
            doc.text(`Número de Expediente: ${caso.numero_expediente || 'N/A'}`);
            doc.text(`Cliente: ${caso.cliente?.nombre || 'No asignado'}`);
            doc.text(`Estatus actual: ${caso.estatus.toUpperCase()}`); // Corregido: estatus
            doc.moveDown(1.5);
// ... resto del código igual ...

            // --- SECCIÓN: RESUMEN Y HECHOS ---
            doc.fillColor('#3b82f6').fontSize(12).font('Helvetica-Bold').text('2. RESUMEN DE HECHOS ANALIZADOS');
            doc.moveDown(0.5);
            doc.fillColor('#1e293b').fontSize(11).font('Helvetica');
            
            const descripcion = caso.descripcion || "No se ha proporcionado una descripción detallada para este caso.";
            doc.text(descripcion, { align: 'justify', lineGap: 2 });
            doc.moveDown(1.5);

            // --- SECCIÓN: HALLAZGOS DE INTELIGENCIA ARTIFICIAL ---
            doc.fillColor('#3b82f6').fontSize(12).font('Helvetica-Bold').text('3. HALLAZGOS Y ALERTAS (IA)');
            doc.moveDown(0.5);
            doc.fillColor('#1e293b').fontSize(11).font('Helvetica');
            
            // Aquí listamos las alertas asociadas al caso como hallazgos
            if (caso.alertas && (caso as any).alertas.length > 0) {
                (caso as any).alertas.forEach((alerta: any, index: number) => {
                    doc.font('Helvetica-Bold').text(`${index + 1}. ${alerta.titulo}:`);
                    doc.font('Helvetica').text(`   - Prioridad: ${alerta.prioridad.toUpperCase()}`);
                    doc.text(`   - Detalle: ${alerta.descripcion || 'Análisis automático realizado'}`);
                    doc.moveDown(0.5);
                });
            } else {
                doc.text("No se han generado alertas o hallazgos automáticos para este expediente aún.");
            }

            // --- PIE DE PÁGINA ---
            const bottom = doc.page.height - 70;
            doc.fontSize(8).fillColor('#64748b')
                .text('Este documento es un informe preliminar generado por IA. Debe ser revisado y firmado por un profesional del derecho.', 50, bottom, { align: 'center', width: 512 });

            doc.end();
        });
    }
}