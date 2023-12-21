import {
  ConsistentResponseUsage,
  FinishReason,
  HandlerParams,
  HandlerParamsNotStreaming,
  HandlerParamsStreaming,
  ResultNotStreaming,
  ResultStreaming,
  Role,
  StreamingChunk,
} from '../types';
import { combinePrompts } from '../utils/combinePrompts';
import { getUnixTimestamp } from '../utils/getUnixTimestamp';

const FINISH_REASON_MAP: Record<string, FinishReason> = {
  length: 'length',
  endoftext: 'stop',
};

interface AI21GeneratedToken {
  generatedToken: {
    token: string;
    logprob: number;
    raw_logprob: number;
  };
}

interface AI21Response {
  id: string;
  prompt: {
    text: string;
    tokens: AI21GeneratedToken[];
  };
  completions: {
    finishReason: {
      reason: string;
    };
    data: {
      text: string;
      tokens: AI21GeneratedToken[];
    };
  }[];
}

function toUsage(response: AI21Response): ConsistentResponseUsage {
  const promptTokens = response.prompt.tokens.length;
  const completionTokens = response.completions.reduce((acc, completion) => {
    return acc + completion.data.tokens.length;
  }, 0);
  return {
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: promptTokens + completionTokens,
  };
}

// eslint-disable-next-line @typescript-eslint/require-await
async function* toStream(
  response: AI21Response,
  model: string,
): AsyncIterable<StreamingChunk> {
  yield {
    model: model,
    created: getUnixTimestamp(),
    usage: toUsage(response),
    choices: [
      {
        delta: {
          content: response.completions[0].data.text,
          role: 'assistant',
        },
        finish_reason:
          FINISH_REASON_MAP[response.completions[0].finishReason.reason] ??
          'stop',
        index: 0,
      },
    ],
  };
}

function toResponse(response: AI21Response, model: string): ResultNotStreaming {
  const choices = response.completions.map((completion, i) => {
    return {
      finish_reason:
        FINISH_REASON_MAP[completion.finishReason.reason] ?? 'stop',
      index: i,
      message: {
        content: completion.data.text,
        role: 'assistant' as Role,
      },
    };
  });
  return {
    model: model,
    created: getUnixTimestamp(),
    usage: toUsage(response),
    choices: choices,
  };
}

async function getAI21Response(
  model: string,
  prompt: string,
  baseUrl: string,
  apiKey: string,
): Promise<Response> {
  return fetch(`${baseUrl}/studio/v1/${model}/complete`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      prompt,
    }),
  });
}

export async function AI21Handler(
  params: HandlerParamsNotStreaming,
): Promise<ResultNotStreaming>;

export async function AI21Handler(
  params: HandlerParamsStreaming,
): Promise<ResultStreaming>;

export async function AI21Handler(
  params: HandlerParams,
): Promise<ResultNotStreaming | ResultStreaming>;

export async function AI21Handler(
  params: HandlerParams,
): Promise<ResultNotStreaming | ResultStreaming> {
  const baseUrl = params.baseUrl ?? 'https://api.ai21.com';
  const apiKey = params.apiKey ?? process.env.AI21_API_KEY!;
  const model = params.model;
  const prompt = combinePrompts(params.messages);

  const res = await getAI21Response(model, prompt, baseUrl, apiKey);

  if (!res.ok) {
    throw new Error(`Received an error with code ${res.status} from AI21 API.`);
  }

  const body = (await res.json()) as AI21Response;

  if (params.stream) {
    return toStream(body, model);
  }

  return toResponse(body, model);
}
