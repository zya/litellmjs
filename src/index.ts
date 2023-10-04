import { OllamaHandler } from './handlers/ollama';
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
  'ollama/llama2': OllamaHandler,
  'ollama/llama2:13b': OllamaHandler,
  'ollama/llama2:70b': OllamaHandler,
  'ollama/llama2-uncensored': OllamaHandler,
  'ollama/orca-mini': OllamaHandler,
  'ollama/vicuna': OllamaHandler,
  'ollama/nous-hermes': OllamaHandler,
  'ollama/nous-hermes:13b': OllamaHandler,
  'ollama/wizard-vicuna': OllamaHandler,
  'ollama/codellama': OllamaHandler,
  'ollama/codellama:7b-instruct': OllamaHandler,
};

export async function completion(params: HandlerParams): Promise<Result> {
  const handler = MODEL_HANDLER_MAPPINGS[params.model];
  return handler(params);
}
