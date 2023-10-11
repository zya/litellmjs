import { completion } from '../src';
import { ResultStreaming } from '../src/types';

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
/**
 * Admin dashboard tests
 *
 * @group e2e
 */
describe('e2e', () => {
  it.each(MODELS)(
    'gets response from supported model $model',
    async ({ model }) => {
      jest.setTimeout(10000);
      const result = await completion({
        model,
        messages: [{ role: 'user', content: PROMPT }],
        stream: false,
      });
      expect(result).toBeTruthy();
      expect(result);
    },
  );

  it.each(MODELS)(
    'gets streaming response from supported model $model',
    async ({ model }) => {
      jest.setTimeout(10000);
      const result: ResultStreaming = await completion({
        model,
        messages: [{ role: 'user', content: PROMPT }],
        stream: true,
      });

      for await (const chunk of result) {
        expect(chunk.choices[0].delta.content).not.toBeNull();
      }
    },
  );
});
