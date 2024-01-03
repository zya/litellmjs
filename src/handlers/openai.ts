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
            function_call: openAIChoice.delta.function_call,
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
  const {
    apiKey: providedApiKey,
    baseUrl: providedBaseUrl,
    ...completionsParams
  } = params;
  const apiKey = providedApiKey ?? process.env.OPENAI_API_KEY;
  const baseUrl = providedBaseUrl ?? 'https://api.openai.com/v1';

  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: baseUrl,
  });

  if (params.stream) {
    const response = await openai.chat.completions.create({
      ...completionsParams,
      stream: params.stream,
    });
    return toStreamingResponse(response);
  }

  return openai.chat.completions.create({
    ...completionsParams,
    stream: false,
  });
}
