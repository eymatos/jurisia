import { Request, Response } from "express";
import { VectorService } from "../services/VectorService";
import { IAService } from "../services/IAService";
import { EscritoService } from "../services/EscritoService";
import { CasoService } from "../services/CasoService";

const vectorService = new VectorService();
const iaService = new IAService();
const escritoService = new EscritoService();
const casoService = new CasoService();

export class IAController {
    
    async preguntar(req: Request, res: Response) {
        try {
            const { pregunta, casoId } = req.body;

            if (!pregunta || !casoId) {
                return res.status(400).json({ message: "Faltan parámetros: pregunta o casoId" });
            }

            console.log(`[IA - Consulta RAG] Iniciando para Caso ID: ${casoId}`);

            // 1. Buscamos fragmentos relevantes en Pinecone
            const coincidencias = await vectorService.buscarSimilares(pregunta, Number(casoId));

            if (!coincidencias || coincidencias.length === 0) {
                return res.json({ 
                    respuesta: "No he encontrado información relevante en los documentos de este expediente para responder a esa consulta." 
                });
            }

            // 2. Extracción de contexto
            const contextoTexto = coincidencias
                .map((c: any) => {
                    const contenido = c.metadata?.text || "Sin contenido de texto disponible";
                    const fuente = c.metadata?.nombre_archivo || "Documento desconocido";
                    return `[Archivo: ${fuente}]: ${contenido}`;
                })
                .join("\n\n");

            console.log(`[IA] Contexto recuperado. Enviando a motor de lenguaje...`);

            // 3. Generar respuesta real usando Groq
            const respuestaIA = await iaService.responderPreguntaConContexto(pregunta, contextoTexto);

            res.json({ 
                respuesta: respuestaIA,
                fuentes: coincidencias.length
            });

        } catch (error: any) {
            console.error("[IAController Error]:", error.message);
            res.status(500).json({ 
                message: "Error interno en el módulo de Consultoría IA",
                error: error.message 
            });
        }
    }

    /**
     * FASE 7: Generar borrador legal en Word (.docx)
     * POST /api/ia/generar-escrito
     */
    async generarEscrito(req: Request, res: Response) {
        try {
            const { casoId, tipoDocumento } = req.body;

            if (!casoId || !tipoDocumento) {
                return res.status(400).json({ message: "Faltan parámetros: casoId o tipoDocumento" });
            }

            // 1. Obtener datos básicos del caso y cliente
            const caso = await casoService.obtenerCasoPorId(Number(casoId));
            if (!caso) return res.status(404).json({ message: "Caso no encontrado" });

            // 2. Recuperar contexto legal profundo de Pinecone
            const busquedaContexto = await vectorService.buscarSimilares("Hechos, pruebas, pretensiones y fundamentos legales", Number(casoId));
            
            // Garantizamos que el contexto sea un string
            const contextoParaRedaccion: string = busquedaContexto
                .map((c: any) => c.metadata?.text || "")
                .join("\n\n") || (caso.descripcion ?? "Sin descripción adicional");

            // 3. IA redacta el borrador (Llama 3.3)
            const nombreParaIA: string | null = caso.cliente?.nombre ?? null;

            const borradorTexto = await iaService.redactarDocumentoLegal(
                tipoDocumento, 
                contextoParaRedaccion, 
                nombreParaIA
            );

            // 4. Convertir texto a archivo Word (.docx)
            const bufferWord = await escritoService.generarDocumentoWord(caso, borradorTexto || "", tipoDocumento);

            // 5. Configurar descarga
            const nombreArchivo = `${tipoDocumento.replace(/\s+/g, '_')}_Caso_${casoId}.docx`;
            
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename=${nombreArchivo}`);
            
            console.log(`[IA - Escritos] Word generado con éxito para: ${tipoDocumento} ✅`);
            res.send(bufferWord);

        } catch (error: any) {
            console.error("[IAController - GenerarEscrito Error]:", error.message);
            res.status(500).json({ message: "Error al generar el documento legal" });
        }
    }

    /**
     * FASE 9: Consultoría Global (Cross-Case Analysis)
     * POST /api/ia/consultar-global
     */
    async consultarGlobal(req: Request, res: Response) {
        try {
            const { pregunta } = req.body;

            if (!pregunta) {
                return res.status(400).json({ message: "La pregunta es obligatoria para la búsqueda global." });
            }

            console.log(`[IA - Búsqueda Global] Consultando precedentes internos...`);

            // 1. Buscar en todo el índice de Pinecone (sin filtro de casoId)
            const coincidenciasGlobales = await vectorService.buscarGlobal(pregunta);

            if (!coincidenciasGlobales || coincidenciasGlobales.length === 0) {
                return res.json({ 
                    respuesta: "No he encontrado referencias similares en ningún expediente del despacho." 
                });
            }

            // 2. Construir contexto enriquecido con metadatos de origen
            const contextoGlobal = coincidenciasGlobales
                .map((c: any) => {
                    const contenido = c.metadata?.text || "Contenido no disponible";
                    const archivo = c.metadata?.nombre_archivo || "Archivo desconocido";
                    const casoNombre = c.metadata?.casoTitulo || "Expediente sin título";
                    return `[Expediente: ${casoNombre}] [Documento: ${archivo}]: ${contenido}`;
                })
                .join("\n\n---\n\n");

            // 3. Generar respuesta unificada usando el motor de IA
            // Reutilizamos el servicio de respuesta con contexto, pero con un prompt implícito global
            const respuestaIA = await iaService.responderPreguntaConContexto(
                `Analiza el siguiente historial del despacho y responde: ${pregunta}`, 
                contextoGlobal
            );

            res.json({ 
                respuesta: respuestaIA,
                fuentes: coincidenciasGlobales.map((c: any) => ({
                    archivo: c.metadata?.nombre_archivo,
                    caso: c.metadata?.casoTitulo,
                    idCaso: c.metadata?.casoId
                }))
            });

        } catch (error: any) {
            console.error("[IAController - Global Error]:", error.message);
            res.status(500).json({ message: "Error en la consulta global de inteligencia." });
        }
    }
}