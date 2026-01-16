import { AppDataSource } from "../data-source";
import { Documento } from "../entities/Documento";
import { Caso } from "../entities/Caso";
import { Alerta, AlertaPrioridad } from "../entities/Alerta"; 
import Tesseract from "tesseract.js";
import * as fs from "fs";
import * as path from "path";
import { IAService } from "./IAService"; 
import { VectorService } from "./VectorService"; 
import * as mammoth from "mammoth"; // Librería para extraer texto de Word

const PDFParser = require("pdf2json");

export class DocumentoService {
    private documentoRepository = AppDataSource.getRepository(Documento);
    private casoRepository = AppDataSource.getRepository(Caso);
    private alertaRepository = AppDataSource.getRepository(Alerta); 
    private iaService = new IAService(); 
    private vectorService = new VectorService(); 

    async registrarDocumento(datos: any, archivo: Express.Multer.File) {
        const caso = await this.casoRepository.findOneBy({ id: Number(datos.casoId) });
        
        if (!caso) {
            throw new Error("El caso especificado no existe");
        }

        const rutaNormalizada = archivo.path.replace(/\\/g, '/');

        const nuevoDocumento = this.documentoRepository.create({
            nombre_archivo: archivo.originalname,
            ruta_url: rutaNormalizada,
            tipo_mimetype: archivo.mimetype,
            caso: caso
        });

        const documentoGuardado = await this.documentoRepository.save(nuevoDocumento);

        console.log(`[SISTEMA] Iniciando procesamiento para: ${archivo.originalname}`);
        
        // Ejecutamos el procesamiento en segundo plano
        this.procesarArchivo(documentoGuardado.id, archivo.path, archivo.mimetype);

        return documentoGuardado;
    }

    private async procesarArchivo(documentoId: number, ruta: string, mimetype: string) {
        try {
            // RUTA 1: Procesamiento de PDF
            if (mimetype === "application/pdf") {
                console.log(`[PDF] Analizando contenido con PDFParser...`);
                
                const pdfParser = new PDFParser(this, 1); 

                pdfParser.on("pdfParser_dataError", (errData: any) => {
                    console.error("[PDF - Error]:", errData.parserError);
                    this.procesarOCR(documentoId, ruta); 
                });

                pdfParser.on("pdfParser_dataReady", async (pdfData: any) => {
                    const textoExtraido = pdfParser.getRawTextContent();
                    
                    if (textoExtraido && textoExtraido.trim().length > 10) {
                        await this.documentoRepository.update(documentoId, {
                            contenido_texto: textoExtraido || ""
                        });
                        
                        console.log(`[PDF] Texto extraído con éxito vía PDFParser ✅`);
                        await this.ejecutarAnalisisIA(documentoId, textoExtraido);
                    } else {
                        console.log(`[PDF] Sin texto digital detectable. Iniciando OCR...`);
                        await this.procesarOCR(documentoId, ruta);
                    }
                });

                pdfParser.loadPDF(ruta);
            } 
            // RUTA 2: Procesamiento de WORD (.docx) - NUEVA FUNCIONALIDAD
            else if (mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || ruta.endsWith('.docx')) {
                console.log(`[WORD] Extrayendo texto nativo con Mammoth...`);
                const result = await mammoth.extractRawText({ path: ruta });
                const textoWord = result.value;

                await this.documentoRepository.update(documentoId, {
                    contenido_texto: textoWord || ""
                });

                console.log(`[WORD] Texto extraído con éxito ✅`);
                await this.ejecutarAnalisisIA(documentoId, textoWord);
            }
            // RUTA 3: Imágenes o formatos desconocidos (OCR Directo)
            else {
                await this.procesarOCR(documentoId, ruta);
            }
        } catch (error) {
            console.error(`[SISTEMA - Error Crítico]:`, error);
        }
    }

