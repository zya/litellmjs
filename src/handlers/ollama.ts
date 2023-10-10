import {
  HandlerParams,
  HandlerParamsNotStreaming,
  HandlerParamsStreaming,
  ResultNotStreaming,
  ResultStreaming,
  StreamingChunk,
} from '../types';
import { combinePrompts } from '../utils/combinePrompts';
import { getUnixTimestamp } from '../utils/getUnixTimestamp';

interface OllamaResponseChunk {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

function toStreamingChunk(
  ollamaResponse: OllamaResponseChunk,
  model: string,
): StreamingChunk {
  return {
    model: model,
    created: getUnixTimestamp(),
    choices: [
      {
        delta: { content: ollamaResponse.response, role: 'assistant' },
        finish_reason: 'stop',
        index: 0,
      },
    ],
  };
}

function toResponse(content: string, model: string): ResultNotStreaming {
  return {
    model: model,
    created: getUnixTimestamp(),
    choices: [
      {
        message: { content, role: 'assistant' },
        finish_reason: 'stop',
        index: 0,
      },
    ],
  };
}

async function* iterateResponse(
  response: Response,
  model: string,
): AsyncIterable<StreamingChunk> {
  const reader = response.body?.getReader();
  let done = false;

  while (!done) {
    const next = await reader?.read();
    if (next?.value) {
      const decoded = new TextDecoder().decode(next.value);
      done = next.done;
      const ollamaResponse = JSON.parse(decoded) as OllamaResponseChunk;
      yield toStreamingChunk(ollamaResponse, model);
    } else {
      done = true;
    }
  }
}

async function getOllamaResponse(
  model: string,
  prompt: string,
  baseUrl: string,
): Promise<Response> {
  return fetch(`${baseUrl}/api/generate`, {
    method: 'POST',

    body: JSON.stringify({
      model,
      prompt,
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  });
}

export async function OllamaHandler(
  params: HandlerParamsNotStreaming,
): Promise<ResultNotStreaming>;

export async function OllamaHandler(
  params: HandlerParamsStreaming,
): Promise<ResultStreaming>;

export async function OllamaHandler(
  params: HandlerParams,
): Promise<ResultNotStreaming | ResultStreaming>;

export async function OllamaHandler(
  params: HandlerParams,
): Promise<ResultNotStreaming | ResultStreaming> {
  const baseUrl = params.baseUrl ?? 'http://127.0.0.1:11434';
  const model = params.model.split('ollama/')[1];
  const prompt = combinePrompts(params.messages);

  const res = await getOllamaResponse(model, prompt, baseUrl);

  if (params.stream) {
    return iterateResponse(res, model);
  }

  const chunks: StreamingChunk[] = [];

  for await (const chunk of iterateResponse(res, model)) {
    chunks.push(chunk);
  }

  const message = chunks.reduce((acc: string, chunk: StreamingChunk) => {
    return (acc += chunk.choices[0].delta.content);
  }, '');

  return toResponse(message, model);
}
