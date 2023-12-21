import Anthropic from '@anthropic-ai/sdk';

import {
  HandlerParams,
  HandlerParamsNotStreaming,
  ResultStreaming,
  ResultNotStreaming,
  HandlerParamsStreaming,
  StreamingChunk,
  Message,
  FinishReason,
} from '../types';
import { combinePrompts } from '../utils/combinePrompts';
import { getUnixTimestamp } from '../utils/getUnixTimestamp';
import { toUsage } from '../utils/toUsage';

function toAnthropicPrompt(messages: Message[]): string {
  const textsCombined = combinePrompts(messages);
  return `${Anthropic.HUMAN_PROMPT} ${textsCombined}${Anthropic.AI_PROMPT}`;
}

function toFinishReson(string: string): FinishReason {
  if (string === 'max_tokens') {
    return 'length';
  }

  return 'stop';
}

function toResponse(
  anthropicResponse: Anthropic.Completion,
  prompt: string,
): ResultNotStreaming {
  return {
    model: anthropicResponse.model,
    created: getUnixTimestamp(),
    usage: toUsage(prompt, anthropicResponse.completion),
    choices: [
      {
        message: {
          content: anthropicResponse.completion,
          role: 'assistant',
        },
        finish_reason: toFinishReson(anthropicResponse.stop_reason),
        index: 0,
      },
    ],
  };
}

function toStreamingChunk(
  anthropicResponse: Anthropic.Completion,
): StreamingChunk {
  return {
    model: anthropicResponse.model,
    created: getUnixTimestamp(),
    choices: [
      {
        delta: { content: anthropicResponse.completion, role: 'assistant' },
        finish_reason: toFinishReson(anthropicResponse.stop_reason),
        index: 0,
      },
    ],
  };
}

async function* toStreamingResponse(
  stream: AsyncIterable<Anthropic.Completion>,
): ResultStreaming {
  for await (const chunk of stream) {
    yield toStreamingChunk(chunk);
  }
}

export async function AnthropicHandler(
  params: HandlerParamsNotStreaming,
): Promise<ResultNotStreaming>;

export async function AnthropicHandler(
  params: HandlerParamsStreaming,
): Promise<ResultStreaming>;

export async function AnthropicHandler(
  params: HandlerParams,
): Promise<ResultNotStreaming | ResultStreaming>;

export async function AnthropicHandler(
  params: HandlerParams,
): Promise<ResultNotStreaming | ResultStreaming> {
  const apiKey = params.apiKey ?? process.env.ANTHROPIC_API_KEY;

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });
  const prompt = toAnthropicPrompt(params.messages);

  const anthropicParams = {
    model: params.model,
    max_tokens_to_sample: 300,
    prompt,
  };

  if (params.stream) {
    const completionStream = await anthropic.completions.create({
      ...anthropicParams,
      stream: params.stream,
    });
    return toStreamingResponse(completionStream);
  }

  const completion = await anthropic.completions.create(anthropicParams);

  return toResponse(completion, prompt);
}
