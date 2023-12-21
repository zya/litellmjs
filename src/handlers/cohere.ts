import cohere from 'cohere-ai';

import {
  HandlerParams,
  HandlerParamsNotStreaming,
  ResultStreaming,
  ResultNotStreaming,
  HandlerParamsStreaming,
  StreamingChunk,
} from '../types';
import { cohereResponse, generateResponse } from 'cohere-ai/dist/models';
import { combinePrompts } from '../utils/combinePrompts';
import { getUnixTimestamp } from '../utils/getUnixTimestamp';
import { toUsage } from '../utils/toUsage';

// eslint-disable-next-line @typescript-eslint/require-await
async function* toStream(
  response: cohereResponse<generateResponse>,
  model: string,
  prompt: string,
): AsyncIterable<StreamingChunk> {
  yield {
    model: model,
    created: getUnixTimestamp(),
    usage: toUsage(prompt, response.body.generations[0].text),
    choices: [
      {
        delta: {
          content: response.body.generations[0].text,
          role: 'assistant',
        },
        finish_reason: 'stop',
        index: 0,
      },
    ],
  };
}

export async function CohereHandler(
  params: HandlerParamsNotStreaming,
): Promise<ResultNotStreaming>;

export async function CohereHandler(
  params: HandlerParamsStreaming,
): Promise<ResultStreaming>;

export async function CohereHandler(
  params: HandlerParams,
): Promise<ResultNotStreaming | ResultStreaming>;

export async function CohereHandler(
  params: HandlerParams,
): Promise<ResultNotStreaming | ResultStreaming> {
  const apiKey = params.apiKey ?? process.env.COHERE_API_KEY!;

  cohere.init(apiKey);
  const textsCombined = combinePrompts(params.messages);

  const config = {
    model: params.model,
    prompt: textsCombined,
    max_tokens: 50,
    temperature: 1,
  };

  const response = await cohere.generate(config);

  if (params.stream) {
    return toStream(response, params.model, textsCombined);
  }

  return {
    model: params.model,
    created: getUnixTimestamp(),
    usage: toUsage(textsCombined, response.body.generations[0].text),
    choices: [
      {
        message: {
          content: response.body.generations[0].text,
          role: 'assistant',
        },
        finish_reason: 'stop',
        index: 0,
      },
    ],
  };
}
