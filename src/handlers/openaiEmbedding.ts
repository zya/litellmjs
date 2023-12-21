import OpenAI from 'openai';
import { EmbeddingParams, EmbeddingResponse } from '../embedding';

export async function OpenAIEmbeddingHandler(
  params: EmbeddingParams,
): Promise<EmbeddingResponse> {
  const api_key = params.api_key ?? process.env.OPENAI_API_KEY;

  const openai = new OpenAI({
    apiKey: apiKey,
  });
  return openai.embeddings.create({ input: params.input, model: params.model });
}
