import * as deepl from 'deepl-node';

import {
  HandlerParams,
  HandlerParamsNotStreaming,
  HandlerParamsStreaming,
  ResultNotStreaming,
  ResultStreaming,
  StreamingChunk,
} from '../types';
import { combinePrompts } from '../utils/combinePrompts';
import { getUnixTimestamp } from '../utils/getUnixTimestamp';
import { toUsage } from '../utils/toUsage';

// The DeepL API is a translation API, so we map it onto the chat interface by
// encoding the target language in the model string, e.g. `deepl/fr`,
// `deepl/en-US`, `deepl/de`. The combined prompt is the text to translate.
function parseTargetLang(model: string): deepl.TargetLanguageCode {
  const targetLang = model.split('deepl/')[1];
  if (!targetLang) {
    throw new Error(
      `Model: ${model} is missing a target language. Use the format 'deepl/<target-lang>', e.g. 'deepl/fr'.`,
    );
  }
  return targetLang as deepl.TargetLanguageCode;
}

// DeepL does not stream, so we yield the full translation as a single chunk,
// mirroring the other non-streaming providers in this library.
// eslint-disable-next-line @typescript-eslint/require-await
async function* toStream(
  text: string,
  model: string,
  prompt: string,
): AsyncIterable<StreamingChunk> {
  yield {
    model,
    created: getUnixTimestamp(),
    usage: toUsage(prompt, text),
    choices: [
      {
        delta: {
          content: text,
          role: 'assistant',
        },
        finish_reason: 'stop',
        index: 0,
      },
    ],
  };
}

export async function DeepLHandler(
  params: HandlerParamsNotStreaming,
): Promise<ResultNotStreaming>;

export async function DeepLHandler(
  params: HandlerParamsStreaming,
): Promise<ResultStreaming>;

export async function DeepLHandler(
  params: HandlerParams,
): Promise<ResultNotStreaming | ResultStreaming>;

export async function DeepLHandler(
  params: HandlerParams,
): Promise<ResultNotStreaming | ResultStreaming> {
  const apiKey = params.apiKey ?? process.env.DEEPL_API_KEY!;
  const targetLang = parseTargetLang(params.model);

  const translator = new deepl.Translator(apiKey);
  const textsCombined = combinePrompts(params.messages);

  // Source language is auto-detected by passing null.
  const result = await translator.translateText(
    textsCombined,
    null,
    targetLang,
  );

  if (params.stream) {
    return toStream(result.text, params.model, textsCombined);
  }

  return {
    model: params.model,
    created: getUnixTimestamp(),
    usage: toUsage(textsCombined, result.text),
    choices: [
      {
        message: {
          content: result.text,
          role: 'assistant',
        },
        finish_reason: 'stop',
        index: 0,
      },
    ],
  };
}
