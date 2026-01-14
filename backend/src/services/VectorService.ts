import { Pinecone } from '@pinecone-database/pinecone';
import * as dotenv from 'dotenv';

dotenv.config();

export class VectorService {
    private pc: Pinecone;
    private indexName: string;

    constructor() {
        this.pc = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY || '',
        });
        this.indexName = process.env.PINECONE_INDEX_NAME || 'juris-ia';
    }

    /**
     * Divide el texto en fragmentos más pequeños para mejorar la precisión de la IA.
     */
    private crearFragmentos(texto: string, tamaño: number = 1000, solapamiento: number = 200): string[] {
        const fragmentos: string[] = [];
        for (let i = 0; i < texto.length; i += (tamaño - solapamiento)) {
            fragmentos.push(texto.substring(i, i + tamaño));
        }
        return fragmentos;
    }

    /**
     * Guarda el texto en Pinecone fragmentado para una búsqueda semántica precisa.
     */
    async indexarDocumento(documentoId: number, texto: string, metadatos: any) {
        try {
            console.log(`[VectorService] Fragmentando documento ID: ${documentoId} para mejor precisión...`);
            const index = this.pc.index(this.indexName);
            
            const fragmentos = this.crearFragmentos(texto);
            const vectoresParaSubir = [];

            for (let i = 0; i < fragmentos.length; i++) {
                vectoresParaSubir.push({
                    id: `${documentoId}_chunk_${i}`,
                    metadata: {
                        ...metadatos,
                        text: fragmentos[i], 
                        originalId: documentoId,
                        chunkIndex: i
                    }
                });
            }

            await (index as any).upsert(vectoresParaSubir);

            console.log(`[VectorService] Documento ID: ${documentoId} indexado en ${fragmentos.length} fragmentos ✅`);
            return documentoId.toString();
        } catch (error: any) {
            if (error.message?.includes('values')) {
                const index = this.pc.index(this.indexName);
                const dummyVector = new Array(1024).fill(0.00001); 

                await index.upsert([{
                    id: documentoId.toString(),
                    values: dummyVector,
                    metadata: {
                        ...metadatos,
                        text: texto,
                        originalId: documentoId
                    }
                }]);
                console.log(`[VectorService] Indexado con dummy-vector (fallback) ✅`);
                return documentoId.toString();
            }
            throw error;
        }
    }

    /**
     * Busca fragmentos de texto similares filtrados por un caso específico.
     */
    async buscarSimilares(queryTexto: string, casoId: number) {
        try {
            console.log(`[VectorService] Consultando cerebro vectorial para Caso ${casoId}: "${queryTexto.substring(0, 50)}..."`);
            
            const embeddingResponse: any = await this.pc.inference.embed(
                'llama-text-embed-v2', 
                [queryTexto],
                { inputType: 'query' }
            );

            const queryVector = embeddingResponse.data ? embeddingResponse.data[0]?.values : embeddingResponse[0]?.values;

            if (!queryVector) {
                console.error('[VectorService] No se pudo generar el vector de consulta.');
                return [];
            }

            const index = this.pc.index(this.indexName);
            const searchResponse = await index.query({
                vector: queryVector,
                topK: 7,
                filter: { casoId: { '$eq': casoId } },
                includeMetadata: true
            });

            return searchResponse.matches || [];

        } catch (error: any) {
            console.error('[VectorService - Búsqueda Error]:', error.message);
            return [];
        }
    }

    /**
     * FASE 9: Búsqueda Global Multimodal
     * Busca en TODO el índice de Pinecone sin filtrar por casoId.
     */
    async buscarGlobal(queryTexto: string) {
        try {
            console.log(`[VectorService - Global] Buscando en todo el despacho: "${queryTexto.substring(0, 50)}..."`);
            
            const embeddingResponse: any = await this.pc.inference.embed(
                'llama-text-embed-v2', 
                [queryTexto],
                { inputType: 'query' }
            );

            const queryVector = embeddingResponse.data ? embeddingResponse.data[0]?.values : embeddingResponse[0]?.values;

            if (!queryVector) return [];

            const index = this.pc.index(this.indexName);
            const searchResponse = await index.query({
                vector: queryVector,
                topK: 10, // Aumentamos a 10 resultados para tener una visión más amplia del despacho
                includeMetadata: true
                // Nota: Eliminamos el objeto filter para que la búsqueda sea global
            });

            console.log(`[VectorService - Global] Coincidencias encontradas: ${searchResponse.matches?.length || 0}`);
            return searchResponse.matches || [];

        } catch (error: any) {
            console.error('[VectorService - Búsqueda Global Error]:', error.message);
            return [];
        }
    }
}