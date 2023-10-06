import Anthropic from '@anthropic-ai/sdk';
const anthropic = new Anthropic();

import {
  HandlerParams,
  HandlerParamsNotStreaming,
  ResultStreaming,
  ResultNotStreaming,
  HandlerParamsStreaming,
  StreamingChunk,
  Message,
} from '../types';
import { combinePrompts } from '../utils/combinePrompts';

function toAnthropicPrompt(messages: Message[]): string {
  const textsCombined = combinePrompts(messages);
  return `${Anthropic.HUMAN_PROMPT} ${textsCombined}${Anthropic.AI_PROMPT}`;
}

function toResponse(
  anthropicResponse: Anthropic.Completion,
): ResultNotStreaming {
  return {
    id: '',
    choices: [
      {
        message: {
          content: anthropicResponse.completion,
          role: 'assistant',
        },
        finish_reason: 'stop',
        index: 0,
      },
    ],
  };
}

function toStreamingChunk(
  anthropicResponse: Anthropic.Completion,
): StreamingChunk {
  return {
    id: '',
    choices: [
      {
        delta: { content: anthropicResponse.completion },
        finish_reason: 'stop',
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

  return toResponse(completion);
}
