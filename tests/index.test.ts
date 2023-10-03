import { completion } from '../src';
import { ModelName } from '../src/types';

const mockCreate = jest.fn();
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    };
  });
});

describe('litellm', () => {
  it.each([
    { model: 'gpt-3.5-turbo', stream: true },
    { model: 'gpt-4-32k-0613', stream: false },
  ])(
    'support using openai chat models with and without streaming',
    async ({ model, stream }) => {
      const params = { model: model as ModelName, messages: [], stream };
      await completion(params);
      expect(mockCreate).toHaveBeenCalledWith(params);
    },
  );
});
