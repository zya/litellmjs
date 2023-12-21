import { ChatCompletion } from 'openai/resources/chat';

import {
  HandlerParams,
  HandlerParamsNotStreaming,
  HandlerParamsStreaming,
  Message,
  ResultNotStreaming,
  ResultStreaming,
  StreamingChunk,
} from '../types';

async function* iterateResponse(
  response: Response,
): AsyncIterable<StreamingChunk> {
  const reader = response.body?.getReader();
  let done = false;

  while (!done) {
    const next = await reader?.read();
    if (next?.value) {
      done = next.done;
      const decoded = new TextDecoder().decode(next.value);
      if (decoded.startsWith('data: [DONE]')) {
        done = true;
      } else {
        const [, value] = decoded.split('data: ');
        yield JSON.parse(value);
      }
    } else {
      done = true;
    }
  }
}

async function getMistralResponse(
  model: string,
  messages: Message[],
  baseUrl: string,
  apiKey: string,
  stream: boolean,
): Promise<Response> {
  return fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      messages,
      model,
      stream,
    }),
  });
}

export async function MistralHandler(
  params: HandlerParamsNotStreaming,
): Promise<ResultNotStreaming>;

export async function MistralHandler(
  params: HandlerParamsStreaming,
): Promise<ResultStreaming>;

export async function MistralHandler(
  params: HandlerParams,
): Promise<ResultNotStreaming | ResultStreaming>;

export async function MistralHandler(
  params: HandlerParams,
): Promise<ResultNotStreaming | ResultStreaming> {
  const baseUrl = params.baseUrl ?? 'https://api.mistral.ai';
  const apiKey = params.apiKey ?? process.env.MISTRAL_API_KEY!;
  const model = params.model.split('mistral/')[1];

  const res = await getMistralResponse(
    model,
    params.messages,
    baseUrl,
    apiKey,
    params.stream ?? false,
  );

  if (params.stream) {
    return iterateResponse(res);
  }

  return res.json() as Promise<ChatCompletion>;
}
