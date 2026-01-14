import { IAService } from "./IAService";
import { VectorService } from "./VectorService";

export class ChatService {
    private iaService = new IAService();
    private vectorService = new VectorService();

    async responderPreguntaSobreCaso(casoId: number, pregunta: string) {
        try {
            console.log(`[ChatService] Buscando en Pinecone para Caso: ${casoId}...`);

            // 1. RETRIEVAL
            const coincidencias = await this.vectorService.buscarSimilares(pregunta, casoId);

            // LOG DE DIAGNÓSTICO: Esto aparecerá en tu terminal
            console.log(`[DEBUG - Pinecone] Encontradas ${coincidencias?.length || 0} coincidencias.`);

            if (!coincidencias || coincidencias.length === 0) {
                return "No encontré información relevante en los documentos de este caso para responder a tu pregunta.";
            }

            // 2. AUGMENTED
            const contextoDocumentos = coincidencias
                .map((m: any) => {
                    // Verificamos si el texto existe en el metadata
                    const contenido = m.metadata?.text || "Sin contenido de texto";
                    return `Documento: ${m.metadata?.nombre || 'Desconocido'}\nContenido: ${contenido}`;
                })
                .join("\n\n---\n\n");

            // 3. GENERATION
            const promptSistema = `
                Eres un asistente legal experto en derecho dominicano. 
                Tu tarea es responder preguntas basadas EXCLUSIVAMENTE en el contexto de los documentos proporcionados.
                Si la respuesta no está en el contexto, indícalo amablemente.
                
                CONTEXTO DE LOS DOCUMENTOS:
                ${contextoDocumentos}
            `;

            const respuestaFinal = await this.iaService.analizarDocumentoLegal(
                `Pregunta del abogado: ${pregunta}`,
                promptSistema
            );

            return respuestaFinal;
        } catch (error) {
            console.error("[ChatService - Error]:", error);
            throw new Error("Error al procesar la consulta legal.");
        }
    }

    /**
     * NUEVO: Responde consultas legales generales sin depender de documentos específicos.
     * Ideal para redacción de contratos, dudas sobre leyes o procedimientos.
     */
    async responderConsultaGeneral(pregunta: string) {
        try {
            console.log(`[ChatService] Iniciando consulta legal global con IA...`);

            const promptSistemaGlobal = `
                Eres un Consultor Jurídico Senior de IA. Tu especialidad es el derecho general, con énfasis en la legislación dominicana.
                Tu objetivo es ayudar a abogados a:
                1. Redactar borradores de cláusulas o contratos.
                2. Explicar términos legales complejos.
                3. Orientar sobre procedimientos procesales.
                4. Analizar situaciones jurídicas hipotéticas.

                REGLAS:
                - Responde de forma profesional, estructurada y precisa.
                - Siempre aclara que tus respuestas son informativas y deben ser revisadas por un profesional.
                - Si citas leyes, asegúrate de mencionar que se basan en la normativa vigente.
            `;

            const respuesta = await this.iaService.analizarDocumentoLegal(
                pregunta,
                promptSistemaGlobal
            );

            return respuesta;
        } catch (error) {
            console.error("[ChatService - Global Error]:", error);
            throw new Error("No se pudo completar la consulta global.");
        }
    }
}