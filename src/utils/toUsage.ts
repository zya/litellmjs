import { EmbeddingResponse } from '../embedding';
import { ConsistentResponseUsage } from '../types';
import { encoderCl100K } from './encoders';

export function countTokens(text: string): number {
  return encoderCl100K.encode(text).length;
}

export function toUsage(
  prompt: string,
  completion: string | undefined,
): ConsistentResponseUsage | undefined {
  if (!completion) {
    return undefined;
  }

  const promptTokens = countTokens(prompt);
  const completionTokens = countTokens(completion);
  return {
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: promptTokens + completionTokens,
  };
}

export function toEmbeddingUsage(prompt: string): EmbeddingResponse['usage'] {
  const promptTokens = encoderCl100K.encode(prompt);
  return {
    prompt_tokens: promptTokens.length,
    total_tokens: promptTokens.length,
  };
}
