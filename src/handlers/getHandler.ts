import { Handler } from '../types';
import { AnthropicHandler } from './anthropic';
import { CohereHandler } from './cohere';
import { OllamaHandler } from './ollama';
import { OpenAIHandler } from './openai';

const MODEL_HANDLER_MAPPINGS: Record<string, Handler> = {
  'claude-2': AnthropicHandler,
  'gpt-': OpenAIHandler,
  command: CohereHandler,
  'ollama/': OllamaHandler,
};

const PATTERNS = Object.keys(MODEL_HANDLER_MAPPINGS);

export function getHandler(model: string): Handler | null {
  const handlerKey = PATTERNS.find((pattern) => {
    const regex = new RegExp(`${pattern}`, 'g');
    return model.match(regex);
  });
  if (!handlerKey) {
    return null;
  }
  return MODEL_HANDLER_MAPPINGS[handlerKey];
}
