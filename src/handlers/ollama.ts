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

function evaluateJsonString(input: string): { remainingText: string; objects: OllamaResponseChunk[] } {
  let stack = [];
  let objects = [];
  let remainingText = input;
  let inString = false;
  let currentStringDelimiter = null;

  for (let i = 0; i < input.length; i++) {
      const char = input[i];

      // Handle string opening/closing
      if ((char === '"' || char === "'" || char === "`") && (i === 0 || input[i - 1] !== '\\')) {
          if (!inString) {
              inString = true;
              currentStringDelimiter = char;
          } else if (currentStringDelimiter === char) {
              inString = false;
              currentStringDelimiter = null;
          }
      }

      // Handle object opening
      if (!inString && char === '{') {
          stack.push(i);
      }

      // Handle object closing
      if (!inString && char === '}') {
          let startIdx = stack.pop();
          if (stack.length === 0) { // We've closed an object
              let jsonString = input.slice(startIdx, i + 1);
              try {
                  objects.push(JSON.parse(jsonString));
                  remainingText = remainingText.replace(jsonString, '');
              } catch (e) {
                  console.error('Invalid JSON object found:', e);
              }
          }
      }
  }

  // Trim the remainingText to remove any leading/trailing whitespace or commas
  remainingText = remainingText.trim().replace(/^,|,$/g, '');

  return { remainingText, objects };
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

  let buffer = "";
  while (!done) {
    const next = await reader?.read();
    if (next?.value) {
      const decoded = new TextDecoder().decode(next.value);
      done = next.done;
      buffer += decoded;
      const { remainingText, objects } = evaluateJsonString(buffer);      
      if(objects.length == 0) continue;
      buffer = remainingText;
      for (let index = 0; index < objects.length; index++) {
        yield toStreamingChunk(objects[index], model, prompt);
      }
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
      `Recieved an error with code ${res.status} from Ollama API.`,
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
