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
import { toUsage } from '../utils/toUsage';

interface OllamaResponseChunk {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

function toStreamingChunk(
  ollamaResponse: OllamaResponseChunk,
  model: string,
  prompt: string,
): StreamingChunk {
  return {
    model: model,
    created: getUnixTimestamp(),
    usage: toUsage(prompt, ollamaResponse.response),
    choices: [
      {
        delta: { content: ollamaResponse.response, role: 'assistant' },
        finish_reason: 'stop',
        index: 0,
      },
    ],
  };
}

function toResponse(
  content: string,
  model: string,
  prompt: string,
): ResultNotStreaming {
  return {
    model: model,
    created: getUnixTimestamp(),
    usage: toUsage(prompt, content),
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
  prompt: string,
): AsyncIterable<StreamingChunk> {
  const reader = response.body?.getReader();
  let done = false;

  while (!done) {
    const next = await reader?.read();
    if (next?.value) {
      const decoded = new TextDecoder().decode(next.value);
      done = next.done;
      const lines = decoded.split(/(?<!\\)\n/);
      const ollamaResponses = lines
        .map((line) => line.trim())
        .filter((line) => line !== '')
        .map((line) => JSON.parse(line) as OllamaResponseChunk)
        .map((response) => toStreamingChunk(response, model, prompt));

      yield* ollamaResponses;
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
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt,
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

  if (!res.ok) {
    throw new Error(
      `Received an error with code ${res.status} from Ollama API.`,
    );
  }

  if (params.stream) {
    return iterateResponse(res, model, prompt);
  }

  const chunks: StreamingChunk[] = [];

  for await (const chunk of iterateResponse(res, model, prompt)) {
    chunks.push(chunk);
  }

  const message = chunks.reduce((acc: string, chunk: StreamingChunk) => {
    return (acc += chunk.choices[0].delta.content);
  }, '');

  return toResponse(message, model, prompt);
}
