import OpenAI from "openai";
import * as dotenv from "dotenv";

dotenv.config();

// CONFIGURACIÓN INTELIGENTE:
// Usamos GROQ_API_KEY si existe, si no, intentamos OPENAI_API_KEY por si Render la autoconfiguró.
const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;

const groq = new OpenAI({
    apiKey: apiKey,
    baseURL: "https://api.groq.com/openai/v1", 
});

export class IAService {
    
    /**
     * Analiza texto legal o responde preguntas usando contexto (RAG).
     */
    async analizarDocumentoLegal(texto: string, systemPrompt?: string) {
        if (!apiKey) {
            console.error("[IA - Error]: No se encontró ninguna API Key (GROQ o OPENAI) en las variables de entorno.");
            return "Error: Credenciales de IA faltantes en el servidor.";
        }

        try {
            console.log("[IA - Groq] Iniciando procesamiento con Llama 3.3...");

            const defaultPrompt = `Eres un asistente legal experto en la legislación de la República Dominicana. 
                                Tu tarea es analizar el texto de documentos legales (instancias, sentencias, contratos). 
                                Debes devolver un análisis en español profesional que incluya:
                                1. Un resumen ejecutivo del documento.
                                2. Identificación de las partes involucradas.
                                3. Puntos clave o cláusulas importantes.
                                4. Recomendación estratégica para el abogado basada en el ordenamiento jurídico dominicano.`;

            const response = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt || defaultPrompt
                    },
                    {
                        role: "user",
                        content: systemPrompt 
                            ? texto 
                            : `Analiza este texto legal: \n\n${texto}`
                    }
                ],
                temperature: 0.2, 
            });

            const resultado = response.choices[0].message.content;
            console.log("[IA - Groq] Respuesta generada con éxito ✅");
            return resultado;

        } catch (error: any) {
            console.error("[IA - Groq Error]:", error.message);
            return `No se pudo procesar con Groq: ${error.message}`;
        }
    }

    /**
     * Responde preguntas basadas en fragmentos recuperados de Pinecone (RAG).
     */
    async responderPreguntaConContexto(pregunta: string, contexto: string) {
        try {
            console.log("[IA - Groq] Generando respuesta basada en contexto judicial y legislación local...");

            const systemPrompt = `Eres un Consultor Jurídico de IA experto en leyes de la República Dominicana. 
            Tu objetivo es ayudar al abogado analizando los fragmentos de documentos proporcionados (contexto).
            
            REGLAS DE RESPUESTA:
            1. Solo responde basándote en el CONTEXTO proporcionado y en las leyes de la República Dominicana (ej: Código Civil, Código de Trabajo, Ley 108-05).
            2. Si la respuesta no está en el contexto, di: "No encuentro información específica sobre eso en los documentos cargados".
            3. Si el contexto menciona fechas o nombres de archivos, cítalos rigurosamente.
            4. Utiliza terminología procesal dominicana (ej: "Octava Franca", "Emplazamiento", "Sentencia In Voce").
            5. Responde de forma clara y profesional en español.`;

            const response = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { 
                        role: "user", 
                        content: `CONTEXTO RECUPERADO DEL EXPEDIENTE:\n${contexto}\n\nPREGUNTA DEL ABOGADO: ${pregunta}` 
                    }
                ],
                temperature: 0.1, 
            });

            return response.choices[0].message.content;

        } catch (error: any) {
            console.error("[IA - Groq RAG Error]:", error.message);
            throw new Error("Error al generar respuesta inteligente con Groq");
        }
    }

    /**
     * Detecta plazos procesales y fechas límite en un texto legal.
     */
    async detectarPlazosProcesales(texto: string) {
        try {
            const hoy = new Date().toISOString().split('T')[0];
            console.log("[IA - Groq] Buscando plazos con fecha de referencia:", hoy);

            const extractionPrompt = `Eres un experto en derecho procesal dominicano. Analiza el siguiente texto y extrae TODAS las fechas límite, vencimientos o plazos mencionados.
            
            CONSIDERACIONES ESPECIALES RD:
            - Identifica plazos de octava franca, recursos de apelación (30 días), recursos de casación, etc.
            - La fecha de hoy es: ${hoy}.
            - Si el texto dice "en 10 días", calcula la fecha sumando 10 días a partir de hoy (asumiendo días calendarios a menos que se especifique lo contrario).
            - Devuelve la fecha en formato ISO (YYYY-MM-DD).
            
            Debes responder ÚNICAMENTE con un objeto JSON que contenga una propiedad "plazos" con un array de objetos:
            {
              "plazos": [
                {
                  "titulo": "Nombre corto del plazo",
                  "descripcion": "Explicación breve citando el documento origen",
                  "fechaVencimiento": "YYYY-MM-DD",
                  "prioridad": "baja" | "media" | "alta" | "critica"
                }
              ]
            }
            Si no hay plazos claros, devuelve {"plazos": []}.`;

            const response = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: extractionPrompt },
                    { role: "user", content: `Extrae plazos de este texto: \n\n${texto}` }
                ],
                temperature: 0, 
                response_format: { type: "json_object" } 
            });

            const content = response.choices[0].message.content || '{"plazos": []}';
            const parsed = JSON.parse(content);
            
            return parsed.plazos || [];

        } catch (error: any) {
            console.error("[IA - Error de Extracción]:", error.message);
            return [];
        }
    }

    /**
     * FASE 7: Generador de Redacción Legal Dinámica
     */
    async redactarDocumentoLegal(tipo: string, contextoExpediente: string, clienteNombre: string | null) {
        try {
            console.log(`[IA - Groq] Redactando borrador de: ${tipo}...`);

            const nombreFinal = clienteNombre || "Parte Interesada";

            const redaccionPrompt = `Eres un abogado senior experto en redacción jurídica de la República Dominicana. 
            Tu tarea es redactar un borrador de un documento legal de tipo: "${tipo}".

            DATOS DEL CLIENTE: ${nombreFinal}
            CONTEXTO DEL EXPEDIENTE (Hechos y Análisis): 
            ${contextoExpediente}

            REGLAS FORMALES DE REDACCIÓN:
            1. Estructura clásica: Encabezado (Poder Judicial), Datos de las partes, "RELACIÓN DE HECHOS", "FUNDAMENTOS DE DERECHO" y "CONCLUSIONES".
            2. Cita leyes dominicanas vigentes relacionadas con el contexto (ej: Código de Trabajo si es laboral, Código Civil si es daños y perjuicios).
            3. Usa lenguaje solemne y técnico (ej: "A tales fines y bajo toda clase de reservas de derecho...").
            4. Utiliza marcadores de posición para datos faltantes como "[NOMBRE DEL ALGUACIL]", "[FECHA DEL ACTO]", "[TRIBUNAL COMPETENTE]".
            5. El tono debe ser persuasivo y firme si es una demanda, o neutral y protector si es un contrato.

            IMPORTANTE: Solo devuelve el texto del documento legal, sin comentarios adicionales antes o después.`;

            const response = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: redaccionPrompt },
                    { role: "user", content: `Redacta el borrador del documento "${tipo}" basado en la información proporcionada.` }
                ],
                temperature: 0.5, 
            });

            return response.choices[0].message.content;

        } catch (error: any) {
            console.error("[IA - Error de Redacción]:", error.message);
            throw new Error("No se pudo generar el borrador legal con la IA.");
        }
    }
}