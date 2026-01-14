import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { Caso } from "../entities/Caso";

export class EscritoService {
    /**
     * Crea un archivo Word (.docx) basado en la redacción de la IA
     */
    async generarDocumentoWord(caso: Caso, contenidoRedactado: string, tipoDocumento: string): Promise<Buffer> {
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    // Encabezado
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({ text: "ESTUDIO JURÍDICO - JURIS IA", bold: true, size: 28, font: "Times New Roman" }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({ text: "Consultoría y Litigación Estratégica", italics: true, size: 20 }),
                        ],
                    }),
                    new Paragraph({ text: "", spacing: { after: 400 } }),

                    // Título del Documento
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({ text: tipoDocumento.toUpperCase(), bold: true, underline: {}, size: 24 }),
                        ],
                    }),
                    new Paragraph({ text: "", spacing: { after: 300 } }),

                    // Contenido generado por la IA
                    ...contenidoRedactado.split('\n').map(linea => 
                        new Paragraph({
                            alignment: AlignmentType.JUSTIFIED,
                            spacing: { line: 360, before: 200 },
                            children: [
                                new TextRun({ text: linea, size: 24, font: "Times New Roman" }),
                            ],
                        })
                    ),

                    // Pie de firma
                    new Paragraph({ text: "", spacing: { before: 800 } }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({ text: "__________________________", bold: true }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({ text: "ABOGADO APODERADO", bold: true, size: 20 }),
                        ],
                    }),
                ],
            }],
        });

        return await Packer.toBuffer(doc);
    }
}