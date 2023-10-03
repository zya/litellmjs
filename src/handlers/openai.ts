import OpenAI from 'openai';

import {
  HandlerParams,
  HandlerParamsNotStreaming,
  ResultStreaming,
  ResultNotStreaming,
  HandlerParamsStreaming,
} from '../types';

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
  return openai.chat.completions.create(params);
}
