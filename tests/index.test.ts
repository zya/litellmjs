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

jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => {
    return {
      completions: {
        create: mockCreate,
      },
    };
  });
});

import Anthropic from '@anthropic-ai/sdk';
import { completion } from '../src';
import { HandlerParams, ResultNotStreaming } from '../src/types';

describe('litellm', () => {
  describe('openai', () => {
    it.each([
      { model: 'gpt-3.5-turbo', stream: true },
      { model: 'gpt-4-32k-0613', stream: false },
    ])(
      'support using openai chat models with and without streaming',
      async ({ model, stream }) => {
        const params = { model: model, messages: [], stream };
        await completion(params);
        expect(mockCreate).toHaveBeenCalledWith(params);
      },
    );
  });

  describe('anthropic', () => {
    it('supports using anthropic models without streaming', async () => {
      const params: HandlerParams = {
        model: 'claude-2',
        messages: [
          {
            content: 'How are you',
            role: 'user',
          },
        ],
        stream: false,
      };
      const expectedPrompt = `${Anthropic.HUMAN_PROMPT} ${params.messages[0].content}${Anthropic.AI_PROMPT}`;
      mockCreate.mockResolvedValueOnce({
        completion: 'response text',
      });
      const result = await completion(params);
      const expectedParams = {
        model: 'claude-2',
        prompt: expectedPrompt,
      };
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining(expectedParams),
      );
      expect(result).toMatchObject({
        choices: [
          {
            message: {
              content: 'response text',
            },
          },
        ],
      });
    });
  });
});
