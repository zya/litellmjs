import { ChatCompletionCreateParams } from 'openai/resources/chat/completions';
import { EmbeddingParams, EmbeddingResponse } from './embedding';

export type Role = 'system' | 'user' | 'assistant' | 'function';

export interface Message {
  role: Role;
  content: string | null;
}

export type FinishReason =
  | 'stop'
  | 'length'
  | 'function_call'
  | 'content_filter';

export interface ConsistentResponseChoice {
  finish_reason: FinishReason | null;
  index: number;
  message: {
    role: string | null | undefined;
    content: string | null | undefined;
    function_call?: {
      arguments: string;
      name: string;
    };
  };
}

export interface ConsistentResponseStreamingChoice
  extends Omit<ConsistentResponseChoice, 'message'> {
  delta: Omit<ConsistentResponseChoice['message'], 'function_call'> & {
    function_call?: {
      arguments?: string;
      name?: string;
    };
  };
}

export interface ConsistentResponseUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ConsistentResponse {
  choices: ConsistentResponseChoice[];
  model?: string;
  created?: number;
  usage?: ConsistentResponseUsage;
}

export type ResultNotStreaming = ConsistentResponse;

export interface StreamingChunk extends Omit<ConsistentResponse, 'choices'> {
  choices: ConsistentResponseStreamingChoice[];
}

export type ResultStreaming = AsyncIterable<StreamingChunk>;

export type Result = ResultNotStreaming | ResultStreaming;

export interface HandlerParamsBase {
  model: string;
  messages: Message[];
  stream?: boolean | null;
  baseUrl?: string;
  temperature?: number | null;
  top_p?: number | null;
  stop?: string | null | string[];
  presence_penalty?: number | null;
  n?: number | null;
  max_tokens?: number | null;
  apiKey?: string;
  functions?: ChatCompletionCreateParams.Function[];
  function_call?:
    | 'none'
    | 'auto'
    | ChatCompletionCreateParams.FunctionCallOption;
}

export interface HandlerParamsStreaming extends HandlerParamsBase {
  stream?: true;
}

export interface HandlerParamsNotStreaming extends HandlerParamsBase {
  stream?: false;
}

export type HandlerParams = HandlerParamsStreaming | HandlerParamsNotStreaming;

export type Handler = (params: HandlerParams) => Promise<Result>;
export type EmbeddingHandler = (
  params: EmbeddingParams,
) => Promise<EmbeddingResponse>;
