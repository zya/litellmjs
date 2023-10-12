import { completion, embedding } from '../src';
import { ResultStreaming } from '../src/types';

const TIMEOUT = 30000;
const PROMPT = 'How are you today?';
const MODELS = [
  {
    model: 'gpt-3.5-turbo',
  },
  {
    model: 'ollama/llama2',
  },
  {
    model: 'command-nightly',
  },
];

const EMBEDDING_MODELS = [
  {
    model: 'text-embedding-ada-002',
  },
  {
    model: 'ollama/llama2',
  },
];

/**
 * @group e2e
 */
describe('e2e', () => {
  describe('completion', () => {
    it.each(MODELS)(
      'gets response from supported model $model',
      async ({ model }) => {
        const result = await completion({
          model,
          messages: [{ role: 'user', content: PROMPT }],
          stream: false,
        });
        expect(result).toBeTruthy();
        expect(result);
      },
      TIMEOUT,
    );

    it.each(MODELS)(
      'gets streaming response from supported model $model',
      async ({ model }) => {
        const result: ResultStreaming = await completion({
          model,
          messages: [{ role: 'user', content: PROMPT }],
          stream: true,
        });

        for await (const chunk of result) {
          expect(chunk.choices[0].delta.content).not.toBeNull();
        }
      },
      TIMEOUT,
    );
  });

  describe('embedding', () => {
    it.each(EMBEDDING_MODELS)(
      'returns embedding models for $model',
      async ({ model }) => {
        const result = await embedding({
          model,
          input: PROMPT,
        });

        expect(result.data.length).toBeGreaterThan(0);
      },
      TIMEOUT,
    );
  });
});
