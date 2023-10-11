import { ConsistentResponseUsage } from '../types';
import { encoderCl100K } from './encoders';

export function toUsage(
  prompt: string,
  completion: string | undefined,
): ConsistentResponseUsage | undefined {
  if (!completion) {
    return undefined;
  }

  const promptTokens = encoderCl100K.encode(prompt);
  const completionTokens = encoderCl100K.encode(completion);
  return {
    prompt_tokens: promptTokens.length,
    completion_tokens: completionTokens.length,
    total_tokens: promptTokens.concat(completionTokens).length,
  };
}
