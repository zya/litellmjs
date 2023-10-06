import OpenAI from 'openai';

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string | null;
}

export type ResultNotStreaming = Pick<
  OpenAI.Chat.ChatCompletion,
  'choices' | 'id'
>;

export type StreamingChunk = Pick<
  OpenAI.Chat.ChatCompletionChunk,
  'choices' | 'id'
>;

export type ResultStreaming = AsyncIterable<StreamingChunk>;

export type Result = ResultNotStreaming | ResultStreaming;

export interface HandlerParamsBase {
  model: string;
  messages: Message[];
  stream?: boolean | null;
  baseUrl?: string;
}

export interface HandlerParamsStreaming extends HandlerParamsBase {
  stream?: true;
}

export interface HandlerParamsNotStreaming extends HandlerParamsBase {
  stream?: false;
}

export type HandlerParams = HandlerParamsStreaming | HandlerParamsNotStreaming;

export type Handler = (params: HandlerParams) => Promise<Result>;
