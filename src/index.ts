import { OpenAIHandler } from './handlers/openai';
import { Handler, HandlerParams, ModelName, Result } from './types';

const MODEL_HANDLER_MAPPINGS: Record<ModelName, Handler> = {
  'gpt-3.5-turbo': OpenAIHandler,
  'gpt-3.5-turbo-0301': OpenAIHandler,
  'gpt-3.5-turbo-0613': OpenAIHandler,
  'gpt-3.5-turbo-16k': OpenAIHandler,
  'gpt-3.5-turbo-16k-0613': OpenAIHandler,
  'gpt-4': OpenAIHandler,
  'gpt-4-0314': OpenAIHandler,
  'gpt-4-0613': OpenAIHandler,
  'gpt-4-32k': OpenAIHandler,
  'gpt-4-32k-0314': OpenAIHandler,
  'gpt-4-32k-0613': OpenAIHandler,
};

export async function completion(params: HandlerParams): Promise<Result> {
  const handler = MODEL_HANDLER_MAPPINGS[params.model];
  return handler(params);
}
