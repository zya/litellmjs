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

async function getDeepInfraResponse(
  model: string,
  messages: Message[],
  baseUrl: string,
  apiKey: string,
  stream: boolean,
): Promise<Response> {
  return fetch(`${baseUrl}/v1/openai/chat/completions`, {
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

export async function DeepInfraHandler(
  params: HandlerParamsNotStreaming,
): Promise<ResultNotStreaming>;

export async function DeepInfraHandler(
  params: HandlerParamsStreaming,
): Promise<ResultStreaming>;

export async function DeepInfraHandler(
  params: HandlerParams,
): Promise<ResultNotStreaming | ResultStreaming>;

export async function DeepInfraHandler(
  params: HandlerParams,
): Promise<ResultNotStreaming | ResultStreaming> {
  const baseUrl = params.baseUrl ?? 'https://api.deepinfra.com';
  const apiKey = params.apiKey ?? process.env.DEEPINFRA_API_KEY!;
  const model = params.model.split('deepinfra/')[1];

  const res = await getDeepInfraResponse(
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
