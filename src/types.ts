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

export type ModelName =
  | 'gpt-3.5-turbo'
  | 'gpt-3.5-turbo-0301'
  | 'gpt-3.5-turbo-0613'
  | 'gpt-3.5-turbo-16k'
  | 'gpt-3.5-turbo-16k-0613'
  | 'gpt-4'
  | 'gpt-4-0314'
  | 'gpt-4-0613'
  | 'gpt-4-32k'
  | 'gpt-4-32k-0314'
  | 'gpt-4-32k-0613'
  | 'ollama/llama2'
  | 'ollama/llama2:13b'
  | 'ollama/llama2:70b'
  | 'ollama/llama2-uncensored'
  | 'ollama/orca-mini'
  | 'ollama/vicuna'
  | 'ollama/nous-hermes'
  | 'ollama/nous-hermes:13b'
  | 'ollama/wizard-vicuna'
  | 'ollama/codellama'
  | 'ollama/codellama:7b-instruct';

export interface HandlerParamsBase {
  model: ModelName;
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
