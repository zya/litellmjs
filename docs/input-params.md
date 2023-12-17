### Translated OpenAI params
This is a list of OpenAI params we need to translate across providers.

This list is constantly being updated.

| Provider | temperature | max_tokens | top_p | stream | stop | n | presence_penalty | frequency_penalty | functions | function_call |
|---|---|---|---|---|---|---|---|---|---|---|
|OpenAI| ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
|Anthropic| ❌ | ❌ | ❌ | ✅ | ❌ |  |  |   |  |   |
|Mistral| ❌ | ❌ | ❌ | ✅ | ❌ |  |  |   |  |   |
|Replicate | ❌ | ❌ | ❌ | ✅ | ❌ | |  |   |  |   |
|Anyscale | ❌ | ❌ | ❌ | ❌ |
|Cohere| ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |   |   |
|Huggingface| ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |  |  |   |    |
|Openrouter| ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
|AI21| ❌ | ❌ | ❌ | ✅| ❌ | ❌ | ❌ | ❌ |  |   |
|VertexAI| ❌ | ❌ |  | ❌ |  |  |  |  |  |   |
|Bedrock| ❌ | ❌ | ❌ | ❌ | ❌ |  |  |   |  |   |
|Sagemaker| ❌ | ❌ |  | ❌ |  |  |  |  |  |   |
|TogetherAI| ❌ | ❌ | ❌ | ❌ | ❌ |  |  |   |  |   |
|AlephAlpha| ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |  |   |  |   |
|Palm| ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |  |  |  |   |
|NLP Cloud| ❌ | ❌ | ❌ | ❌ | ❌ | |  |  |  |   |
|Petals| ❌ | ❌ |  | ❌ | |  |   |  |  |   |
|Ollama| ❌ | ❌ | ❌ | ✅ | ❌ |  |   | ❌ |  |   |
|DeepInfra| ❌ | ❌ | ❌ | ✅ | ❌ |  |   | ❌ |  |   |