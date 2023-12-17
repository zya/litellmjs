import { completion, embedding } from '../src';
import { ResultStreaming } from '../src/types';

const TIMEOUT = 30000;
const PROMPT = 'How are you today?';

/**
 * @group e2e
 */
describe('e2e', () => {
  describe('completion', () => {
    it.each`
      model
      ${'gpt-3.5-turbo'}
      ${'ollama/llama2'}
      ${'command-nightly'}
      ${'j2-light'}
      ${'replicate/meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3'}
      ${'deepinfra/mistralai/Mistral-7B-Instruct-v0.1'}
      ${'mistral/mistral-tiny'}
    `(
      'gets response from supported model $model',
      async ({ model }) => {
        const result = await completion({
          model: model as string,
          messages: [{ role: 'user', content: PROMPT }],
          stream: false,
        });
        expect(result).toBeTruthy();
        expect(result);
      },
      TIMEOUT,
    );

    it.each`
      model
      ${'gpt-3.5-turbo'}
      ${'ollama/llama2'}
      ${'command-nightly'}
      ${'j2-light'}
      ${'replicate/meta/llama-2-7b-chat:ac944f2e49c55c7e965fc3d93ad9a7d9d947866d6793fb849dd6b4747d0c061c'}
      ${'deepinfra/mistralai/Mistral-7B-Instruct-v0.1'}
      ${'mistral/mistral-tiny'}
    `(
      'gets streaming response from supported model $model',
      async ({ model }) => {
        const result: ResultStreaming = await completion({
          model: model as string,
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
    it.each`
      model
      ${'text-embedding-ada-002'}
      ${'ollama/llama2'}
      ${'mistral/mistral-embed'}
    `(
      'returns embedding models for $model',
      async ({ model }) => {
        const result = await embedding({
          model: model as string,
          input: PROMPT,
        });

        expect(result.data.length).toBeGreaterThan(0);
      },
      TIMEOUT,
    );
  });
});
