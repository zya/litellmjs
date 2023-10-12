import { MODEL_HANDLER_MAPPINGS } from '../../src/completion';
import { AnthropicHandler } from '../../src/handlers/anthropic';
import { CohereHandler } from '../../src/handlers/cohere';
import { getHandler } from '../../src/handlers/getHandler';
import { OllamaHandler } from '../../src/handlers/ollama';
import { OpenAIHandler } from '../../src/handlers/openai';

describe('getHandler', () => {
  it.each([
    { model: 'claude-2', expectedHandler: AnthropicHandler },
    { model: 'gpt-3.5-turbo', expectedHandler: OpenAIHandler },
    { model: 'ollama/llama2', expectedHandler: OllamaHandler },
    { model: 'command-nightly', expectedHandler: CohereHandler },
    { model: 'unknown', expectedHandler: null },
  ])(
    'should return the correct handler for a given model name',
    ({ model, expectedHandler }) => {
      const handler = getHandler(model, MODEL_HANDLER_MAPPINGS);
      expect(handler).toBe(expectedHandler);
    },
  );
});