    private async procesarOCR(documentoId: number, fuente: string | Buffer) {
        try {
            // Verificamos si la fuente es un archivo de Word para evitar que Tesseract explote
            if (typeof fuente === 'string' && fuente.endsWith('.docx')) {
                console.error("[IA - OCR] Error: Tesseract no puede procesar archivos .docx");
                return;
            }

            console.log(`[IA] Iniciando Tesseract para ID: ${documentoId}...`);
            const result = await Tesseract.recognize(
                fuente,
                'spa',
                { logger: m => {
                    if (m.status === 'recognizing text') {
                        console.log(`[IA - Progreso]: ${Math.round(m.progress * 100)}%`);
                    }
                }}
            );

            const textoOcr = result.data.text;

            await this.documentoRepository.update(documentoId, {
                contenido_texto: textoOcr || ""
            });

            console.log(`[IA] Lectura completada y base de datos actualizada ✅`);
            await this.ejecutarAnalisisIA(documentoId, textoOcr);

        } catch (error) {
            console.error(`[IA - Error Crítico]:`, error);
        }
    }

    private async ejecutarAnalisisIA(documentoId: number, texto: string) {
        try {
            // 1. Obtener el resumen con Groq
            const analisis = await this.iaService.analizarDocumentoLegal(texto);
            
            await this.documentoRepository.update(documentoId, {
                resumen_ia: analisis || "" 
            });
            
            console.log(`[SISTEMA] Análisis de IA guardado para documento ID: ${documentoId} ✅`);

            // 2. Indexación en Pinecone
            const docDb = await this.documentoRepository.findOne({ 
                where: { id: documentoId },
                relations: ["caso"] 
            });

            if (docDb) {
                const pineconeId = await this.vectorService.indexarDocumento(
                    documentoId, 
                    texto, 
                    { 
                        casoId: docDb.caso.id,
                        nombre: docDb.nombre_archivo 
                    }
                );

                await this.documentoRepository.update(documentoId, {
                    pinecone_id: pineconeId
                });

                // 3. DETECCIÓN AUTOMÁTICA DE PLAZOS
                console.log(`[IA - Plazos] Analizando plazos procesales para el caso ${docDb.caso.id}...`);
                const plazosDetectados = await this.iaService.detectarPlazosProcesales(texto);

                if (plazosDetectados && Array.isArray(plazosDetectados) && plazosDetectados.length > 0) {
                    for (const plazo of plazosDetectados) {
                        const fecha = new Date(plazo.fechaVencimiento);
                        if (isNaN(fecha.getTime())) continue;

                        const nuevaAlerta = this.alertaRepository.create({
                            titulo: plazo.titulo,
                            descripcion: `${plazo.descripcion} (Detectado del archivo: ${docDb.nombre_archivo})`,
                            fechaVencimiento: fecha,
                            prioridad: (plazo.prioridad as AlertaPrioridad) || AlertaPrioridad.MEDIA,
                            caso: docDb.caso,
                            documentoOrigen: docDb
                        });
                        await this.alertaRepository.save(nuevaAlerta);
                    }
                    console.log(`[IA - Plazos] Se han creado ${plazosDetectados.length} alertas automáticas ✅`);
                }
            }

        } catch (error) {
            console.error(`[SISTEMA] Error en flujo de IA/Vectorización/Plazos:`, error);
        }
    }

    async obtenerPorCaso(casoId: number) {
        return await this.documentoRepository.find({
            where: { caso: { id: casoId } }
        });
    }

    async buscarEnDocumentos(casoId: number, termino: string) {
        return await this.documentoRepository.createQueryBuilder("documento")
            .where("documento.casoId = :casoId", { casoId })
            .andWhere(
                "(documento.contenido_texto ILIKE :termino OR documento.resumen_ia ILIKE :termino OR documento.nombre_archivo ILIKE :termino)",
                { termino: `%${termino}%` }
            )
            .getMany();
    }
}