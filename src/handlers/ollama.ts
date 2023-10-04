import {
  HandlerParams,
  HandlerParamsNotStreaming,
  HandlerParamsStreaming,
  Message,
  ResultNotStreaming,
  ResultStreaming,
  StreamingChunk,
} from '../types';

interface OllamaResponseChunk {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

function toStreamingChunk(ollamaResponse: OllamaResponseChunk): StreamingChunk {
  return {
    id: '',
    choices: [
      {
        delta: { content: ollamaResponse.response },
        finish_reason: 'stop',
        index: 0,
      },
    ],
  };
}

function toResponse(content: string): ResultNotStreaming {
  return {
    choices: [
      {
        message: { content, role: 'assistant' },
        finish_reason: 'stop',
        index: 0,
      },
    ],
    id: '',
  };
}

async function* iterateResponse(
  response: Response,
): AsyncIterable<StreamingChunk> {
  const reader = response.body?.getReader();
  let done = false;

  while (!done) {
    const next = await reader?.read();
    if (next?.value) {
      const decoded = new TextDecoder().decode(next.value);
      done = next.done;
      const ollamaResponse = JSON.parse(decoded) as OllamaResponseChunk;
      yield toStreamingChunk(ollamaResponse);
    } else {
      done = true;
    }
  }
}

function combineMessagesToPromit(messages: Message[]): string {
  return messages.reduce((acc: string, message: Message) => {
    // TODO: Distinguish between the different role types
    return (acc += message.content);
  }, '');
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
  const prompt = combineMessagesToPromit(params.messages);

  const res = await getOllamaResponse(model, prompt, baseUrl);

  if (params.stream) {
    return iterateResponse(res);
  }

  const chunks: StreamingChunk[] = [];

  for await (const chunk of iterateResponse(res)) {
    chunks.push(chunk);
  }

  const message = chunks.reduce((acc: string, chunk: StreamingChunk) => {
    return (acc += chunk.choices[0].delta.content);
  }, '');

  return toResponse(message);
}
