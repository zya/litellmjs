import { CreateEmbeddingResponse } from 'openai/resources/embeddings';
import { EmbeddingParams, EmbeddingResponse } from '../embedding';

async function getMistralResponse(
  model: string,
  input: EmbeddingParams['input'],
  baseUrl: string,
  api_key: string,
): Promise<Response> {
  return fetch(`${baseUrl}/v1/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${api_key}`,
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
  const api_key = params.api_key ?? process.env.MISTRAL_API_KEY!;
  const response = await getMistralResponse(
    model,
    params.input,
    baseUrl,
    api_key,
  );

  if (!response.ok) {
    throw new Error(
      `Recieved an error with code ${response.status} from Mistral API.`,
    );
  }
  const body = (await response.json()) as CreateEmbeddingResponse;
  return body;
}
