import { getHandler } from './handlers/getHandler';
import { HandlerParams, Result } from './types';

export async function completion(params: HandlerParams): Promise<Result> {
  const handler = getHandler(params.model);

  if (!handler) {
    throw new Error(
      `Model: ${params.model} not supported. Cannot find a handler.`,
    );
  }

  return handler(params);
}
