import { EmbeddingParams, EmbeddingResponse } from '../embedding';
import { toEmbeddingUsage } from '../utils/toUsage';

interface OllamaEmbeddingsResponseChunk {
  embedding: number[];
}

async function getOllamaResponse(
  model: string,
  prompt: string,
  baseUrl: string,
): Promise<Response> {
  return fetch(`${baseUrl}/api/embeddings`, {
    method: 'POST',

    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  });
}

export async function OllamaEmbeddingHandler(
  params: EmbeddingParams,
): Promise<EmbeddingResponse> {
  const model = params.model.split('ollama/')[1];
  const baseUrl = params.baseUrl ?? 'http://127.0.0.1:11434';
  const response = await getOllamaResponse(model, params.input, baseUrl);
  const body = (await response.json()) as OllamaEmbeddingsResponseChunk;

  return {
    data: [{ embedding: body.embedding, index: 0 }],
    model: model,
    usage: toEmbeddingUsage(params.input),
  };
}
