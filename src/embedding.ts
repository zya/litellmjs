import { CompletionUsage } from 'openai/resources';
import { getHandler } from './handlers/getHandler';
import { EmbeddingHandler } from './types';
import { OpenAIEmbeddingHandler } from './handlers/openaiEmbedding';
import { OllamaEmbeddingHandler } from './handlers/ollamaEmbedding';
import { MistralEmbeddingHandler } from './handlers/mistralEmbedding';

export interface EmbeddingParams {
  input: string | string[];
  model: string;
  apiKey?: string;
  baseUrl?: string;
}

export interface EmbeddingObject {
  embedding: number[];
  index: number;
}

export interface EmbeddingResponse {
  usage?: Pick<CompletionUsage, 'prompt_tokens' | 'total_tokens'>;
  model: string;
  data: EmbeddingObject[];
}

const EMBEDDING_MODEL_HANDLER_MAPPINGS: Record<string, EmbeddingHandler> = {
  'text-embedding-': OpenAIEmbeddingHandler,
  'ollama/': OllamaEmbeddingHandler,
  'mistral/': MistralEmbeddingHandler,
};

export async function embedding(
  params: EmbeddingParams,
): Promise<EmbeddingResponse> {
  const handler = getHandler(params.model, EMBEDDING_MODEL_HANDLER_MAPPINGS);

  if (!handler) {
    throw new Error(
      `Model: ${params.model} not supported. Cannot find a handler.`,
    );
  }

  return handler(params);
}
