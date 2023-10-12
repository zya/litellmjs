import OpenAI from 'openai';
import { EmbeddingParams, EmbeddingResponse } from '../embedding';

export async function OpenAIEmbeddingHandler(
  params: EmbeddingParams,
): Promise<EmbeddingResponse> {
  const openai = new OpenAI();
  return openai.embeddings.create({ input: params.input, model: params.model });
}
