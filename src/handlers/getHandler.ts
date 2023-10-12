import { EmbeddingHandler, Handler } from '../types';

export function getHandler(
  model: string,
  mapping: Record<string, EmbeddingHandler>,
): EmbeddingHandler | null;

export function getHandler(
  model: string,
  mapping: Record<string, Handler>,
): Handler | null;

export function getHandler(
  model: string,
  mapping: Record<string, Handler> | Record<string, EmbeddingHandler>,
): Handler | EmbeddingHandler | null;

export function getHandler(
  model: string,
  mapping: Record<string, Handler> | Record<string, EmbeddingHandler>,
): Handler | EmbeddingHandler | null {
  const patterns = Object.keys(mapping);
  const handlerKey = patterns.find((pattern) => {
    const regex = new RegExp(`${pattern}`, 'g');
    return model.match(regex);
  });
  if (!handlerKey) {
    return null;
  }
  return mapping[handlerKey];
}
