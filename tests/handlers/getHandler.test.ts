import { MODEL_HANDLER_MAPPINGS } from '../../src/completion';
import { AI21Handler } from '../../src/handlers/ai21';
import { AnthropicHandler } from '../../src/handlers/anthropic';
import { CohereHandler } from '../../src/handlers/cohere';
import { DeepInfraHandler } from '../../src/handlers/deepinfra';
import { getHandler } from '../../src/handlers/getHandler';
import { MistralHandler } from '../../src/handlers/mistral';
import { OllamaHandler } from '../../src/handlers/ollama';
import { OpenAIHandler } from '../../src/handlers/openai';
import { ReplicateHandler } from '../../src/handlers/replicate';

describe('getHandler', () => {
  it.each([
    { model: 'claude-2', expectedHandler: AnthropicHandler },
    { model: 'claude-instant-1', expectedHandler: AnthropicHandler },
    { model: 'gpt-3.5-turbo', expectedHandler: OpenAIHandler },
    { model: 'openai/test', expectedHandler: OpenAIHandler },
    { model: 'ollama/llama2', expectedHandler: OllamaHandler },
    { model: 'command-nightly', expectedHandler: CohereHandler },
    { model: 'j2-light', expectedHandler: AI21Handler },
    { model: 'j2-mid', expectedHandler: AI21Handler },
    { model: 'j2-ultra', expectedHandler: AI21Handler },
    { model: 'j2-grande-instruct', expectedHandler: AI21Handler },
    { model: 'j2-mid-instruct', expectedHandler: AI21Handler },
    { model: 'j2-ultra-instruct', expectedHandler: AI21Handler },
    { model: 'replicate/test/test', expectedHandler: ReplicateHandler },
    { model: 'deepinfra/test/test', expectedHandler: DeepInfraHandler },
    { model: 'mistral/mistral-tiny', expectedHandler: MistralHandler },
    { model: 'unknown', expectedHandler: null },
  ])(
    'should return the correct handler for a given model name',
    ({ model, expectedHandler }) => {
      const handler = getHandler(model, MODEL_HANDLER_MAPPINGS);
      expect(handler).toBe(expectedHandler);
    },
  );
});
