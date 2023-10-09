export interface Message {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string | null;
}

export interface ConsistentResponseChoice {
  finish_reason: string;
  index: number;
  message: {
    role: string;
    content: string;
  };
}

export interface ConsistentResponseStreamingChoice
  extends Omit<ConsistentResponseChoice, 'message'> {
  delta: ConsistentResponseChoice['message'];
}

export interface ConsistentResponseUsage {
  prompt_tokens: number;
  completion_tokesn: number;
  total_tokens: number;
}

export interface ConsistentResponse {
  choices: ConsistentResponseChoice[];
  model?: string; // TODO: Make this non-optional
  created?: string; // TODO: Make this non-optional and implement
  usage?: ConsistentResponseUsage; // TODO: Make this non-optional and implement
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
}

export interface HandlerParamsStreaming extends HandlerParamsBase {
  stream?: true;
}

export interface HandlerParamsNotStreaming extends HandlerParamsBase {
  stream?: false;
}

export type HandlerParams = HandlerParamsStreaming | HandlerParamsNotStreaming;

export type Handler = (params: HandlerParams) => Promise<Result>;
