import { Request, Response } from "express";
import { DocumentoService } from "../services/DocumentoService";
import { VectorService } from "../services/VectorService";

const documentoService = new DocumentoService();
const vectorService = new VectorService();

export class DocumentoController {
    
    /**
     * Procesa la subida y activa el flujo: Extracción -> OCR -> Pinecone
     * POST http://localhost:3000/api/documentos/subir
     */
    async subir(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No se subió ningún archivo" });
            }

            console.log(`[DocumentoController] Recibiendo archivo: ${req.file.originalname} para el caso: ${req.body.casoId}`);

            const documento = await documentoService.registrarDocumento(req.body, req.file);
            res.status(201).json(documento);
        } catch (error: any) {
            console.error("[DocumentoController Subida Error]:", error.message);
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Obtiene la lista de documentos de un caso específico
     * GET http://localhost:3000/api/documentos/caso/:casoId
     */
    async listarPorCaso(req: Request, res: Response) {
        try {
            const casoId = Number(req.params.casoId);
            
            if (isNaN(casoId)) {
                return res.status(400).json({ message: "ID de caso inválido" });
            }

            const documentos = await documentoService.obtenerPorCaso(casoId);
            res.json(documentos);
        } catch (error: any) {
            console.error("[DocumentoController Listado Error]:", error.message);
            res.status(500).json({ message: "Error al obtener documentos" });
        }
    }

    /**
     * Búsqueda tradicional (Palabras exactas en base de datos)
     * GET http://localhost:3000/api/documentos/buscar/:casoId?q=termino
     */
    async buscar(req: Request, res: Response) {
        try {
            const casoId = Number(req.params.casoId);
            const query = req.query.q as string;

            if (isNaN(casoId)) {
                return res.status(400).json({ message: "ID de caso inválido" });
            }

            if (!query) {
                return res.status(400).json({ message: "Debe proporcionar un término de búsqueda" });
            }

            const resultados = await documentoService.buscarEnDocumentos(casoId, query);
            res.json(resultados);
        } catch (error: any) {
            console.error("[DocumentoController Búsqueda Error]:", error.message);
            res.status(500).json({ message: "Error al realizar la búsqueda" });
        }
    }

    /**
     * Búsqueda Semántica (Por concepto - Fase 3)
     * GET http://localhost:3000/api/documentos/IA/buscar/:casoId?q=concepto
     */
    async buscarSemantico(req: Request, res: Response) {
        try {
            const casoId = Number(req.params.casoId);
            const query = req.query.q as string;

            if (isNaN(casoId) || !query) {
                return res.status(400).json({ message: "Faltan parámetros: casoId o query (q)" });
            }

            console.log(`--------------------------------------------------`);
            console.log(`[IA - Búsqueda Semántica] Iniciando consulta...`);
            console.log(`[Parámetros] Caso: ${casoId} | Consulta: "${query}"`);
            
            const coincidencias = await vectorService.buscarSimilares(query, casoId);
            
            console.log(`[Resultado] Se encontraron ${coincidencias?.length || 0} fragmentos relevantes.`);
            console.log(`--------------------------------------------------`);

            res.json({
                mensaje: "Búsqueda semántica completada",
                filtros_aplicados: {
                    casoId: casoId,
                    termino: query
                },
                resultados: coincidencias || []
            });
        } catch (error: any) {
            console.error("[DocumentoController IA Error]:", error.message);
            res.status(500).json({ 
                message: "Error en la búsqueda inteligente",
                error: error.message 
            });
        }
    }
}