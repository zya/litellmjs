import { CreateEmbeddingResponse } from 'openai/resources/embeddings';
import { EmbeddingParams, EmbeddingResponse } from '../embedding';

async function getMistralResponse(
  model: string,
  input: EmbeddingParams['input'],
  baseUrl: string,
  apiKey: string,
): Promise<Response> {
  return fetch(`${baseUrl}/v1/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: typeof input === 'string' ? [input] : input,
    }),
  });
}

export async function MistralEmbeddingHandler(
  params: EmbeddingParams,
): Promise<EmbeddingResponse> {
  const model = params.model.split('mistral/')[1];
  const baseUrl = params.baseUrl ?? 'https://api.mistral.ai';
  const apiKey = params.apiKey ?? process.env.MISTRAL_API_KEY!;
  const response = await getMistralResponse(
    model,
    params.input,
    baseUrl,
    apiKey,
  );

  if (!response.ok) {
    throw new Error(
      `Received an error with code ${response.status} from Mistral API.`,
    );
  }
  const body = (await response.json()) as CreateEmbeddingResponse;
  return body;
}
