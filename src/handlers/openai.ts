import OpenAI from 'openai';

import {
  HandlerParams,
  HandlerParamsNotStreaming,
  ResultStreaming,
  ResultNotStreaming,
  HandlerParamsStreaming,
} from '../types';

async function* toStreamingResponse(
  response: AsyncIterable<OpenAI.Chat.ChatCompletionChunk>,
): ResultStreaming {
  for await (const chunk of response) {
    yield {
      model: chunk.model,
      created: chunk.created,
      choices: chunk.choices.map((openAIChoice) => {
        return {
          delta: {
            content: openAIChoice.delta.content,
            role: openAIChoice.delta.role,
          },
          index: openAIChoice.index,
          finish_reason: openAIChoice.finish_reason,
        };
      }),
    };
  }
}

export async function OpenAIHandler(
  params: HandlerParamsNotStreaming,
): Promise<ResultNotStreaming>;

export async function OpenAIHandler(
  params: HandlerParamsStreaming,
): Promise<ResultStreaming>;

export async function OpenAIHandler(
  params: HandlerParams,
): Promise<ResultNotStreaming | ResultStreaming>;

export async function OpenAIHandler(
  params: HandlerParams,
): Promise<ResultNotStreaming | ResultStreaming> {
  const openai = new OpenAI();

  if (params.stream) {
    const response = await openai.chat.completions.create({
      ...params,
      stream: params.stream,
    });
    return toStreamingResponse(response);
  }

  return openai.chat.completions.create({ ...params, stream: false });
}
